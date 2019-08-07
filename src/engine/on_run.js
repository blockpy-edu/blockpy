import {indent} from "../utilities";
import {StatusState} from "../server";
import {InstructorConfiguration} from "./instructor";

const NEW_LINE_REGEX = /\r\n|\r|\n/;
/**
 * @return {string}
 */
const WRAP_INSTRUCTOR_CODE = function (studentCode, instructorCode, quick, isSafe) {
    let safeCode = JSON.stringify(studentCode);
    let indentedCode = indent(indent(isSafe ? studentCode : "pass"));
    let tifaAnalysis = "";
    if (!quick) {
        tifaAnalysis = "from pedal.tifa import tifa_analysis\ntifa_analysis(False)";
    }

    return `
from pedal.report import *
from pedal.source import set_source
set_source(${safeCode})
def run_student():
    # limit_execution_time()
    try:
${indentedCode}
    except Exception as error:
        # unlimit_execution_time()
        return error
    # unlimit_execution_time()
    return None
${tifaAnalysis}
from pedal.sandbox import compatibility
from utility import *
student = get_student_data()
compatibility.set_sandbox(student)
error, position = get_student_error()
compatibility.raise_exception(error, position)
compatibility.run_student = run_student
compatibility.get_plots = get_plots
compatibility.get_output = get_output
compatibility.reset_output = reset_output
compatibility.trace_lines = trace_lines
def capture_output(func, *args):
   reset_output()
   func(*args)
   return get_output()
compatibility.capture_output = capture_output
from pedal.cait.cait_api import parse_program
${instructorCode}
from pedal.resolvers import simple
SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE = simple.resolve()
#print(MAIN_REPORT.feedback[0].mistake['error'])
`;
};

export class OnRunConfiguration extends InstructorConfiguration {
    use(engine) {
        super.use(engine);
        this.filename = "_instructor.on_run";
        this.code = this.main.model.assignment.onRun();

        let report = this.main.model.execution.reports;
        // Actually run the python code
        let studentCodeSafe = this.main.model.submission.code();
        Sk.builtinFiles.files["src/lib/pedal/sandbox/sandbox.py"] = "class Sandbox: pass\ndef run(): pass\ndef reset(): pass\n";
        let instructorCode = this.code;
        let lineOffset = instructorCode.split(NEW_LINE_REGEX).length;
        let isSafe = report["parser"].success && report["verifier"].success;
        instructorCode = WRAP_INSTRUCTOR_CODE(studentCodeSafe, instructorCode, false, isSafe);
        lineOffset = instructorCode.split(NEW_LINE_REGEX).length - lineOffset;
        report["instructor"] = {
            "compliments": [],
            "filename": "./_instructor/on_run.py",
            "code": instructorCode,
            //'complete': false // Actually, let's use undefined for now.
        };

        this.code = instructorCode;

        Sk.retainGlobals = false;

        return this;
    }

    success(module) {
        // TODO: Actually parse results
        let results = module.$d.on_run.$d;
        this.main.components.feedback.presentFeedback(results);
        this.main.model.execution.reports["instructor"]["success"] = true;
        let success = Sk.ffi.remapToJs(results.SUCCESS);
        this.main.model.submission.correct(success || this.main.model.submission.correct());
        // Cannot exceed 1 point, cannot go below 0 points
        let score = Sk.ffi.remapToJs(results.SCORE);
        score = Math.max(0.0, Math.min(1.0, score));
        let oldScore = this.main.model.submission.score();
        this.main.model.submission.score(Math.max(oldScore, score));
        // Hide status
        let hide = Sk.ffi.remapToJs(results.HIDE);
        // And fire the result!
        this.main.components.server.updateSubmission(score, success, hide, false);
        this.main.model.status.onExecution(StatusState.READY);
        //after(module);

        if (!Sk.executionReports.instructor.scrolling) {
            try {
                this.main.components.console.scrollToBottom();
            } catch (e) {
            }
        }
    }

    failure(error) {
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