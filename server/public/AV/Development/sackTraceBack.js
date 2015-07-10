//fills in a jsav table with all the values for a particular item set
var fillTableComplete = function(table, itemTable)
{
    for(var i = 1; i < table.length; i++)
    {
        for(var w = 1; w < table[i].size(); w++)
        {
            var itemWeight, itemValue;
            itemWeight = itemTable[1].value(i-1);
            itemValue = itemTable[2].value(i-1);
            if(itemWeight > w) //item won't fit in the knapsack
            {
                table[i].value(w, table[i-1].value(w));
            }
            else
            {
                table[i].value(w, Math.max(table[i-1].value(w), 
                                           table[i-1].value(w-itemWeight) + itemValue));
            }
        }
    }
}

//recovers the solution and animates it nicely.
var findSolSet = function(sol, table, items)
{
    var i = table.length -1;
    var w = table[i].size() -1;
    var newW;
    var solPos = 0;
    var taken = false;
    while(i > 0)
    {
        taken = false;

        //highlight current position
        table[i].css(w, {"background-color": "green"});
        jsav.umsg("looking at item " + i + " with " + w + " knapsack capacity units left");
        jsav.step();

        //hightlight the options
        var itemWeight, itemValue; 
        itemWeight = items[1].value(i-1);
        itemValue = items[2].value(i-1);
        if(w < itemWeight)
        {        
            //had no choice, item won't fit
            table[i-1].css(w, {"background-color": "yellow"});
            items[0].css(i-1, {"background-color": "yellow"});
            items[1].css(i-1, {"background-color": "red"});
            items[2].css(i-1, {"background-color": "yellow"});
            jsav.umsg("item " + i + " has weight " + itemWeight + ", so it can't fit");
            jsav.step();
            //unhighlight items
            for(j = 0; j < items.length; j++)
            {
                items[j].css(i-1, {"background-color": "white"});
            }
            table[i-1].css(w, {"background-color": "white"});
        }
        else
        {
            table[i-1].css(w, {"background-color": "yellow"});//dont take
            jsav.umsg("if item " + i + " is not taken, the best value possible with the remaining items is " +
                table[i-1].value(w));
            jsav.step();
            table[i-1].css(w-itemWeight, {"background-color": "yellow"});//take
            for(j = 0; j < items.length; j++)
            {
                items[j].css(i-1, {"background-color":"yellow"});//highlight item in item array
            }
            jsav.umsg("if item " + i + " is taken, the best value possible is " + (itemValue + table[i-1].value(w-itemWeight)));
            jsav.step();
            
            for(j = 0; j < items.length; j++)
            {
                items[j].css(i-1, {"background-color":"white"});//unhighlight item
            }
            var valTake, valLeave;
            valLeave = table[i-1].value(w);
            valTake  = table[i-1].value(w-itemWeight) + itemValue;
            
            if(valLeave >= valTake) //leave the item
            {
                taken = false;
                table[i-1].css(w, {"background-color": "#2233FF"});//dont take
                table[i-1].css(w-itemWeight, {"background-color": "white"});
                if(valTake == valLeave)
                    jsav.umsg("there is no difference if the item is taken or not. leave it.");
                else
                    jsav.umsg("this item should be left behind.")
                jsav.step();
            }
            else //take the item
            {
                taken = true;
                newW = w-itemWeight;
                table[i-1].css(w, {"background-color": "white"});//dont take
                table[i-1].css(w-itemWeight, {"background-color": "#2233FF"});
                jsav.umsg("item " + i +" should be taken");
                jsav.step();
            }
            
        }

        //put item in sack
        if(taken)
        {
            table[i].css(w, {"background-color": "#00FF00"});
            sol.value(solPos++, i);
            jsav.umsg("put item " + i + " into the knapsack");
        }
        else
        {
            table[i].css(w, {"background-color": "red"});
            jsav.umsg("the item is left behind");
        }
        jsav.step();

        w = newW;
        i--;
    }
}

var jsav = new JSAV("av");
var itemArray = [];
var dynTable = [];
var solSet = jsav.ds.array(["", "", ""], {centered: false, right:50, top:0});    

//init the arrays with values for items
itemArray[0] = jsav.ds.array([1, 2, 3], {centered: false, left:50, top:0}); //item
itemArray[1] = jsav.ds.array([3, 2, 2], {centered: false, left:50, top:40});//weight
itemArray[2] = jsav.ds.array([3, 8, 4], {centered: false, left:50, top:80});//value

//this was what I was going to label the arrays with.
jsav.label("Item", {left: 175, top: 12});
jsav.label("Weight", {left: 175, top: 52});
jsav.label("Value", {left: 175, top: 92});
jsav.label("Item Table", {left: 70, top: -20})

jsav.label("Knapsack", {right: 75, top:-20})

//set up the table with the base cases and blank other spaces
dynTable[0] = jsav.ds.array([0, 0, 0, 0, 0, 0, 0], {top: "0px"});
dynTable[1] = jsav.ds.array([0, "", "", "", "", "", ""], {top: "40px"});
dynTable[2] = jsav.ds.array([0, "", "", "", "", "", ""], {top: "80px"});
dynTable[3] = jsav.ds.array([0, "", "", "", "", "", ""], {top: "120px"});

//labels for the arrays
jsav.label("Item", {left:(parseInt(dynTable[0].css("left")) - 65), top:(parseInt(dynTable[0].css("top")) + 10)});
jsav.label("Capacity", {top:(parseInt(dynTable[0].css("top")) - 40), left:(parseInt(dynTable[0].css("left")) + 0 )});

//item labels
//console.log("items labels:");
for(var i = 0; i < dynTable.length; i++)
{
    
//    console.log("parse: \"" + dynTable[0].css("top"));
//    console.log("top" + (parseInt(dynTable[0].css("top")) + 42 * i + 10));
//    console.log("left" + (parseInt(dynTable[0].css("left")) - 20));
    jsav.label(i, {top:(parseInt(dynTable[0].css("top")) + 42 * i + 10),
                   left:(parseInt(dynTable[0].css("left")) - 20)});
}
//weight labels
for(var i = 0; i < dynTable[0].size(); i++)
{
    jsav.label(i, {top:(parseInt(dynTable[0].css("top")) - 20), left:(parseInt(dynTable[0].css("left")) + 17 + 41*i)});
}


//make sure that we can see the arrays
for(i = 0; i < itemArray.length; i++)
{
    itemArray[i].show();
}
for(i = 0; i < itemArray.length; i++)
{
    dynTable[i].show();
}

//fills in every cell in the dp lookup table
//using the data form the item array
fillTableComplete(dynTable, itemArray);

//animate through the recovery of the answer
findSolSet(solSet, dynTable, itemArray);
jsav.step();
jsav.recorded();
