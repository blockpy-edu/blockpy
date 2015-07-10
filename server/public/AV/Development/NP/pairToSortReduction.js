//Written by Nabanita Maji and Cliff Shaffer
"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var input1;
  var input2;
  var sort1;
  var sort2;
  var iparr1;
  var iparr2;
  var sortarr1;
  var sortarr2;
  var oparr;
  var paired;

function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));

  jsav.umsg("Pairing of two arrays by reduction to sorting");
  jsav.displayInit();
  jsav.step();

  input1 = new Array(23,42,17,93,88,12,57,90);
  input2 = new Array(48,59,11,89,12,91,64,34);
  var r1 = jsav.g.rect(95,10,560,60);
  r1.show();
  iparr1 = jsav.ds.array(input1,  {left: 100, top: 8});
  for(var i=0;i<input1.length;i++)
    iparr1.css(i,{"background-color":"AntiqueWhite"});
  iparr2 = jsav.ds.array(input2,  {left: 400, top: 8});
  for(var i=0;i<input2.length;i++)
    iparr2.css(i,{"background-color":"AntiqueWhite"});
  jsav.label("<b>Arrays to be paired</b>",{left: 300, top: -28});
  jsav.step();


  var r12 = jsav.g.rect(95,110,560,60);
  r12.show();
  iparr1 = jsav.ds.array(input1,  {left: 100, top: 107});
  for(var i=0;i<input1.length;i++)
    iparr1.css(i,{"background-color":"AntiqueWhite"});
  iparr2 = jsav.ds.array(input2,  {left: 400, top: 107});
  for(var i=0;i<input2.length;i++)
    iparr2.css(i,{"background-color":"AntiqueWhite"});
  var l11 = jsav.g.line(369,70,369,110);
  l11.show();
  jsav.label("<b>Transformation - Identity function Cost= O(n)</b>",{left: 400, top: 65});
  jsav.umsg("The arrays are fed as input to the sorting problem directly");
  jsav.step();
  
  var l1= jsav.g.line(220,170,220,190);
  l1.show();
  var l2= jsav.g.line(520,170,520,190);
  l2.show();
  
  jsav.umsg("Sort the two arrays individually");
  var r2 = jsav.g.rect(190,190,60,40);
  r2.show();
  var r3 = jsav.g.rect(490,190,60,40);
  r3.show();
  jsav.label("<b>Sort</b>",{left: 202, top: 185});
  jsav.label("<b>Sort</b>",{left: 502, top: 185});
  jsav.step();

  var l3= jsav.g.line(220,230,220,240);
  l3.show();
  var l4= jsav.g.line(520,230,520,240);
  l4.show();
  sort1 = new Array(12,17,23,42,57,88,90,93);
  sort2 = new Array(11,12,34,48,59,64,89,91);
  var r4 = jsav.g.rect(95,240,560,60);
  r4.show();
  sortarr1 = jsav.ds.array(sort1,  {left: 100, top: 237});
  jsav.label("Sorted array",{left:10,top:240});
  sortarr2 = jsav.ds.array(sort2,  {left: 400, top: 237});
  jsav.label("Sorted array",{left:660,top:240});
  jsav.step();


  var r4 = jsav.g.rect(95,330,560,60);
  r4.show();
  var l12 = jsav.g.line(369,300,369,330);
  l12.show();
  jsav.umsg("The sorted arrays are reverse transformed.");
  jsav.label("<b>Reverse Transformation Cost= O(n)</b>",{left: 400, top: 290});
  jsav.step();

  jsav.umsg("Pair the numbers at the same index of two sorted arrays together.");
  oparr= jsav.ds.array([" "," "," "," "," "," "," "," "],  {left: 180, top: 327});
  jsav.step();
  
  oparr.show();
  for(var i=0;i<8;i++){
	if(i>0){
        	sortarr1.unhighlight(i-1);
        	sortarr2.unhighlight(i-1);
        	oparr.unhighlight(i-1);
	}
	var str="&nbsp"+sortarr1.value(i)+","+sortarr2.value(i)+"&nbsp";
        oparr.value(i,str);
        sortarr1.highlight(i);
        sortarr2.highlight(i);
        oparr.highlight(i);
	jsav.umsg("Pairing "+sortarr1.value(i)+" with "+sortarr2.value(i));
	jsav.step()
  }
  sortarr1.unhighlight(i-1);
  sortarr2.unhighlight(i-1);
  oparr.unhighlight(i-1);
  jsav.umsg("The output array gives the pairing" );
  jsav.step();
  var l13 = jsav.g.line(369,390,369,415);
  l13.show();
  var oparr2= jsav.ds.array([" "," "," "," "," "," "," "," "],  {left: 180, top: 397});
  for(var i=0;i<8;i++)
 	oparr2.value(i,oparr.value(i));
  for(var i=0;i<8;i++)
    oparr2.css(i,{"background-color":"#CCFF99"});
  jsav.umsg("Cost of pairing = O(n) + Cost of sorting");
  jsav.label("<b>Paired array</b>",{left:570,top:400});
  jsav.step(); 
  jsav.recorded();
}

function about() {
     var mystring = "Example of Reduction\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);

}
  

// Connect action callbacks to the HTML entities
$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
