/**
 * An object that manages the main toolbar, including the different mode buttons.
 * This doesn't actually have many responsibilities after the initial load.
 */
export class BlockPyToolbar {
    main: any;
    tag: any;
    tags: Record<string, any>;

    constructor(main: any, tag: any) {
        this.main = main;
        this.tag = tag;

        // Holds the HTMLElement tags for each of the toolbar items
        this.tags = {};
        this.tags.mode_set_text = this.tag.find(".blockpy-mode-set-text");
        this.tags.filename_picker = this.tag.find(".blockpy-toolbar-filename-picker");

        // Actually set up the toolbar!
        this.activateToolbar();
    }

    /**
     * Register click events for more complex toolbar actions.
     *
     * Note: Pretty sure these are all deprecated!
     */
    activateToolbar(): void {
        const main = this.main;
        this.tag.find(".blockpy-run").click(function(e: any) {
            //main.components.server.logEvent('editor', 'run')
            const backup = this;
            main.components.feedback.clear();
            $(this).removeClass("btn-success").addClass("btn-warning");
            main.components.engine.on_run();
            $(backup)
                .removeClass("btn-warning")
                .addClass("btn-success");
        });
        this.tags.mode_set_text.click(function() {
            main.components.server.logEvent("editor", "text");
            main.model.settings.editor("Text");
        });
        this.tag.find(".blockpy-toolbar-reset").click(function() {
            main.model.programs["__main__"](main.model.programs["starting_code"]());
            main.components.server.logEvent("editor", "reset");
            if (main.model.assignment.parsons()) {
                main.components.editor.blockly.shuffle();
            }
        });
        this.tag.find(".blockpy-mode-set-blocks").click(function(event: any) {
            if (main.model.areBlocksUpdating()) {
                main.components.server.logEvent("editor", "blocks");
                main.model.settings.editor("Blocks");
            } else {
                event.preventDefault();
                return false;
            }
        });
        this.tag.find(".blockpy-mode-set-split").click(function(event: any) {
            if (main.model.areBlocksUpdating()) {
                main.model.settings.editor("Split");
                main.components.server.logEvent("editor", "split");
            } else {
                event.preventDefault();
                return false;
            }
        });
        this.tag.find(".blockpy-toolbar-import").click(function() {
            main.components.corgis.openDialog();
            main.components.server.logEvent("editor", "import");
        });
        this.tag.find(".blockpy-toolbar-history").click(function() {
            main.components.history.openDialog();
            main.components.server.logEvent("editor", "history");
        });
        const instructorDialog = this.main.model.constants.container.find(".blockpy-instructor-popup");
        this.tag.find(".blockpy-toolbar-instructor").click(function() {
            instructorDialog.modal({"backdrop": false}).modal("show");
            instructorDialog.draggable({
                "handle": ".modal-title"
            });
            main.components.server.logEvent("editor", "instructor");
        });
        this.tag.find(".blockpy-toolbar-english").click(function() {
            main.components.english.openDialog();
            main.components.server.logEvent("editor", "english");
        });

        this.tag.find(".blockpy-toolbar-filename-picker label").click(function() {
            main.model.settings.filename($(this).data("filename"));
        });
    }
}
