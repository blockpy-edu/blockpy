"use strict";

/* global LAMBDA */

$(document).ready(function () {

    //var av_name = "parseTree";
    //var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
    //var av = new JSAV(av_name);

    var lt = "&lt;";
    var gt = "&gt;";
    var eNT = lt + "&lambda;exp" + gt;
    //var eNT = lt + "e" + gt;
    var varNT = lt + "var" + gt;
    //var varNT = lt + "v" + gt;
    var lambdaexp = "((z ^x.^y.z) (x y))";
    var arr, tree, label1,label2, graph;

    var oneChar = function(x) { return ! parenChar(x) &&
				arr.value(x).length === 1; };
    var noChar = function(x) { return arr.value(x).length === 0; };
    var lambdaChar = function(x) { return arr.value(x).length === 3; };
    var parenChar = function(x) { 
    return arr.value(x) === '(' || arr.value(x) === ')' ||
	    arr.value(x) === ' '; 
    };

    JSAV.init();
    JSAV.ext.SPEED = 500;

    var av = new JSAV($("#parseTree"));

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 1 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    arr = av.ds.array(LAMBDA.mySplit(lambdaexp.replace(/\^/g,"\u03BB")));
    arr.removeClass(true,"oneCharWidth");
    arr.removeClass(true,"emptyWidth");
    arr.removeClass(true,"lambdaWidth");
    arr.removeClass(true,"narrow");
    arr.addClass(true, "defaultCellStyle");
    arr.addClass(noChar,"emptyWidth");
    arr.addClass(oneChar, "oneCharWidth");
    arr.addClass(parenChar,"narrow");
    arr.addClass(lambdaChar,"lambdaWidth");

    //setArrayCellsWidth();
    label1 = av.label("The root node of the parse tree for any ");
    label2 = av.label("&lambda; expression  is always the non-terminal " + eNT +".");
    label1.addClass("labelstyle");
    label2.addClass("labelstyle");
    tree = av.ds.tree({nodegap: 10});
    tree.root(eNT);
    tree.root().addClass("wider");
    tree.layout();
    av.displayInit();

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 2 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    arr.addClass([0],"lambdaexphighlight");
    label1.text("Since the first character of the");
    label2.text("&lambda; expression is a left parenthesis...");
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 3 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    arr.addClass([arr.size()-1],"lambdaexphighlight");
    label1.text("... it must, together with the last parenthesis, define a");
    label2.text("function application at the top-level of the parse tree.");
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 4 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("Let's add the four nodes corresponding to this");
    label2.text("top-level function application to the parse tree.");
    tree.root().addChild("(").addChild(eNT).addChild(eNT).addChild(")");
    //tree.root().child(0).translateX("-40px");
    //tree.root().child(0).edgeToParent().layout();
    tree.root().child(1).addClass("wider");
    tree.root().child(2).addClass("wider");
    tree.root().child(0).highlight();
    tree.root().child(1).highlight();
    tree.root().child(2).highlight();
    tree.root().child(3).highlight();
    tree.layout();



    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 5 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    arr.removeClass([0,arr.size()-1],"lambdaexphighlight");
    arr.addClass([1],"lambdaexphighlight");
    tree.root().child(0).unhighlight();
    tree.root().child(1).unhighlight();
    tree.root().child(2).unhighlight();
    tree.root().child(3).unhighlight();
    label1.text("Now, we need to identify the two &lambda; expressions that make up");
    label2.text("this application. The first one must start with this left parenthesis...");
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 6 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    arr.addClass([7],"lambdaexphighlight");
    label1.text("... and must end with the matching");
    label2.text("right parenthesis highlighted above.");
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 7 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("So we can add the corresponding");
    label2.text("nodes to the parse tree.");
    tree.root().child(1).addChild("(").addChild(eNT).addChild(eNT).addChild(")");
    tree.root().child(1).child(1).addClass("wider");
    tree.root().child(1).child(2).addClass("wider");
    tree.root().child(1).child(0).highlight();
    tree.root().child(1).child(1).highlight();
    tree.root().child(1).child(2).highlight();
    tree.root().child(1).child(3).highlight();
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 8 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("Similarly, the second &lambda; expression in the top-level");
    label2.text("application is contained in the highlighted parentheses.");
    tree.root().child(1).child(0).unhighlight();
    tree.root().child(1).child(1).unhighlight();
    tree.root().child(1).child(2).unhighlight();
    tree.root().child(1).child(3).unhighlight();
    arr.removeClass([1,7],"lambdaexphighlight");
    arr.addClass([arr.size()-6,arr.size()-2],"lambdaexphighlight");
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 9 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("So we can add the corresponding nodes to the parse tree.");
    label2.text("And since the highlighted function application is really short...");
    tree.root().child(2).addChild("(").addChild(eNT).addChild(eNT).addChild(")");
    tree.root().child(2).child(1).addClass("wider");
    tree.root().child(2).child(2).addClass("wider");
    tree.root().child(2).child(0).highlight();
    tree.root().child(2).child(1).highlight();
    tree.root().child(2).child(2).highlight();
    tree.root().child(2).child(3).highlight();
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 10 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("... let's add all of the nodes");
    label2.text("that make up its two sub-trees.");
    arr.removeClass([arr.size()-6,arr.size()-2],"lambdaexphighlight");
    arr.addClass([arr.size()-5,arr.size()-3],"lambdaexphighlight");
    tree.root().child(2).child(0).unhighlight();
    tree.root().child(2).child(1).unhighlight();
    tree.root().child(2).child(2).unhighlight();
    tree.root().child(2).child(3).unhighlight();
    tree.root().child(2).child(1).addChild(varNT);
    tree.root().child(2).child(1).child(0).addClass("wide");
    tree.root().child(2).child(2).addChild(varNT);
    tree.root().child(2).child(2).child(0).addClass("wide");
    tree.root().child(2).child(1).child(0).addChild("x");
    tree.root().child(2).child(2).child(0).addChild("y");
    tree.root().child(2).child(1).child(0).highlight();
    tree.root().child(2).child(2).child(0).highlight();    
    tree.root().child(2).child(1).child(0).child(0).highlight();    
    tree.root().child(2).child(2).child(0).child(0).highlight();    
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 11 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("Now we turn our attention back to the first");
    label2.text("application in the top-level &lambda; expression.");
    arr.removeClass([arr.size()-5,arr.size()-3],"lambdaexphighlight");
    tree.root().child(2).child(1).child(0).unhighlight();
    tree.root().child(2).child(2).child(0).unhighlight();    
    tree.root().child(2).child(1).child(0).child(0).unhighlight();    
    tree.root().child(2).child(2).child(0).child(0).unhighlight();    
    arr.addClass([1,7],"lambdaexphighlight");
    tree.root().child(1).child(0).highlight();
    tree.root().child(1).child(1).highlight();
    tree.root().child(1).child(2).highlight();
    tree.root().child(1).child(3).highlight();
    tree.layout();
    av.step();

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 12 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("The first &lambda; expression in this application is a");
    label2.text("variable. Let's add its sub-tree to the parse tree.");
    arr.removeClass([1,7],"lambdaexphighlight");
    arr.addClass([2],"lambdaexphighlight");
    tree.root().child(1).child(0).unhighlight();
    tree.root().child(1).child(1).unhighlight();
    tree.root().child(1).child(2).unhighlight();
    tree.root().child(1).child(3).unhighlight();
    tree.root().child(1).child(1).addChild(varNT);
    tree.root().child(1).child(1).child(0).addClass("wide");
    tree.root().child(1).child(1).child(0).addChild("z");
    tree.root().child(1).child(1).child(0).highlight();
    tree.root().child(1).child(1).child(0).child(0).highlight();
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 13 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("The second &lambda; expression is a &lambda; abstraction. Let's");
    label2.text("add the four corresponding nodes to the parse tree.");
    arr.removeClass([2],"lambdaexphighlight");
    arr.addClass([4,5,6],"lambdaexphighlight");
    tree.root().child(1).child(1).child(0).unhighlight();
    tree.root().child(1).child(1).child(0).child(0).unhighlight();
    tree.root().child(1).child(2).addChild("&lambda;");
    tree.root().child(1).child(2).addChild(varNT);
    tree.root().child(1).child(2).child(1).addClass("wide");
    tree.root().child(1).child(2).addChild(".");
    tree.root().child(1).child(2).addChild(eNT);
    tree.root().child(1).child(2).child(3).addClass("wider");
    tree.root().child(1).child(2).child(0).highlight();
    tree.root().child(1).child(2).child(1).highlight();
    tree.root().child(1).child(2).child(2).highlight();
    tree.root().child(1).child(2).child(3).highlight();
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 14 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("The formal parameter in this &lambda; expression is x.");
    label2.text("Let's add one node for x to the parse tree.");
    arr.removeClass([5,6],"lambdaexphighlight");
    tree.root().child(1).child(2).child(0).unhighlight();
    tree.root().child(1).child(2).child(1).unhighlight();
    tree.root().child(1).child(2).child(2).unhighlight();
    tree.root().child(1).child(2).child(3).unhighlight();
    tree.root().child(1).child(2).child(1).addChild("x");
    tree.root().child(1).child(2).child(1).child(0).highlight();
    tree.layout();
    av.step();
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 15 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("Finally, we complete the parse tree by adding");
    label2.text("nodes for this innermost &lambda; expression.");
    arr.removeClass([4],"lambdaexphighlight");
    tree.root().child(1).child(2).child(1).child(0).unhighlight();
    arr.addClass([5,6],"lambdaexphighlight");
    tree.root().child(1).child(2).child(3).addChild("&lambda;");
    tree.root().child(1).child(2).child(3).addChild(varNT);
    tree.root().child(1).child(2).child(3).child(1).addClass("wide");
    tree.root().child(1).child(2).child(3).child(1).addChild("y");
    tree.root().child(1).child(2).child(3).addChild(".");
    tree.root().child(1).child(2).child(3).addChild(eNT);
    tree.root().child(1).child(2).child(3).child(3).addClass("wider");
    tree.root().child(1).child(2).child(3).child(3).addChild(varNT);
    tree.root().child(1).child(2).child(3).child(3).child(0).addClass("wide");
    tree.root().child(1).child(2).child(3).child(3).child(0).addChild("z");
    tree.root().child(1).child(2).child(3).child(3).child(0).child(0).highlight();
    tree.root().child(1).child(2).child(3).child(0).highlight();
    tree.root().child(1).child(2).child(3).child(1).highlight();
    tree.root().child(1).child(2).child(3).child(2).highlight();
    tree.root().child(1).child(2).child(3).child(3).highlight();
    tree.root().child(1).child(2).child(3).child(1).child(0).highlight()
    tree.root().child(1).child(2).child(3).child(3).child(0).highlight();
    tree.layout();
    av.step(); 
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 16 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    label1.text("And this is the complete parse");
    label2.text("tree for the &lambda; expression above.");
    arr.removeClass([5,6],"lambdaexphighlight");
    tree.root().child(1).child(2).child(3).child(0).unhighlight();
    tree.root().child(1).child(2).child(3).child(1).unhighlight();
    tree.root().child(1).child(2).child(3).child(2).unhighlight();
    tree.root().child(1).child(2).child(3).child(3).unhighlight();
    tree.root().child(1).child(2).child(3).child(3).child(0).unhighlight();
    tree.root().child(1).child(2).child(3).child(1).child(0).unhighlight()
    tree.root().child(1).child(2).child(3).child(3).child(0).child(0).unhighlight();
    tree.layout();
    av.step(); 
    av.recorded();

});
