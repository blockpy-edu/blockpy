import {StudentConfiguration} from "./student";

export class SampleConfiguration extends StudentConfiguration {
    use(engine) {
        super.use(engine);
        // TODO: Fix to be the current sample submission
        this.filename = "answer.py";
        this.code = "print('Not ready yet!')";

        return this;
    }
}