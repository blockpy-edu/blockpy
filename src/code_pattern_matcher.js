function CodePatternMatcher(left, right) {
    // Inherit
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
    
    // Convert to ASTs
    left = this.parseAst(left);
    right = this.parseAst(right);
    if (!left || !right) {
        throw "CodeMatcher: No code given."
    }
    console.log(left, right);
    
    // Match patterns
    this.cached = {};
    return this.matchTrees(left, right, {});
};

CodePatternMatcher.prototype = new NodeVisitor();

CodePatternMatcher.prototype.matchTrees = function(left, right, pattern) {
    // Do left and right match?
    if (this.areNodesEqual(left, right)) {
        return pattern;
    } else {
        var left_children = left.walk().slice(1);
        var right_children = left.walk().slice(1);
        var result = [];
        // Does a left child match the right tree?
        for (var i = 0, len = left_children.length; i < len; i = i+1) {
            result.concat(this.matchTrees(left_children[i], right, pattern));
        }
        // Does a right child match the left tree?
        for (var i = 0, len = right_children.length; i < len; i = i+1) {
            result.concat(this.matchTrees(left, right_children[i], pattern));
        }
        return result;
    }
}

CodePatternMatcher.prototype.areNodesEqual = function(left, right) {
    if (left.ast_name == right.ast_name) {
        var childList = iter_fields(left);
        for (var i = 0; i < childList.length; i += 1) {
            var field = childList[i][0],
                leftField = childList[i][1];
            var rightField = right[field];
            console.log(leftField, rightField);
        }
        //return resultList;
    } else {
        return false;
    }
}

CodePatternMatcher.prototype.parseAst = function(code) {
    // Code
    var filename = '__main__';
    
    // Attempt parsing - might fail!
    try {
        var parse = Sk.parse(filename, code);
        var ast = Sk.astFromParse(parse.cst, filename, parse.flags);
        return ast;
    } catch (error) {
        throw error;
        return;
    }
};

(function() {
    
    var unit_tests = [
        ["for ___ in ___:\n  count = count + 1\n___ = ____/count",
         "x=0\nfor i in y:\n    x = x + 1\nz = z/x", {"count": "x"}],
    ]
    
    var errors = 0;
    for (var i = 0, len = unit_tests.length; i < len; i = i+1) {
        var left = unit_tests[i][0],
            right = unit_tests[i][1],
            correct_patterns = unit_tests[i][2];
        result_patterns = new CodePatternMatcher(left, right);
        for (var j = 0, len2 = result_patterns.length; j < len2; j= j+1) {
            var pattern = result_patterns[j];
            for (var key in pattern) {
                if (pattern.hasOwnProperty(key)) {
                    if (!(key in correct_patterns)) {
                        console.error("CM Tests: Error!", left, right, pattern, correct_patterns);
                        errors += 1;
                        continue;
                    }
                }
            }
        }
    }
    if (errors == 0) {
        console.log("CodeMatcher: All test cases passed!");
    } else {
        console.log("CodeMatcher:", errors, "test cases failed out of", unit_tests.length);
    }
})();