/*
	Edit Distance (Levenshtein Distance)
	Erich Brungraber

	**Future version thoughts**
	-consolidate eDistAnim & eDist into one function that takes another param (boolean) to determine whether or not to animate anything.
*/

/*
eDistAnim
Creates and animates the matrix rep of the dynamic edit distance algorithm.
@params:
av = JSAV container for the animation to appear in
start = starting string
end = ending string
*/
var eDistAnim = function(av, start, end) {
    var startMax = start.length;
    var endMax = end.length;
	var dynArr = emptyEDist(av, start, end);    
    
	av.displayInit();
    
    //meat of the code
    var initCol = 2; //initial column
    var pRow = 2; //previous row
    var pCol = 2; //previous column
    
	//establish highlight for lettering
    for (var i = 0; i <= startMax + 1; i++) {		
		dynArr[0].css(i,{"color":"#fff", "background-color": "#000"});
    }
    for (var i = 1; i <= endMax + 1; i++) {
		dynArr[i].css(0, {"color":"#fff", "background-color": "#000"});
    }
    
    for (var j = 2; j <= endMax + 1; j++) {	
		for(var i = 2; i <= startMax + 1; i++) {
			
			//gray out previous cell, highlight current cell.
			dynArr[pRow].css(pCol, {"color": "#0f0", "background-color": "#eee"});
			dynArr[j].css(i, {"color": "#ff0", "background-color": "#f00"});
			
			//character comparison
			if (start.charAt(i-2) === end.charAt(j-2)) {
				//chars match, get upper-left value
				dynArr[j].value(i, dynArr[j-1].value(i-1));
			} else {
				//chars don't match, get all three surrounding values + 1.
				var ins = parseInt(dynArr[j-1].value(i), 10) + 1;
				var del = parseInt(dynArr[j].value(i-1), 10) + 1;
				var sub = parseInt(dynArr[j-1].value(i-1), 10) + 1;
			
				var min = Math.min(Math.min(sub, ins), del);
				dynArr[j].value(i, min);		
			} 
			//cell filled, move on to next cell
			av.step();
			if (initCol === 2) { //special initial case for graying out previous cells.
				pCol = 2;
				initCol = -1;
			} else { pCol = i; }
			pRow = j;
		} //end inner for	    
	} //end outer for

	dynArr[endMax+1].css(startMax+1, {"color": "#0f0", "background-color": "#eee"});

	av.recorded();
	av.show();
    
	return dynArr;
} //end eDistAnim func

/*
testMaker
Prepares the AV for the two inputs:
	1.	array of choices for user to select
	2.	answer grid for user to click in, matching array choice above

Currently unused, plan to introduce for proficiency exercise, assuming I can get it to work.
*/
var testMaker = function(av, start, end) {
	
	var array = eDist(av, start, end);
	var solution = [""];
	var startMax = start.length;
	var endMax = end.length;
	
	//console.log("Creating the solution deep copy.");
	//create solution array, deep copy
	for (var i = 0; i < endMax + 2; i++) {
		var arr = av.ds.array([""]);
		//arr.hide();
		for (var j = 0; j < startMax + 2; j++) {
			arr.value(j, array[i].value(j));
		}
		solution[i] = arr;
	}
	//console.log("Created the solution deep copy.");

	
	console.log("Array size: " + array.length);
	for (var i = 0; i < array.length; i++) {
		//console.log("Inner array " + array[i].size());
		for (var j = 0; j < array[i].size(); j++) {
			console.log(typeof array[i].value(j));
			console.log("" + i + ", " + j + ": " + array[i].value(j));
		}
	}
	
	//creates choices array for user to select by plucking values from answer grid
	var choices = av.ds.array([""]);
	var size = startMax * endMax;
	var count = 0;
	var numChoices = Math.floor(size / 5);
	for (var i = 0; i < numChoices; i++) {
		while (1){
			var row = Math.floor(((endMax - 1) * Math.random()) + 2);
			var col = Math.floor(((startMax - 1) * Math.random()) + 2);
			//console.log("Row: " + typeof row + ", Col: " + typeof col);
			console.log("Row: " + row + ", Col: " + col);
			console.log("Typeof element: " + typeof array[row]);
			if (array[row].value(col) !== "") {
				choices.value(count++, array[row].value(col));
				array[row].value(col, "");
				break;
			}
		}
	}
	
	av.displayInit();
	av.recorded();
	//choices.show();
	for (var i = 0; i < array.length; i++){
		array[i].css({centered: "true"});
	}
	array.show();
	
} //end testMaker func

/**
initKA1
Similar to initKA2, creates full grid, randomly picks a row/col coordinate, and asks user to select the appropriate function call from the list of substitution, insertion, deletion.
@params:
Same as above.
Returns:
int: representative of fnc call: 0 for sub/match, 1 for ins, 2 for del.
*/
var initKA1 = function(av, start, end, row, col)
{
	var array = eDist(av, start, end);
	var startMax = start.length;
	var endMax = end.length;
	var answer;
				
	//highlight cell.
	array[row].css(col, {"color":"#000", "background-color": "#f00"});

	answer = editFuncCall(array, row, col);
	
	if (start.charAt(row-2) === end.charAt(col-2))
	{
		answer = 3;
	}

	//center the grid
	for(var i = 0; i < array.length; i++) {
		array[i].css({centered: "true"});
		array[i].show();
	}
	
	av.displayInit();
	av.recorded();
	
	return answer;
} //end initKA1 func

/*
initKA2
Creates solution grid with one element missing, and returns an array with the answer & 3 false choices for use within the Khan Academy interface.  For purposes of verifying the right answer, the fifth element holds the correct value.
@params:
same as all the rest.
*/
var initKA2 = function(av, start, end){
	
	var array = eDist(av, start, end);

	var startMax = start.length;
	var endMax = end.length;
	var answers = [];
			
	//pick random row/col coordinates to ask the user to fill
	var row = Math.floor(((startMax - 1) * Math.random()) + 2);
	var col = Math.floor(((endMax - 1) * Math.random()) + 2);
	
	//save off the actual answer, null value, highlight cell.
	answers[0] = array[row].value(col);
	array[row].value(col, "??");
	array[row].css(col, {"color":"#000", "background-color": "#f00"});

	//fill answer array with false choices
	var max = array[startMax+1].value(endMax+1);
	for (var i = 1; i < 4; i++) {
		answers[i] = Math.floor((max + 1) * Math.random());
	}
	
	//duplicate check & removal
	/*
	just occurred to me that this might be part of the cause; could the sloppy quality of this duplicate check and the relative inefficient nature of it cause the KA JS stuff to fail, thereby returning the odd textbox & answer?
EDIT:  not [part of] the cause, but still inefficient.
	*/
	for (var i = 1; i < 4; i++) {
		var a = (i + 1) % 4;
		var b = (i + 2) % 4;
		var c = (i + 3) % 4;
		while (answers[i] === answers[a] || answers[i] === answers[b] || answers[i] === answers[c]) {
			answers[i] = Math.floor((max + 1) * Math.random());
		}
	}
	
	//store the correct answer off
	answers[4] = answers[0];
	
	var temp = [answers[0],answers[1], answers[2],answers[3]];
	
	//randomize the answers within the returning array
	/*
	Also not the most efficient way to handle this, but it worked for my testing purposes.
	*/
	for (var i = 0; i < 4; i++) {
		while(1){
			var index = Math.floor(4 * Math.random());
			if (temp[index] !== "") {
				answers[i] = temp[index];
				temp[index] = "";
				break;
			}
		}
	}
	
	//attempt to center the entire grid after modifying the *one* cell, but this doesn't seem to do anything
	for(var i = 0; i < array.length; i++) {
		array[i].css({centered: "true"});
		array[i].show();
	}
	
	av.displayInit(); //is this needed if there is nothing between displayInit() and recorded()?
	av.recorded();
	
	return answers;
	
} //end initKA2 func


/**
emptyEDist
Creates the empty (save for the input characters & base cases) edit distance table.
@params: same as the rest.
*/
var emptyEDist = function(av, start, end) {
    var startMax = start.length;
    var endMax = end.length;
    var arr = av.ds.array(["",""], {centered:true});
    var arr2 = av.ds.array([""], {centered:true});
    var dynArr = [arr, arr2];
    
    for (var i = 0; i < endMax; i++) {
		dynArr[0].value((i + 2), end.charAt(i));
    }
    dynArr[1].value(0, "");
    
	for (var i = 0; i <= endMax; i++) {
		dynArr[1].value((i+1), i);
    }
    
    for (var i = 1; i <= startMax; i++) {
		var tArr = [start.charAt(i-1), i];
		for (var j = 2; j <= endMax + 1; j++) {
			tArr[j] = "";
		}
		dynArr[i+1] = av.ds.array(tArr, {centered:true});
    }    
	return dynArr;
} //end emptyEDist func

/**
 * eDist
 * Returns a constructed matrix to be used with the proficiency exercise. *no animation*
 */
var eDist = function(av, start, end) {
	var startMax = start.length;
	var endMax = end.length;
	var dynArr = emptyEDist(av, start, end);
	
    //meat of the code
    var initCol = 2;
    var pRow = 2;
    var pCol = 2;
    

	for(var i = 2; i <= startMax + 1; i++) {
	    for (var j = 2; j <= endMax + 1; j++) {	
			if (start.charAt(i-2) === end.charAt(j-2)) {
				dynArr[i].value(j, dynArr[i-1].value(j-1));
			} else {
				var del = parseInt(dynArr[i-1].value(j), 10) + 1;
				var ins = parseInt(dynArr[i].value(j-1), 10) + 1;
				var sub = parseInt(dynArr[i-1].value(j-1), 10) + 1;
			
				var min = Math.min(Math.min(sub, ins), del);
				dynArr[i].value(j, min);		
			}
			if (initCol === 2) {
				pCol = 2;
				initCol = -1;
			} else { pCol = j; }
			pRow = i;
		} //end inner for	    
	} //end outer for
	
	av.displayInit();	
	av.recorded();
    	//av.show();
    
    	return dynArr;
} //end eDist func


/**
eDistOptimal
Animates the optimal path from a completed grid.
@params:
Same as the rest.
*/
var eDistOptimal = function(av, start, end)
{
	var startMax = start.length;
	var endMax = end.length;
	var grid = eDist(av, start, end);
	var row = startMax + 1;
	var col = endMax + 1;
	var input = [start,end];
	
	av.umsg("The completed grid is used to find the optimal path.");
	av.displayInit();

	av.umsg("Start with the bottom-right-most cell.");
	grid[row].css(col, {"background-color": "green"});
	av.step();
	
	while(row > 1 || col > 1)
	{
		//highlight look-up cells
		var hlt = editHighlight(input, row, col);
		for(var j = 0; j < hlt.length; j++)
    		{
			if(hlt[j][0] != 0 && hlt[j][1] != 0)
			{
        			grid[hlt[j][0]].css(hlt[j][1], {"background-color": "yellow"});
			}
    		}

		//highlight next appropriate cell
		if(hlt.length == 1 && row != 1 && col != 1)
		{
			av.umsg("Since the letters match, this cell is the next one in the path.");
			grid[row-1].css(col-1, {"background-color": "red"});
			grid[row].css(0, {"background-color": "black", "color": "white"});
			grid[0].css(col, {"background-color": "black", "color": "white"});
			av.step();
			grid[row].css(0, {"background-color": "white", "color": "black"});
			grid[0].css(col, {"background-color": "white", "color": "black"});
			//gray out current cell to prepare next cell movement
			grid[row].css(col, {"background-color": "#ccc"});
			
			//update coordinates
			row--;
			col--;
		} else
		{
			av.umsg("Highlighted cell(s) indicate next possible path choice.");
			av.step();
			
			//gray out current cell to prepare next cell movement
			grid[row].css(col, {"background-color": "#ccc"});

			//determine next cell in path
			var dir = editFuncCall(grid, row, col);
			switch(dir)
			{
				case 0:
					grid[row-1].css(col-1, {"background-color": "red"});
					av.umsg("Substitution.");
					row--;
					col--;
					break;
				case 1:
					grid[row].css(col-1, {"background-color": "red"});
					av.umsg("Insertion.");
					col--;
					break;
				case 2:
					grid[row-1].css(col, {"background-color": "red"});
					av.umsg("Deletion.");
					row--;
					break;
			} //end switch case
			av.step();
		} //end if

		//unhighlight cells
		for(var j = 0; j < hlt.length; j++)
		{
			grid[hlt[j][0]].css(hlt[j][1], {"background-color": "white"});
		}		
		
		//highlight new current node
		grid[row].css(col, {"background-color": "green"});
		av.umsg("Moving to the new cell, the process continues.");
		av.step();
	} // end while

	//at base case
	grid[row].css(col, {"background-color": "white"});
	av.umsg("At base case, light gray path is optimal path.");
	av.recorded();
} //end eDistOptimal func

/**
editFill
Evaluator function to be used with the general dynamic form function (fillTable) found in generalDynamicForm.js.
@params:
data = [starting string, ending string]
row = horizontal coordinate of cell to be evaluated
col = vertial coordinate of cell to be evaluated
*/
var editFill = function(data, row, col) {
    var startMax = data[0].length;
    var endMax = data[1].length;
    var dynArr = [["",""], [""]];
    
    for (var i = 0; i < endMax; i++) {
		dynArr[0][i + 2] = data[1].charAt(i);
    }
    dynArr[1][0] = "";
    
	for (var i = 0; i <= endMax; i++) {
		dynArr[1][i + 1] = i;
    }
    
    for (var i = 1; i <= startMax; i++) {
		var tArr = [data[0].charAt(i-1), i];
		for (var j = 2; j <= endMax + 1; j++) {
			tArr[j] = 0;
		}
		dynArr[i+1] = tArr;
    }    
    
    //all of this is the same as the original eDistAnim/eDist functions
    var initCol = 2;
    var pRow = 2;
    var pCol = 2;
	
	for(var i = 2; i <= startMax + 1; i++) {
		for (var j = 2; j <= endMax + 1; j++) {	
			if (data[0].charAt(i-2) === data[1].charAt(j-2)) {
				dynArr[i][j] = dynArr[i-1][j-1];
			} else {
				var del = parseInt(dynArr[i-1][j], 10) + 1;
				var ins = parseInt(dynArr[i][j-1], 10) + 1;
				var sub = parseInt(dynArr[i-1][j-1], 10) + 1;
			
				dynArr[i][j] = Math.min(Math.min(sub, ins), del);
			}
			if (initCol === 2) {
				pCol = 2;
				initCol = -1;
			} else { pCol = j; }
			pRow = i;
		} //end inner for	    
	} //end outer for
		
	//only difference is here, returns the desired cell value.
	return dynArr[row][col];
} //end editFill func

/**
editBase
Base case evaluator to be used with the fillTable function from generalDynamicForm.js.
@params:
data = [starting string, ending string]
row = horizontal coordinate of cell to be evaluated
col = vertial coordinate of cell to be evaluated
*/
var editBase = function(data, row, col)
{
	if(row == 1 || col == 1)
	{
		return true;
	} else
	{
		return false;
	}
} //end editBase func

/**
editHighlight
Highlighting function; determines which cell coordinates need to be highlighted for a particular row/col cell; called from fillTable in generalDynamicForm.js.
@params:
data = [starting string, ending string]
row = horizontal coordinate of cell to be evaluated
col = vertial coordinate of cell to be evaluated
Returns array of arrays; cell coordinates.
*/
var editHighlight = function(data, row, col)
{
	var r = row - 2;
	var c = col - 2;
	//base case
	if(row == 0 || col == 0)
	{
		return [[]];
	} else
	{	//matched
		if (data[0].charAt(r) === data[1].charAt(c))
		{
			return [[row-1,col-1]];
		} else
		{	//no match
			var sub = [row-1,col-1];
			var del = [row-1,col];
			var ins = [row,col-1];
			return [sub,del,ins];
		}
	}
} //end editHighlight func

/*
editFuncCall
Given the created grid and a particular coordinate, returns what cell is the appropriate next one for optimal path generation.
@params:
grid = completed grid generated via eDist func
row/col = row/col of particular cell to evaluate next cell.
Returns:
int:  0 for top-left cell (sub/match), 1 for left cell (ins), 2 for top cell (del)
*/
var editFuncCall = function(grid, row, col)
{
	var sChar = grid[row].value(0);
	var eChar = grid[0].value(col);

	if(sChar === eChar) //matching letter, only one option
	{
		return 0;	
	}
	else //no match, determine minimum now
	{
		//bypass boundary issues
		if (row == 1 && col > 1) {return 1;}
		if (col == 1 && row > 1) {return 2;}

		//normal checking
		var sub = grid[row-1].value(col-1);
		var ins = grid[row].value(col-1);
		var del = grid[row-1].value(col);

		if (sub <= del && sub <= ins) {return 0;} 	//top-left
		else if (ins <= del) 		{return 1;}	//left
		else 					{return 2;} 	//top
	}
} //end editFuncCall func

/*
recDistAnim
Creates & animates the recursive call tree for edit distance algo.
@params:
av = JSAV container
tr = tree to be populated; created outside the recursive function
node = node to be evaluated
start = starting string
end = ending string
*/

var recDistAnim = function(av, tr, node, start, end) {
    var tmp = node.value().split(",");
    var i = parseInt(tmp[0]) - 1;
    var j = parseInt(tmp[1]) - 1;
//-1 due to the value in the node being 1 higher; the way the grid lays out the characters, the initial character is at position 1, not 0 like it really is, so the node inflates the value by one for demonstration purposes.

    
    //base cases
    if (i === 0) {
		if (j === 1) {
			node.addChild( "1,1");
			tr.layout();
			av.step();
			return recDistAnim(av, tr, node.child(0), start, end);
		} else {
			return j + 1;
		}
    }
    if (j === 0) {
		if (i === 1) {
			node.addChild("1,1");
			tr.layout();
			av.step();
			return recDistAnim(av, tr, node.child(0), start, end);
		} else {
			return i + 1;
		}
    }

    //recursive call, start with match check
    if (start.charAt(i) === end.charAt(j)) {
		node.addChild( "" + i + "," + j);
		tr.layout();
		av.step();
		return recDistAnim(av, tr, node.child(0), start, end);
    } else { //recursively check top-left, top, and left "cells"
		node.addChild( "" + i + "," + j);
		node.addChild( "" + (i+1) + "," + j);
		node.addChild( "" + i + "," + (j+1));
		tr.layout();
		av.step();
		var sub = recDistAnim(av, tr, node.child(0), start, end) + 1; //substitution
		var ins = recDistAnim(av, tr, node.child(1), start, end) + 1; //insert
		var del = recDistAnim(av, tr, node.child(2), start, end) + 1; //delete
	
		return Math.min(Math.min(sub, ins), del);
    }	
} //end recDistAnim func

/*
recDist
Creates the recursive call tree for edit distance algorithm, sans animation.
@params:
av = JSAV container
tr = tree to be populated; created outside the recursive function
node = node to be evaluated
start = starting string
end = ending string
*/
var recDist = function(av, tr, node, start, end) {
    var tmp = node.value().split(",");
    var i = parseInt(tmp[0]) - 1;
    var j = parseInt(tmp[1]) - 1;
    
    //base cases
    if (i === 0) {
		if (j === 1) {
			node.addChild( "1,1");
			return recDist(av, tr, node.child(0), start, end);
		} else {
			return j + 1;
		}
    }
    if (j === 0) {
		if (i === 1) {
			node.addChild("1,1");
			return recDist(av, tr, node.child(0), start, end);
		} else {
			return i + 1;
		}
    }

    //recursive call, start with match check
    if (start.charAt(i) === end.charAt(j)) {
		node.addChild( "" + i + "," + j);
		return recDist(av, tr,node.child(0), start, end);
    } else { //recursively check top-left, top, and left "cells"
		node.addChild( "" + i + "," + j);
		node.addChild( "" + (i+1) + "," + j);
		node.addChild( "" + i + "," + (j+1));
		
		var sub = recDist(av, tr,node.child(0), start, end) + 1; //substitution
		var ins = recDist(av, tr,node.child(1), start, end) + 1; //insert
		var del = recDist(av, tr,node.child(2), start, end) + 1; //delete
	
		return Math.min(Math.min(sub, ins), del);
    }	
} //end recDist func
