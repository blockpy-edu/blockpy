import {StudentConfiguration} from "./student";

export class RunConfiguration extends StudentConfiguration {
    use(engine) {
        this.main.model.execution.feedback.message("Running...");
        this.filename = "answer";
        this.code = this.main.model.submission.code();

        super.use(engine);

        engine.reset();
        this.updateParse();
        this.main.components.server.saveFile(this.filename, this.code, null);
        this.main.model.execution.reports["verifier"] = {
            "success": Boolean(this.code.trim()),
            "code": this.code
        };

        Sk.retainGlobals = true;

        return this;
    }

    success(module) {
        console.log("runSuccess");
        let report = this.main.model.execution.reports;
        let filename = this.filename;
        this.main.model.execution.student.results = module;
        this.main.model.execution.student.globals = Sk.globals;
        return new Promise((resolve, reject) => {
            this.step(module.$d, -1, 0, filename + ".py");
            this.lastStep();
            report["student"] = {
                "success": true,
                "trace": this.engine.executionBuffer.trace,
                "lines": this.engine.executionBuffer.trace.map(x => x.line),
                "results": module,
                "output": this.main.model.execution.output
            };
            resolve();
        });
    }

    failure(error) {
        let report = this.main.model.execution.reports;
        return new Promise((resolve, reject) => {
            report["student"] = {
                "success": false,
                "error": error,
            };
            console.error(error);
            resolve();
        });
    }
}