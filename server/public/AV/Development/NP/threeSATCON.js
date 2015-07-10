//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA, setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "threeSATCON";

    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]);
    });
    $(".avcontainer").on("jsav-updatecounter" ,  function(){
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);

    av.umsg("<br><b>Introduction to 3-CNF Satisfiability</b> ");
    var nl1=av.label("This slideshow introduces"+
" and explains the \"3-CNF Satisfiability\" (3-SAT) Problem."
+"</b> <br><br><br> We start with some definitions  and background.",{top:0});


    av.displayInit();

    av.step();
    nl1.hide();
 
    var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
    var y = 0;
    av.umsg("<br><b>Background</b>"); 
    nl1=av.label("A <b>3-CNF</b> is a Boolean formula that is an AND of "+
"clauses, each of which is an OR of <br>exactly 3 distinct literals."
,{top:-10}); 
    av.step();

    var nl2=av.label("Example of 3-CNF: $(x_1 + x_2 + x_3).(\\overline{x_1} + x_4 + x_6)." + 
"(x_2 + \\overline{x_5}+ \\overline{x_3}).(x_1 + \\overline{x_3} + \\overline{x_6})$."
,{top:50});
    av.step();

    var nl3=av.label("An assignment to the boolean variables in a formula "+
"is known as a <b>truth assignment</b>.",{top:100});
    av.step();
 
    var nl4=av.label("A truth assignment of variables is said to be <b> "+
"satisfying</b>, if it causes the formula to evaluate to \"TRUE\".",{top:150});
    av.step();
 
    var nl5=av.label("A 3-CNF is said to be <b>satisfiable</b> if it has a "+
"satisfying assignment.",{top:200});
    av.step();
 
   nl1.hide();
   nl2.hide();
   nl3.hide();
   nl4.hide();
   nl5.hide();
   av.umsg("<br><b>The 3-SAT problem</b>");  
   nl1= av.label("Given any boolean formula in CNF such that each "+
    "clause has exactly 3 literals , is the formula satisfiable?",
    {top:0});

    av.step();
    nl1.hide(); 
    av.umsg("<br><b>Example of 3-SAT</b>");

    y = 0;

   
    label1 = av.label("<b>P = ($x_1$ + $x_2$ + $x_3$).($x_4$ + $\\overline{"+
"x_2}$ + $\\overline{x_1}$) . ($x_3$ + $\\overline{x_2}$ + $x_1$) . ("+
"$\\overline{x_3}$ + $x_4$ + $x_1$) . ($\\overline{x_4}$ + $\\overline{x_2}$"
+" + $\\overline{x_1}$) .($x_1$ + $x_4$ + $x_3$) . ($x_3$ + $x_2$ + $x_4$)</b>",
    {top: y-30,left:0}).css({"text-align": "center"}); 

    av.step();

    label2 = av.label("Truth Table for P",{top:y+20,left:150})
    .css({"text-align": "center"});


    var matdata=[["$x_1$","$x_2$","$x_3$",
    "$x_4$","P"],
               ["F","F","F","F","F"],
               ["F","F","F","T","F"],
               ["F","F","T","F","F"],
               ["F","F","T","T","T"],
               ["F","T","F","F","F"],
               ["F","T","F","T","F"],
               ["F","T","T","F","F"],
               ["F","T","T","T","T"]];
    var matdata1=[["$x_1$","$x_2$","$x_3$",
    "$x_4$","P"],
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
    av.umsg("<br><b>Example of 3 - SAT</b>"); 

    y = 0;
   
    label1 = av.label("<b>P = ($x_1$ + $x_2$ + $x_3$) .($x_1$ + $\\overline{x_3}$ + "
    +"$\\overline{x_4}$) . ($\\overline{x_1}$ + $x_3$ + $x_4$) . ($\\overline{x_2}$"
+" + $x_4$ + $\\overline{x_3}$). ($x_1$ + $\\overline{x_2}$ + $x_3$) . ($x_2$ + "+
"$\\overline{x_3}$ + $x_4$) . ($\\overline{x_1}$ + $\\overline{x_2}$ + $\\overline{x_4}$)"
+" . ($\\overline{x_1}$ + $x_2$ + $\\overline{x_4}$)</b>",
    {top: y-30,left:0}).css({"text-align": "center"}); 
  
    av.step();

    label2 = av.label("Truth Table for P",{top:y+20,left:150})
    .css({"text-align": "center"}); label2.show();


    var matdata2=[["$x_1$","$x_2$","$x_3$","$x_4$","P"],
                  ["F","F","F","F","F"],
                  ["F","F","F","T","F"],
                  ["F","F","T","F","F"],
                  ["F","F","T","T","F"],
                  ["F","T","F","F","F"],
                  ["F","T","F","T","F"],
                  ["F","T","T","F","F"],
                  ["F","T","T","T","F"]];

    var matdata3=[["$x_1$","$x_2$","$x_3$","$x_4$","P"],
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
    av.umsg("<br><b>Insights</b>"); 
    mat3.hide(); mat4.hide(); 
    label1.hide();label2.hide(); label3.hide();label4.hide();
    av.label("Size of the truth table is $2^n$ where $n$ is the "
    +"number of boolean variables involved "
    +"<br><br>Hence the problem gets exponentially harder as number "
    +"of variables increase. ",{top:5}); 


  av.recorded();
});
 
