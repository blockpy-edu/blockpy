//Written by Nabanita Maji and Cliff Shaffer
"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var input;
  var iparr;
  var pair1;
  var pair2;
  var pair11;
  var pair21;
  var pairs;
  var oparr;
  var paired;
  var line1;

function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));

  jsav.umsg("Sorting of a given array by reducing it to Pairing problem.");
  jsav.displayInit();
  jsav.step();

  input = new Array(23,42,17,93,88,12,57,90);
  iparr = jsav.ds.array(input,  {left: 230, top: -8,indexed:true});
  for(var i=0;i<8;i++)
    iparr.css(i,{"background-color":"AntiqueWhite"});
  jsav.label("<b>Array to be sorted</b>",{left: 290, top: -28});
  jsav.step();

  var l1= jsav.g.line(355,40,355,83);
  l1.show();
  jsav.umsg("Transformation step to reduce into pairing problem");
  jsav.label("<b>Transformation (Cost=O(n))</b>",{left: 375, top: 45});
  var r1 = jsav.g.rect(80,85,550,45);
  r1.show();
  jsav.step();

  jsav.umsg("The Input array and Position array is given as an input to the Pairing problem. The Position array contains a value <i>k</i> at the k<sup>th</sup> index");
  pair1 = jsav.ds.array([0,1,2,3,4,5,6,7],  {left: 90 , top: 75});
  for(var i=0;i<8;i++)
    pair1.css(i,{color:"blue","background-color":"WhiteSmoke"});
  jsav.label("Position <br>array",{left: 20, top: 75});
  pair2 = jsav.ds.array(input,  {left: 370, top: 75});
  for(var i=0;i<8;i++)
    pair2.css(i,{"background-color":"AntiqueWhite"});
  jsav.label("Input <br>array",{left: 640, top: 75});
  jsav.step();

  jsav.umsg("The two arrays are fed into the Pairing problem as input");
  jsav.label("<b>Pairing</b>",{left: 375, top: 120});
  var l2= jsav.g.line(355,130,355,160);
  l2.show();
  var r2 = jsav.g.rect(215,160,280,110);
  r2.show();
  jsav.step();

  jsav.umsg("Pairing problem is to be solved on the two arrays");
  pair11 = jsav.ds.array([0,1,2,3,4,5,6,7],  {left: 230 , top: 152});
  for(var i=0;i<8;i++)
    pair11.css(i,{color:"blue","background-color":"WhiteSmoke"});
  pair21 = jsav.ds.array(input,  {left: 230, top: 212});
  for(var i=0;i<8;i++)
    pair21.css(i,{"background-color":"AntiqueWhite"});
  jsav.step();
 
  jsav.umsg("Pairing problem is solved on the two arrays");
  pairs = new Array([23,2],[42,3],[17,1],[93,7],[88,5],[12,0],[57,4],[90,6]);

  var pairing = new Array();
  for(var i=0;i<8;i++){
	var x2=i*30+250;
	var x1=pairs[i][1]*30+250;
	pairing[i]=jsav.g.line([x1,197,x2,229]);
	pairing[i].show();
	
  }
  jsav.step();
	 
  jsav.umsg("Pairing problem is solved on the two arrays");
  var l3= jsav.g.line(355,270,355,300);
  l3.show();
  jsav.label("<b>Pairs generated</b>",{left: 375, top:260});
  paired = jsav.ds.array(pairs,{left: 194, top: 285});
  for(var i=0;i<8;i++)
       paired.css(i,{"width":"40px","min-width":"40px"});
  jsav.step();

 
  jsav.umsg("Reverse transformation: "
  +"In each pair, the second number determines the position of the first in Output Array");
  var l4= jsav.g.line(355,330,355,360);
  l4.show();
  jsav.label("<b>Reverse Transformation Cost=O(n)</b>",{left: 375,top: 320});
  var r1 = jsav.g.rect(215,360,280,80);
  r1.show();
  oparr= jsav.ds.array([" "," "," "," "," "," "," "," "],  {left: 230, top: 360,indexed:true});
  for(var i=0;i<8;i++)
       oparr.css(i,{"background-color":"Snow"});
  jsav.step();

  jsav.step();
  oparr.show();
  var curr;
  for(var i=0;i<8;i++){
	if(i>0){
        	paired.unhighlight(i-1);
        	oparr.unhighlight(curr);
		//oparr.css(curr,{"background-color":"ForestGreen"});
	}
	var str=paired.value(i)+",";
	var arr=str.split(",");
	curr=arr[1];
	curr=curr*1;
        oparr.value(curr,arr[0]);
        paired.highlight(i);
        oparr.highlight(curr);
	jsav.umsg("Placing "+arr[0]+" at "+curr);
	jsav.step()
  }
  paired.unhighlight(i-1);
  oparr.unhighlight(curr);
  jsav.umsg("The output array gives the sorted array" );
  jsav.step();
  var l5= jsav.g.line(495,412,522,412);
  jsav.label("<b>Output</b>",{left: 620,top: 410});
  var op= jsav.ds.array([" "," "," "," "," "," "," "," "],  {left: 520, top: 380});
  for(var i=0;i<8;i++)
  	op.value(i,oparr.value(i)); 
  for(var i=0;i<8;i++)
        op.css(i,{"background-color":"#CCFF99"});
  jsav.umsg("Total cost of sorting = O(n) + Cost of Pairing");
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
