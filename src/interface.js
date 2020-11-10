/**
 * @fileoverview Contains main HTML of BlockPy interface, and helper functions.
 * Combines a lot of HTML from components.
 *
 * Here's the layout:
 *  Row 1: Header and Quick Menu
 *  Row 2: Console and Feedback
 *  Row 3: File Navigation
 *  Row 4: View Row
 *  Row 5: Footer Row
 */

import {TRACE_HTML} from "trace.js";
import {DIALOG_HTML} from "dialog.js";
import {FEEDBACK_HTML} from "feedback.js";
import {FILES_HTML} from "files.js";
import {FOOTER_HTML} from "footer.js";
import {EDITORS_HTML} from "editors.js";
import {CONSOLE_HTML} from "console.js";

/**
 * The different layout options of the panes in the second row of the layout.
 * @enum {String}
 */
export let SecondRowSecondPanelOptions = {
    FEEDBACK: "feedback",
    TRACE: "trace",
    NONE: "none"
};

/**
 * Setup any additional Knockout subscriptions to fire on interface changes.
 * @param self
 * @param model
 */
export function makeExtraInterfaceSubscriptions(self, model) {
    // Highlight Markdown when instructions update
    let highlightTimeout = null;
    model.ui.instructions.current.subscribe(() => {
        if (highlightTimeout !== null) {
            clearTimeout(highlightTimeout);
        }
        highlightTimeout = setTimeout(() => {
            model.configuration.container.find(".blockpy-instructions pre code").map( (i, block) => {
                window.hljs.highlightBlock(block);
            });
        }, 400);
    });
    // Provide Fullscreen support
    model.display.fullscreen.subscribe((isFullscreen) => {
        self.components.server.logEvent("X-Display.Fullscreen.Request", "", "",
                                        isFullscreen.toString(), "");
        if (isFullscreen) {
            // NOTE: navigationUI could allow us to force controls to show
            model.configuration.container.parent()[0].requestFullscreen().catch(err => {
                let message = `Error attempting to enable full-screen mode: ${err.message} (${err.name})`;
                self.components.server.logEvent("X-Display.Fullscreen.Error", "", "",
                                                message,  "");
                alert(message);
            }).then(() => {
                self.components.server.logEvent("X-Display.Fullscreen.Success", "", "",
                                                "", "");
                model.display.fullscreen(true);
                model.configuration.container.css("overflow-y", "auto");
            });
        } else {
            document.exitFullscreen().then(() => {
                self.components.server.logEvent("X-Display.Fullscreen.Exit", "", "",
                                                isFullscreen.toString(), "");
                model.display.fullscreen(false);
            });
        }
    });
}

// TODO: Get shareable link button

export function makeInterface(main) {
    return `
<div class='blockpy-content container-fluid'>

    <!-- Dialog -->
    ${DIALOG_HTML}
    
    <!-- Hidden Capture Canvas -->
    <canvas id='capture-canvas' class='d-none' role="presentation" aria-hidden="true"></canvas>
    
    <!-- Row 1: Header and Quick Menu -->
    <div class='row'>
         
         <!-- Description -->
         <div class='col-md-10 blockpy-panel blockpy-header'
               role='heading' aria-label='Assignment Description'>
         
            <!-- Assignment Name -->
            <span role='heading' aria-level='1'
                  class="blockpy-name">
                <strong>BlockPy: </strong> 
                <span data-bind='text: assignment.name'></span>
            </span>
            
            <!-- Reset Instructions Button -->
            <div class="blockpy-instructions-reset"
                data-bind="visible: ui.instructions.isChanged">
                <a class="float-right"
                    data-bind="click: ui.instructions.reset"
                    href="">
                    Reset instructions</a>
            </div>
            
            <!-- Instructions -->
            <div class='blockpy-instructions'
                 data-bind="html: ui.instructions.current">
            </div>
        </div>
        
        <div class='col-md-2 blockpy-panel blockpy-quick-menu'
             role='menubar' aria-label='Quick Menu' title="Quick Menu">
            <!-- Get Shareable Link -->
            <!--<button class="btn btn-outline-secondary btn-sm">
                Get shareable link</button>-->
            <span data-bind="visible: ui.menu.isSubmitted">
                Your submission is ready to be reviewed!</span>
            <button class="btn btn-outline-secondary btn-sm"
                data-bind="visible: ui.menu.canMarkSubmitted,
                           text: ui.menu.textMarkSubmitted,
                           click: ui.menu.clickMarkSubmitted"></button>
            <!-- View as instructor -->
            <div class="form-check"
                 data-bind="visible: ui.role.isGrader">
                <input class="form-check-input" type="checkbox" value="" id="blockpy-as-instructor"
                    data-bind="checked: display.instructor">
                <label class="form-check-label" for="blockpy-as-instructor">
                    View as instructor
                </label>
            </div>
            <button class="btn btn-outline-secondary btn-sm"
                data-bind="click: ui.menu.clickFullscreen"
                title="Full Screen"
            ><span class='fas',
                           data-bind="class: ui.menu.textFullscreen"
            ></span></button>
            <button class="btn btn-outline-secondary btn-sm"
                data-bind="click: ui.menu.editInputs, visible: ui.menu.showQueuedInputs" title="Edit Inputs"
            ><span class='fas fa-list-alt'></span></button>
            <span class="blockpy-student-error fas fa-bug"></span>
        </div>
         
    </div>
    
    <!-- Row 2: Console and Feedback -->
    <!-- ko if: ui.secondRow.isAllVisible -->
    <div class='row'>
    
        <!-- Console -->
        ${CONSOLE_HTML}
         
        <!-- Feedback -->
        <!-- ko if: ui.secondRow.isFeedbackVisible -->
        ${FEEDBACK_HTML}
        <!-- /ko -->
        
        <!-- Trace -->
        <!-- ko if: ui.secondRow.isTraceVisible -->
        ${TRACE_HTML}
        <!-- /ko -->
         
    </div>
    <!-- /ko -->
    
    <!-- Row 3: File Navigation -->
    <!-- ko if: ui.files.visible -->
    <div class='row'>
        ${FILES_HTML}
    </div>
    <!-- /ko -->
    
    <!-- Row 4: View Row -->
    <div class="row">
        ${EDITORS_HTML}
    </div>

    <!-- Row 5: Footer Row -->    
    <div class="row">
        ${FOOTER_HTML}
    </div>
    
</div>
    `;
}