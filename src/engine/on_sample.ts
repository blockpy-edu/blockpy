import {OnRunConfiguration} from "./on_run";

export class OnSampleConfiguration extends OnRunConfiguration {
    use(engine) {
        super.use(engine);
        this.filename = "on_run.py";
        this.code = this.main.model.assignment.onRun();

        return this;
    }
}