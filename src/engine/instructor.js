import {Configuration, EMPTY_MODULE} from "./configurations.js";
import {$sk_mod_instructor} from "../sk_mod_instructor";

const UTILITY_MODULE_CODE = "var $builtinmodule = " + $sk_mod_instructor.toString();

export class InstructorConfiguration extends Configuration {
    use(engine) {
        super.use(engine);
        // Instructors have no limits
        Sk.execLimit = undefined;
        // Stepper! Executed after every statement.
        Sk.afterSingleExecution = null; // 10 *1000
        // Mute everything
        this.main.model.display.mutePrinter(true);
        // Disable input box
        Sk.queuedInput = [];
        // TODO Sk.inputfun = BlockPyEngine.inputMockFunction;
        // TODO: Allow input function to disable the timer, somehow
        // Enable utility mode
        Sk.builtinFiles.files["src/lib/utility/__init__.js"] = UTILITY_MODULE_CODE;
        Sk.builtinFiles.files["./_instructor/__init__.js"] = EMPTY_MODULE;
        return this;
    }

    openFile(filename) {
        let instructorFiles = this.main.model.assignment.extraInstructorFiles();
        for (let i=0; i < instructorFiles.length; i++) {
            if (instructorFiles[i].filename() === "!"+filename) {
                return instructorFiles[i].contents();
            }
        }
        // TODO: Prevent students from editing files, instead of relying on startingFiles
        instructorFiles = this.main.model.assignment.extraStartingFiles();
        for (let i=0; i < instructorFiles.length; i++) {
            if (instructorFiles[i].filename() === "^"+filename) {
                return instructorFiles[i].contents();
            }
        }
        let studentFiles = this.main.model.submission.extraFiles();
        for (let i=0; i < studentFiles.length; i++) {
            if (studentFiles[i].filename() === filename) {
                return studentFiles[i].contents();
            }
        }
        throw new Sk.builtin.OSError("File not found: "+filename);
    }

    importFile(filename) {
        if (filename === "./answer.py") {
            return this.main.model.submission.code();
        } else if (filename === "./_instructor/on_run.py") {
            return this.main.model.assignment.onRun();
        } else if (filename === "./_instructor/on_eval.py") {
            return this.main.model.assignment.onEval() || "";
        } else if (filename === "./_instructor/__init__.js") {
            return EMPTY_MODULE;
        } else if (filename.startsWith("./_instructor/")) {
            let innerName = filename.slice("./_instructor/".length);
            let instructorFiles = this.main.model.assignment.extraInstructorFiles();
            for (let i=0; i < instructorFiles.length; i++) {
                if (instructorFiles[i].filename() === "!"+innerName) {
                    return instructorFiles[i].contents();
                }
            }
            throw new Sk.builtin.ImportError("File not found: '" + filename + "'");
        } else if (Sk.builtinFiles === undefined ||
            Sk.builtinFiles["files"][filename] === undefined) {
            throw "File not found: '" + filename + "'";
        }
        return Sk.builtinFiles["files"][filename];
    };

    input(promptMessage) {
        return "ApplePie";
        return Sk.queuedInput.pop();
        /*return new Promise((resolve) => {
            resolve(Sk.queuedInput.pop());
        });*/
    }

}