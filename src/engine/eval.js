import {StudentConfiguration} from "./student";

export class EvalConfiguration extends StudentConfiguration {
    use(engine) {
        // TODO: fix to be currently added line
        this.main.model.execution.feedback.message("Running...");
        this.filename = "answer";
        this.code = "print(name)";

        super.use(engine);

        Sk.retainGlobals = true;
        Sk.globals = this.main.model.execution.student.globals;

        return this;
    }
}