import {StatusState} from "./server";
import {OnRunConfiguration} from "./engine/on_run";
import {RunConfiguration} from "./engine/run";
import {EvalConfiguration} from "./engine/eval";
import {SampleConfiguration} from "./engine/sample";
import {OnChangeConfiguration} from "./engine/on_change";
import {OnEvalConfiguration} from "./engine/on_eval";
import {OnSampleConfiguration} from "./engine/on_sample";

/**
 * An object for executing Python code and passing the results along to interested components.
 *
 * Interesting components:
 *  Execution Buffer: Responsible for collecting the trace during program execution.
 *                    This prevents Knockoutjs from updating the editor during execution.
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
export class BlockPyEngine {
    constructor(main) {
        this.main = main;
        this.executionModel = this.main.model.execution;

        this.configurations = {
            run: new RunConfiguration(main),
            eval: new EvalConfiguration(main),
            onRun: new OnRunConfiguration(main),
            onChange: new OnChangeConfiguration(main),
            onEval: new OnEvalConfiguration(main)
        };

        // Preconfigure skulpt so we can parse
        Sk.configure(this.configurations.run.getSkulptOptions());

        // Keeps track of the tracing while the program is executing
        this.executionBuffer = {};

        /**
         * Definable function to be run when execution has fully ended,
         * whether it succeeds or fails.
         */
        this.onExecutionBegin = null;
        this.onExecutionEnd = null;
    }

    /**
     * Reset reports
     */
    resetReports() {
        let report = this.executionModel.reports;
        report["verifier"] = {};
        report["parser"] = {};
        report["student"] = {};
        report["instructor"] = {};
        report["model"] = this.main.model;
    };

    resetStudentModel() {
        let student = this.executionModel.student;
        student.currentStep(null);
        student.currentTraceStep(0);
        student.lastStep(0);
        student.currentLine(null);
        student.currentTraceData.removeAll();
        student.results = null;
    }

    resetExecutionBuffer() {
        this.executionBuffer = {
            "trace": [],
            "step": 0,
            "line": 0,
        };
    };

    /**
     * Remove all interface aspects of the previous Run.
     */
    reset() {
        // TODO: Clear out any coverage/trace/error highlights in editors
        // Reset execution in model
        this.resetStudentModel();
        // Get reports ready
        this.resetReports();
        // Clear out the execution buffer
        this.resetExecutionBuffer();
        // Clear out the console of printed stuff
        this.main.components.console.clear();
        // Clear out any old feedback
        this.main.components.feedback.clear();
    }

    delayedRun() {
        //this.main.model.status.onExecution(StatusState.ACTIVE);
        //$(".blockpy-run").addClass("blockpy-run-running");
        this.run();
        //setTimeout(this.run.bind(this), 1);
    }

    run() {
        this.configuration = this.configurations.run.use(this);
        let execution = this.execute().then(
            this.configuration.success.bind(this.configuration),
            this.configuration.failure.bind(this.configuration)
        );
        if (!this.main.model.assignment.settings.disableFeedback()) {
            execution.then(() => {
                this.configuration.provideSecretError();
                return this.onRun();
            });
        } else {
            execution.then(this.configuration.showErrors.bind(this.configuration));
        }
    }

    onRun() {
        this.configuration = this.configurations.onRun.use(this);
        this.execute().then(
            this.configuration.success.bind(this.configuration),
            this.configuration.failure.bind(this.configuration)
        ).then(this.executionEnd_.bind(this));
    }

    evaluate() {
        this.main.model.status.onExecution(StatusState.ACTIVE);
        let evaluationInput = this.main.components.console.evaluate();
        console.log(evaluationInput);
        evaluationInput.then((userInput) => {
            this.configuration = this.configurations.eval.use(this, userInput);
            let execution = this.execute().then(
                this.configuration.success.bind(this.configuration),
                this.configuration.failure.bind(this.configuration)
            );
            if (!this.main.model.assignment.settings.disableFeedback() &&
                this.main.model.assignment.onEval()) {
                execution.then(this.onEval.bind(this));
            } else {
                execution.then(this.configuration.showErrors.bind(this.configuration))
                    .then(this.evaluate.bind(this));
            }
        });
    }

    onEval() {
        this.configuration = this.configurations.onEval.use(this);
        this.execute().then(
            this.configuration.success.bind(this.configuration),
            this.configuration.failure.bind(this.configuration)
        ).then(this.evaluate.bind(this));
    }

    onChange() {
        this.configuration = this.configurations.onChange.use(this);
    }

    execute() {
        this.main.model.status.onExecution(StatusState.ACTIVE);
        return Sk.misceval.asyncToPromise(() =>
            Sk.importMainWithBody(this.configuration.filename, false,
                                  this.configuration.code, true,
                                  this.configuration.sysmodules)
        );
    }

    /**
     * Activated whenever the Python code changes
     */
    on_change() {
        let FILENAME = "on_change";
        // Skip if the instructor has not defined anything
        if (!this.main.model.programs[FILENAME]().trim()) {
            return false;
        }
        this.main.model.execution.status("changing");
        this.main.components.server.saveCode();
        // On step does not perform parse analysis by default or run student code
        let engine = this;
        let feedback = this.main.components.feedback;
        engine.resetReports();
        engine.verifyCode();
        engine.updateParse();
        engine.runInstructorCode(FILENAME, true, function (module) {
            if (Sk.executionReports["instructor"]["success"]) {
                // SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE
                // TODO: only show under certain circumstances
                if (!success &&
                    !(category === "Instructor" && label === "No errors")) {
                    feedback.presentFeedback(category, label, message, line);
                }
                engine.main.components.feedback.presentFeedback(module.$d);
                engine.main.model.execution.status("complete");
            }
        });
        engine.main.components.server.logEvent("engine", "on_change");
    };


    /**
     * Helper function that will attempt to call the defined onExecutionEnd,
     * but will do nothing if there is no function defined.
     */
    executionEnd_() {
        if (this.onExecutionEnd !== null) {
            this.onExecutionEnd();
        }
    }

    /**
     *
     */
    executionBegin_() {
        if (this.onExecutionBegin !== null) {
            this.onExecutionBegin();
        }
    }

}

