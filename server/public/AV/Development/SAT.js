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
" and explains the \"Formula Satisfiability\" (SAT) Problem."
+"</b> <br><br><br> We start with some definitions  and background.");


    av.displayInit();

    av.step();
  
  var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
  //slide2
  var y = 0;
  av.umsg("<br><br><b>Background</b>");
  av.umsg("<br><br><br>Boolean variables are variables that can have a value from "+
"{T,F}, where \"T\" stands for \"True\" and \"F\" for \"False\".",{preserve:true});
  av.umsg("<br> For example :x<sub>1</sub>, x<sub>2</sub>, x<sub>3</sub>",{preserve:true});

  av.step();

  av.umsg("<br><br><br>Boolean operators are AND (+) , OR (.), NOT (^) which follow the"
+" truth table",{preserve:true});

    var y=75;
    var x = 75;

    label1 = av.label("The NOT Operator",{left:x-50,top:y+50});
    var data1 = [[" x ","^x "],
                 [" T "," F "],
                 [" F "," T "]];
    var table1 = new av.ds.matrix(data1,{style:"table",left:x-40,top:y+75,});

    for(var i=0;i<3;i++)
        table1.css(0,i,{"background-color":"Silver"});

    x+=225;

    label2 = av.label("The AND Operator",{left:x-50,top:y+50});
    var data2 = [[" x ","y "," x.y "],
                 [" T "," T "," T "],
                 [" T "," F "," F "],
                 [" F "," T "," F "],
                 [" F "," F "," F "]];
    var table2 = new av.ds.matrix(data2,{style:"table",left:x-50,top:y+75});

    for(var i=0;i<3;i++)
        table2.css(0,i,{"background-color":"Silver"});

    x+=225;

    label3 = av.label("The OR Operator",{left:x-50,top:y+50});
    var data3 = [[" x "," y"," x+y "],
                 [" T "," T "," T "],
                 [" T "," F "," T "],
                 [" F "," T "," T "],
                 [" F "," F "," F "]];

    var table3 = new av.ds.matrix(data3,{style:"table",left:x-50,top:y+75});

    for(var i=0;i<3;i++)
        table3.css(0,i,{"background-color":"Silver"});

    av.step();


    av.umsg("<br><br><br><br><br><br><br><br><br><br><br><br><br><br>"+
"<br> A Boolean formula is composed of boolean variables and operators. "+
"<br>For example x<sub>1</sub> + x<sub>2</sub>.x<sub>3</sub> ",{preserve:true});
//slide 3
    av.step();

    label1.hide(); label2.hide(); label3.hide();
    table1.hide(); table2.hide(); table3.hide();

    av.umsg("<br><br><b>Background</b>");
    av.umsg("<br><br><br>A <b>literal</b> is either a boolean variable (x) or "
+"its negation (^x)",{preserve:true}); 

    av.umsg("<br><br>For example : a , ^b , ^g , c , ^c , ^e ... ",{preserve:true});

    av.step();

    av.umsg("<br><br><br>A <b>clause</b> is disjunction (OR) of literals i.e."
+" of the form  l<sub>1</sub> + l<sub>2</sub> + l<sub>3</sub> + ... +"+
+"l<sub>n</sub> for some literal l<sub>i</sub>",{preserve:true}); 

    av.umsg("<br><br>For example :&nbsp&nbsp&nbsp&nbsp (a + ^b) , &nbsp&nbsp&nbsp"
+"&nbsp ^g , &nbsp&nbsp&nbsp&nbsp (c + ^f + ^e + h), &nbsp&nbsp&nbsp&nbsp "
+"... ",{preserve:true});

    av.step();  

    av.umsg("<br><br><br>A <b>Conjunctive normal form (CNF)</b> is a conjunction "
+"(AND) of clauses.",{preserve:true}); 

    av.umsg("<br><br>For example: &nbsp&nbsp&nbsp&nbsp^x<sub>1</sub> . ("+
"x<sub>1</sub> + x<sub>2</sub>) . (x<sub>3</sub> + x<sub>4</sub> + "+
"^x<sub>5</sub>)",{preserve:true}); 

  av.umsg("<br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp"+
"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp(x<sub>1</sub> + x<sub>3</sub>) . "+
"(^x<sub>3</sub> + x<sub>2</sub> + ^x<sub>5</sub>) . (x<sub>1</sub> + "+
"x<sub>2</sub> + ^x<sub>3</sub>) . (x<sub>3</sub> + x<sub>4</sub> + "+
"^x<sub>2</sub>) . (^x<sub>4</sub> + ^x<sub>1</sub> + ^x<sub>5</sub>) . "+
"(x<sub>1</sub> + x<sub>3</sub> + x<sub>5</sub>)",{preserve:true}); 

 //slide 4 
  
    av.step();
    av.umsg("<b>Background</b>");
    y=0;
    av.umsg("<br><br><br> An assignment to the boolean variables in a formula "+
"is known as a <b>truth assignment</b>.",{preserve:true});
    av.step();

    av.umsg("<br><br><br> A truth assignment of variables is said to be <b> "+
"satisfying</b>, if it causes the formula to evaluate to \"True\".",{preserve:true});
    av.step();

    av.umsg("<br><br><br> A CNF is said to be <b>satisfiable</b> if it has a "+
"satisfying assignment.",{preserve:true});
    av.step(); 
    y = 130;
    label1 = av.label("For example (x<sub>1</sub> + x<sub>2</sub> . x<sub>3</sub>) is"+
" \"True\" for x<sub>1</sub>=T , x<sub>2</sub>=T, x<sub>3</sub>=T , "+
"hence satisfiable.",{top: y,left:10});
    y = y+ 20;
    label2 = av.label("(x<sub>1</sub> . ^x<sub>1</sub>) is  always \"False\", hence"+
" not satisfiable.",{top: y,left:70});
 
  // slide 4
    av.step();
    av.umsg("<b>The SAT Problem</b>");
    y=0;
    label1.hide();
    label2.hide();
 
    av.umsg("<br><br><br>Given any boolean formula in CNF, is the formula satisfiable?"
,{preserve:true}); 

    av.step();

    av.umsg("<b>Example of SAT</b>");
    label1.hide();
    label2.hide();

    y = 0;
   
    label1 = av.label("P = ($x_1$ + $x_2$).($x_2$ + ^$x_3$ + $x_4$).($x_1$ + "+
"^$x_2$ + $x_3$ + $x_4$).(^$x_1$ + $x_3$)"
,{top: y-30,left:0}).css({"text-align": "center"}); 

    label2 = av.label("Truth Table for P",{top: y+20,left:150})
.css({"text-align": "center"}); 

    var matdata=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>","x<sub>4</sub>","P"],
               ["F","F","F","F","F"],
               ["F","F","F","T","F"],
               ["F","F","T","F","F"],
               ["F","F","T","T","F"],
               ["F","T","F","F","F"],
               ["F","T","F","T","T"],
               ["F","T","T","F","T"],
               ["F","T","T","T","T"]];
    var matdata1=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>","x<sub>4</sub>","P"],
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

    label3 = av.label("P is satisfiable",{top: y+175,left:550})
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

    av.umsg("<b>Example of SAT</b>");
    y = 0;

   
    label1 = av.label("P = ($x_1$ + $x_2$).($x_2$ + ^$x_3$ + $x_4$).($x_3$ + "+
"^$x_4$).($x_1$ + ^$x_1$).($x_1$ + ^$x_2$ + $x_3$ + $x_4$)",{top: y-30,left:0})
.css({"text-align": "center"}); 

    label2 = av.label("Truth Table for P",{top: y+20,left:150})
.css({"text-align": "center"}); 

     var matdata2=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>","x<sub>4</sub>","P"],
                 ["F","F","F","F","F"],
                 ["F","F","F","T","F"],
                 ["F","F","T","F","F"],
                 ["F","F","T","T","F"],
                 ["F","T","F","F","F"],
                 ["F","T","F","T","F"],
                 ["F","T","T","F","F"],
                 ["F","T","T","T","F"]];
     var matdata3=[["x<sub>1</sub>","x<sub>2</sub>","x<sub>3</sub>","x<sub>4</sub>","P"],
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

    label3 = av.label("P is non satisfiable",{top: y+175,left:550})
.css({"text-align": "center", "font-size": "20px"}); 


    av.step();
    mat3.hide();
    mat4.hide();
    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    av.umsg("<b>Insights</b>");
    av.umsg("<br><br><br><br>Size of the truth table is 2<sup>n</sup> where n is the "
    +"number of boolean variables involved ",{preserve:true}); 
    av.umsg("<br><br>Hence the problem gets exponentially harder as number of variables"
    +" increase ",{preserve:true}); 

    av.recorded();
}
  function about() {
    var mystring = "Introduction of Formula Satisfiability Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));

