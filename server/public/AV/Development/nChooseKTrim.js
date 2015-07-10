////////////////////////////////////////////////////////////////////////////////
//the 3 functions below are needed to use Erichs generic framework for dynamic
//programing problems.
////////////////////////////////////////////////////////////////////////////////

//function to compute the value of a specific nCk call.
//comatible with Erichs fill table function
var computeCell = function(data, n, k)
{
    var table = [];
    var row = [];
    //i is number of items
    for(var i = 0; i <= n; i++)
    {
        row = [];
        //j is num items to pick
        for(var j = 0; j <= i; j++)
        {
            if(i == j || j == 0)
                row[j] = 1;
            else
                row[j] = table[i-1][j-1] + table[i-1][j];
        }
        table[i] = row;
    }
//    for(var i = 0; i < table.length; i++)
//    {
//        var str;
//        str = "";
//        for(var j = 0; j < table[i].length; j++)
//        {
//            str = str + table[i][j] + ", ";
//        }
//        console.log(str);
//    }
    return table[n][k];
}

//builds a list of cells to highlight as dependancies for Erichs
//fill table function
var computeHighlight = function(data, n, k)
{
    if(n == k || k == 0)
        return [[n, k]];
    return([[n-1,k],[n-1,k-1]]);
}

//returns true if the parameters are a base case.
//built for erichs fill table function
var isBase = function(data, n, k)
{
    return (n == k || k == 0);
}

////////////////////////////////////////////////////////////////////////////////
//The two functions below create a Jsav call tree for Erichs fill table function
////////////////////////////////////////////////////////////////////////////////

//build a jsav tree for a nCk call
var buildTree = function(tree, n, k, animate)
{
    
    tree.root("" + (n) + "," + k);
    if(animate != false)
    {
        tree.layout();
        jsav.step();
    }
    buildNode(tree.root(), n, k, animate);
    return;
}

//recursive helper for buildTree
var buildNode = function(node, n, k, animate)
{
    if(n == k || k == 0)
    {
        return;
    }
    else
    {
        node.addChild("" + (n-1) + "," + (k-1));
        node.addChild("" + (n-1) + "," + (k));
        buildNode(node.child(0), n-1, k-1);
        buildNode(node.child(1), n-1, k);
    }
    return;
}

//////////////////////////////////////////////////////////////////////
//below is the code to setup jsav and get the animation off the ground
//////////////////////////////////////////////////////////////////////

var jsav = new JSAV("av");
var callTree = jsav.ds.tree({visible: false, centered:false});

var dynTable = [];

//set up the dynamic table with the base cases and blank other spaces
dynTable[0] = jsav.ds.array([1, "", "", "", ""],{centered:false, left:"500px", top:0});
dynTable[1] = jsav.ds.array([1, 1, "", "", ""],{centered:false, left:"500px", top:40});
dynTable[2] = jsav.ds.array([1, "", 1, "", ""],{centered:false, left:"500px", top:80});
dynTable[3] = jsav.ds.array([1, "", "", 1, ""],{centered:false, left:"500px", top:120});
dynTable[4] = jsav.ds.array([1, "", "", "", 1],{centered:false, left:"500px", top:160})

//labels for the arrays
jsav.label("N", {left:(parseInt(dynTable[0].css("left")) - 40), top:(parseInt(dynTable[0].css("top")) + 10)});
jsav.label("K", {top:(parseInt(dynTable[0].css("top")) - 40), left:(parseInt(dynTable[0].css("left")) + 17 )});

//N labels
for(var i = 0; i <= 4; i++)
{
    jsav.label(i, {top:(parseInt(dynTable[0].css("top")) + 42 * i + 10), left:(parseInt(dynTable[0].css("left")) - 20)});
}
//K labels
for(var i = 0; i <= 4; i++)
{
    jsav.label(i, {top:(parseInt(dynTable[0].css("top")) - 20), left:(parseInt(dynTable[0].css("left")) + 17 + 41*i)});
}

//build the tree
buildTree(callTree, 4, 2, false);
callTree.layout();
callTree.css({top:"-50px", left:"0px"});
callTree.show();

//build an animation using Erichs framework.
fillTable(jsav, callTree, callTree.root(), dynTable, {}, isBase, computeHighlight, computeCell, 0);
jsav.recorded();
