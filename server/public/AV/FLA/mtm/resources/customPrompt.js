function NodePrompt() {
    this.render = function(value, is, fs, lab) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogueoverlay = document.getElementById('dialogueoverlay');
        var dialoguebox = document.getElementById('dialoguebox');
        dialogueoverlay.style.display = "block";
        dialogueoverlay.style.height = winH+"px";
        dialoguebox.style.left = (winW/2) - (550/2)+"px";
        dialoguebox.style.top = "100px";
        dialoguebox.style.display = "block";
        document.getElementById('dialogueboxhead').innerHTML = "Edit Node <b>" + value + ":</b>";
        document.getElementById('dialogueboxbody').innerHTML = 'Initial State:<input type="checkbox" id="initial_state">';
        document.getElementById('dialogueboxbody').innerHTML += '<br>Final State:<input type="checkbox" id="final_state">';
        document.getElementById('dialogueboxbody').innerHTML += '<br>Label: <input id="label">';
        document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="ok()">OK</button> <button onclick="terminate()">Cancel</button>';
        if (is) {
            document.getElementById('initial_state').checked = true;
        }
        if (fs) {
            document.getElementById('final_state').checked = true;
        }
        if (lab) {
            document.getElementById('label').value = lab;
        }
    }
    terminate = function() {
        document.getElementById('dialoguebox').style.display = "none";
        document.getElementById('dialogueoverlay').style.display = "none";
    }
    ok = function() {
        var initial_state = document.getElementById('initial_state').checked;
        var final_state = document.getElementById('final_state').checked;
        var node_label = document.getElementById('label').value;
        window["updateNode"](initial_state, final_state, node_label);
        this.terminate();
    }
}

function EdgePrompt() {
    this.render = function(value) {
        var winW = window.innerWidth;
        var winH = window.innerHeight;
        var dialogueoverlay = document.getElementById('dialogueoverlay');
        var dialoguebox = document.getElementById('dialoguebox');
        dialogueoverlay.style.display = "block";
        dialogueoverlay.style.height = winH+"px";
        dialoguebox.style.left = (winW/2) - (550/2)+"px";
        dialoguebox.style.top = "100px";
        dialoguebox.style.display = "block";
        if(value === ""){
            document.getElementById('dialogueboxhead').innerHTML = "Create Edge:";
            document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="addEdge()">OK</button> <button onclick="end()">Cancel</button>';
        }
        else {
            document.getElementById('dialogueboxhead').innerHTML = "Edit Edge:";
            document.getElementById('dialogueboxfoot').innerHTML = '<button onclick="changeEdge()">OK</button> <button onclick="end()">Cancel</button>';
        }
        document.getElementById('dialogueboxbody').innerHTML = 'Accepted Character: <input id="transition">';
        document.getElementById('transition').value = value;
    }
    end = function() {
        document.getElementById('dialoguebox').style.display = "none";
        document.getElementById('dialogueoverlay').style.display = "none";
    }
    addEdge = function() {
        var edge_label = document.getElementById('transition').value;
        if (edge_label === "") {
            edge_label = "\&lambda;";
        }
        window["createEdge"](edge_label);
        this.end();
    }
    changeEdge = function() {
        var edge_label = document.getElementById('transition').value;
        if (edge_label === "") {
            edge_label = "\&lambda;";
        }
        window["updateEdge"](edge_label);
        this.end();
    }
}