export const EMPTY_MODULE = "let $builtinmodule = function(mod){ return mod; }"

/**
 * A container for holding settings of a particular run configuration.
 */
export class Configuration {

    constructor(main) {
        this.main = main;
        this.filename = null;
        this.code = null;
    }

    use(engine) {
        // Access point for instructor data
        this.engine = engine;
        Sk.executionReports = this.main.model.execution.reports;
        Sk.console = this.main.components.console;
        Sk.queuedInput = [];
        Sk.configure(this.getSkulptOptions());
        return this;
    }

    getSkulptOptions() {
        return {
            __future__: Sk.python3,
            // import
            read: this.importFile.bind(this),
            // open
            fileopen: this.openFile.bind(this),
            // file.write
            filewrite: this.writeFile.bind(this),
            // print
            output: this.print.bind(this),
            // Prevents reading HTML elements as files
            inBrowser: false,
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

    static inputMockFunction() {
        if (Sk.queuedInput.length) {
            return Sk.queuedInput.pop();
        } else {
            return "";
        }
    };

    getImageProxy() {
        // TODO
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

