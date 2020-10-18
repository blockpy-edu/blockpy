import {InstructorConfiguration} from "./instructor";
import {StatusState} from "../server";
import {NEW_LINE_REGEX} from "./on_run";
import {indent} from "../utilities";

/**
 * @return {string}
 */
export const WRAP_INSTRUCTOR_CODE = function (studentCode, instructorCode, quick, isSafe) {
    let safeCode = JSON.stringify(studentCode);
    let indentedCode = indent(indent(isSafe ? studentCode : "None"));

    return `
from utility import *

# Load in some commonly used tools
from pedal.cait.cait_api import parse_program
from pedal.sandbox.commands import *
from pedal.core.commands import *

# Backup the feedback
on_run_feedback = []
for feedback in MAIN_REPORT.feedback:
    on_run_feedback.append(feedback)
MAIN_REPORT.feedback.clear()

from pedal.environments.blockpy import setup_environment
# Add in evaluated stuff from last time
student = get_sandbox()
# TODO: What about new inputs since we last ran/evaled?
MAIN_REPORT.submission.files['evaluation'] = ${safeCode}
evaluate(${safeCode})

# TODO: Refactor resolver to return instructions
# Monkey-patch questions
#from pedal import questions
#questions.show_question = set_instructions

# Run the actual instructor code
${instructorCode}

# Resolve everything
from pedal.resolvers.simple import resolve
final = resolve()
SUCCESS = final.success
SCORE = final.score
CATEGORY = final.category
LABEL = final.title
MESSAGE = final.message
DATA = final.data
HIDE = final.hide_correctness

# Handle questions
if final.instructions:
    set_instructions(final.instructions[-1].message)
    
# Handle positive feedback
POSITIVE = []
for positive in final.positives:
    message = positive.message
    if not positive:
        message = positive.else_message
    POSITIVE.append({
        "title": positive.title,
        "label": positive.label,
        "message": message
    })
    
# Handle system messages
for system in final.systems:
    if system.label == 'log':
        console_log(system.title, system.message);
    if system.label == 'debug':
        console_debug(system.title, system.message);

`;
};

export class OnEvalConfiguration extends InstructorConfiguration {
    use(engine) {
        super.use(engine);
        this.filename = "_instructor.on_eval";
        this.code = this.main.model.assignment.onEval() || "";

        let disableTifa = this.main.model.assignment.settings.disableTifa();

        let report = this.main.model.execution.reports;
        let studentCodeSafe = this.main.model.execution.reports.student.evaluation || "None";
        this.dummyOutSandbox();
        let instructorCode = this.code;
        let lineOffset = instructorCode.split(NEW_LINE_REGEX).length;
        let isSafe = !report["parser"].empty && report["verifier"].success;
        instructorCode = WRAP_INSTRUCTOR_CODE(studentCodeSafe, instructorCode, disableTifa, isSafe);
        lineOffset = instructorCode.split(NEW_LINE_REGEX).length - lineOffset;
        report["instructor"] = {
            "compliments": [],
            "filename": "./_instructor/on_eval.py",
            "code": instructorCode,
            "lineOffset": lineOffset
            //'complete': false // Actually, let's use undefined for now.
        };
        this.code = instructorCode;

        super.use(engine);

        //Sk.retainGlobals = false;
        Sk.globals = this.main.model.execution.instructor.globals;

        return this;
    }

    success(module) {
        console.log("OnEval success");
        // TODO: Actually parse results
        this.main.model.execution.instructor.globals = Sk.globals;
        this.main.model.execution.instructor.sysmodules = Sk.sysmodules;
        console.log(module);
        let results = module.$d.on_eval.$d;
        console.log(module.$d);
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
        console.log("OnEval failure");
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