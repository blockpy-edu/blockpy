import {InstructorConfiguration} from "./instructor";

export class OnEvalConfiguration extends InstructorConfiguration {
    use(engine) {
        super.use(engine);
        this.filename = "on_eval.py";
        this.code = this.main.model.assignment.onEval();

        return this;
    }
}