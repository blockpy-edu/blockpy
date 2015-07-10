"use strict";
/*global alert: true, ODSA, console */

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


(function ($) {
  var av;

  function runit() {

    ODSA.AV.reset();

    av = new JSAV($(".avcontainer"));

// Declaring our DashLine
function DashLine(dashlineHeight) {
    this.setMargin = function (dashlineLeftMargin) {
    return av.g.polyline([[dashlineLeftMargin, dashlineHeight], 
      [dashlineLeftMargin + 13, dashlineHeight], 
      [dashlineLeftMargin + 13, dashlineHeight + 36],  
         [dashlineLeftMargin +  83,dashlineHeight + 36],
         [dashlineLeftMargin + 83, dashlineHeight],
         [dashlineLeftMargin + 101, dashlineHeight]],    
          {"arrow-end":"classic-wide-long", "opacity":0, 
          "stroke-width":2,"stroke-dasharray":"-"});
    }  

    return this;
};

  switch ($("#fitAlgorithm").val()) {
  case '0':  // No function chosen
  ODSA.AV.reset();
   break;

  case '1':
  // Offsets
  var leftMargin = 217;
  var topMargin =  40;

  // Create a list object under control of JSAV library
  var l = av.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
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
  var freelist = av.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  // Create 'null' label
  var nullLabel = av.label("Counter", {top: topMargin - 55, left: leftMargin - 110});
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


/////////////////////////
var margin1 = 264;
var margin2 = 338;
var margin3 = 412
var margin4 = 486;
var margin5 = 560;
var margin6 = 634;
var dashObject = new DashLine(58);
var dashline = dashObject.setMargin(margin5);

  av.umsg("We will illustrate using a Self Organizing list using frequency count by applying F D F G E G F A D F G E. pattern");
    av.displayInit();
// step 1
  av.umsg("We search for F");
  l.get(5).highlight();
  av.step();

  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(5);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(5).edgeToNext().show();
  Fpointer = setPointer("1", l.get(0));
  l.layout();
  av.step();


  // step 2
  av.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  Dpointer = setPointer("1", l.get(0));
  l.layout();
  av.step();

   // step 3
  av.umsg("We search for F"); 
  l.get(0).unhighlight();
  l.get(1).highlight();
  av.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  Fpointer = setPointer("2", l.get(0));
  l.layout();
  av.step();

  // step 4
  av.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(1, "G");
  l.get(1).highlight();
  l.get(6).edgeToNext().show();
  Gpointer = setPointer("1", l.get(1));
  l.layout();
  av.step();

 // step 5
  av.umsg("We search for E");
  l.get(1).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(1, "E");
  l.get(1).highlight();
  l.get(6).edgeToNext().show();
  Epointer = setPointer("1", l.get(1));
  l.layout();
  av.step();

 // step 6
  av.umsg("We search for G");
  l.get(1).unhighlight();
  l.get(2).highlight();
  av.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(2);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  Gpointer = setPointer("2", l.get(0));
  l.layout();
  av.step();

 // step 7
  av.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(1).highlight();
  av.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  Fpointer = setPointer("3", l.get(0));
  l.layout();
  av.step();


 // step 7
  av.umsg("We search for A");
  l.get(4).highlight();
  l.get(0).unhighlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(2, "A");
  l.get(2).highlight();
  l.get(4).edgeToNext().show();
  Apointer = setPointer("1", l.get(2));
  l.layout();
  av.step();

 // step 8
  av.umsg("We search for D");
  l.get(2).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(4).edgeToNext().show();
  Dpointer = setPointer("2", l.get(2));
  l.layout();
  av.step();

 // step 9
  av.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(0).highlight();
  av.step();
  av.umsg("F stays in the same position");
  l.remove(0);
  l.add(0, "F");
  l.get(0).highlight();
  Fpointer = setPointer("4", l.get(0));
  l.layout();
  av.step();

 // step 11
  av.umsg("We search for G");
  l.get(1).highlight();
  l.get(0).unhighlight();
  av.step();
  l.remove(1);
  l.add(1, "G");
  av.umsg("G stays in the same position");
  l.get(1).highlight();
  Gpointer = setPointer("3", l.get(1));
  l.layout();
  av.step();

 // step 12
  av.umsg("We search for E");
  l.get(1).unhighlight();
  l.get(4).highlight();
  av.step();

  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");

  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();

  l.remove(4);
  l.add(3, "E");
  l.get(3).highlight();
  l.get(4).edgeToNext().show();
  Epointer = setPointer("2", l.get(3));
  l.layout();
  av.step();

  av.step();
  av.umsg("And we are done");
  l.get(3).unhighlight();
  break;


 ///////////////////////////////////////////////////////NEXT CASE
  case '2':
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
  var l = av.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
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
  var freelist = av.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  av.umsg("We will  illustrate using a Self Organizing list using move-to-front by applying F D F G E G F A D F G E. pattern");
  av.displayInit();

  // step 1
  av.umsg("We search for F");
  l.get(5).highlight();
  av.step();
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(5);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  av.step();

  // step 2
  av.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  av.step();

  // step 3
  av.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(1).highlight();
  av.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(1);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  l.layout();
  av.step();

  // step 4
  av.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  av.step();

  // step 5
  av.umsg("We search for E");
  l.get(0).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(0, "E");
  l.get(0).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  av.step();

  // step 6
  av.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(1).highlight();
  av.step();
  dashline = dashObject.setMargin(margin1);
  dashline.show();
  l.get(0).edgeToNext().hide();
  l.get(1).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(1);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(1).edgeToNext().show();
  l.layout();
  av.step();

  // step 7
  av.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(2).highlight();
  av.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(2);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  l.layout();
  av.step();


  // step 8
  av.umsg("We search for A");
  l.get(0).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(0, "A");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  av.step();

  // step 9
  av.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(0, "D");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  av.step();

  // step 10
  av.umsg("We search for F");
  l.get(0).unhighlight();
  l.get(2).highlight();
  av.step();
  dashline = dashObject.setMargin(margin2);
  dashline.show();
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(2);
  l.add(0, "F");
  l.get(0).highlight();
  l.get(2).edgeToNext().show();
  l.layout();
  av.step();

  // step 11
  av.umsg("We search for G");
  l.get(0).unhighlight();
  l.get(3).highlight();
  av.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(3);
  l.add(0, "G");
  l.get(0).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  av.step();

  // step 12
  av.umsg("We search for E");
  l.get(0).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(0, "E");
  l.get(0).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  av.step();

  av.umsg("And we are done");
  l.get(0).unhighlight();

  break;

  ///////////////////////////////////////////////////////NEXT CASE
  case '3':
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
  var l = av.ds.list({"nodegap": 30, "top": topMargin, left: leftMargin});
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
  var freelist = av.ds.list({"nodegap": 30, "top": topMargin + 100, left: leftMargin});

  av.umsg("We will  illustrate using a Self Organizing list using Transpose by applying F D F G E G F A D F G E. pattern");
  av.displayInit();

  // step 1
  av.umsg("We search for F");
  l.get(5).highlight();
  av.step();
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(5);
  l.add(4, "F");
  l.get(4).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  av.step();

  // step 2
  av.umsg("We search for D");
  l.get(4).unhighlight();
  l.get(3).highlight();
  av.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(3);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  av.step();

  // step 3
  av.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(4).highlight();
  av.step();
  dashline = dashObject.setMargin(margin4);
  dashline.show();
  l.get(3).edgeToNext().hide();
  l.get(4).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(4);
  l.add(3, "F");
  l.get(3).highlight();
  l.get(4).edgeToNext().show();
  l.layout();
  av.step();

  // step 4
  av.umsg("We search for G");
  l.get(3).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(5, "G");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  av.step();

  // step 5
  av.umsg("We search for E");
  l.get(5).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(5, "E");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  av.step();

  // step 6
  av.umsg("We search for G");
  l.get(5).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(5, "G");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();
  l.layout();
  av.step();

  // step 7
  av.umsg("We search for F");
  l.get(5).unhighlight();
  l.get(3).highlight();
  av.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(3);
  l.add(2, "F");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  av.step();

  // step 8
  av.umsg("We search for A");
  l.get(2).unhighlight();
  l.get(0).highlight();
  av.step();
  av.umsg("A stays in the same position");
  av.step();

  // step 9
  av.umsg("We search for D");
  l.get(0).unhighlight();
  l.get(3).highlight();
  av.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(3);
  l.add(2, "D");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  av.step();


  // step 10
  av.umsg("We search for F");
  l.get(2).unhighlight();
  l.get(3).highlight();
  av.step();
  dashline = dashObject.setMargin(margin3);
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(3);
  l.add(2, "F");
  l.get(2).highlight();
  l.get(3).edgeToNext().show();
  l.layout();
  av.step();


  // step 11
  av.umsg("We search for G");
  l.get(2).unhighlight();
  l.get(5).highlight();
  av.step();
  dashline = dashObject.setMargin(margin5);
  dashline.show();
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(5);
  l.add(4, "G");
  l.get(4).highlight();
  l.get(5).edgeToNext().show();
  l.layout();
  av.step();

  // step 12
  av.umsg("We search for E");
  l.get(4).unhighlight();
  l.get(6).highlight();
  av.step();
  dashline = dashObject.setMargin(margin6);
  dashline.show();
  l.get(5).edgeToNext().hide();
  l.get(6).edgeToNext().hide();
  av.umsg("Now we can route around the un-needed node.");
  av.step();
  av.umsg("The node goes to the According position");
  dashline.hide();
  l.remove(6);
  l.add(5, "E");
  l.get(5).highlight();
  l.get(6).edgeToNext().show();  

  l.layout();

  av.step();
  av.umsg("And we are done");
  l.get(5).unhighlight();

  break;

      }

 /* MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
  $(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    });
  $(".avcontainer").on("jsav-updatecounter", function(){ 
      // invoke MathJax to do conversion again 
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]); 
    });
*/


  
    av.recorded();
  }

  function about() {
    var mystring = "Build heap running time visual proof\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
