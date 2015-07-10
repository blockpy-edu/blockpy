//Written by Nabanita Maji and Cliff Shaffer
"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var x;
  var y;
  var mat1,mat2;
  var mat1data;
  var mat2data;
  

function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));
  jsav.umsg("The following two matrices need to be multiplied");
  x = 0; y = 0;
  mat1data=[[2,3],[6,7],[4,9]];
  mat2data=[[1,10,5],[12,8,11]];
  mat1 = new jsav.ds.matrix(mat1data,{style:"matrix",left:x+30,top:y+0});
  for(var i=0;i<3;i++)
    for(var j=0;j<2;j++)
      mat1.css(i,j,{"background-color":"Wheat"});
  mat1.show();
  jsav.label("X",{left:x+190,top:y+10});
  mat2 = new jsav.ds.matrix(mat2data,{style:"matrix",left:x+280,top:y+0});
  for(var i=0;i<2;i++)
    for(var j=0;j<3;j++)
      mat2.css(i,j,{"background-color":"PowderBlue"});
  mat2.show();
  jsav.displayInit();
  jsav.step();
  jsav.umsg ("Each of the two matrices are transformed into corresponding symmeric matrices by using its transpose as shown.");
  var r21 = jsav.g.rect(0,200,435,220);
  r21.show();
  var l11 = jsav.g.line(70,130,70,150);
  l11.show();
  var l12 = jsav.g.line(70,170,70,200);
  l12.show();
  var l21 = jsav.g.line(350,110,350,150);
  l21.show();
  var l22 = jsav.g.line(350,170,350,200);
  l22.show();
  var r2 = jsav.g.rect(0,150,200,20);
  jsav.label("Transformation (Cost:O(mn))",{left:5,top:135});
  r2.show();
  var r3 = jsav.g.rect(250,150,200,20);
  jsav.label("Transformation (Cost:O(mn))",{left:255,top:135});
  r3.show();
  var mat1Transformed = transform(mat1data,3,2,0); 
  var mat1TransDisp = new jsav.ds.matrix(mat1Transformed,{style:"matrix",left:x+10,top:y+200});
  for(var i=0;i<3;i++)
    for(var j=3;j<5;j++)
      mat1TransDisp.css(i,j,{"background-color":"Wheat"});
  for(var i=3;i<5;i++)
    for(var j=0;j<3;j++)
      mat1TransDisp.css(i,j,{"background-color":"Khaki"});
  mat1TransDisp.show();
  jsav.label("X",{left:x+210,top:y+270});
  var mat2Transformed = transform(mat2data,2,3,1); 
  var mat2TransDisp = new jsav.ds.matrix(mat2Transformed,{style:"matrix",left:x+250,top:y+200});
  for(var i=0;i<3;i++)
    for(var j=3;j<5;j++)
      mat2TransDisp.css(i,j,{"background-color":"LightSteelBlue"});
  for(var i=3;i<5;i++)
    for(var j=0;j<3;j++)
      mat2TransDisp.css(i,j,{"background-color":"PowderBlue"});
  mat2TransDisp.show();
  jsav.step();
  jsav.umsg("Then the two symmetric matrices are multiplied");
  var r31 = jsav.g.rect(535,200,200,220);
  r31.show();
  var l31 = jsav.g.line(450,300,520,300);
  l31.show();
  jsav.label("Multiply",{left:450,top:300}); 
  var product = multiply(mat1Transformed,mat2Transformed,5,5,5); 
  var productDisp = new jsav.ds.matrix(product,{style:"matrix",left:x+550,top:y+200});
  productDisp.show();
  jsav.step();
  for(var i=0;i<3;i++)
    for(var j=0;j<3;j++)
      productDisp.css(i,j,{"background-color":"#CCFF99"});

  var r32 = jsav.g.rect(560,220,95,100);
  r31.show();
  var r4 = jsav.g.rect(550,150,200,20);
  jsav.label("Reverse Transform (O(mn))",{left:555,top:135});
  r4.show();
  var l31 = jsav.g.line(640,120,640,150);
  l31.show();
  var l32 = jsav.g.line(640,170,640,200);
  l32.show();
  jsav.umsg("The 3*3 matrix in the upper left corner gives the output array");
  jsav.step();
  var verifyprod = multiply(mat1data,mat2data,3,3,2); 
  var verifyprodDisp = new jsav.ds.matrix(verifyprod,{style:"matrix",left:x+600,top:y+0});
  for(var i=0;i<3;i++)
    for(var j=0;j<3;j++)
      verifyprodDisp.css(i,j,{"background-color":"#CCFF99"});
  verifyprodDisp.show();
  jsav.label("Output Array",{left:610,top:-30});
  jsav.umsg("Total cost = O(mn) + cost of smmtric multiply");
   
  jsav.recorded();
}

function transpose(matrix,row,col){
	var result = new Array(col);;
	for(var i=0;i<col;i++)
   		result[i]=new Array(row); 
	for(var i=0;i<col;i++){
		for(var j=0;j<row;j++){
			result[i][j] = matrix[j][i];
		}
	}
	return result;
}

function zeroMat(row,col){
	var result = new Array(row);
	for(var i=0;i<row;i++)
   		result[i]=new Array(col); 
	for(var i=0;i<row;i++)
		for(var j=0;j<col;j++)
       	        	result[i][j]=0;
	
	return result;
}

function transform(matrix,row,col,flag){
        var num = row+col;
	var result = zeroMat(num,num);
        var matrixT = transpose(matrix,row,col) ;
        for(var i=0;i<row;i++){
		for(var j=0;j<col;j++){
			if(flag==0){
				result[i][row+j]=matrix[i][j];
				result[row+j][i]=matrixT[j][i];
			}
			else if(flag==1) {
				result[j][col+i]=matrixT[j][i];
				result[col+i][j]=matrix[i][j];
			}
		}
	}
	return result;
}

function multiply(mat1,mat2,row,col,mid){
	var result = zeroMat(row,col);
	for(var i=0;i<row;i++)
		for(var j=0;j<col;j++)
			for(var k=0;k<mid;k++)
				result[i][j]+=mat1[i][k]*mat2[k][j];
				
	return result;
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
