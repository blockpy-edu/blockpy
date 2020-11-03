import {Configuration, EMPTY_MODULE} from "./configurations";

export class StudentConfiguration extends Configuration {
    use(engine) {
        super.use(engine);
        // Limit execution to 4 seconds
        let settings = this.main.model.settings;
        Sk.execLimitFunction = () =>
            this.main.model.assignment.settings.disableTimeout() ? Infinity : 5000;
        Sk.execLimit = Sk.execLimitFunction();
        // Stepper! Executed after every statement.
        Sk.afterSingleExecution = this.step.bind(this);
        // Unmute everything
        this.main.model.display.mutePrinter(false);

        // Function to call after each step
        // afterSingleExecution

        Sk.builtinFiles.files["src/lib/utility/__init__.js"] = EMPTY_MODULE;

        return this;
    }

    openFile(filename) {
        let found = this.main.components.fileSystem.searchForFile(filename, true);
        //console.log(filename, found);
        if (found === undefined) {
            throw new Sk.builtin.OSError("File not found: "+filename);
        } else {
            return found.contents();
        }
    }

    importFile(filename) {
        if (this.isForbidden(filename)) {
            throw "File not accessible: '" + filename + "'";
        } else if (filename === "./answer.py") {
            return this.main.model.submission.code();
        } else if (Sk.builtinFiles === undefined) {
            throw new Sk.builtin.OSError("Built-in modules not accessible.");
        } else if (Sk.builtinFiles["files"][filename] !== undefined) {
            return Sk.builtinFiles["files"][filename];
        } else {
            let found = this.main.components.fileSystem.searchForFile(filename, true);
            if (found === undefined) {
                throw new Sk.builtin.OSError("File not found: '"+filename + "'");
            } else {
                return found.contents();
            }
        }
    }

    input(promptMessage) {
        return this.main.components.console.input(promptMessage);
    }

    isForbidden(filename) {
        return filename.startsWith("src/lib/utility/") ||
            filename.startsWith("src/lib/pedal/") ||
            filename.startsWith("./_instructor/");
    }

    /**
     * "Steps" the execution of the code, meant to be used as a callback to the Skulpt
     * environment.
     *
     * @param {Object} globals - Hash that maps the names of global variables (Strings) to their Skulpt representation.
     * @param {Object} locals - Hash that maps the names of local variables (Strings) to their Skulpt representation.
     * @param {Number} lineNumber - The corresponding line number in the source code that is being executed.
     * @param {Number} columnNumber - The corresponding column number in the source code that is being executed.
     *                                Think of it as the "X" position to the lineNumber's "Y" position.
     * @param {String} filename - The name of the python file being executed (e.g., "__main__.py").
     * @param {Boolean} isDocstring - Whether or not this is an actual line or a docstring.
     */
    step(globals, locals, lineNumber, columnNumber, filename, isDocstring) {
        if (filename === "answer.py") {
            let currentStep = this.engine.executionBuffer.step;
            let globals = this.main.components.trace.parseGlobals(globals);
            // TODO: Trace local variables properly
            //console.log(globals, locals);
            //let locals = this.main.components.trace.parseGlobals(locals);
            //Object.assign(globals, locals);
            this.engine.executionBuffer.trace.push({
                "step": currentStep,
                "filename": filename,
                //'block': highlightMap[lineNumber-1],
                "line": lineNumber,
                "column": columnNumber,
                "properties": globals.properties,
                "modules": globals.modules,
                "isDocstring": isDocstring
            });
            this.engine.executionBuffer.step = currentStep + 1;
            this.engine.executionBuffer.line = lineNumber;
        }
    };

    /**
     * Called at the end of the Skulpt execution to terminate the executionBuffer
     * and hand it off to the execution trace in the model.
     */
    lastStep() {
        let execution = this.main.model.execution;
        execution.student.currentTraceData(this.engine.executionBuffer.trace);
        execution.student.currentStep(this.engine.executionBuffer.step);
        execution.student.lastStep(this.engine.executionBuffer.step);
        execution.student.currentLine(this.engine.executionBuffer.line);
        execution.student.lastLine(this.engine.executionBuffer.line);
        execution.student.currentTraceStep(this.engine.executionBuffer.step);
    };

    getLines(ast) {
        let visitedLines = new Set();
        let visitBody = (node) => {
            if (node.lineno !== undefined) {
                visitedLines.add(node.lineno);
            }
            if (node.body) {
                node.body.forEach((statement) => visitBody(statement));
            }
            if (node.orelse) {
                node.orelse.forEach((statement) => visitBody(statement));
            }
            if (node.finalbody) {
                node.finalbody.forEach((statement) => visitBody(statement));
            }
        };
        visitBody(ast);
        return Array.from(visitedLines);
    }

    /**
     * Ensure that the parse information is up-to-date
     */
    updateParse() {
        let report = this.main.model.execution.reports;
        // Hold all the actually discovered lines from the parse
        let lines = [];
        // Attempt a parse
        let ast;
        try {
            let parse = Sk.parse(this.filename, this.code);
            ast = Sk.astFromParse(parse.cst, this.filename, parse.flags);
            lines = this.getLines(ast);
        } catch (error) {
            // Report the error
            report["parser"] = {
                "success": false,
                "error": error,
                "empty": true,
                "lines": lines
            };
            console.error(error);
            console.log(this.filename, this.code);
            return false;
        }
        // Successful parse
        report["parser"] = {
            "success": true,
            "ast": ast,
            "empty": ast.body.length === 0,
            "lines": lines
        };
        return true;
    }

    showErrors() {
        let report = this.main.model.execution.reports;
        if (report["student"].success) {
            this.main.components.feedback.clear();
        } else {
            this.main.components.feedback.presentRunError(report.student.error);
        }
    }

    provideSecretError() {
        let report = this.main.model.execution.reports;
        let feedback = this.main.components.feedback;
        if (!report["student"].success) {
            let errorButton = this.main.model.configuration.container.find(".blockpy-student-error");
            let message = feedback.presentRunError(report.student.error, true);
            errorButton.attr("title", "Click to see Original Error");
            errorButton.tooltip({"trigger": "hover", "container": this.main.model.configuration.attachmentPoint});
            errorButton.click(() => this.main.components.dialog.ERROR_SHOW_STUDENT_ERROR(message));
            errorButton.show();
        }
    }
}