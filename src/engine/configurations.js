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
        // Proxy requests
        Sk.requestsGet = (url, data, timeout) => this.openURL(url, data, timeout);
        return this;
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
            // Whether or not to keep the globals
            retainGlobals: true
        };
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

    dummyOutSandbox() {
        //Sk.builtinFiles.files["src/lib/pedal/sandbox/sandbox.py"] = "class Sandbox: pass\ndef run(): pass\ndef reset(): pass\n";
    }
}

