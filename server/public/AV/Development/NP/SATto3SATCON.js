//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA, setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "SATto3SATCON";

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
  var label1, label2 , label3, label4, label5, label6, label7, label8, label9,
  label10, label11, label12,nl1,nl2,nl3,n4; 

    av.umsg("<br><b>Reduction of SAT to 3SAT </b>");
     nl1=av.label(" This slideshow presents how to reduce a Formula Satisfiability "+
"problem to an 3 CNF Satisfiability problem in polynomial time",{top:0});
    av.displayInit();
    av.step();

    nl1.hide();
    av.umsg("<br><b>Reduction of SAT to 3-SAT</b>");

    nl1=av.label("There can be only four cases for a clause in a SAT "+
    "formula : $C_1$ &nbsp;&nbsp;. $C_2$ . $\\cdots$ . $C_n$"
    +"<br><br> Let $C_i$ denote a random clause in a SAT formula"
+" where $i$ can range from 1 to n<br><br>&nbsp;1. It contains three literals. &nbsp;&nbsp;"+
"&nbsp; For example : ($x_1 + \\overline{x_2} + x_3$)<br>&nbsp;&nbsp;&nbsp;&nbsp;"+
"No reduction needed for this case.<br><br>&nbsp;2. It contains only one literal. &nbsp;"+
"&nbsp;&nbsp; For example : ($x_1$)<br><br>&nbsp;3. It contains two literals. &nbsp;"+
"&nbsp;&nbsp; For example : ($x_1 + \\overline{x_2}$)<br><br>&nbsp;4. It contains more than "
+"three literals. &nbsp;&nbsp;&nbsp; For example : ($x_1 + \\overline{x_2} + x_3$ "+
"+ $\\cdots$ +$x_k$) where $k > 3$"
,{top:-10}); 


    av.step();
    nl2=av.label("Any of the above type of clause (C) can be replaced by"
    +" a conjunction of clauses (Z) such that <br><br>1. All clauses in "+
    "Z contain  exactly 3 literals. <br><br>2. C is satisfiable if and only if"+
    " Z is satisfiable. that is $C \\iff Z$"
    ,{top:280}); 
  
    av.step();
    
    av.umsg("<br><b>Case 2: Reduction of clauses containing one literal</b>");
    nl1.hide(); 
    nl2.hide(); 
    nl1=av.label("Let $C_i$ &nbsp;&nbsp; = &nbsp; $l_i$ where $l_i$ is a "+
    "literal.",{top:-10});

    av.step();

    nl2=av.label("Introduce 2 new variables $y_{i,1}$ and "+
    "$y_{i,2}$.",{top:20});

    av.step();

    nl3=av.label("Replace $C_i$ by conjunction of clauses "
    +"$Z_i$ where",{top:45});
    
    var nl4= av.label("$Z_i = $",{top:70,left:0});
    label1 = av.label("$(l_i + y_{i,1} + y_{i,2}) \\cdot$ ",{left:30,top:70});
    label2 = av.label("$(l_i + \\overline{y_{i,1}} + y_{i,2}) \\cdot$ ",{left:145,top:70});
    label3 = av.label("$(l_i + y_{i,1} + \\overline{y_{i,2}}) \\cdot$ ",{left:255,top:70});
    label4 = av.label("$(l_i + \\overline{y_{i,1}} + \\overline{y_{i,2}})$",{left:365,top:70});
 
    av.step();

    label1.css({"color":"red"});
    label2.css({"color":"green"});
    label3.css({"color":"blue"});
    label4.css({"color":"Chocolate"});

    label5 = av.label("I",{left:60,top:90}).css({"color":"red"});
    label6 = av.label("II",{left:190,top:90}).css({"color":"green"});;
    label7 = av.label("III",{left:305,top:90}).css({"color":"blue"});
    label8 = av.label("IV",{left:430,top:90}).css({"color":"Chocolate"});

    av.step();
    label9 = av.label("<b>Truth Table :</b>",{left:20,top:110});
    
    var mat1 =[["$l_i$","$y_{i,1}$","$y_{i,2}$",
                "I","II","III","IV","$Z_i$"],
               ["T","T","T","T","T","T","T","T"],
               ["T","T","F","T","T","T","T","T"],
               ["T","F","T","T","T","T","T","T"],
               ["T","F","F","T","T","T","T","T"],
               ["F","T","T","T","T","T","F","F"],
               ["F","T","F","T","T","F","T","F"],
               ["F","F","T","T","F","T","T","F"],
               ["F","F","F","F","T","T","T","F"]
              ]; 
        
    var table1 = new av.ds.matrix(mat1,{style:"table",left:10,top:130,});

    for(var i=0;i<9;i++)
         for(var j=3;j<8;j++)
             table1.css(i,j,{opacity:"0"});

    av.step();

    label1.css({"font-weight":"bold"});
    for(var i=0;i<9;i++)
         table1.css(i,3,{opacity:"1"});

    av.step();

    label1.css({"font-weight":"normal"});
    label2.css({"font-weight":"bold"});
    for(var i=0;i<9;i++)
         table1.css(i,4,{opacity:"1"});

    av.step();

    label2.css({"font-weight":"normal"});
    label3.css({"font-weight":"bold"});
    for(var i=0;i<9;i++)
         table1.css(i,5,{opacity:"1"});

    av.step();

    label3.css({"font-weight":"normal"});
    label4.css({"font-weight":"bold"});
    for(var i=0;i<9;i++)
         table1.css(i,6,{opacity:"1"});

    av.step();

    label4.css({"font-weight":"normal"});
    for(var i=0;i<9;i++)
         table1.css(i,7,{opacity:"1"});


    av.step();

    label10 = av.label("When $C_i$ (i.e. $l_i$)  is $True$,"
    + " $Z_i$ is true. ",{left:350,top:200});

    for(var i=1;i<5;i++){
	 table1.css(i,0,{"background-color":"Aquamarine"});
         table1.css(i,7,{"background-color":"Aquamarine"});
    }


    av.step();

    label11 = av.label("When $C_i$ (i.e. $l_i$)  is $False$,"
    + " $Z_i$ is false. ",{left:350,top:230});

    for(var i=1;i<5;i++){
	 table1.css(i,0,{"background-color":"White"});
         table1.css(i,7,{"background-color":"White"});
    }
    for(var i=5;i<9;i++){
	 table1.css(i,0,{"background-color":"Aquamarine"});
         table1.css(i,7,{"background-color":"Aquamarine"});
    }

    av.step();

    for(var i=5;i<9;i++){
	 table1.css(i,0,{"background-color":"White"});
         table1.css(i,7,{"background-color":"White"});
    }

    label12 = av.label("Hence $C_i$ can be reduced to $Z_i$ "+
    "where each clause in $Z_i$ contains exactly 3 literals and "
    +"$C_i \\iff Z_i$.",{left:350,top:270}).css({"color":"blue"});

    av.step();

    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    label5.hide();
    label6.hide();
    label7.hide();
    label8.hide();
    label9.hide();
    label10.hide();
    label11.hide();
    label12.hide();
    nl1.hide();
    nl2.hide();
    nl3.hide();
    nl4.hide();
    table1.hide();

    av.umsg("<br><b>Case 3: Reduction of clauses containing two literals.</b>");
    nl1=av.label("Let $C_i$ &nbsp;&nbsp; = &nbsp; ( $l_{i,1}$ + $l_{i,2}$ )"
    +" where $l_{i,1}$ and $l_{i,2}$ are literals.",{top:-10});

    av.step();

    nl2=av.label("Introduce a new variable  $y_i$",{top:20});

    av.step();

    nl3=av.label("Replace $C_i$ by conjunction of clauses "
    +"$Z_i$ where",{top:45});

    nl4=av.label("$Z_i =$",{top:70});

    label1 = av.label("$(l_{i,1} + l_{i,2} + y_i) \\cdot$ ",{left:30,top:72});
    label2 = av.label("$(l_{i,1} + l_{i,2} + \\overline{y_i})$  ",{left:135,top:72});

    av.step();

    label1.css({"color":"blue"});
    label2.css({"color":"Chocolate"});

    label3 = av.label("I",{left:70,top:90}).css({"color":"blue"});
    label4 = av.label("II",{left:175,top:90}).css({"color":"chocolate"});;

    av.step();

    label5 = av.label("<b>Truth Table :</b>",{left:20,top:110});

    var mat2=[["$l_{i,1}$","$l_{i,2}$","$y_i$",
               "$C_i$","I","II","$Z_i$"] ,
               ["T","T","T","T","T","T","T"],
               ["T","T","F","T","T","T","T"],
               ["T","F","T","T","T","T","T"],
               ["T","F","F","T","T","T","T"],
               ["F","T","T","T","T","T","T"],
               ["F","T","F","T","T","T","T"],
               ["F","F","T","F","T","F","F"],
               ["F","F","F","F","F","T","F"],
              ];

    var table2 = new av.ds.matrix(mat2,{style:"table",left:10,top:130,});

    for(var i=0;i<9;i++)
         for(var j=3;j<7;j++)
             table2.css(i,j,{opacity:"0"});

    av.step();

    for(var i=0;i<9;i++)
         table2.css(i,3,{opacity:"1"});

    av.step();

    for(var i=0;i<9;i++)
         table2.css(i,4,{opacity:"1"});

    label1.css({"font-weight":"bold"});

    av.step();

    label1.css({"font-weight":"normal"});
    label2.css({"font-weight":"bold"});

    for(var i=0;i<9;i++)
         table2.css(i,5,{opacity:"1"});

    av.step();

    label2.css({"font-weight":"normal"});

    for(var i=0;i<9;i++)
         table2.css(i,6,{opacity:"1"});

    av.step();

    label6 = av.label("When $C_i$ is true,"
    + " $Z_i$ is true. ",{left:350,top:200});

    for(var i=1;i<7;i++){
	 table2.css(i,3,{"background-color":"Aquamarine"});
         table2.css(i,6,{"background-color":"Aquamarine"});
    }


    av.step();

    label7 = av.label("When $C_i$ is false,"
    + " $Z_i$ is false. ",{left:350,top:230});

    for(var i=1;i<7;i++){
	 table2.css(i,3,{"background-color":"White"});
         table2.css(i,6,{"background-color":"White"});
    }
    for(var i=7;i<9;i++){
	 table2.css(i,3,{"background-color":"Aquamarine"});
         table2.css(i,6,{"background-color":"Aquamarine"});
    }

    av.step();

    for(var i=7;i<9;i++){
	 table2.css(i,3,{"background-color":"White"});
         table2.css(i,6,{"background-color":"White"});
    }

    label8 = av.label("Hence $C_i$ can be reduced to $Z_i$ "+
    "where each clause in $Z_i$ contains exactly 3 literals and "
    +"$C_i \\iff Z_i$.",{left:350,top:270}).css({"color":"blue"});

    av.step();


    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    label5.hide();
    label6.hide();
    label7.hide();
    label8.hide();

    nl1.hide();
    nl2.hide();
    nl3.hide();
    nl4.hide();
    table2.hide();
    
    av.umsg("<br><b>Case 4: Reduction of clauses containing more than three "+
    "literals.</b>");
    nl1=av.label("Let $C_i$ &nbsp;&nbsp; = &nbsp; $( l_{i,1} + l_{i,2} + "
    +"l_{i,3} + \\cdots + l_{i,k} )$ where $k>3$.",{top:-10});

    av.step();

    nl2=av.label("Introduce $(k-3)$ new variables : $y_1 , y_2, \\cdots "
    +",y_{k-3}$ ",{top:20});

    av.step();

    nl3=av.label("Replace $C_i$ with a sequence of clauses " +
    "$Z_i$ where<br><br> $Z_i = (l_{i,1} + l_{i,2} "+
    "+ y_1) \\cdot (\\overline{y_1} + l_{i,3} + y_2)"+
    " \\cdots (\\overline{y_{j-2}} + l_{i,j} + y_{j-1}) \\cdots"+
    " (\\overline{y_{k-4}} + l_{i,k-2} + y_{k-3}) \\cdot("+
    "\\overline{y_{k-3}} + l_{i,k-1} + l_{i,k})$"
    ,{top:60});

    av.step();

    nl4=av.label("<b> To prove:</b><br><br>a. When $C_i$ is satisfiable,"+
    "$ Z_i$ is satisfiable <br><br>b. When $C_i$ is not satisfiable, $Z_i$ "
    +"is not satisfiable",{top:180});

    av.step();
   
    nl1.hide();
    nl2.hide();
    nl3.hide();
    nl4.hide();

    av.umsg("<br><b> Case 4a. When C<sub>i</sub> is satisfiable.</b>");

    nl1=av.label("$C_i$ &nbsp;&nbsp; = &nbsp; $( l_{i,1} + l_{i,2} + "+
    "l_{i,3} + \\cdots + l_{i,k} )$ where $k>3$.",{top:-20});

    nl2=av.label("$Z_i =$ ",{top:4});

    var zlabels = [];
    zlabels.push(av.label(" $($ ",{left: 35,top:4}));
    zlabels.push(av.label("$l_{i,1} + l_{i,2}$",{left:40,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 95,top:4}));
    zlabels.push(av.label("$y_1$",{left: 110,top:4}));
    zlabels.push(av.label(" $)\\cdot($ ",{left: 120,top:4}));
    zlabels.push(av.label("$\\overline{y_1}$",{left: 137,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 152,top:4}));
    zlabels.push(av.label("$l_{i,3}$",{left: 167,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 185,top:4}));
    zlabels.push(av.label("$y_2$",{left: 200,top:4}));
    zlabels.push(av.label(" $) \\cdots ($ ",{left: 215,top:4}));
    zlabels.push(av.label("$\\overline{y_{j-3}}$",{left: 245,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 277,top:4}));
    zlabels.push(av.label("$l_{i,j-1}$",{left: 290,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 320,top:4}));
    zlabels.push(av.label("$y_{j-2}$",{left: 335,top:4}));
    zlabels.push(av.label(" $)\\cdot($ ",{left: 360,top:4}));
    zlabels.push(av.label("$\\overline{y_{j-2}}$",{left: 380,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 408,top:4}));
    zlabels.push(av.label("$l_{i,j}$",{left: 423,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 440,top:4}));
    zlabels.push(av.label("$y_{j-1}$",{left: 460,top:4}));
    zlabels.push(av.label(" $)\\cdot($ ",{left: 485,top:4}));
    zlabels.push(av.label("$\\overline{y_{j-1}}$",{left: 500,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 530,top:4}));
    zlabels.push(av.label("$l_{i,j+1}$",{left: 545,top:4}));
    zlabels.push(av.label(" $+$ ",{left: 575,top:4}));
    zlabels.push(av.label("$y_{j}$",{left: 590,top:4}));
    zlabels.push(av.label("$)\\cdots($",{left: 605,top:4}));
    zlabels.push(av.label("$\\overline{y_{k-4}}$",{left:635,top:4}));
    zlabels.push(av.label(" $+$ ",{left:665,top:4}));
    zlabels.push(av.label("$l_{i,k-2}$",{left:680,top:4}));
    zlabels.push(av.label(" $+$ ",{left:715,top:4}));
    zlabels.push(av.label("$y_{k-3}$",{left:730,top:4}));
    zlabels.push(av.label(" $)$ ",{left:758,top:4}));
    zlabels.push(av.label(" $($ ",{left:30,top:25}));
    zlabels.push(av.label("$\\overline{y_{k-3}}$",{left:37,top:25}));
    zlabels.push(av.label(" $+$ ",{left:72,top:25}));
    zlabels.push(av.label("$l_{i,k-1} + l_k$",{left:81,top:25}));
    zlabels.push(av.label(" $)$ ",{left:145,top:25}));

    nl3=av.label("When $C_i$ is satisfiable atleast one literal in ${ "+
    "l_{i,1} ... l_{i,k} }$ is $True$.",{top:60});

    av.step();

    label1=av.label("<b>If any of $l_{i,1}$ or $l_{i,2}$ is $True$</b>, "
    +"set all the additional variables $y_1 ,"+
    "y_2 \\cdots y_{k-3}$ to $False$.",{left:0,top:100});

    zlabels[1].css({color:"green"});

    av.step();


    av.step();

    label3=av.label("The first term of all the clauses in $Z_i$ "+
    "other than the first has a literal $\\overline{y_n}$ which evaluates to $True$"
    ,{left:0,top:130});

    zlabels[5].css({color:"green"});
    zlabels[3].css({color:"red"});
    zlabels[11].css({color:"green"});
    zlabels[9].css({color:"red"});
    zlabels[17].css({color:"green"});
    zlabels[15].css({color:"red"});
    zlabels[23].css({color:"green"});
    zlabels[21].css({color:"red"});
    zlabels[29].css({color:"green"});
    zlabels[27].css({color:"red"});
    zlabels[36].css({color:"green"});
    zlabels[33].css({color:"red"});

    label4=av.label("<b>$Z_i$ has a satisfying assignment</b>"
    ,{left:0,top:160});

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
    }

    label1.hide();
    label3.hide();
    label4.hide();

    label1=av.label("<b>If any of $l_{i,k-1}$ or $l_{i,k}$ is $True$</b>, "
    +"set all the additional variables $y_1 ,"+
    "y_2 \\cdots y_{k-3}$ to $True$.",{left:0,top:100});

    zlabels[38].css({color:"green"});

    av.step();

    label3=av.label("The third term of all the clauses in $Z_i$ "+
    "other than the last has a literal $y_n$ which evaluates to $True$"
    ,{left:0,top:130});

    zlabels[3].css({color:"green"});
    zlabels[5].css({color:"red"});
    zlabels[9].css({color:"green"});
    zlabels[11].css({color:"red"});
    zlabels[15].css({color:"green"});
    zlabels[17].css({color:"red"});
    zlabels[21].css({color:"green"});
    zlabels[23].css({color:"red"});
    zlabels[27].css({color:"green"});
    zlabels[29].css({color:"red"});
    zlabels[33].css({color:"green"});
    zlabels[36].css({color:"red"});

    label4.show();

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
    }

    label1.hide();
    label3.hide();
    label4.hide();

    label1=av.label("<b>If $l_{i,j}$ $(where \\ j \\notin \\{1,2,k-1,k\\})$ is $True$</b>, "
    +"set $y_1 \\cdots y_{j-2}$ to $True$ and $y_{j-1} \\cdots y_{k-3}$ to $False$."
    ,{left:0,top:100});

    zlabels[19].css({color:"green"});

    av.step ();

    label3=av.label("Let us call the clause in $Z_i$ containing "+
    "$l_{i,j}$ in as $C$'",{left:0,top:130});

    label6 = av.label("--------------------",{left:340,top:20});
    label7 = av.label("$C'$",{left:380,top:35});

    av.step();

    label4=av.label("The third term of all the clauses in $Z_i$ "+
    "left to $C'$ has a literal $y_n$ ($where \\ n \\in \\{1..j-2\\}$) "
    +"which evaluates to $True$",{left:0,top:160});

    zlabels[3].css({color:"green"});
    zlabels[5].css({color:"red"});
    zlabels[9].css({color:"green"});
    zlabels[11].css({color:"red"});
    zlabels[15].css({color:"green"});
    zlabels[17].css({color:"red"});

    av.step();

    label5=av.label("The first term of all the clauses in $Z_i$ "+
    "right to $C'$ has a literal $\\overline{y_n}$ ($where \\ n \\in \\{j-1..k-3\\}$) "
    +" which evaluates to $True$",{left:0,top:210});

    zlabels[23].css({color:"green"});
    zlabels[21].css({color:"red"});
    zlabels[29].css({color:"green"});
    zlabels[27].css({color:"red"});
    zlabels[36].css({color:"green"});
    zlabels[33].css({color:"red"});

    av.step();

    label8=av.label("<b>$Z_i$ has a satisfying assignment</b>"
    ,{left:0,top:270});

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
        zlabels[i].hide();
    }

    label1.hide();
    label3.hide();
    label4.hide();
    label5.hide();
    label6.hide();
    label7.hide();
    label8.hide();
    nl2.hide();
    nl3.hide();

    av.umsg("<br><b> Case 4a. When C<sub>i</sub> is satisfiable.</b>");
    nl3=av.label("Hence when $C_i$ is satisfiable, "+
    "$Z_i$ is satisfiable.",{top:40});

    av.step();
    nl3.hide();
    nl2.show();
    av.umsg("<br><b> Case 4b. When C<sub>i</sub> is not satisfiable.</b>");

   
    for(var i in zlabels){
        zlabels[i].show();
    }

    av.step();

    nl3=av.label("When $C_i$ is not satisfiable NO literal in { "+
    "$l_i,1 \\cdots l_i,k$ } is $True$.",{top:70});
 
    zlabels[1].css({color:"Red"});
    zlabels[7].css({color:"Red"});
    zlabels[13].css({color:"Red"});
    zlabels[19].css({color:"Red"});
    zlabels[25].css({color:"Red"});
    zlabels[31].css({color:"Red"});
    zlabels[38].css({color:"Red"});

    av.step();

    nl4=av.label("For $Z_i$ to be satisfiable, all its clauses "
    +"must evaluate to $True$ ",{top:110});

    av.step();

    var nl5=av.label("For the first clause to be $True$, $y_1 = True$"
    ,{top:150});
    
    zlabels[3].css({color:"Green"});
    zlabels[5].css({color:"Red"});
    
    av.step();

    var nl6=av.label("Now for the second clause to be $True$, $y_2 = True$"
    ,{top:190});
    
    zlabels[9].css({color:"Green"});

    av.step();
    
    var nl7=av.label("Similarly for the third clause to be $True$, $y_3 = True$"
    ,{top:230});
   
    av.step();
    
    var nl8=av.label("$y_3 = True \\Rightarrow y_4 = True \\cdots \\Rightarrow y_{j-2}"
    +" = True \\Rightarrow y_{j-1} = True \\Rightarrow y_j = True \\cdots \\Rightarrow y_{k-4} "
    +"= True \\Rightarrow y_{k-3} = True$",{top:270});
   
    zlabels[11].css({color:"Red"});
    zlabels[15].css({color:"Green"});
    zlabels[17].css({color:"Red"});
    zlabels[21].css({color:"Green"});
    zlabels[23].css({color:"Red"});
    zlabels[27].css({color:"Green"});
    zlabels[29].css({color:"Red"});
    zlabels[33].css({color:"Green"});
    zlabels[36].css({color:"Red"});

    av.step();

    var nl9=av.label("The last clause evaluates to $False$. <b> Hence $Z_i$"
    +" is NOT SATISFIABLE</b>",{top:310});
   
    av.step();
    for(var i in zlabels){
        zlabels[i].hide();
    }
    nl1.hide();
    nl2.hide();
    nl3.hide();
    nl4.hide();
    nl5.hide();
    nl6.hide();
    nl7.hide();
    nl8.hide();
    nl9.hide();
 
    av.umsg("<br><b>Case 4: Reduction of clauses containing more than three "+
    "literals.</b>");

    nl1=av.label("<b>Hence we proved:</b>"
+"<br><br>a. When $C_i$ is satisfiable, $Z_i$ is "
+"satisfiable<br><br>b. When $C_i$ is not satisfiable, $Z_i$ "
+"is not satisfiable",{top:20});

    av.step();

    nl1.hide();	
    av.umsg("<br><b>Reduction of SAT to 3-SAT");
    nl1=av.label("Hence any clause in a SAT expression can be replaced by a"
    +" conjunction of clauses which contains 3 literals each."
    +"<br><br><br><b>So, a SAT problem can be reduced to an instance of 3-SAT"
    +" in polynomial time.</b>",{top:20});

    av.recorded(); 

});


