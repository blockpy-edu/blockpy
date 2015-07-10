/**
	Erich Brungraber & Jeremy Rodencal
	The main function here is fillTable:
	This is abstracted to handle hopefully whichever dynamic algorithm with which one is working.
	The purpose of this function is to have a full tree and empty dynamic grid, and animate the pruning of the tree to fill the grid.
*/

/**
fillTable
Animates the plucking of the recursive call tree and filling of the dynamic grid.
@params:
jsav: the jsav container object from html file
tree: the recursive call tree (created prior to initial calling of fillTable)
node: the starting node to be called, usually the root of the RCT; the node data must be a two integer string, split by a comma
table: the dynamic grid to be modified/filled (created prior to initial calling of fillTable)
tdata: the input data the algorithm is dependent upon to fill the table
isBaseCase: function that determines if particular row/col is base case  params: (tdata, row, col), returns boolean.
highFunc: the function that determines which cells of the table need to be highlighted.  params: (tdata, row, col), returns an array of [rows,cols].
fillFunc: the function that determines the value of any cell given by the algorithm.  params: (tdata, row, col), returns an int.
offset: Leave this zero unless your table has descriptive text in first <#offset> rows & cols, pass it this number to skip these cells during animation
*/
var fillTable = function(jsav, tree, node, table, tdata, isBaseCase, highFunc, fillFunc, offset)
{
    var string = node.value().split(",");
    var i = parseInt(string[0]) + offset;
    var w = parseInt(string[1]) + offset;
	
	//recurse down to base nodes (far left)
    var chCount;
    for(var k = 0; k < node.children().length; k++)
    {
        chCount = node.children().length;
        fillTable(jsav, tree, node.children()[k], table, tdata, isBaseCase, highFunc, fillFunc, offset);
        if(chCount != node.children().length)
        {
            k--;
        }
    }
    
	//highlight the active node to green
    node.css({"background-color": "green"});

    //highlight the dependent cells
	console.log("row: " + i + ", col: " + w);
    var hlt = highFunc(tdata, i, w);
    for(var j = 0; j < hlt.length; j++)
    {
        table[hlt[j][0]].css(hlt[j][1], {"background-color": "yellow"});
    }
	
	//base case check, no trimming yet.
	if (isBaseCase(tdata, i, w))
	{
		jsav.umsg("This is a base case; its value is known.");
		table[i].css(w, {"background-color": "yellow"});
        jsav.step();
        table[i].css(w, {"background-color": "white"});
	} 
	else
	{
		//highlight & fill active cell
		table[i].css(w, {"background-color": "green"});
		table[i].value(w, fillFunc(tdata, i, w));
		jsav.umsg("The value can be found from the yellow cells.");
		jsav.step();

		//unhighlight the dependent cells
		for(var j = 0; j < hlt.length; j++)
		{
			table[hlt[j][0]].css(hlt[j][1], {"background-color": "white"});
		}		
		//trim tree
		trimTree(tree.root(), (i-offset), (w-offset));
		jsav.umsg("All future calls to (" + (i - offset) + ", " + (w - offset) + ") can now be looked up in constant time.");
		jsav.step();
	}
	
	//unhighlight active cell & node
	table[i].css(w, {"background-color": "white"});
     node.css({"background-color": "white"});
     return;	
}

/*
trimTree
Traverse the tree, trimming the appropriate node
@params:
node = node to evaluate
i = initial value of node
f = final value of node
*/
var trimTree = function(node, i, f)
{
    if(node.value() == "" + i + "," + f)
    {
		node.hide();
		if(node.parent() != null && node.parent() != undefined)
		{
			node.remove();
		}
	}
    else
    {
        var k, chCount;
        for(k = 0; k < node.children().length; k++)
        {
            chCount = node.children().length;
            trimTree(node.children()[k], i, f);
            if(chCount != node.children().length)
                k--;
        }
    }
    return;
}

// VVV  jeremy's functions for use with fillTable  VVV

var sackHighlight = function(data, i, w)
{
    if(i === 0 || w === 0)
    {
        return [];
    }
    //item didnt fit
    if(w - data[0][i-1] < 0)
    {
        return [[i-1, w]];
    }
    else
    {
        return [[i-1, w], [i-1, w-data[0][i-1]]];
    }
}


//assuming data is a square two dimensional array
//data[0] is the item weight row
//data[1] is the item value row
var sackFill = function(data, i, w)
{
    var table = [];
    var row = [];
    if(i === 0 || w === 0)
    {
        return 0;
    }
    //j is the row/item
    for(var j = 0; j <= i; j++)
    {
        row = [];
        //k is the column/weight
        for(var k = 0; k <= w; k++)
        {
            //base case
            if(j === 0 || k === 0)
            {
                row[k] = 0;
            }
            //won't fit case
            else if(data[0][j-1] > k)
            {
                row[k] = table[j-1][k];
            }
            //default case
            else
            {
                row[k] = Math.max(table[j-1][k],
                                  table[j-1][k-data[0][j-1]] + data[1][j-1]);
            }
        }
        table[j] = row;
    }
    return table[i][w];
}

var sackBase = function(data, row, col)
{
	if(row == 0 || col == 0)
	{
		return true;
	} else
	{
		return false;
	}
} //end sackBase func

//n-choose-k base case func
var nKBase = function(data, n, k)
{
	if(n == k || k == 0)
	{
		return true;
	} else
	{
		return false;
	}
} //end nKBase func
