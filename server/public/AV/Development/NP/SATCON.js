//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA, setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "SATCON";

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

    av.umsg("<br><b>Introduction to Formula Satisfiability </b>");
    var nl1=av.label("This slideshow introduces"+
" and explains the \"Formula Satisfiability\" (SAT) Problem."
+"</b> <br><br><br> We start with some definitions  and background.",{top:0,left:0});


    av.displayInit();

    av.step();
  
  var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
  //slide2
  nl1.hide();
  var y = 0;
  av.umsg("<br><b>Background</b>");
  nl1 = av.label("Boolean variables are variables that can have a value from "+
"{T,F}, where 'T' stands for TRUE <br> and 'F' for FALSE. For example :$x_1$,"
+" $x_2$, $x_3$",{left:0,top:-10});

  av.step();

  var nl2=av.label("Boolean operators are AND (+) , OR (.), NOT ($\\overline{\\ \\ \\ "+
"}$) which follow the truth table",{top:60,left:0});

    var y=65;
    var x = 75;

    label1 = av.label("The NOT Operator",{left:x-50,top:y+50});
    var data1 = [[" $x$ ","$\\overline{x}$ "],
                 [" T "," F "],
                 [" F "," T "]];
    var table1 = new av.ds.matrix(data1,{style:"table",left:x-40,top:y+75,});

    for(var i=0;i<3;i++)
        table1.css(0,i,{"background-color":"Silver"});

    x+=225;

    label2 = av.label("The AND Operator",{left:x-50,top:y+50});
    var data2 = [[" $x$ "," $y$ "," $x.y$ "],
                 [" T "," T "," T "],
                 [" T "," F "," F "],
                 [" F "," T "," F "],
                 [" F "," F "," F "]];
    var table2 = new av.ds.matrix(data2,{style:"table",left:x-50,top:y+75});

    for(var i=0;i<3;i++)
        table2.css(0,i,{"background-color":"Silver"});

    x+=225;

    label3 = av.label("The OR Operator",{left:x-50,top:y+50});
    var data3 = [[" $x$ "," $y$ "," $x$+$y$ "],
                 [" T "," T "," T "],
                 [" T "," F "," T "],
                 [" F "," T "," T "],
                 [" F "," F "," F "]];

    var table3 = new av.ds.matrix(data3,{style:"table",left:x-50,top:y+75});

    for(var i=0;i<3;i++)
        table3.css(0,i,{"background-color":"Silver"});

    av.step();


    var nl3=av.label("A Boolean formula is composed of boolean variables and operators. "+
" For example $x_1 + x_2 . x_3$ ",{top:310,left:0});
//slide 3
    av.step();
    nl1.hide();
    nl2.hide();
    nl3.hide();

    label1.hide(); label2.hide(); label3.hide();
    table1.hide(); table2.hide(); table3.hide();

    av.umsg("<br><b>Background</b>");
    nl1=av.label("A <b>literal</b> is either a boolean variable ($x$) or "
+"its negation ($\\overline{x}$)<br><br>For example : $a$ , "+
"$\\overline{b}$ , $\\overline{g}$ , $c$"+
" , $\\overline{c}$ , $\\overline{e}$ $\\cdots$ ",{top:-10,left:0});

    av.step();

    nl2=av.label("A <b>clause</b> is disjunction (OR) of literals i.e."
+" of the form  $l_1 + l_2 + l_3 +\\cdots +l_n$ for some literal $l_i$"
+"<br><br>For example :&nbsp&nbsp&nbsp&nbsp ($a + \\overline{b}$) , &nbsp&nbsp&nbsp"
+"&nbsp $\\overline{g}$ , &nbsp&nbsp&nbsp&nbsp ($c + \\overline{f} + \\overline{e} + h$)",
{left:0,top:80}); 

    av.step();  

    nl3 = av.label("<br><br><br>A <b>Conjunctive normal form (CNF)</b> is a conjunction "
+"(AND) of clauses.<br><br>For example: &nbsp&nbsp&nbsp&nbsp $\\overline{x_1} . ("+
"x_1 + x_2).(x_3 + x_4 + \\overline{x_5}$)" 
+"<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"+
"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp $(x_1 + x_3) .\\overline{x_3} + x_2 + \\overline{x_5})"+
" . (x_1 + x_2 + \\overline{x_3}) . (x_3 + x_4 + \\overline{x_2}) . (\\overline{x_4} +"+
" \\overline{x_1} + \\overline{x_5}) . (x_1 + x_3 + x_5)$",{left:0,top:120}); 

 //slide 4 
  
    av.step();
    av.umsg("<br><b>Background</b>");
    y=0;
    nl1.hide();
    nl2.hide();
    nl3.hide();
    nl1=av.label("An assignment to the boolean variables in a formula "+
"is known as a <b>truth assignment</b>.",{top:-10,left:0});
    av.step();

    nl2=av.label("A truth assignment of variables is said to be <b> "+
"satisfying</b>, if it causes the formula to evaluate to \"TRUE\"."
,{top:40});
    av.step();

    nl3=av.label("A CNF is said to be <b>satisfiable</b> if it has a "+
"satisfying assignment.",{top:90});
    av.step(); 
    y = 130;
    label1 = av.label("For example $(x_1 + x_2 . x_3)$ is"+
" \"True\" for $x_1$=T , $x_2$=T, $x_3$=T , "+
"hence satisfiable.",{top: y,left:10});
    y = y+ 20;
    label2 = av.label("($x_1 . \\overline{x_1}$) is  always \"False\", hence"+
" not satisfiable.",{top: y,left:70});
 
  // slide 4
    av.step();
    nl1.hide();
    nl2.hide();
    nl3.hide();
    av.umsg("<br><b>The SAT Problem</b>");
    y=0;
    label1.hide();
    label2.hide();
 
    nl1=av.label("Given any boolean formula in CNF, is the formula satisfiable?"
,{top:0}); 

    av.step();
    nl1.hide();
    av.umsg("<br><b>Example of SAT</b>");
    label1.hide();
    label2.hide();

    y = 0;
   
    label1 = av.label("P = ($x_1$ + $x_2$).($x_2$ + $\\overline{x_3}$ + $x_4$).($x_1$ + "+
"$\\overline{x_2}$ + $x_3$ + $x_4$).($\\overline{x_1}$ + $x_3$)"
,{top: y-30,left:0}).css({"text-align": "center"}); 

    label2 = av.label("Truth Table for P",{top: y+20,left:150})
.css({"text-align": "center"}); 

    var matdata=[["$x_1$","$x_2$","$x_3$","$x_4$","P"],
               ["F","F","F","F","F"],
               ["F","F","F","T","F"],
               ["F","F","T","F","F"],
               ["F","F","T","T","F"],
               ["F","T","F","F","F"],
               ["F","T","F","T","T"],
               ["F","T","T","F","T"],
               ["F","T","T","T","T"]];
    var matdata1=[["$x_1$","$x_2$","$x_3$","$x_4$","P"],
                ["T","F","F","F","F"],
                ["T","F","F","T","F"],
                ["T","F","T","F","F"],
                ["T","F","T","T","T"],
                ["T","T","F","F","F"],
                ["T","T","F","T","F"],
                ["T","T","T","F","T"],
                ["T","T","T","T","T"]];

  

    var mat1 = new av.ds.matrix(matdata,{style:"table",left:50,top:y+50});
    var mat2= new av.ds.matrix(matdata1,{style:"table",left:250,top:y+50});

    for(var j=0; j<5 ; j++)
        mat1.css(0,j,{"background-color":"Silver"});
    for(var j=0; j<5 ; j++)
        mat2.css(0,j,{"background-color":"Silver"});

    av.step();
    for (var i=1; i< 9; i++){
       if (matdata[i][4] == "F"){
            for(var j=0; j<5 ; j++)
                mat1.css(i,j,{"background-color":"#CB6D51"});
	}
	else{
	    for(var j=0; j<5 ; j++)
	        mat1.css(i,j,{"background-color":"#93C572"});
	}

	if (matdata1[i][4] == "F"){
	    for(var j=0; j<8 ; j++)
	        mat2.css(i,j,{"background-color":"#CB6D51"});
	}
	else{
	    for(var j=0; j<8 ; j++)
	       mat2.css(i,j,{"background-color":"#93C572"});
	}
	
    }

    av.step();
    label4 = av.label("There exists assignments that makes the formula true "+
    "(The green rows)",{top:y+120,left:550})
    av.step();

    label3 = av.label("P is satisfiable",{top: y+185,left:550})
.css({"text-align": "center", "font-size": "20px"}); 
    label3.show();


//slide 8
    av.step();
    mat1.hide();
    mat2.hide();
    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();

    av.umsg("<br><b>Example of SAT</b>");
    y = 0;

   
    label1 = av.label("P = ($x_1$ + $x_2$).($x_2$ + $\\overline{x_3}$ + $x_4$).($x_3$ + "+
"$\\overline{x_4}$).($x_1$ + $\\overline{x_1}$).($x_1$ + $\\overline{x_2}$ + $x_3$ + $x_4$)",{top: y-30,left:0})
.css({"text-align": "center"}); 

    label2 = av.label("Truth Table for P",{top: y+20,left:150})
.css({"text-align": "center"}); 

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
    for(var j=0; j<5 ; j++)
        mat3.css(0,j,{"background-color":"Silver"});
    for(var j=0; j<5 ; j++)
        mat4.css(0,j,{"background-color":"Silver"});

    av.step();
    for ( var k=1; k< 9; k++){
        for(var l=0; l<5 ; l++){
            mat3.css(k,l,{"background-color":"#CB6D51"});
            mat4.css(k,l,{"background-color":"#CB6D51"});
	}

    }
//slide 9
    av.step();
    label4 = av.label("There does not exist any assignment that makes the formula true "+
    "(No green rows)",{top:y+120,left:550})
    av.step();

    label3 = av.label("P is non satisfiable",{top: y+185,left:550})
.css({"text-align": "center", "font-size": "20px"}); 


    av.step();
    mat3.hide();
    mat4.hide();
    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    av.umsg("<br><b>Insights</b>");
    av.label("Size of the truth table is $2^n$ where $n$ is the "
    +"number of boolean variables involved <br><br>Hence the problem "+
    "gets exponentially harder as number of variables increase "
    ,{top:5}); 

    av.recorded();
});

