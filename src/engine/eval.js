import {StudentConfiguration} from "./student";
import {StatusState} from "../server";
import {BlockPyTrace} from "../trace";

export class EvalConfiguration extends StudentConfiguration {
    use(engine, code) {
        // TODO: fix to be currently added line
        this.main.model.execution.feedback.message("Running...");
        this.filename = "answer";
        this.code = "_ = " + code;
        Sk.afterSingleExecution = null;

        super.use(engine);

        Sk.retainGlobals = true;
        Sk.globals = this.main.model.execution.student.globals();

        this.main.components.server.logEvent("X-File.Add", "", "", code, "evaluations");
        this.main.components.server.logEvent("Compile", "", "", this.code, "evaluations");

        return this;
    }

    success(module) {
        console.log("Eval success");
        this.main.components.server.logEvent("X-Evaluate.Program", "", "", "", "evaluations");
        this.main.model.status.onExecution(StatusState.READY);
        this.main.model.execution.student.globals(Sk.globals);
        Sk.globals = {};
        let report = this.main.model.execution.reports;
        let filename = this.filename;
        this.main.model.execution.student.results = module;
        this.main.components.console.printValue(Sk.ffi.remapToJs(module.$d._.$r()));
        return new Promise((resolve, reject) => {
            //this.step(module.$d, module.$d,-1, 0, filename + ".py");
            this.lastStep();
            report["student"] = {
                "success": true,
                "trace": this.engine.executionBuffer.trace,
                "lines": this.engine.executionBuffer.trace.map(x => x.line),
                "realLines": this.engine.executionBuffer.trace.filter(x => !x.isDocstring).map(x => x.line),
                "results": module,
                "output": this.main.model.execution.output,
                "evaluation": this.code
            };
            resolve();
        });
    }

    failure(error) {
        console.log("Eval failure");
        this.main.model.status.onExecution(StatusState.FAILED);
        let report = this.main.model.execution.reports;
        this.main.components.server.logEvent("Compile.Error", "", "", error.toString(), "evaluations");
        return new Promise((resolve, reject) => {
            report["student"] = {
                "success": false,
                "error": error,
                "evaluation": this.code
            };
            console.error(error);
            resolve();
        });
    }
}