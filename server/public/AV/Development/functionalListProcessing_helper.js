//use the following section to control highlighting of a pseudocode object
// ----- Documentation ----- //
// 1. Create a JSAV pseudocode object
// 2. Create a codeHighlighter object, passing in the JSAV pseudocode object from above
// -- During this step, all lines are unhighlighted
// 3. Highlight specific lines using the following:
// codeHighlighter.highlightPrevious (specify which line is to be highlighted and marked as the previous line, and sets the previousLine variable)
// codeHighlighter.highlightCurrent (specify which line is the current highlighted line and set the currentLine variable)
// codeHighlighter.highlightBoth (Specify the previous and current lines at once, and also set the currentLine value)
//codeHighlighter.moveCurrentLine (moves the current line to the specified line, and then moves the previous line to the previous currentLine)


// codeHighlighter.unhighlight (unhighlight all lines -- currentLine variable is NOT modified)
// codeHighlighter.advance (increments the currentLine by one and changes previous line to what current line used to be, and highlights the new current line as well as the previous line -- code will not highlight the previous line if current line was the first line)

//background pseudocode colors
//unhighlighted - E9E9E9
//current executing - A4A4A4
//prior executing - C8C8C8

CodeHighlighter.numHighlighters = 0;

//params: PseudoCode pCode
function CodeHighlighter(pCode, numLines)
{
	this.lineCount=numLines;
	this.code=pCode;
	this.currentLine = 0;
	this.previousLine = 0;
	this.currentColor = "#A4A4A4";
	this.previousColor = "#C8C8C8";
	this.baseColor = "#E9E9E9";
	
	this.lineHeight = 21.5;
	this.labelLeftOffset = 120;
	this.setLabel = function(av, labelText){
		av.label(labelText+" (below)", {relativeTo: pCode, left: "-"+this.labelLeftOffset+"px", top: "-"+(this.lineHeight*Math.trunc(this.lineCount/2) )+"px"});
	};

	CodeHighlighter.numHighlighters++;
	
	//[[[[[[[[[[[[        Use the following for handling toggling of line highlights and such. his keeps track of each line highlight, with an array of booleans
	this.highlightedLines = [];
	this.isStoringLines = false;
	
	this.highlightedLines.length = this.lineCount;
		
	for(var i=0;i<this.lineCount;i++)
	{
		this.highlightedLines[i] = false;
	}
	
	this.isLineHighlighted = function(index){
		return this.highlightedLines[index];
	};
	
	this.toggleLine = function(line){
		this.highlightedLines[line] = (!this.highlightedLines[line]);
		
		this.highlightUsingArray();
	};
	
	this.highlightUsingArray = function(){
		this.unhighlight();
		
		for(var i=0;i<this.highlightedLines.length;i++)
		{
			if(this.highlightedLines[i])
			{
				pCode.css(i, {"background-color": this.currentColor });
			}
		}
	};
	//]]]]]]]]]]]]
	
	//params: int line
	this.highlightPrevious = function(line){
		this.previousLine=line;
		pCode.css(line, {"background-color": this.previousColor });
		
		this.highlightedLines[line] = true;
		
	};
	
	//params: int line
	this.highlightCurrent = function(line)
	{
		this.currentLine=line;
		pCode.css(line, {"background-color": this.currentColor });
		
		this.highlightedLines[line] = true;
		
	};

	this.unhighlight = function()
	{
		pCode.css(0, {"background-color": this.baseColor });
		
		for(var i=0;i<this.highlightedLines.length;i++)
		{
			this.highlightedLines[i] = false;
		}
		
	};
	
	this.reset = function(){
		this.currentLine = 0;
		this.previousLine = 0;
		this.unhighlight();
	};

	this.unhighlight(pCode);

	this.advance = function()
	{
		//this.previous = this.currentLine;
		//this.currentLine++;
		this.unhighlight();
		
		this.highlightCurrent(this.currentLine+1);
		
		if(this.currentLine>1)
			this.highlightPrevious(this.currentLine-1)
			
		
	};
	
	//params: int previous, int current
	this.highlightBoth = function(previous, current)
	{
		this.unhighlight();
		
		this.highlightCurrent(current);
		this.highlightPrevious(previous);
	};
	
	//moves the current line to the specified line, and sets the previousLine to what the current used to be
	this.moveCurrentLine = function(newCurrent)
	{
		this.unhighlight();
		this.highlightPrevious(this.currentLine);
		this.highlightCurrent(newCurrent);
	};
}


//----------------//use the following to control functions of the visuals of arrays and variables------------
//Documentation

//Use this object to control a slideshow visualization that has arrays and variables
//You can update variables by name, and resize arrays

//Steps to use
//--------------
//1. Create javascript array of VarObj's
//2. Create javascript array of ArrayObj's
//3. Create new VisualsController, passing in arrays (from above) and the JSAV object
//4. Call the VisualsController.visualize method to draw the initial slide
//5. On subsequent slides, change variables and arrays using VisualsController.updateVar or VisualsController.updateArray
//6. After changing variables, call VisualsController.redraw to show the changes (and reposition labels and variables)
//----- NOTE ------//
// If labels, and positing is off on certain slides, you can change the following VisualsController members:
// VisualsController.arrayCellWidth (to offset labels and variables to the left, separate form size of labels)
// VisualsController.largestTextWidth (to offset labels to the left independent of arrayCellWidth)
// VisualsController.arrayCellHeight (to change distance between arrays vertically)
// VisualsController.charWidth (to change label offsets based on character width)
// VisualsController.varLeftOffset (to add a base offset to variable positioning on the left)


//use this object to represent an array to visualize
function ArrayObj(arr, text, name)
{
	this.array=arr;
	this.jsavArray;
	this.textOfLabel=text;
	this.nameOfArray=name;//used for lookup reasons to update this variable
	this.label = null;
}

//use this object to represent a variable to visualize
function VarObj(text, name, initVal)
{
	this.variable=null;
	this.varValue = initVal;
	this.textOfVar=text;
	this.nameOfVar=name;//used for lookup reasons to update this variable 
}

//this object will attempt to autoposition the arrays and labels, as well as handle resizing of the arrays
//signature: VisualsController(ArrayObj[] arrays, VarObj[] variables, JSAV jsavObj, eyecolor) 
function VisualsController(arrays, variables, jsavObj) {
    this.jsav = jsavObj;
    this.arraysList=arrays;
    this.variablesList=variables;
    this.arrayCellWidth = 45;
    this.arrayCellHeight = 50;
    this.charWidth = 10; //use this for moving variables to the left based on their character counts
    this.varLeftOffset = 70; //use this for moving variables over to the left more, from where the calculated edge of text/arrays is
    
    //use this to first visualize the arrays, use the "update" method to redraw the arrays (but omit the variables)
    this.visualize = function(){
    	var currentArray;
    	var currentLabel;
    	var largestArrayWidth = 0;
    	var largestTextWidth = 0;
    	
    	for(var i=0;i<this.arraysList.length;i++)
    	{
    		//create array for AV
    		currentArray = jsavObj.ds.array(this.arraysList[i].array, {indexed: true});
    		var arrayWidth = this.arraysList[i].array.length * this.arrayCellWidth;
    		var arrayLabelWidth = this.arraysList[i].textOfLabel.length * this.charWidth;
    		
    		this.arraysList[i].jsavArray = currentArray;//ensure this doesn't store the reference in successive iterations
    		
    		//update largest, to help in placing variables
    		largestArrayWidth = Math.max(largestArrayWidth, arrayWidth);
    		
    		//create label for array
    		//if(this.arraysList[i] == null)
    		//	console.log("this.arraysList[i] is NULL");
    		
    		//console.log("this.arraysList length="+this.arraysList.length + " and i="+i);
    		//console.log("this.arraysList[i]="+this.arraysList[i].name);
    		//console.log("arrays: currentarray-"+this.arraysList[i].nameOfArray);
    		//console.log("set array label ["+this.arraysList[i].textOfLabel+"] to: left: -"+(arrayLabelWidth+(arrayWidth/2))+"px, top: -15px" );
    		//console.log("arrayLabelWidth: "+arrayLabelWidth+" arrayWidth: "+arrayWidth);
    		this.arraysList[i].label = this.jsav.label(this.arraysList[i].textOfLabel, {relativeTo: currentArray, left: "-"+((arrayWidth+arrayLabelWidth-1)/2)+"px", top: "-15px"});
    		
    		//update largest, to help in placing variables
    		largestTextWidth = Math.max(largestTextWidth, arrayLabelWidth);
    	}
    	
    	//check for variables to place
    	//if there are no arrays, this will crash
    	currentArray = this.arraysList[0].jsavArray;
    		
    	
		for(var i=0;i<this.variablesList.length;i++)
		{
    		//if there is no array, this may position to root, or just throw an exception
    		//console.log("vars: currentarray-"+this.arraysList[0].nameOfArray);
    		//console.log("positioned var ["+this.variablesList[i].nameOfVar+"] at pos: left-"+(varLeftOffset + (largestTextWidth+largestArrayWidth) )+"px top: "+(15+(i*this.arrayCellHeight) )+"px");
    		this.variablesList[i].variable = this.jsav.variable([this.variablesList[i].textOfVar+" : "+this.variablesList[i].varValue], {relativeTo: currentArray, visible: true, left: "-"+(this.varLeftOffset + (largestTextWidth+largestArrayWidth) )+"px", top: ""+(15+(i*this.arrayCellHeight) )+"px"} ); 
    	}
    	
    };
    
    //this method hides all arrays and their labels (to be redrawn)
    this.hideArrays = function()
    {
    	for(var i=0;i<this.arraysList.length;i++)
    	{
    		this.arraysList[i].jsavArray.hide();
    		this.arraysList[i].label.hide();
    	}
    	
    	console.log("Hide arrays done");
    };
    
    //use this method to update changes to the visualizer
    this.redraw = function()
    {
    	this.hideArrays();
    	
    	var currentArray;
    	var currentLabel;
    	var largestArrayWidth = 0;
    	var largestTextWidth = 0;
    	var varLeftOffset = 70;//use this for moving variables over to the left more, from where the calculated edge of text/arrays is
    	
    	for(var i=0;i<this.arraysList.length;i++)
    	{
    		//create array for AV
    		currentArray = jsavObj.ds.array(this.arraysList[i].array, {indexed: true});
    		var arrayWidth = this.arraysList[i].array.length * this.arrayCellWidth;
    		var arrayLabelWidth = this.arraysList[i].textOfLabel.length * this.charWidth;
    		
    		this.arraysList[i].jsavArray = currentArray;//ensure this doesn't store the reference in successive iterations
    		
    		//update largest, to help in placing variables
    		largestArrayWidth = Math.max(largestArrayWidth, arrayWidth);
    		
    		//create label for array
    		//if(this.arraysList[i] == null)
    		//	console.log("this.arraysList[i] is NULL");
    		
    		//console.log("this.arraysList length="+this.arraysList.length + " and i="+i);
    		//console.log("this.arraysList[i]="+this.arraysList[i].name);
    		//console.log("arrays: currentarray-"+this.arraysList[i].nameOfArray);
    		//console.log("set array label ["+this.arraysList[i].textOfLabel+"] to: left: -"+(arrayLabelWidth+(arrayWidth/2))+"px, top: -15px" );
    		//console.log("arrayLabelWidth: "+arrayLabelWidth+" arrayWidth: "+arrayWidth);
    		this.arraysList[i].label = this.jsav.label(this.arraysList[i].textOfLabel, {relativeTo: currentArray, left: "-"+((arrayWidth+arrayLabelWidth-1)/2)+"px", top: "-15px"});
    		
    		//update largest, to help in placing variables
    		largestTextWidth = Math.max(largestTextWidth, arrayLabelWidth);
    	}
    	
    	//check for variables to place
    	//if there are no arrays, this will crash
    	//currentArray = this.arraysList[0].jsavArray;
    		
    	
		for(var i=0;i<this.variablesList.length;i++)
		{
    		//if there is no array, this may position to root, or just throw an exception
    		//console.log("vars: currentarray-"+this.arraysList[0].nameOfArray);
    		//console.log("positioned var ["+this.variablesList[i].nameOfVar+"] at pos: left-"+(varLeftOffset + (largestTextWidth+largestArrayWidth) )+"px top: "+(15+(i*this.arrayCellHeight) )+"px");
    		this.variablesList[i].variable.value(this.variablesList[i].textOfVar+" : "+this.variablesList[i].varValue);
    		//this.variablesList[i].variable = this.jsav.variable([this.variablesList[i].textOfVar+" : "+this.variablesList[i].varValue], {relativeTo: currentArray, visible: true, left: "-"+(varLeftOffset + (largestTextWidth+largestArrayWidth) )+"px", top: ""+(15+(i*this.arrayCellHeight) )+"px"} ); 
    	}
    };
    
    //use this to update a var's value (by name)
    this.updateVar = function(name, newVal)
    {
    	for(var i=0;i<this.variablesList.length;i++)
    	{
    		if(this.variablesList[i].nameOfVar==name)
    		{
    			console.log("updated var: "+name+" with value: "+newVal+" that had old value of: "+this.variablesList[i].varValue);
    			this.variablesList[i].varValue=newVal;
    			
    		}
    	}
    };
    
    //use this to update an array's value (a javascript array) by name
    this.updateArray = function(name, newArray)
    {
    	for(var i=0;i<this.arraysList.length;i++)
    	{
    		if(this.arraysList[i].nameOfArray==name)
    		{
    			console.log("updated array: "+name+" with value: "+newArray+" that had old value of: "+this.arraysList[i].array);
    			this.arraysList[i].array=newArray;
    			
    		}
    	}
    };
    
    //use this to show/hide a variable by name (as specified by the 'show' boolean)
    this.setVarVisibility = function(name, show)
    {
    	for(var i=0;i<this.variablesList.length;i++)
    	{
    		if(this.variablesList[i].nameOfVar==name)
    		{
    			if(show)
    				this.variablesList[i].variable.show();
    			else
    				this.variablesList[i].variable.hide();
    				
    			console.log("Hiding/Showing variable:"+name);
    			
    		}
    	}
    };
    
    //use this to show/hide an array by name (as specified by the 'show' boolean)
    this.setArrayVisibility = function(name, show)
    {
    	for(var i=0;i<this.arraysList.length;i++)
    	{
    		if(this.arraysList[i].nameOfArray==name)
    		{
    			if(show)
    				this.arraysList[i].jsavArray.show();
    			else
    				this.arraysList[i].jsavArray.hide();
    				
    			console.log("Hiding/Showing array:"+name);
    			
    		}
    	}
    };
}

