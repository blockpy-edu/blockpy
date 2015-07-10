/*global ODSA */
"use strict";
$(document).ready(function () {
  var jsav = new JSAV("varindexCON");
  var setYellow = function (index) {
    arr.css(index, {"background-color": "#FFFF00" });
  };
  var itemheight = 72;  

  //Lower rectangles
  var rect11 = jsav.g.rect(0, itemheight, 120, 20).css({"fill": "white"});
  var rect12 = jsav.g.rect(120, itemheight, 60, 20).css({"fill": "white"});
  var rect13 = jsav.g.rect(180, itemheight, 140, 20).css({"fill": "white"});
  var rect14 = jsav.g.rect(320, itemheight, 30, 20).css({"fill": "white"});
  var rect15 = jsav.g.rect(350, itemheight, 170, 20).css({"fill": "white"});
  
  var fragLabel1 = jsav.label("73", {left : 2, top: itemheight - 15});
  var fragLabel2 = jsav.label("52", {left : 122, top: itemheight - 15});
  var fragLabel3 = jsav.label("98", {left : 182, top: itemheight - 15});
  var fragLabel4 = jsav.label("37", {left : 322, top: itemheight - 15});
  var fragLabel5 = jsav.label("42", {left : 352, top: itemheight - 15});
  
  // Slide 1
  jsav.umsg("Here is an array of variable length database records");
  jsav.displayInit();
  
  // Slide 2
  var theArray = [];
  theArray.length = 10;
  var arr = jsav.ds.array(theArray);
  jsav.umsg("This is the Linear Index array");
  jsav.step();
  
  // Slide 3
  jsav.effects.copyValue(fragLabel1, arr, 0);
  jsav.umsg("Every block in the variable length array has a corresponding key in the Linear Index Array");
  jsav.step();
  
  // Slide 4
  jsav.effects.copyValue(fragLabel2, arr, 2);
  jsav.step();
  
  // Slide 5
  jsav.effects.copyValue(fragLabel3, arr, 4);
  jsav.step();
  
  // Slide 6
  jsav.effects.copyValue(fragLabel4, arr, 6);
  jsav.step();
  
  // Slide 7
  jsav.effects.copyValue(fragLabel5, arr, 8);
  jsav.step();

  // Slide 8
  arr.swap(0,6);
  arr.swap(4,8);
  arr.swap(2,4);
  jsav.umsg("Here is the Linear Index Array with all keys in sorted order");
  jsav.step();
  
  // Slide 9
  var xFragArrow = jsav.g.line(160,  20,  160, 45, {'stroke-width' : 1});
  var yFragArrow = jsav.g.line(160,  45,  325, 45, {'stroke-width' : 1});
  var zFragArrow = jsav.g.line(325,  45,  325, 70, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  setYellow(1);
  jsav.umsg("Every key has a pointer to the beginning of the corresponding record in the database file");
  jsav.step();
  
  // Slide 10
  var x1FragArrow = jsav.g.line(226,  20,  226, 39, {'stroke-width' : 1});
  var y1FragArrow = jsav.g.line(226,  39,  355, 39, {'stroke-width' : 1});
  var z1FragArrow = jsav.g.line(355,  39,  355, 70, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  setYellow(3);
  jsav.step();
  
  // Slide 11
  var x2FragArrow = jsav.g.line(289,  20,  289, 62, {'stroke-width' : 1});
  var y2FragArrow = jsav.g.line(289,  62,  127, 62, {'stroke-width' : 1});
  var z2FragArrow = jsav.g.line(127,  62,  127, 70, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  setYellow(5);
  jsav.step();
  
  // Slide 12
  var x3FragArrow = jsav.g.line(351,  20, 351, 57, {'stroke-width' : 1});
  var y3FragArrow = jsav.g.line(351,  57,  7, 57, {'stroke-width' : 1});
  var z3FragArrow = jsav.g.line(7,  57,  7, 70, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  setYellow(7);
  jsav.step();

  // Slide 13
  var x4FragArrow = jsav.g.line(412,  20,  412, 51, {'stroke-width' : 1});
  var y4FragArrow = jsav.g.line(412,  51,  184, 51, {'stroke-width' : 1});
  var z4FragArrow = jsav.g.line(184,  51,  184, 70, {'arrow-end': 'classic-wide-long','stroke-width' : 1});  
  setYellow(9);
  jsav.step();
  
  // Slide 14
  jsav.umsg("Each record in the index file is of fixed length and contains a pointer to the beginning of the corresponding record in the database file");
  jsav.recorded();
});
  

$(document).ready(function () {
  var theArray = [1,2003,5894,10528];
  var empty = [];
  empty.length = 4;
  var av = new JSAV("linindexCON");
  var arr2 = av.ds.array(theArray);

  var LIGHT = "rgb(215, 215, 215)"; 
  var setYellow = function (index) {
    arr2.css(index, {"background-color": "#FFFF00" });
  };
  var setLight = function (index) {
    arr3.css(index, {"background-color": "#ddf"});
  };
  var itemheight = 75;

  av.umsg("Here is the Second Level Index Array which stores the first key value in the disk block of the index file");
  av.displayInit();
  
  av.umsg("Let's search for the entry with key 3000");
  av.step();
  
  setYellow(1);
  av.umsg("The second disk block contains the greatest value less than or equal to the search key");
  av.step();
  
  av.umsg("Here is a representation of the disk blocks in the Linear Index file");
  var rect5 = av.g.rect(0, itemheight, 143, itemheight - 50).css({"fill": "white"});
  var rect6 = av.g.rect(143, itemheight, 143, itemheight - 50).css({"fill": "white"});
  var rect7 = av.g.rect(286, itemheight, 143, itemheight - 50).css({"fill": "white"});
  var rect8 = av.g.rect(429, itemheight, 143, itemheight - 50).css({"fill": "white"});
  
  var fragLabel1 = av.label("1", {left : 2, top: itemheight - 13});
  var fragLabel2 = av.label("2001", {left : 104, top: itemheight - 13});
  var fragLabel3 = av.label("2003", {left : 145, top: itemheight - 13});
  var fragLabel4 = av.label("5688", {left : 245, top: itemheight - 13});
  var fragLabel5 = av.label("5894", {left : 288, top: itemheight - 13});
  var fragLabel6 = av.label("9942", {left : 388, top: itemheight - 13});
  var fragLabel7 = av.label("10528", {left : 431, top: itemheight - 13});
  var fragLabel8 = av.label("10984", {left : 523, top: itemheight - 13});
  var fragLabel9 = av.label("Linear Index: Disk Blocks", {left :  0, top:  100});
  av.step();
  
  av.umsg("The search is directed to the proper block in the index file, which is read into memory");
  var rect6 = av.g.rect(143, 75, 143, 25).css({"fill": "#FFFF00"});
  av.step();
  
  var theArray2 = [2003,2260, 2592, 2820, 3000, 3920, 4160, 4880, 5550, 5688];
  var arr3 = av.ds.array(theArray2, {top: 140, center: true, right: 0, left: 0, indexed: true});

  fragLabel9.hide();
  var x4FragArrow = av.g.line(147,  100,  30, 155, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  var z5FragArrow = av.g.line(280,  100, 430, 155, {'arrow-end': 'classic-wide-long','stroke-width' : 1});
  
  
  av.umsg("Here is the array expansion of the selected block within the index file");
  av.step();
  av.umsg("Now we perform a binary search to look for the record in the array expansion");
  av.step();
  
  av.umsg("We now choose the median value, which is the value at index 5");
  setLight(5);
  av.step();

  x4FragArrow.hide();
  z5FragArrow.hide();
  av.umsg("Since the record 3000 is less than the median value we split the array and look in the lower half");
  arr3.css(5, {"background-color": "white"});
  av.step();

  av.umsg("The element at Index 2 is the new median value");
  arr3.css(2, {"background-color": "#ddf"});
  av.step();
  av.umsg("Since 3000 is greater than the median value we look at the two values at index 3 and 4");
  arr3.css(2, {"background-color": "white"});
  arr3.css(3, {"background-color": "#ddf"});
  arr3.css(4, {"background-color": "#ddf"});
  av.step();
  av.umsg("The record that we are looking for is at index 4");
  arr3.css(3, {"background-color": "white"});
  arr3.css(4, {"background-color": "#FFFF00"});
  av.step();
  av.umsg("A binary search produces a pointer to the actual record in the database");
  av.recorded();
});
