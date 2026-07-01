import {InstructorConfiguration} from "./instructor";

export class OnChangeConfiguration extends InstructorConfiguration {
    use(engine: any): this {
        super.use(engine);
        this.filename = "on_change.py";
        this.code = this.main.model.assignment.onChange();

        clearTimeout(this.main.model.display.triggerOnChange);

        return this;
    }
}