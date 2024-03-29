//TODO: Move get link down to footer, remove vertical bar from quick-menu
export let FOOTER_HTML = `
<div class="col-md-12 blockpy-panel blockpy-status">
    <div>
        <label class="badge" data-bind="class: ui.server.status('loadAssignment')">Load Assignment
            <!-- ko if: display.instructor -->
            <input type="file"
            class="blockpy-force-load-assignment-file blockpy-hidden-file"
            accept="application/JSON"
            data-bind="event: {change: ui.server.force.loadAssignment}">
            <!-- /ko -->
        </label>, 
        <span class="badge" data-bind="class: ui.server.status('saveAssignment')">Save Assignment</span>, 
        <span class="badge" data-bind="class: ui.server.status('loadFile')">Load File</span>, 
        <span class="badge" data-bind="class: ui.server.status('saveFile')">Save File</span>, 
        <span class="badge" data-bind="class: ui.server.status('loadDataset')">Load Dataset</span>, 
        <span class="badge" data-bind="class: ui.server.status('logEvent')">Log Event</span>, 
        <span class="badge" data-bind="class: ui.server.status('updateSubmission'),
                                        click: ui.server.force.updateSubmission">Update Submission</span>, 
        <span class="badge" data-bind="class: ui.server.status('onExecution')">Execution</span>
    </div>
    <div
        <span data-bind="text: ui.server.messages"></span>
    </div>
    <div>
        <span>User: <span data-bind="text: user.id"></span> (<span data-bind="text: user.name"></span>, <span data-bind="text: user.role"></span>)</span>, 
        <span>Course: <span data-bind="text: user.courseId"></span></span>,
        <span>Group: <span data-bind="text: user.groupId"></span></span>,
        <span>Assignment: <span data-bind="text: assignment.id"></span></span>,
        <span>Assignment Version: <span data-bind="text: assignment.version"></span></span>,
        <span>Submission: 
            <span data-bind="text: submission.id"></span>
            <span data-bind="if: submission.ownerId() != user.id()">
                (Owner ID: <span data-bind="text: submission.ownerId()"></span>)
            </span>
        </span>, 
        <span>Submission Version: <span data-bind="text: submission.version"></span></span>,
        <span>Editor Version: <span data-bind="text: display.editorVersion"></span></span>
    </div>
</div>
`;