import {Configuration} from "./configurations.js";
import {$sk_mod_instructor} from "../sk_mod_instructor";

const UTILITY_MODULE_CODE = "var $builtinmodule = " + $sk_mod_instructor.toString();

export class InstructorConfiguration extends Configuration {
    use(engine) {
        super.use(engine);
        // Instructors have no limits
        Sk.execLimit = undefined;
        // Stepper! Executed after every statement.
        Sk.afterSingleExecution = null;
        // Mute everything
        this.main.model.display.mutePrinter(true);
        // Disable input box
        Sk.queuedInput = [];
        // TODO Sk.inputfun = BlockPyEngine.inputMockFunction;
        // Enable utility mode
        Sk.builtinFiles.files["src/lib/utility/__init__.js"] = UTILITY_MODULE_CODE;
        Sk.builtinFiles.files["./_instructor/__init__.js"] = "let $builtinmod = function(mod){ return mod; }";
        return this;
    }

    importFile(filename) {
        if (filename === "./answer.py") {
            return this.main.model.submission.code();
        } else if (filename === "./_instructor/on_run.py") {
            return this.main.model.assignment.onRun();
        } else if (Sk.builtinFiles === undefined ||
            Sk.builtinFiles["files"][filename] === undefined) {
            throw "File not found: '" + filename + "'";
        }
        return Sk.builtinFiles["files"][filename];
    };
}