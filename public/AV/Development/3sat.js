/*global ODSA, setPointerL */
//"use strict";
(function ($) {

  var av;
  
  function runit(){
    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]);
    }); 
    $(".avcontainer").on("jsav-updatecounter" ,  function(){
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });

    av = new JSAV($('.avcontainer'));
 
    av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow introduces"+
" and explains the \"3-CNF Satisfiability\" (3-SAT) Problem."
+"</b> <br><br><br> We start with some definitions  and background.");


    av.displayInit();

    av.step();
 
    var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
    var y = 0;
    av.umsg("<br><b>Background</b>"); 
    av.umsg("<br><br><br> A <b>3-CNF</b> is a Boolean formula that is an AND of "+
"clauses, each of which is an OR of exactly 3 distinct literals."
,{preserve:true}); 
    av.step();

    av.umsg("<br><br><br> Example of 3-CNF: (x1 + x2 + x3).(^x1 + x4 + x6)." + 
    "(x2 + ^x5+ ^x3).(x1 + ^x3 + ^x6) .",{preserve:true});
    av.step();

    av.umsg("<br><br><br> An assignment to the boolean variables in a formula "+
"is known as a <b>truth assignment</b>.",{preserve:true});
    av.step();
 
    av.umsg("<br><br><br> A truth assignment of variables is said to be <b> "+
"satisfying</b>, if it causes the formula to evaluate to \"True\".",{preserve:true});
    av.step();
 
    av.umsg("<br><br><br> A 3-CNF is said to be <b>satisfiable</b> if it has a "+
"satisfying assignment.",{preserve:true});
    av.step();
 
   av.umsg("<br><b>The 3-SAT problem</b>");  
    av.umsg("<br><br><br>Given any boolean formula in CNF such that each "+
    "clause has exactly 3 literals , is the formula satisfiable?",
    {preserve:true});

    av.step(); 
    av.umsg("<b>Example of 3-SAT</b>");

    y = 0;

   
    label1 = av.label("<b>P = ($x_1$ + $x_2$ + $x_3$).($x_4$ + ^$x_2$ + ^$x_1$)"
    +" . ($x_3$ + ^$x_2$ + $x_1$) . (^$x_3$ + $x_4$ + $x_1$) . (^$x_4$ + ^$x_2$"
    +" + ^$x_1$) .($x_1$ + $x_4$ + $x_3$) . ($x_3$ + $x_2$ + $x_4$)</b>",
    {top: y-30,left:0}).css({"text-align": "center"}); 

    av.step();

    label2 = av.label("Truth Table for P",{top:y+20,left:150})
    .css({"text-align": "center"});


    var matdata=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>",
    "x<sub>4</sub>","P"],
               ["F","F","F","F","F"],
               ["F","F","F","T","F"],
               ["F","F","T","F","F"],
               ["F","F","T","T","T"],
               ["F","T","F","F","F"],
               ["F","T","F","T","F"],
               ["F","T","T","F","F"],
               ["F","T","T","T","T"]];
    var matdata1=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>",
    "x<sub>4</sub>","P"],
                  ["T","F","F","F","F"],
                  ["T","F","F","T","T"],
                  ["T","F","T","F","T"],
                  ["T","F","T","T","T"],
                  ["T","T","F","F","F"],
                  ["T","T","F","T","F"],
                  ["T","T","T","F","F"],
                  ["T","T","T","T","F"]];

    var mat1 = new av.ds.matrix(matdata,{style:"table",left:50,top:y+50}); 
    var mat2= new av.ds.matrix(matdata1,{style:"table",left:250,top:y+50}); 
    for(var i=0;i<5;i++){
        mat1.css(0,i,{"background-color":"Silver"});
        mat2.css(0,i,{"background-color":"Silver"});
    }
    av.step();

    for (var i=1; i< 9; i++){ 
        if (matdata[i][4] == "F"){ for(var j=0; j<5 ; j++)
            mat1.css(i,j,{"background-color":"#CB6D51"}); } 
        else{ for(var j=0; j<5 ; j++)
            mat1.css(i,j,{"background-color":"#93C572"}); }

        if (matdata1[i][4] == "F"){ for(var j=0; j<8 ; j++)
            mat2.css(i,j,{"background-color":"#CB6D51"}); } 
        else{ for(var j=0; j<8 ; j++)
            mat2.css(i,j,{"background-color":"#93C572"}); }
    
    } 

    av.step();
    label4 = av.label("There exists assignments that makes the formula true "+
    "(The green rows)",{top:y+120,left:550})
    av.step();
    label3 = av.label("P is satisfiable",{top: y+200,left:550}).css({"text-align":
    "center", "font-size": "20px"});
    
    av.step(); 
    mat1.hide(); 
    mat2.hide(); 
    label1.hide(); 
    label2.hide();
    label3.hide();
    label4.hide(); 
    av.umsg("<b>Example of 3 - SAT</b>"); 

    y = 0;
   
    label1 = av.label("<b>P = ($x_1$ + $x_2$ + $x_3$) .($x_1$ + ^$x_3$ + "
    +"^$x_4$) . (^$x_1$ + $x_3$ + $x_4$) . (^$x_2$ + $x_4$ + ^$x_3$) . "+
    "($x_1$ + ^$x_2$ + $x_3$) . ($x_2$ + ^$x_3$ + $x_4$) . (^$x_1$ + ^$x_2$" +
    " + ^$x_4$) . (^$x_1$ + $x_2$ + ^$x_4$)</b>",
    {top: y-30,left:0}).css({"text-align": "center"}); 
  
    av.step();

    label2 = av.label("Truth Table for P",{top:y+20,left:150})
    .css({"text-align": "center"}); label2.show();


    var matdata2=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>",
    "x<sub>4</sub>","P"],
                  ["F","F","F","F","F"],
                  ["F","F","F","T","F"],
                  ["F","F","T","F","F"],
                  ["F","F","T","T","F"],
                  ["F","T","F","F","F"],
                  ["F","T","F","T","F"],
                  ["F","T","T","F","F"],
                  ["F","T","T","T","F"]];

    var matdata3=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>",
    "x<sub>4</sub>","P"],
                  ["T","F","F","F","F"],
                  ["T","F","F","T","F"],
                  ["T","F","T","F","F"],
                  ["T","F","T","T","F"],
                  ["T","T","F","F","F"],
                  ["T","T","F","T","F"],
                  ["T","T","T","F","F"],
                  ["T","T","T","T","F"]];

    var mat3 = new av.ds.matrix(matdata2,{style:"table",left:50,top:y+50}); 
    var mat4= new av.ds.matrix(matdata3,{style:"table",left:250,top:y+50}); 
    for(var i=0;i<5;i++){
        mat3.css(0,i,{"background-color":"Silver"});
        mat4.css(0,i,{"background-color":"Silver"});
    }
    av.step();
    for ( var k=1; k< 9; k++){ 
        for(var l=0; l<5 ; l++){
            mat3.css(k,l,{"background-color":"#CB6D51"});
            mat4.css(k,l,{"background-color":"#CB6D51"}); }
    } 

    av.step();
    label4 = av.label("There exists no assignments that makes the formula true "+
    "(No green rows)",{top:y+120,left:550})
    av.step();
    label3 = av.label("P is not satisfiable",{top:y+200,left:550})
    .css({"text-align": "center", "font-size": "20px"});


    av.step(); 
    av.umsg("<b>Insights</b>"); 
    mat3.hide(); mat4.hide(); 
    label1.hide();label2.hide(); label3.hide();label4.hide();
    av.umsg("<br><br><br>Size of the truth table is 2<sup>n</sup> where n is the "
    +"number "
    +" of boolean variables involved ",{preserve:true});
    av.umsg("<br><br><br>Hence the problem gets exponentially harder as number "
    +"of variables increase. ",{preserve:true}); 


  av.recorded();
}
  function about() {
    var mystring = "Introduction of 3 CNF Satisfiability Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
 
