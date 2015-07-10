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

    var jsav = new JSAV("av");
    var callTree = jsav.ds.tree();
    var itemArray = [];
    
    //init the arrays with values for items
    itemArray[0] = jsav.ds.array([1, 2, 3], {centered:false, left:"0px", top:"0px"});//item
    itemArray[1] = jsav.ds.array([3, 2, 2], {centered:false, left:"0px", top:"40px"});//weight
    itemArray[2] = jsav.ds.array([3, 8, 4], {centered:false, left:"0px", top:"80px"});//value

    //add some labels to the item list
    jsav.label("Item", {top: 10, left: 130});
    jsav.label("Weight", {top: 50, left: 130});
    jsav.label("Value", {top: 90, left: 130});

    //build the tree
    buildTree(callTree, 2, 6);
    jsav.recorded(); // done recording changes, will rewind
