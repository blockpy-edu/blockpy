import {indent} from "../utilities";
import {StatusState} from "../server";
import {InstructorConfiguration} from "./instructor";

export const NEW_LINE_REGEX = /\r\n|\r|\n/;
/**
 * @return {string}
 */
export const WRAP_INSTRUCTOR_CODE = function (studentCode, instructorCode, quick, isSafe) {
    let safeCode = JSON.stringify(studentCode);
    let indentedCode = indent(indent(isSafe ? studentCode : "pass"));
    let tifaAnalysis = "";
    if (!quick) {
        tifaAnalysis = "from pedal.tifa import tifa_analysis\ntifa_analysis(False)";
    }

    return `
from pedal.report import *
from pedal.source import set_source
set_source(${safeCode}, "answer.py")
${tifaAnalysis}
from pedal.sandbox.sandbox import Sandbox
from pedal.sandbox import compatibility
from utility import *
student = MAIN_REPORT['sandbox']['run'] = Sandbox()
#student.run(MAIN_REPORT['source']['code'], MAIN_REPORT['source']['filename'], report_exceptions=False)
#debug(student)
student.report_exceptions_mode = True
compatibility.run_student(raise_exceptions=False)
#log(student.data)
#student = get_student_data()
#error, position = get_student_error()
#compatibility.raise_exception(error, position)
run_student = compatibility.run_student
reset_output = compatibility.reset_output
queue_input = compatibility.queue_input
get_output = compatibility.get_output
get_plots = compatibility.get_plots
compatibility.trace_lines = trace_lines
from pedal import questions
questions.show_question = set_instructions
# TODO: Remove the need for this hack!
def capture_output(func, *args):
   reset_output()
   student.call(func.__name__, *args)
   return get_output()
compatibility.capture_output = capture_output

from pedal.cait.cait_api import parse_program
${instructorCode}
from pedal.resolvers import simple
SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE = simple.resolve()
`;
};

export class OnRunConfiguration extends InstructorConfiguration {
    use(engine) {
        super.use(engine);
        this.filename = "_instructor.on_run";
        this.code = this.main.model.assignment.onRun();

        let disableTifa = this.main.model.assignment.settings.disableTifa();

        let report = this.main.model.execution.reports;
        let studentCodeSafe = this.main.model.submission.code();
        this.dummyOutSandbox();
        let instructorCode = this.code;
        let lineOffset = instructorCode.split(NEW_LINE_REGEX).length;
        let isSafe = !report["parser"].empty && report["verifier"].success;
        instructorCode = WRAP_INSTRUCTOR_CODE(studentCodeSafe, instructorCode, disableTifa, isSafe);
        lineOffset = instructorCode.split(NEW_LINE_REGEX).length - lineOffset - 4;
        report["instructor"] = {
            "compliments": [],
            "filename": "./_instructor/on_run.py",
            "code": instructorCode,
            "lineOffset": lineOffset
            //'complete': false // Actually, let's use undefined for now.
        };

        this.code = instructorCode;

        Sk.retainGlobals = false;

        return this;
    }

    success(module) {
        // TODO Logging!!!!
        console.log("OnRun success");
        // TODO: Actually parse results
        this.main.model.execution.instructor.globals = Sk.globals;
        Sk.globals = {};
        let results = module.$d.on_run.$d;
        this.main.components.feedback.presentFeedback(results);
        this.main.model.execution.reports["instructor"]["success"] = true;
        let success = Sk.ffi.remapToJs(results.SUCCESS);
        this.main.model.submission.correct(success || this.main.model.submission.correct());
        // Cannot exceed 1 point, cannot go below 0 points
        let score = Sk.ffi.remapToJs(results.SCORE);
        score = Math.max(0, Math.min(100, score));
        let oldScore = this.main.model.submission.score();
        this.main.model.submission.score(Math.max(oldScore, score));
        // Hide status
        let hide = Sk.ffi.remapToJs(results.HIDE);
        // And fire the result!
        this.main.components.server.updateSubmission(score, success, hide, false);
        this.main.model.status.onExecution(StatusState.READY);
        //after(module);

        /*if (success && this.main.model.configuration.callbacks.success) {
            this.main.model.configuration.callbacks.success(this.main.model.assignment.id());
        }*/

        if (!Sk.executionReports.instructor.scrolling) {
            try {
                this.main.components.console.scrollToBottom();
            } catch (e) {
            }
        }
    }

    failure(error) {
        console.log("OnRun failure");
        let report = this.main.model.execution.reports;
        if (error.tp$name === "GracefulExit") {
            report["instructor"]["success"] = true;
            this.main.model.status.onExecution(StatusState.READY);
        } else {
            this.main.model.status.onExecution(StatusState.FAILED);
            //console.log(report["instructor"]["code"]);
            console.error(error);
            this.main.components.feedback.presentInternalError(error, this.filename);
            //report["instructor"]["success"] = false;
            //report["instructor"]["error"] = error;
            //TODO: report["instructor"]["line_offset"] = lineOffset;
        }
        //TODO: after(error);
    }
}