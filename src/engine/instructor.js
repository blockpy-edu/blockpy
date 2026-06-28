import {Configuration, EMPTY_MODULE} from "./configurations.js";
import {$sk_mod_instructor} from "../skulpt_modules/sk_mod_instructor";
import {$sk_mod_coverage} from "../skulpt_modules/coverage";
import {$pedal_tracer} from "../skulpt_modules/pedal_tracer";
import {chompSpecialFile} from "../files";

const UTILITY_MODULE_CODE = "var $builtinmodule = " + $sk_mod_instructor.toString();
const COVERAGE_MODULE_CODE = $sk_mod_coverage;

export class InstructorConfiguration extends Configuration {
    use(engine) {
        super.use(engine);
        // Instructors get 4 seconds
        this.runtime.setExecLimitFunction(() =>
            this.main.model.assignment.settings.disableTimeout() ? Infinity : 7000);
        // Stepper! Executed after every statement.
        this.runtime.setAfterSingleExecution(null); // 10 *1000
        // Mute everything
        this.main.model.display.mutePrinter(true);
        // Disable input box
        this.runtime.setQueuedInput([]);
        // TODO Sk.inputfun = BlockPyEngine.inputMockFunction;
        // TODO: Allow input function to disable the timer, somehow
        // Disable the beforeCall checker unless specifically requested
        this.beforeCallBackup = this.runtime.getBeforeCall();
        this.runtime.setBeforeCallBackup(this.beforeCallBackup);
        this.runtime.setBeforeCall(null);
        // Enable utility mode
        this.runtime.setBuiltinFile("src/lib/utility/__init__.js", UTILITY_MODULE_CODE);
        this.runtime.setBuiltinFile("src/lib/coverage.py", COVERAGE_MODULE_CODE);
        // TODO: Check if this needs to be optimized
        //const PEDAL_TRACER_MODULE_CODE = Sk.compile($pedal_tracer, "tracer.py", "exec", true, false);
        this.runtime.setBuiltinFile("src/lib/pedal/sandbox/tracer.py", $pedal_tracer);
        this.runtime.deleteBuiltinFile("src/lib/pedal/sandbox/tracer.js");
        // TODO: Mock Pedal's tracer module with the appropriate version
        this.runtime.setBuiltinFile("./_instructor/__init__.js", EMPTY_MODULE);
        // Reuse any existing sysmodules that we previously found, but not __main__ modules
        this.sysmodules = this.clearExistingStudentImports();
        // Horrific hack, to prevent Tifa from caching a bad version of the students' import
        this.runtime.setClearExistingStudentImports(this.clearExistingStudentImports.bind(this));
        return this;
    }

    print(value) {
        super.print(value);
        console.info("Printed:", value);
    }

    clearExistingStudentImports() {
        let sysmodules = this.main.model.execution.instructor.sysmodules;
        // Remove any existing __main__ modules
        if (sysmodules !== undefined) {
            for (let filename of this.getAllFilenames()) {
                this.runtime.popSysmodule(sysmodules, filename);
            }
        }
        return sysmodules;
    }

    getAllStudentFiles() {
        const files = {
            "answer.py": this.main.model.ui.files.getStudentCode()
        };
        // Skip special instructor files
        this.main.model.assignment.extraInstructorFiles().forEach(file => {
            if (!("!^$#".includes(file.filename()[0]))) {
                files[chompSpecialFile(file.filename())] = file.contents();
            }
        });
        // Include normal student extra files
        this.main.model.submission.extraFiles().forEach(file => {
            files[file.filename()] = file.contents();
        });
        return files;
    }

    getAllFilenames() {
        function clean(filename) {
            filename = chompSpecialFile(filename);
            if (filename.endsWith(".py")) {
                filename = filename.slice(0, -3);
            }
            return filename;
        }
        return [
            "__main__",
            "_instructor",
            ...this.main.model.assignment.extraInstructorFiles().map(file => "_instructor." + clean(file.filename())),
            ...this.main.model.submission.extraFiles().map(file => clean(file.filename())),
        ];
    }

    getTimeoutPrompt(longTimeout) {
        if (longTimeout) {
            return "The instructor code has taken a REALLY long time to check your code (30 or more seconds). You might want to cancel and check your code (or get help from an instructor). Or, you can add more seconds to wait below.";
        } else {
            return "The instructor code is taking a little while to check your code; it might just need a little more time. How many more seconds would you like to wait?";
        }
    }

    openFile(filename) {
        let found = this.main.components.fileSystem.searchForFile(filename, false);
        if (found === undefined) {
            throw this.runtime.makeError("OSError", "File not found: "+filename);
        } else {
            return found.contents();
        }
    }

    openURL(url, data, timeout) {
        // TODO: Figure out why parameters are misaligned..?
        if (data.v === "OPENAI") {
            return this.main.components.server.openaiProxy(timeout.v);
        } else {
            return super.openURL(url, data, timeout);
        }
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
        } else if (this.runtime.hasBuiltinFile(filename)) {
            return this.runtime.getBuiltinFile(filename);
        } else {
            let found = this.main.components.fileSystem.searchForFile(filename, false);
            if (found === undefined) {
                throw this.runtime.makeError("OSError", "File not found: '"+filename + "'");
            } else {
                return found.contents();
            }
        }
    };

    input(promptMessage) {
        //return "ApplePie";
        console.log(">>>", this.main.model.execution.input(), this.main.model.execution.inputIndex());
        if (this.main.model.execution.inputIndex() < this.main.model.execution.input().length) {
            let inputIndex = this.main.model.execution.inputIndex();
            let nextInput = this.main.model.execution.input()[inputIndex];
            this.main.model.execution.inputIndex(inputIndex+1);
            return nextInput;
        } else {
            return "ApplePie";
        }
        /*return new Promise((resolve) => {
            resolve(Sk.queuedInput.pop());
        });*/
    }

    beforeCall(functionName, posargs, kwargs) {
        let studentModel = this.main.model.execution.reports.student;
        //console.log("HEY INSTRUCTOR CALL", functionName, studentModel.tracing);
        if (studentModel.tracing && studentModel.tracing.length) {
            super.beforeCall(functionName, posargs, kwargs);
        }
    }

}