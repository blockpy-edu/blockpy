////////////////////////////////////////////////////////////////////////////////
//the 3 functions below are needed to use Erichs generic framework for dynamic
//programing problems.
////////////////////////////////////////////////////////////////////////////////

//function to compute the value of a specific knapsack call.
//comatible with Erichs fill table function
var computeKnapsack = function(data, i, w)
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

//builds a list of cells to highlight as dependancies for Erichs
//fill table function
var computeHighlight = function(data, i, w)
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

//returns true if the parameters are a base case.
//built for erichs fill table function
var isBase = function(data, row, column)
{
    return (row == 0 || column == 0);
}



//builds a calltree for the knapsack function.
var buildTree = function(tree, i, w, animate)
{
    
    tree.root("" + (i+1) + "," + w);
    if(animate != false)
    {
        tree.layout();
        jsav.step();
    }
    buildNode(tree.root(), i, w, animate);
    return;
}

//helper for buildTree
var buildNode = function(node, i, w, animate)
{
    if(i < 0 || w == 0)
    {
        return;
    }
    if(itemArray[1].value(i) > w)
    {
        node.addChild("" + i + "," + w);
        if(animate != false)
        {
            callTree.layout();
            jsav.step();
        }
        buildNode(node.child(0), i-1, w, animate);
    }
    else
    {
        node.addChild("" + i + "," + w);
        node.addChild("" + i + "," + (w - itemArray[1].value(i)));
        if(animate != false)
        {
            callTree.layout();
            jsav.step();
        }
        buildNode(node.child(0), i-1, w, animate);
        buildNode(node.child(1), i-1, (w - itemArray[1].value(i)), animate);
    }
    return;
}

//////////////////////////////////////////////////////////////////////
//below is the code to setup jsav and get the animation off the ground
//////////////////////////////////////////////////////////////////////
var data = [];
data[0] = [3,2,2];
data[1] = [4,8,4];

var jsav = new JSAV("av");
var callTree = jsav.ds.tree({visible: false, centered:false});

var itemArray = [];
var dynTable = [];

//init the arrays with values for items
itemArray[0] = jsav.ds.array([1, 2, 3],{centered:false, left:0, top:"0px"}); //item
itemArray[1] = jsav.ds.array(data[0],{centered:false, left:0, top:"40px"});//weight
itemArray[2] = jsav.ds.array(data[1],{centered:false, left:0, top:"80px"});//value


//labels for the arrays
jsav.label("Item", {left:"140px", top:"12px"});
jsav.label("Weight", {left:"140px", top:"52px"});
jsav.label("Value", {left: "140px", top: "92px"});
jsav.label("i", {left: "880px", top:"12px"});
jsav.label("c", {left: "915px", top:"-25px"});

//set up the dynamic table with the base cases and blank other spaces
dynTable[0] = jsav.ds.array([0, 0, 0, 0, 0, 0, 0],{centered:false, left:900, top:0});
dynTable[1] = jsav.ds.array([0, "", "", "", "", "", ""],{centered:false, left:900, top:40});
dynTable[2] = jsav.ds.array([0, "", "", "", "", "", ""],{centered:false, left:900, top:80});
dynTable[3] = jsav.ds.array([0, "", "", "", "", "", ""],{centered:false, left:900, top:120});

//build the tree, without animation
buildTree(callTree, 2, 6, false);
callTree.layout();
callTree.css({top:"-50px", left:"200px"});
callTree.show();


//var counter = 0;
//build an animation using Erichs framework.
fillTable(jsav, callTree, callTree.root(), dynTable, data, isBase, computeHighlight, computeKnapsack, 0);
jsav.recorded();
