"use strict";
// Various functions and variables that will be used by all of the
// following sections of the tutorial.

// Helper function for seting pointer
function setPointer(name, node, opt){
  var pointerRight = {anchor: "right top",
    myAnchor: "left bottom",
    left: -10,
    top: -20};
  var pointerLeft = {anchor: "left top",
    myAnchor: "right bottom",
    left: 15,
    top: -20};
  if(opt === "right"){
    return node.jsav.pointer(name, node, pointerRight);
  }else{
    return node.jsav.pointer(name, node, pointerLeft);
  }
}

// Helper funciton for deleting a pointer
function delPointer(pointer){
  if(pointer){
    pointer.element.remove();
    pointer.arrow.remove();
  }
}

// SelfOrg frequence heuristic
///////////////////////////////////////
(function ($) {
  var jsav = new JSAV("SelforgCON1");

  // Offsets
  var leftMargin = 217;
  var topMargin =  40;

  // Create a list object under control of JSAV library
  var l = jsav.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
  l.addFirst("H")
   .addFirst("G")
   .addFirst("F")
   .addFirst("E")
   .addFirst("D")
   .addFirst("C")
   .addFirst("B")
   .addFirst("A");
  l.layout();

  // Create freelist
  var freelist = jsav.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  // Create 'null' label
  var nullLabel = jsav.label("Counter", {top: topMargin - 55, left: leftMargin - 110});
  nullLabel.css({color : "red"});
  // counters for the nodes
  var Apointer = setPointer("0", l.get(0));
  var Bpointer = setPointer("0", l.get(1));
  var Cpointer = setPointer("0", l.get(2));
  var Dpointer = setPointer("0", l.get(3));
  var Epointer = setPointer("0", l.get(4));  
  var Fpointer = setPointer("0", l.get(5));
  var Gpointer = setPointer("0", l.get(6));
  var Hpointer = setPointer("0", l.get(7));



// Declaring our DashLine
function DashLine(dashlineHeight) {
    this.setMargin = function (dashlineLeftMargin) {
    return jsav.g.polyline([[dashlineLeftMargin, dashlineHeight], 
      [dashlineLeftMargin + 13, dashlineHeight], [dashlineLeftMargin + 13, dashlineHeight + 36],	   [dashlineLeftMargin + 	    83,dashlineHeight + 36],[dashlineLeftMargin + 83, dashlineHeight],[dashlineLeftMargin + 101, dashlineHeight]], 	   {"arrow-end":"classic-wide-long", "opacity":0, "stroke-width":2,"stroke-dasharray":"-"});
    }  

    return this;
};


/////////////////////////
var margin1 = 264;
var margin2 = 338;
var margin3 = 412
var margin4 = 486;
var margin5 = 560;
var margin6 = 634;
var dashObject = new DashLine(58);
var dashline = dashObject.setMargin(margin5);


  jsav.umsg("We will illustrate maintaining a self-organizing list using frequency count on the pattern: F D F G E G F A D F G E.");
  jsav.displayInit();

  // step 1
  jsav.umsg("We search for F");
  l.get(5).highlight();
  jsav.step();

  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(5);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(5).edgeToNext().show();
  Fpointer = setPointer("1", l.get(0));
  l.layout();
  jsav.step();


  // step 2
  jsav.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  Dpointer = setPointer("1", l.get(0));
  l.layout();
  jsav.step();

  // step 3
  jsav.umsg("We search for F"); 
  l.get(0).unhighlight();
  l.get(1).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  Fpointer = setPointer("2", l.get(0));
  l.layout();
  jsav.step();

  // step 4
  jsav.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(6);
  l.add(1, "G");
  l.get(1).highlight();
  l.get(6).edgeToNext().show();
  Gpointer = setPointer("1", l.get(1));
  l.layout();
  jsav.step();

 // step 5
  jsav.umsg("We search for E");
  l.get(1).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(6);
  l.add(1, "E");
  l.get(1).highlight();
  l.get(6).edgeToNext().show();
  Epointer = setPointer("1", l.get(1));
  l.layout();
  jsav.step();

 // step 6
  jsav.umsg("We search for G");
  l.get(1).unhighlight();
  l.get(2).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(2);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  Gpointer = setPointer("2", l.get(0));
  l.layout();
  jsav.step();

 // step 7
  jsav.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(1).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  Fpointer = setPointer("3", l.get(0));
  l.layout();
  jsav.step();


 // step 7
  jsav.umsg("We search for A");
  l.get(4).highlight();
  l.get(0).unhighlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(4);
  l.add(2, "A");
  l.get(2).highlight();
  l.get(4).edgeToNext().show();
  Apointer = setPointer("1", l.get(2));
  l.layout();
  jsav.step();

 // step 8
  jsav.umsg("We search for D");
  l.get(2).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();
  l.remove(4);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(4).edgeToNext().show();
  Dpointer = setPointer("2", l.get(2));
  l.layout();
  jsav.step();

 // step 9
  jsav.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(0).highlight();
  jsav.step();
  jsav.umsg("F stays in the same position");
  l.remove(0);
  l.add(0, "F");
  l.get(0).highlight();
  Fpointer = setPointer("4", l.get(0));
  l.layout();
  jsav.step();

 // step 11
  jsav.umsg("We search for G");
  l.get(1).highlight();
  l.get(0).unhighlight();
  jsav.step();
  l.remove(1);
  l.add(1, "G");
  jsav.umsg("G stays in the same position");
  l.get(1).highlight();
  Gpointer = setPointer("3", l.get(1));
  l.layout();
  jsav.step();

 // step 12
  jsav.umsg("We search for E");
  l.get(1).unhighlight();
  l.get(4).highlight();
  jsav.step();

  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Because its count has increased enough, we need to move it. Remove it from the list.");
  jsav.step();
  jsav.umsg("Put the node in position to maintain a list sorted by frequency.");
  dashline.hide();

  l.remove(4);
  l.add(3, "E");
  l.get(3).highlight();
  l.get(4).edgeToNext().show();
  Epointer = setPointer("2", l.get(3));
  l.layout();
  jsav.step();

  jsav.step();
  jsav.umsg("And we are done");
  l.get(3).unhighlight();
  jsav.step();

  jsav.umsg("The total number of comparisons required was 45.");
  jsav.recorded();
}(jQuery));





////////////////////////////////////
///
//SelfOrg list move-to-front
///////////////////////////////////////
(function ($) {
  var jsav = new JSAV("SelforgCON2");

// Declaring our DashLine
function DashLine(dashlineHeight) {
    this.setMargin = function (dashlineLeftMargin) {
    return jsav.g.polyline([[dashlineLeftMargin, dashlineHeight], 
      [dashlineLeftMargin + 13, dashlineHeight], [dashlineLeftMargin + 13, dashlineHeight + 36],	   [dashlineLeftMargin + 	    83,dashlineHeight + 36],[dashlineLeftMargin + 83, dashlineHeight],[dashlineLeftMargin + 101, dashlineHeight]], 	   {"arrow-end":"classic-wide-long", "opacity":0, "stroke-width":2,"stroke-dasharray":"-"});
    }  

    return this;
};


/////////////////////////
var margin1 = 264;
var margin2 = 338;
var margin3 = 412
var margin4 = 486;
var margin5 = 560;
var margin6 = 634;
var dashObject = new DashLine(58);
var dashline = dashObject.setMargin(margin5);

  // Offsets
  var leftMargin = 217;
  var topMargin =  40;

  // Create a list object under control of JSAV library
  var l = jsav.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
  l.addFirst("H")
   .addFirst("G")
   .addFirst("F")
   .addFirst("E")
   .addFirst("D")
   .addFirst("C")
   .addFirst("B")
   .addFirst("A");
  l.layout();

  // Create freelist
  var freelist = jsav.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  jsav.umsg("We will illustrate maintaining a self-organizing list using move-to-front on the pattern: F D F G E G F A D F G E.");
  jsav.displayInit();

  // step 1
  jsav.umsg("We search for F");
  l.get(5).highlight();
  jsav.step();
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(5);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 2
  jsav.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 3
  jsav.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(1).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 4
  jsav.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(6);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 5
  jsav.umsg("We search for E");
  l.get(0).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(6);
  l.add(0, "E");
  l.get(0).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 6
  jsav.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(1).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(1);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 7
  jsav.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(2).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(2);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  l.layout();
  jsav.step();


  // step 8
  jsav.umsg("We search for A");
  l.get(0).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(4);
  l.add(0, "A");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 9
  jsav.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 10
  jsav.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(2).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(2);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 11
  jsav.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(3).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(3);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 12
  jsav.umsg("We search for E");
  l.get(0).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Move it to the front");
  dashline.hide();
  l.remove(4);
  l.add(0, "E");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  jsav.step();

  jsav.umsg("And we are done");
  l.get(0).unhighlight();
  jsav.step();

  jsav.umsg("The total number of comparisons required was 54.");
  jsav.recorded();
}(jQuery));




////////////////////////////////////
///
//SelfOrg list Transpose
///////////////////////////////////////
(function ($) {
  var jsav = new JSAV("SelforgCON3");

// Declaring our DashLine
function DashLine(dashlineHeight) {
    this.setMargin = function (dashlineLeftMargin) {
    return jsav.g.polyline([[dashlineLeftMargin, dashlineHeight], 
      [dashlineLeftMargin + 13, dashlineHeight], [dashlineLeftMargin + 13, dashlineHeight + 36],	   [dashlineLeftMargin + 	    83,dashlineHeight + 36],[dashlineLeftMargin + 83, dashlineHeight],[dashlineLeftMargin + 101, dashlineHeight]], 	   {"arrow-end":"classic-wide-long", "opacity":0, "stroke-width":2,"stroke-dasharray":"-"});
    }  

    return this;
};


/////////////////////////
var margin1 = 264;
var margin2 = 338;
var margin3 = 412
var margin4 = 486;
var margin5 = 560;
var margin6 = 634;
var dashObject = new DashLine(58);
var dashline = dashObject.setMargin(margin5);

  // Offsets
  var leftMargin = 217;
  var topMargin =  40;

  // Create a list object under control of JSAV library
  var l = jsav.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
  l.addFirst("H")
   .addFirst("G")
   .addFirst("F")
   .addFirst("E")
   .addFirst("D")
   .addFirst("C")
   .addFirst("B")
   .addFirst("A");
  l.layout();

  // Create freelist
  var freelist = jsav.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  jsav.umsg("We will illustrate maintaining a self-organizing list using transpose on the pattern: F D F G E G F A D F G E.");
  jsav.displayInit();

  // step 1
  jsav.umsg("We search for F");
  l.get(5).highlight();
  jsav.step();
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(5);
  l.add(4, "F");
  l.get(4).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 2
  jsav.umsg("We search for D");
  l.get(4).unhighlight();
  l.get(3).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(3);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 3
  jsav.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(4).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(4);
  l.add(3, "F");
  l.get(3).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 4
  jsav.umsg("We search for G");
  l.get(3).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(6);
  l.add(5, "G");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 5
  jsav.umsg("We search for E");
  l.get(5).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(6);
  l.add(5, "E");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 6
  jsav.umsg("We search for G");
  l.get(5).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(6);
  l.add(5, "G");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 7
  jsav.umsg("We search for F");
  l.get(5).unhighlight();
  l.get(3).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(3);
  l.add(2, "F");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 8
  jsav.umsg("We search for A");
  l.get(2).unhighlight();
  l.get(0).highlight();
  jsav.step();
  jsav.umsg("A stays in the same position");
  jsav.step();

  // step 9
  jsav.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(3).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(3);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  jsav.step();


  // step 10
  jsav.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(3).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(3);
  l.add(2, "F");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  jsav.step();


  // step 11
  jsav.umsg("We search for G");
  l.get(2).unhighlight();
  l.get(5).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin5);
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(5);
  l.add(4, "G");
  l.get(4).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  jsav.step();

  // step 12
  jsav.umsg("We search for E");
  l.get(4).unhighlight();
  l.get(6).highlight();
  jsav.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  jsav.umsg("Swap with the previous record.");
  dashline.hide();
  l.remove(6);
  l.add(5, "E");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();  

  l.layout();

  jsav.step();
  jsav.umsg("And we are done");
  l.get(5).unhighlight();
  jsav.step();

  jsav.umsg("The total number of comparisons required was 62.");
  jsav.recorded();
}(jQuery));
