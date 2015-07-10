(function() {
	/*global ODSA */
	"use strict";
	var av = new JSAV("container");

	var s0 = {"background-color":"lightgray"};
	var s1 = {"background-color":"sandybrown"};
	var s2 = {"background-color":"skyblue"};
	var s3 = {"background-color":"lightgreen"};
	var s4 = {"background-color":"violet"};
	var lam = "&#955;";
	
	var exp = [lam,"x",".","x"];
	var js = [["function","(","x",")","{"],
		["","return"," ","x",";"],
		["}"]];

	//lists of lists of indices for styling
	var l_lam = [[0],[0],[],[]];
	var l_formal = [[1],[2],[],[]];
	var l_dot = [[2],[],[1],[]];
	var l_body = [[3],[],[3],[]];
	var l_extra = [[],[1,3,4],[0,2,4],[0]];

	/*initialize and position JSAV arrays*/
	var init = function(){
		exp = av.ds.array(exp, {"indexed":"true"});
		exp.css(true, s0);
		for(var i=0; i<js.length; i++){
			var arr = i<1 ? exp : js[i-1];
			js[i] = av.ds.array(js[i],
				{"relativeTo":arr,"anchor":"left bottom","myAnchor":"left top",
				"center":"false","indexed":"true"}
			);
			js[i].css(true, s0);
		}
		//hide arrays only after relative positions established
		exp.hide();
		for(var i=0; i<js.length; i++)
			js[i].hide();
	}

	/*indices in list l are highlighted and have style s applied*/
	var style = function(l, s){
		exp.highlight(l[0]);
		exp.unhighlight();
		exp.css(l[0], s);
		for(var i=0; i<js.length; i++){
			js[i].highlight(l[i+1]);
			js[i].unhighlight();
			js[i].css(l[i+1], s);
		}
	}

	//commence edumacating
	init();

	//slide 1
	av.umsg("Lambda effing calculus!");
	av.displayInit();

	//slide 2
	av.umsg("Consider the "+lam+"-calculus identity function, which simply "
		+"returns the value which was passed to it.");
	exp.show();
	av.step();

	//slide 3
	av.umsg("Now consider the equivalent function in JavaScript.");
	for(var i=0; i<js.length; i++)
		js[i].show();
	av.step();

	//slide 4
	av.umsg("The "+lam+" symbol is similar in purpose to the function keyword.");
	style(l_lam, s1);
	av.step();

	//slide 5
	av.umsg("Formal parameters are similarly defined in both cases. "
		+"Note, the function is anonymous in both cases. "
		+"There is no function name specified.");
	style(l_formal, s2);
	av.step();

	//slide 6
	av.umsg("The dot serves a similar purpose to the return statement.");
	style(l_dot, s3);
	av.step();

	//slide 7
	av.umsg("The expression following the dot is what the function returns. "
		+"This can be any kind of valid "+lam+" expression.");
	style(l_body, s4);
	av.step();

	//slide 8
	av.umsg("The leftover syntax is surplus to the needs of "+lam+"-calculus.");
	style(l_extra, s0);
	av.step();

	av.recorded();
}());
