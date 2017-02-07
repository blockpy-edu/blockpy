// Empty body, return nothing
    if (node.length == 0) {
        return null;
    }
    
    // Final result list
    var children = [], // The complete set of peers
        root = null, // The top of the current peer
        current = null; // The bottom of the current peer
        
    function addPeer(peer) {
        if (root == null) {
            children.push(peer);
        } else {
            children.push(root);
            root = peer;
            current = peer;
        }
    }
    
    function finalizePeers() {
        if (root != null) {
            children.push(root);
        }
    }
    
    function nestChild(child) {
        if (root == null) {
            root = child;
            current = child;
        } else if (current == null) {
            root = current;
        } else {
            var nextElement = document.createElement("next");
            nextElement.appendChild(child);
            current.appendChild(nextElement);
            current = child;
        }
    }
    
    var lineNumberInBody = 0,
        lineNumberInProgram,
        previousLineInProgram=null,
        distance,
        skipped_line,
        commentCount
        previousHeight = null;
    // Iterate through each node
    for (var i = 0; i < node.length; i++) {
        lineNumberInBody += 1;
        
        lineNumberInProgram = node[i].lineno;
        this.previousGlobalLine = lineNumberInProgram;
        distance = 0, wasFirstLine = true;
        if (previousLineInProgram != null) {
            distance = lineNumberInProgram - previousLineInProgram-1;
            wasFirstLine = false;
        }
        lineNumberInBody += distance;
        
        // Handle earlier comments
        commentCount = 0;
        for (var commentLineInProgram in this.comments) {
            if (commentLineInProgram < lineNumberInProgram) {
                commentChild = this.Comment(this.comments[commentLineInProgram], commentLineInProgram);
                if (previousLineInProgram == null) {
                    nestChild(commentChild);
                } else {
                    skipped_previous_line = Math.abs(previousLineInProgram-commentLineInProgram) > 1;
                    if (is_top_level && skipped_previous_line) {
                        addPeer(commentChild);
                    } else {
                        nestChild(commentChild);
                    }
                }
                previousLineInProgram = commentLineInProgram;
                this.previousGlobalLine = parseInt(commentLineInProgram, 10);
                distance = lineNumberInProgram - previousLineInProgram;
                delete this.comments[commentLineInProgram];
                commentCount += 1;
            }
        }
        
        // Now convert the actual node
        var height = this.heights.shift();
        var originalSourceCode = this.getSourceCode(lineNumberInProgram, height);
        var newChild = this.convertStatement(node[i], originalSourceCode, is_top_level);
        
        // Skip null blocks (e.g., imports)
        if (newChild == null) {
            continue;
        }
        console.log(lineNumberInProgram, height, height-lineNumberInProgram, distance, previousHeight, this.previousGlobalLine, commentCount, this.previousGlobalLine-commentCount, this.nextExpectedLine-commentCount);
        this.nextExpectedLine = lineNumberInProgram+height;
        skipped_line = distance > 1;
        previousLineInProgram = lineNumberInProgram;
        previousHeight = height;
        
        // Handle top-level expression blocks
        if (is_top_level && newChild.constructor == Array) {
            addPeer(newChild[0]);
        // Handle skipped line
        } else if (is_top_level && skipped_line) {
            addPeer(newChild);
        // Otherwise, always embed it in there.
        } else {
            nestChild(newChild);
        }
    }
    
    
    // Handle comments that are on the very last line
    var lastLineNumber = lineNumberInProgram+1
    if (lastLineNumber in this.comments) {
        commentChild = this.Comment(this.comments[lastLineNumber], lastLineNumber);
        nestChild(commentChild);
        delete this.comments[lastLineNumber];
    }
    
    // Handle any extra comments that stuck around
    if (is_top_level) {
        for (var commentLineInProgram in this.comments) {
            commentChild = this.Comment(this.comments[commentLineInProgram], commentLineInProgram);
            distance = commentLineInProgram - previousLineInProgram;
            if (previousLineInProgram == null) {
                addPeer(commentChild);
            } else if (distance > 1) {
                addPeer(commentChild);
            } else {
                nestChild(commentChild);
            }
            previousLineInProgram = commentLineInProgram;
            delete this.comments[lastLineNumber];
        }
    }
    
    
    finalizePeers();
    
    return children;