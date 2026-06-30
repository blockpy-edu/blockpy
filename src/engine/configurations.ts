export const EMPTY_MODULE = "let $builtinmodule = function(mod){ return mod; }";

/**
 * A container for holding settings of a particular run configuration.
 * This is the root class for all other configurations.
 */
export class Configuration {

    constructor(main) {
        this.main = main;
        this.filename = null;
        this.code = null;
        this.sysmodules = undefined;
    }

    use(engine) {
        // Access point for instructor data
        this.engine = engine;
        Sk.executionReports = this.main.model.execution.reports;
        Sk.console = this.main.components.console;
        Sk.queuedInput = [];
        Sk.configure(this.getSkulptOptions());
        // Set openFile as mechanism to read files
        Sk.inBrowser = this.openFile.bind(this);
        // Function to convert filenames to URLs
        Sk.fileToURL = this.getUrlFromFilename.bind(this);
        // Proxy requests
        Sk.requestsGet = (url, data, timeout) => this.openURL(url, data, timeout);
        // Configure a "do you want to wait? prompt"
        Sk.timeoutHandler = (timePassed, execLimit) => {
            if (this.main.model.assignment.settings.disableTimeout()) {
                return null;
            }
            let promptMessage = this.getTimeoutPrompt(timePassed/1000 > 30);
            let delay = prompt(promptMessage, Sk.execLimit/1000);
            if (delay !== null || delay==0) {
                delay = Sk.execLimit + parseInt(delay, 10) * 1000;
                Sk.execLimit = delay;
                Sk.execLimitFunction = () =>
                    this.main.model.assignment.settings.disableTimeout() ? Infinity : delay;
            }
            return delay;
        };
        // Attach beforeCall
        Sk.beforeCall = this.beforeCall.bind(this);
        return this;
    }

    getTimeoutPrompt(longTimeout) {
        if (longTimeout) {
            return "The program has taken a REALLY long time to run (30 or more seconds). You might want to cancel and check your code. Or, you can add more seconds to wait below.";
        } else {
            return "The program is taking a while to run. How many more seconds would you like to wait?";
        }
    }

    getSkulptOptions() {
        return {
            __future__: Sk.python3,
            // import
            read: this.importFile.bind(this),
            // open
            //fileopen: this.openFile.bind(this),
            // file.write
            filewrite: this.writeFile.bind(this),
            // print
            output: this.print.bind(this),
            // input
            inputfun: this.input.bind(this),
            inputfunTakesPrompt: true,
            // Media Image Proxy URL
            imageProxy: this.getImageProxy.bind(this),
            // TODO: Make this set by the system so we can use our own servers in practice
            emojiProxy: (part) => `https://twemoji.maxcdn.com/v/13.1.0/svg/${part.toLowerCase()}.svg`,
            // Whether or not to keep the globals
            retainGlobals: true
        };
    }

    getUrlFromFilename(filename) {
        const found = this.main.components.fileSystem.filesToUrls[filename];
        if (found === undefined) {
            throw new Sk.builtin.OSError("File not found: " + filename);
        }
        return found;
    }

    /**
     * Used to access Skulpt built-ins. This is pretty generic, taken
     * almost directly from the Skulpt docs.
     *
     * @param {String} filename - The python filename (e.g., "os" or "pprint") that will be loaded.
     * @returns {String} The JavaScript source code of the file (weird, right?)
     * @throws Will throw an error if the file isn't found.
     */
    importFile(filename) {
        console.warn("Unimplemented method!");
        // TODO
    };

    openURL(url, data, timeout) {
        //return new Promise((resolve, reject) => {
        let mockUrlData = this.main.components.fileSystem.getFile("?mock_urls.blockpy");
        if (mockUrlData == null) {
            throw (new Sk.builtin.IOError("Cannot access url: URL Data was not made available for this assignment"));
        }
        mockUrlData = JSON.parse(mockUrlData.handle());
        for (let filename in mockUrlData) {
            if (mockUrlData.hasOwnProperty(filename)) {
                for (let i=0; i < mockUrlData[filename].length; i+= 1) {
                    if (mockUrlData[filename][i] === url) {
                        let fileData = this.main.components.fileSystem.readFile(filename);
                        return (fileData);
                    }
                }
            }
        }
        //reject(new Sk.builtin.IOError("Cannot access url: "+url+" was not made available for this assignment"));
        throw (new Sk.builtin.IOError("Cannot access url: "+url+" was not made available for this assignment"));
        //});
    }

    openFile() {
        console.warn("Unimplemented method!");
        // TODO
    }

    writeFile() {
        console.warn("Unimplemented method!");
        // TODO
    }

    print(value) {
        this.main.components.console.print(value);
    }

    input() {
        console.warn("Unimplemented method!");
        // TODO
    }

    clearInput() {
        if (this.main.model.display.clearInputs()) {
            this.main.model.execution.input([]);
        }
        this.main.model.execution.inputIndex(0);
    }

    static inputMockFunction() {
        if (Sk.queuedInput.length) {
            return Sk.queuedInput.pop();
        } else {
            return "";
        }
    };

    getImageProxy(url) {
        // TODO
        return url;
    }

    step() {

    }

    lastStep() {

    }

    isForbidden(filename) {
        return false;
    }

    success(module) {
        throw new Error("Abstract success execution");
    }

    failure(error) {
        throw new Error("Abstract failure execution");
    }

    finally(result) {
        // Force Pygame to stop trapping keyboard events
        if (this.main.components.console.pygameLine) {
            this.main.components.console.pygameLine.cleanup();
            this.main.components.console.pygameLine.stop();
        }
    }

    dummyOutSandbox() {
        //Sk.builtinFiles.files["src/lib/pedal/sandbox/sandbox.py"] = "class Sandbox: pass\ndef run(): pass\ndef reset(): pass\n";
    }

    beforeCall(functionName, posargs, kwargs) {
        //console.log("TRACKING CALL", functionName, posargs, kwargs);
        // TODO: Handle fastcall too? Check how that works in Skulpt side
        let studentModel = this.main.model.execution.reports.student;
        if (!("calls" in studentModel)) {
            studentModel.calls = {};
        }
        if (!(functionName in studentModel.calls)) {
            studentModel.calls[functionName] = [];
        }
        let args = {};
        // Get actual parameter names!!
        for (let i=0; i < posargs.length; i+= 1) {
            args["__ARG"+i] = posargs[i];
        }
        if (kwargs && kwargs[0] != null) {
            args["__ARGS"] = kwargs[0];
        }
        if (kwargs && kwargs[1] != null) {
            args["__KWARGS"] = kwargs[1];
        }
        //console.log(args);
        studentModel.calls[functionName].push(args);
    }
}

