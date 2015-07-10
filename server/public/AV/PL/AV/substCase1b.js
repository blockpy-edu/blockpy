"use strict";

/* global LAMBDA */

$(document).ready(function () {

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

    var av = new JSAV($("#SubstCase1b"));

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%% slide 1 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    arr = av.ds.array(["subst(","\u03BBy.(y x)",",","u",",","v",")"]);
/*    arr.removeClass(true,"oneCharWidth");
    arr.removeClass(true,"emptyWidth");
    arr.removeClass(true,"lambdaWidth");
    arr.removeClass(true,"narrow");
    arr.addClass(true, "defaultCellStyle");
    arr.addClass(noChar,"emptyWidth");
    arr.addClass(oneChar, "oneCharWidth");
    arr.addClass(parenChar,"narrow");
    arr.addClass(lambdaChar,"lambdaWidth");
*/

    //setArrayCellsWidth();
    label1 = av.label("The root node of the parse tree for any ");
    label1.addClass("labelstyle");
    av.displayInit();

    label1 = av.label("hello");
    av.step();

    label1 = av.label("hello again");
    av.step();
    av.recorded();

});
