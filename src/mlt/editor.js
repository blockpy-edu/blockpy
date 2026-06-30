import { workspaceToPython } from "./blockToPython";
import { PYTHON_BLOCK_TYPES, PYTHON_TOOLBOX, registerPythonBlocks } from "./pythonBlocks";
import { pythonToBlocks } from "./pythonToBlocks";

const DEFAULT_HEIGHT = 500;
const XMLNS = "https://developers.google.com/blockly/xml";

const GLOBAL_SCOPE = typeof window !== "undefined" ? window : globalThis;
const DATASET_EXTRA_TOOLS = GLOBAL_SCOPE.BlockMirrorBlockEditor && GLOBAL_SCOPE.BlockMirrorBlockEditor.EXTRA_TOOLS
    ? GLOBAL_SCOPE.BlockMirrorBlockEditor.EXTRA_TOOLS
    : {};

GLOBAL_SCOPE.BlockMirrorBlockEditor = GLOBAL_SCOPE.BlockMirrorBlockEditor || {};
GLOBAL_SCOPE.BlockMirrorBlockEditor.EXTRA_TOOLS = DATASET_EXTRA_TOOLS;
GLOBAL_SCOPE.BlockMirrorTextToBlocks = GLOBAL_SCOPE.BlockMirrorTextToBlocks || {};

let pythonBlocksRegistered = false;

function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function blocklyTextToDom(xmlText) {
    if (Blockly.Xml && Blockly.Xml.textToDom) {
        return Blockly.Xml.textToDom(xmlText);
    }
    return new DOMParser().parseFromString(xmlText, "text/xml").documentElement;
}

function blocklyDomToText(dom) {
    if (Blockly.Xml && Blockly.Xml.domToText) {
        return Blockly.Xml.domToText(dom);
    }
    return new XMLSerializer().serializeToString(dom);
}

function workspaceToDom(workspace) {
    if (Blockly.Xml && Blockly.Xml.workspaceToDom) {
        return Blockly.Xml.workspaceToDom(workspace);
    }
    return null;
}

function domToWorkspace(dom, workspace) {
    if (Blockly.Xml && Blockly.Xml.domToWorkspace) {
        Blockly.Xml.domToWorkspace(dom, workspace);
    }
}

function clearWorkspace(workspace) {
    if (workspace && workspace.clear) {
        workspace.clear();
    }
}

function setLineClass(codeMirror, lineNumber, className) {
    if (!codeMirror || lineNumber == null || Number.isNaN(lineNumber)) {
        return null;
    }
    const zeroIndexed = Math.max(0, Number(lineNumber) - 1);
    return codeMirror.addLineClass(zeroIndexed, "background", className);
}

function normalizeLines(lines) {
    if (lines == null) {
        return [];
    }
    if (Array.isArray(lines)) {
        return lines;
    }
    return [lines];
}

function injectExtraToolContents(toolboxDefinition, extraEntries) {
    if (!extraEntries.length) {
        return toolboxDefinition;
    }
    const result = deepClone(toolboxDefinition) || { kind: "categoryToolbox", contents: [] };
    if (!result.kind) {
        result.kind = "categoryToolbox";
    }
    if (!Array.isArray(result.contents)) {
        result.contents = [];
    }
    extraEntries.forEach((entry) => {
        if (typeof entry === "string") {
            if (entry.trim().charAt(0) === "<") {
                result.contents.push(entry);
            } else {
                result.contents.push({ kind: "sep", gap: "12" });
                result.contents.push({ kind: "label", text: entry });
            }
        } else if (entry) {
            result.contents.push(entry);
        }
    });
    return result;
}

function extraToolObjectToItem(slug, tool) {
    if (!tool) {
        return [];
    }
    if (typeof tool === "function") {
        return extraToolObjectToItem(slug, tool());
    }
    if (typeof tool === "string") {
        return [tool];
    }
    if (Array.isArray(tool)) {
        return tool.reduce((accumulator, entry) => accumulator.concat(extraToolObjectToItem(slug, entry)), []);
    }
    if (tool.kind || tool.type) {
        return [tool];
    }
    if (tool.toolbox) {
        return extraToolObjectToItem(slug, tool.toolbox);
    }
    if (tool.blocks) {
        return [{
            kind: "category",
            name: tool.name || tool.title || slug,
            colour: String(tool.colour || tool.color || 45),
            contents: tool.blocks.map((block) => {
                if (typeof block === "string") {
                    return { kind: "block", type: block };
                }
                if (block && !block.kind && block.type) {
                    return Object.assign({ kind: "block" }, block);
                }
                return block;
            })
        }];
    }
    return [{
        kind: "category",
        name: tool.name || tool.title || slug,
        colour: String(tool.colour || tool.color || 45),
        contents: []
    }];
}

function categoryItemToXml(item) {
    const name = item.name ? ` name="${escapeXml(item.name)}"` : "";
    const colour = item.colour ? ` colour="${escapeXml(item.colour)}"` : "";
    const custom = item.custom ? ` custom="${escapeXml(item.custom)}"` : "";
    const contents = (item.contents || []).map(toolboxItemToXml).join("");
    return `<category${name}${colour}${custom}>${contents}</category>`;
}

function blockItemToXml(item) {
    const type = item.type ? ` type="${escapeXml(item.type)}"` : "";
    const fields = Object.keys(item.fields || {}).map((fieldName) => (
        `<field name="${escapeXml(fieldName)}">${escapeXml(item.fields[fieldName])}</field>`
    )).join("");
    return `<block${type}>${fields}</block>`;
}

function toolboxItemToXml(item) {
    if (!item) {
        return "";
    }
    if (typeof item === "string") {
        return item;
    }
    switch (item.kind) {
        case "category":
            return categoryItemToXml(item);
        case "block":
            return blockItemToXml(item);
        case "sep":
            return `<sep gap="${escapeXml(item.gap || 8)}"></sep>`;
        case "label":
            return `<label text="${escapeXml(item.text || "")}"></label>`;
        case "button":
            return `<button text="${escapeXml(item.text || "")}" callbackKey="${escapeXml(item.callbackKey || "")}"></button>`;
        case "categoryToolbox":
            return (item.contents || []).map(toolboxItemToXml).join("");
        default:
            if (item.type) {
                return blockItemToXml(Object.assign({ kind: "block" }, item));
            }
            return "";
    }
}

function toolboxJsonToXml(toolboxDefinition) {
    const contents = toolboxDefinition && toolboxDefinition.kind === "categoryToolbox"
        ? toolboxDefinition.contents || []
        : toolboxDefinition && Array.isArray(toolboxDefinition.contents)
            ? toolboxDefinition.contents
            : Array.isArray(toolboxDefinition)
                ? toolboxDefinition
                : [];
    return `<xml xmlns="${XMLNS}">${contents.map(toolboxItemToXml).join("")}</xml>`;
}

function buildMinimalToolbox() {
    return {
        kind: "categoryToolbox",
        contents: [
            {
                kind: "category",
                name: "Values",
                colour: "230",
                contents: [
                    { kind: "block", type: PYTHON_BLOCK_TYPES.NUMBER },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.STRING },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.BOOLEAN },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.NONE }
                ]
            },
            {
                kind: "category",
                name: "Variables",
                colour: "330",
                contents: [
                    { kind: "block", type: PYTHON_BLOCK_TYPES.VARIABLE },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.ASSIGN }
                ]
            },
            {
                kind: "category",
                name: "Control",
                colour: "120",
                contents: [
                    { kind: "block", type: PYTHON_BLOCK_TYPES.IF },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.FOR },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.WHILE }
                ]
            },
            {
                kind: "category",
                name: "Functions",
                colour: "290",
                contents: [
                    { kind: "block", type: PYTHON_BLOCK_TYPES.FUNC_CALL },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.PRINT }
                ]
            }
        ]
    };
}

function isXmlToolbox(toolbox) {
    return typeof toolbox === "string" && toolbox.trim().charAt(0) === "<";
}

function makeSvgPng(svgElement, callback) {
    if (!svgElement) {
        callback("", { remove() {} });
        return;
    }
    const clone = svgElement.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const bbox = svgElement.getBBox ? svgElement.getBBox() : { x: 0, y: 0, width: 1, height: 1 };
    const width = Math.max(1, Math.ceil(bbox.width + 40));
    const height = Math.max(1, Math.ceil(bbox.height + 40));
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
    clone.setAttribute("viewBox", `${bbox.x - 20} ${bbox.y - 20} ${width} ${height}`);
    const svgText = new XMLSerializer().serializeToString(clone);
    const image = new Image();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (context) {
            context.fillStyle = "white";
            context.fillRect(0, 0, width, height);
            context.drawImage(image, 0, 0);
        }
        URL.revokeObjectURL(svgUrl);
        callback(canvas.toDataURL("image/png"), image);
    };
    image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        callback("", image);
    };
    image.src = svgUrl;
}

class MLTEditor {
    constructor(configuration) {
        if (!pythonBlocksRegistered) {
            registerPythonBlocks(Blockly);
            pythonBlocksRegistered = true;
        }
        this.configuration = Object.assign({
            height: DEFAULT_HEIGHT,
            toolbox: "normal",
            imageMode: false
        }, configuration || {});
        this.changeListeners = [];
        this.highlightHandles = {};
        this.isApplyingTextChange = false;
        this.isApplyingBlockChange = false;
        this.lastValidBlocksXml = `<xml xmlns="${XMLNS}"></xml>`;
        this.lastValidPython = "";
        this.parseErrors = [];
        this.renderImages = !!this.configuration.imageMode;
        this.textToBlocks = {
            hiddenImports: GLOBAL_SCOPE.BlockMirrorTextToBlocks.hiddenImports || []
        };
        GLOBAL_SCOPE.BlockMirrorTextToBlocks.hiddenImports = this.textToBlocks.hiddenImports;
        this.buildToolboxes();
        this.render();
        this.setupTextEditor();
        this.setupBlockEditor();
        this.setMode(this.configuration.mode || "split");
        this.setImageMode(this.configuration.imageMode);
        this.setCode("");
    }

    buildToolboxes() {
        const normalToolbox = deepClone(PYTHON_TOOLBOX);
        if (normalToolbox && Array.isArray(normalToolbox.contents)) {
            normalToolbox.contents = normalToolbox.contents.slice();
            normalToolbox.contents.push({
                kind: "category",
                name: "Advanced",
                colour: "120",
                contents: [
                    { kind: "block", type: PYTHON_BLOCK_TYPES.TRY },
                    { kind: "block", type: PYTHON_BLOCK_TYPES.DECORATED }
                ]
            });
        }
        this.toolboxPresets = {
            empty: { kind: "categoryToolbox", contents: [] },
            normal: normalToolbox,
            minimal: buildMinimalToolbox(),
            full: deepClone(normalToolbox),
            ct: deepClone(normalToolbox),
            ct2: deepClone(normalToolbox)
        };
    }

    render() {
        this.container = this.configuration.container;
        this.container.innerHTML = "";
        this.root = document.createElement("div");
        this.root.className = "mlt-editor";
        this.root.style.display = "flex";
        this.root.style.width = "100%";
        this.root.style.gap = "8px";
        this.root.style.alignItems = "stretch";

        this.blockPane = document.createElement("div");
        this.blockPane.className = "mlt-editor-blocks";
        this.blockPane.style.position = "relative";
        this.blockPane.style.flex = "1 1 50%";
        this.blockPane.style.minWidth = "0";
        this.blockPane.style.border = "1px solid #ddd";

        this.blockOverlay = document.createElement("div");
        this.blockOverlay.style.position = "absolute";
        this.blockOverlay.style.inset = "0";
        this.blockOverlay.style.display = "none";
        this.blockOverlay.style.background = "rgba(255,255,255,0.01)";
        this.blockOverlay.style.zIndex = "10";

        this.blockTarget = document.createElement("div");
        this.blockTarget.style.width = "100%";
        this.blockTarget.style.height = "100%";

        this.textPane = document.createElement("div");
        this.textPane.className = "mlt-editor-text";
        this.textPane.style.flex = "1 1 50%";
        this.textPane.style.minWidth = "0";
        this.textPane.style.border = "1px solid #ddd";

        this.textarea = document.createElement("textarea");
        this.textPane.appendChild(this.textarea);
        this.blockPane.appendChild(this.blockTarget);
        this.blockPane.appendChild(this.blockOverlay);
        this.root.appendChild(this.blockPane);
        this.root.appendChild(this.textPane);
        this.container.appendChild(this.root);
    }

    setupTextEditor() {
        const codeMirror = CodeMirror.fromTextArea(this.textarea, {
            mode: "python",
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            extraKeys: {
                Tab: "indentMore",
                "Shift-Tab": "indentLess"
            }
        });
        codeMirror.on("change", () => {
            if (this.isApplyingTextChange) {
                return;
            }
            this.syncBlocksFromText(codeMirror.getValue());
            this.notifyChangeListeners();
        });
        this.textEditor = {
            codeMirror,
            resizeResponsively: () => {
                const height = typeof this.configuration.height === "number"
                    ? `${this.configuration.height}px`
                    : this.configuration.height;
                this.blockPane.style.height = height;
                this.textPane.style.height = height;
                codeMirror.setSize("100%", height);
                codeMirror.refresh();
                if (Blockly.svgResize && this.blockEditor && this.blockEditor.workspace) {
                    Blockly.svgResize(this.blockEditor.workspace);
                }
            },
            updateGutter: () => {
                codeMirror.refresh();
            },
            enableImages: () => {
                this.renderImages = true;
            },
            disableImages: () => {
                this.renderImages = false;
            }
        };
        this.textEditor.resizeResponsively();
    }

    setupBlockEditor() {
        const toolboxDom = this.getToolboxDom();
        const workspace = Blockly.inject(this.blockTarget, {
            media: this.configuration.blocklyMediaPath,
            toolbox: toolboxDom,
            trashcan: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            }
        });
        workspace.addChangeListener((event) => {
            if (this.isApplyingBlockChange || !event) {
                return;
            }
            const eventType = Blockly.Events && Blockly.Events.UI ? Blockly.Events.UI : "ui";
            if (event.type === eventType) {
                return;
            }
            this.syncTextFromBlocks();
            this.notifyChangeListeners();
        });
        this.blockEditor = {
            workspace,
            TOOLBOXES: this.toolboxPresets,
            EXTRA_TOOLS: DATASET_EXTRA_TOOLS,
            remakeToolbox: () => {
                const dom = this.getToolboxDom();
                if (workspace.updateToolbox) {
                    workspace.updateToolbox(dom);
                }
                if (Blockly.svgResize) {
                    Blockly.svgResize(workspace);
                }
            },
            getPngFromBlocks: (callback) => {
                const svg = this.blockTarget.querySelector("svg");
                makeSvgPng(svg, callback);
            }
        };
    }

    resolveToolboxDefinition() {
        let toolbox = this.configuration.toolbox;
        if (typeof toolbox === "string" && !isXmlToolbox(toolbox)) {
            toolbox = this.toolboxPresets[toolbox] || this.toolboxPresets.normal;
        }
        const extraEntries = [];
        const hiddenImports = this.textToBlocks.hiddenImports.length
            ? this.textToBlocks.hiddenImports
            : Object.keys(DATASET_EXTRA_TOOLS);
        hiddenImports.forEach((slug) => {
            extraEntries.push.apply(extraEntries, extraToolObjectToItem(slug, DATASET_EXTRA_TOOLS[slug]));
        });
        if (isXmlToolbox(toolbox)) {
            return toolbox;
        }
        return injectExtraToolContents(toolbox || this.toolboxPresets.normal, extraEntries);
    }

    getToolboxDom() {
        const toolbox = this.resolveToolboxDefinition();
        const xmlText = typeof toolbox === "string" ? toolbox : toolboxJsonToXml(toolbox);
        return blocklyTextToDom(xmlText);
    }

    syncBlocksFromText(code) {
        const result = pythonToBlocks(code);
        this.parseErrors = result.errors || [];
        if (result.success && result.blocksXml) {
            this.lastValidBlocksXml = result.blocksXml;
            this.lastValidPython = code;
            this.isApplyingBlockChange = true;
            clearWorkspace(this.blockEditor.workspace);
            domToWorkspace(blocklyTextToDom(result.blocksXml), this.blockEditor.workspace);
            this.isApplyingBlockChange = false;
            if (Blockly.svgResize) {
                Blockly.svgResize(this.blockEditor.workspace);
            }
        }
    }

    syncTextFromBlocks() {
        const result = workspaceToPython(this.blockEditor.workspace);
        this.parseErrors = result.errors || [];
        const code = result.code || "";
        this.lastValidPython = code;
        const dom = workspaceToDom(this.blockEditor.workspace);
        if (dom) {
            this.lastValidBlocksXml = blocklyDomToText(dom);
        }
        if (code !== this.textEditor.codeMirror.getValue()) {
            this.isApplyingTextChange = true;
            this.textEditor.codeMirror.setValue(code);
            this.isApplyingTextChange = false;
        }
    }

    notifyChangeListeners() {
        this.changeListeners.slice().forEach((listener) => listener({
            code: this.getCode(),
            source: "editor"
        }));
    }

    addChangeListener(listener) {
        if (this.changeListeners.indexOf(listener) === -1) {
            this.changeListeners.push(listener);
        }
    }

    removeChangeListener(listener) {
        this.changeListeners = this.changeListeners.filter((candidate) => candidate !== listener);
    }

    setCode(code) {
        const safeCode = code == null ? "" : String(code);
        this.isApplyingTextChange = true;
        this.textEditor.codeMirror.setValue(safeCode);
        this.isApplyingTextChange = false;
        this.syncBlocksFromText(safeCode);
    }

    getCode() {
        return this.textEditor.codeMirror.getValue();
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === "block") {
            this.blockPane.style.display = "block";
            this.blockPane.style.flex = "1 1 100%";
            this.textPane.style.display = "none";
        } else if (mode === "text") {
            this.blockPane.style.display = "none";
            this.textPane.style.display = "block";
            this.textPane.style.flex = "1 1 100%";
        } else {
            this.blockPane.style.display = "block";
            this.textPane.style.display = "block";
            this.blockPane.style.flex = "1 1 50%";
            this.textPane.style.flex = "1 1 50%";
        }
        this.refresh();
    }

    setReadOnly(isReadOnly) {
        this.readOnly = !!isReadOnly;
        this.textEditor.codeMirror.setOption("readOnly", this.readOnly);
        this.blockOverlay.style.display = this.readOnly ? "block" : "none";
    }

    setHighlightedLines(lines, className) {
        const targetClassName = className || "editor-highlight-line";
        this.clearHighlightedLines(targetClassName);
        this.highlightHandles[targetClassName] = normalizeLines(lines).map((lineNumber) => (
            setLineClass(this.textEditor.codeMirror, lineNumber, targetClassName)
        )).filter(Boolean);
    }

    clearHighlightedLines(className) {
        const classNames = className ? [className] : Object.keys(this.highlightHandles);
        classNames.forEach((targetClassName) => {
            (this.highlightHandles[targetClassName] || []).forEach((handle) => {
                this.textEditor.codeMirror.removeLineClass(handle, "background", targetClassName);
            });
            this.highlightHandles[targetClassName] = [];
        });
    }

    refresh() {
        this.textEditor.resizeResponsively();
        if (Blockly.svgResize && this.blockEditor && this.blockEditor.workspace) {
            Blockly.svgResize(this.blockEditor.workspace);
        }
    }

    forceBlockRefresh() {
        this.syncBlocksFromText(this.getCode());
        if (this.blockEditor && this.blockEditor.remakeToolbox) {
            this.blockEditor.remakeToolbox();
        }
    }

    setImageMode(imageMode) {
        this.configuration.imageMode = !!imageMode;
        if (this.configuration.imageMode) {
            this.textEditor.enableImages();
        } else {
            this.textEditor.disableImages();
        }
    }
}

MLTEditor.EXTRA_TOOLS = DATASET_EXTRA_TOOLS;
MLTEditor.PYTHON_TOOLBOX = PYTHON_TOOLBOX;

export { MLTEditor };
