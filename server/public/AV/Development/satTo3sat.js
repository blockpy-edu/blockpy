/*global ODSA, setPointerL */
//"use strict";
(function ($) {

  var av;

  function runit(){
    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });
    $(".avcontainer").on("jsav-updatecounter" ,  function(){
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });

    av = new JSAV($('.avcontainer')); 

    av.umsg("<b>Objective </b><br><br><br> This slideshow presents how to reduce"+
" a Formula Satisfiability problem to an 3 CNF Satisfiability problem in polynomial time");
    av.displayInit();
    av.step();


    av.umsg("<br><b>Reduction of SAT to 3-SAT</b>");

    av.umsg("<br><br><br>There can be only four cases for a clause in a SAT "+
    "formula : $C_1$ &nbsp;&nbsp;. $C_2$ . $\\cdots$ . $C_n$"
    ,{preserve:true});

    av.umsg("<br><br> Let $C_i$ denote a random clause in a SAT formula"
    +" where $i$ can range from 1 to n",{preserve:true});

    av.umsg("<br><br>&nbsp;1. It contains three literals. &nbsp;&nbsp;"+
    "&nbsp; For example : ($x_1$ + ^$x_2$ + $x_3$)",{preserve:true}); 
  
    av.umsg("<br>&nbsp;&nbsp;&nbsp;&nbsp;No reduction needed for this case.",{preserve:true}); 

    av.umsg("<br><br>&nbsp;2. It contains only one literal. &nbsp;"+
    "&nbsp;&nbsp; For example : ($x_1$)",{preserve:true}); 
  
    av.umsg("<br><br>&nbsp;3. It contains two literals. &nbsp;"+
    "&nbsp;&nbsp; For example : ($x_1$ + ^$x_2$)",{preserve:true}); 
  
    av.umsg("<br><br>&nbsp;4. It contains more than three literals. &nbsp;&nbsp;"+
    "&nbsp; For example : ($x_1$ + ^$x_2$ + $x_3$ + $\\cdots$ +$x_k$) where k > 3"
    ,{preserve:true}); 


    av.step();

    av.umsg("<br><br><br>Any of the above type of clause (C) can be replaced by"
    +" a conjunction of clauses (Z) such that <br><br>1. All clauses in "+
    "Z contain  exactly 3 literals. <br><br>2. C is satisfiable if and only if"+
    " Z is satisfiable. that is $C \\iff Z$"
    ,{preserve:true}); 
  
    av.step();
    
    av.umsg("<b>Case 2: Reduction of clauses containing one literal</b>");
    
    av.umsg("<br><br>Let $C_i$ &nbsp;&nbsp; = &nbsp; $l_i$ where $l_i$ is a "+
    "literal.",{preserve:true});

    av.step();

    av.umsg("<br><br>Introduce 2 new variables y<sub>i,1</sub> and "+
    "y<sub>i,2</sub>.",{preserve:true});

    av.step();

    av.umsg("<br><br>Replace C<sub>i</sub> by conjunction of clauses "
    +"Z<sub>i</sub> where",{preserve:true});

    av.umsg("<br><br>Z<sub>i</sub> = ",{preserve:true});

    label1 = av.label("($l_i$ + $y_{i,1}$ + $y_{i,2}$) . ",{left:30,top:70});
    label2 = av.label("($l_i$ + ^$y_{i,1}$ + $y_{i,2}$) . ",{left:145,top:70});
    label3 = av.label("($l_i$ + $y_{i,1}$ + ^$y_{i,2}$) . ",{left:265,top:70});
    label4 = av.label("($l_i$ + ^$y_{i,1}$ + ^$y_{i,2}$)",{left:385,top:70});
 
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
    label9 = av.label("<b>Truth Table :</b>",{left:20,top:120});
    
    var mat1 =[["l<sub>i</sub>","y<sub>i,1</sub>","y<sub>i,2</sub>",
                "I","II","III","IV","Z<sub>i</sub>"],
               ["1","1","1","1","1","1","1","1"],
               ["1","1","0","1","1","1","1","1"],
               ["1","0","1","1","1","1","1","1"],
               ["1","0","0","1","1","1","1","1"],
               ["0","1","1","1","1","1","0","0"],
               ["0","1","0","1","1","0","1","0"],
               ["0","0","1","1","0","1","1","0"],
               ["0","0","0","0","1","1","1","0"]
              ]; 
        
    var table1 = new av.ds.matrix(mat1,{style:"table",left:10,top:150,});

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

    label10 = av.label("When C<sub>i</sub> (i.e. l<sub>i</sub>)  is true,"
    + " Z<sub>i</sub> is true. ",{left:350,top:200});

    for(var i=1;i<5;i++){
	 table1.css(i,0,{"background-color":"Aquamarine"});
         table1.css(i,7,{"background-color":"Aquamarine"});
    }


    av.step();

    label11 = av.label("When C<sub>i</sub> (i.e. l<sub>i</sub>)  is false,"
    + " Z<sub>i</sub> is false. ",{left:350,top:230});

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

    label12 = av.label("Hence C<sub>i</sub> can be reduced to Z<sub>i</sub> "+
    "where each clause in Z<sub>i</sub> contains exactly 3 literals and "
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

    table1.hide();

    av.umsg("<b>Case 3: Reduction of clauses containing two literals.</b>");
    av.umsg("<br><br>Let $C_i$ &nbsp;&nbsp; = &nbsp; ( $l_{i,1}$ + $l_{i,2}$ )"
    +" where $l_{i,1}$ and $l_{i,2}$ are literals.",{preserve:true});

    av.step();

    av.umsg("<br><br> Introduce a new variable  y<sub>i</sub>",{preserve:true});

    av.step();

    av.umsg("<br><br>Replace C<sub>i</sub> by conjunction of clauses "
    +"Z<sub>i</sub> where",{preserve:true});

    av.umsg("<br><br>Z<sub>i</sub> = ",{preserve:true});

    label1 = av.label("($l_{i,1}$ + $l_{i,2}$ + $y_i$) . ",{left:30,top:72});
    label2 = av.label("($l_{i,1}$ + $l_{i,2}$ + ^$y_i$)  ",{left:135,top:72});

    av.step();

    label1.css({"color":"blue"});
    label2.css({"color":"Chocolate"});

    label3 = av.label("I",{left:70,top:90}).css({"color":"blue"});
    label4 = av.label("II",{left:175,top:90}).css({"color":"chocolate"});;

    av.step();

    label5 = av.label("<b>Truth Table :</b>",{left:20,top:120});

    var mat2=[["l<sub>i,1</sub>","l<sub>i,2</sub>","y<sub>i</sub>",
               "C<sub>i</sub>","I","II","Z<sub>i</sub>"] ,
               ["1","1","1","1","1","1","1"],
               ["1","1","0","1","1","1","1"],
               ["1","0","1","1","1","1","1"],
               ["1","0","0","1","1","1","1"],
               ["0","1","1","1","1","1","1"],
               ["0","1","0","1","1","1","1"],
               ["0","0","1","0","1","0","0"],
               ["0","0","0","0","0","1","0"],
              ];

    var table2 = new av.ds.matrix(mat2,{style:"table",left:10,top:150,});

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

    label6 = av.label("When C<sub>i</sub> is true,"
    + " Z<sub>i</sub> is true. ",{left:350,top:200});

    for(var i=1;i<7;i++){
	 table2.css(i,3,{"background-color":"Aquamarine"});
         table2.css(i,6,{"background-color":"Aquamarine"});
    }


    av.step();

    label7 = av.label("When C<sub>i</sub> is false,"
    + " Z<sub>i</sub> is false. ",{left:350,top:230});

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

    label8 = av.label("Hence C<sub>i</sub> can be reduced to Z<sub>i</sub> "+
    "where each clause in Z<sub>i</sub> contains exactly 3 literals and "
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

    table2.hide();
    
    av.umsg("<b>Case 4: Reduction of clauses containing more than three "+
    "literals.</b>");
    av.umsg("<br><br>Let $C_i$ &nbsp;&nbsp; = &nbsp; ( $l_{i,1}$ + $l_{i,2}$ + "
    +"$l_{i,3}$ + $\\cdots$ + $l_{i,k}$ ) where k>3.",{preserve:true});

    av.step();

    av.umsg("<br><br>Introduce (k-3) new variables : $y_1 , y_2, \\cdots "
    +",y_{k-3}$ ",{preserve:true});

    av.step();

    av.umsg("<br><br> Replace C<sub>i</sub> with a sequence of clauses " +
    "Z<sub>i</sub> where",{preserve:true});

    av.umsg("<br><br> Z<sub>i</sub> = (l<sub>i,1</sub> + l<sub>i,2</sub> "+
    "+ y<sub>1</sub>) . (^y<sub>1</sub> + l<sub>i,3</sub> + y<sub>2</sub>)"+
    " ... (^y<sub>j-2</sub> + l<sub>i,j</sub> + ^y<sub>j-1</sub>) ..."+
    " (^y<sub>k-4</sub> + l<sub>i,k-2</sub> + y<sub>k-3</sub>) .("+
    "^y<sub>k-3</sub> + l<sub>i,k-1</sub> + l<sub>i,k</sub>)"
    ,{preserve:true});

    av.step();

    av.umsg("<br><br><b> To prove:</b>",{preserve:true});
    av.umsg("<br><br>a. When C<sub>i</sub> is satisfiable, Z<sub>i</sub> is "
    +"satisfiable",{preserve:true});
    av.umsg("<br><br>b. When C<sub>i</sub> is not satisfiable, Z<sub>i</sub> "
    +"is not satisfiable",{preserve:true});

    av.step();

    av.umsg("<b> Case 4a. When C<sub>i</sub> is satisfiable.</b>");

    av.umsg("<br><br> $C_i$ &nbsp;&nbsp; = &nbsp; ( $l_{i,1}$ + $l_{i,2}$ + "+
    "$l_{i,3}$ + $\\cdots$ + $l_{i,k}$ ) where k>3.",{preserve:true});

    av.umsg("<br><br> Z<sub>i</sub> = ",{preserve:true});

    var zlabels = [];
    zlabels.push(av.label("(",{left: 30,top:4}));
    zlabels.push(av.label("$l_{i,1}$+$l_{i,2}$",{left: 37,top:4}));
    zlabels.push(av.label("+",{left: 82,top:4}));
    zlabels.push(av.label("$y_1$",{left: 91,top:4}));
    zlabels.push(av.label(").(",{left: 104,top:4}));
    zlabels.push(av.label("^$y_1$",{left: 118,top:4}));
    zlabels.push(av.label("+",{left: 140,top:4}));
    zlabels.push(av.label("$l_{i,3}$",{left: 150,top:4}));
    zlabels.push(av.label("+",{left: 167,top:4}));
    zlabels.push(av.label("$y_2$",{left: 177,top:4}));
    zlabels.push(av.label(") ... (",{left: 190,top:4}));
    zlabels.push(av.label("^$y_{j-3}$",{left: 221,top:4}));
    zlabels.push(av.label("+",{left: 254,top:4}));
    zlabels.push(av.label("$l_{i,j-1}$",{left: 264,top:4}));
    zlabels.push(av.label("+",{left: 295,top:4}));
    zlabels.push(av.label("$y_{j-2}$",{left: 305,top:4}));
    zlabels.push(av.label(").(",{left: 330,top:4}));
    zlabels.push(av.label("^$y_{j-2}$",{left: 344,top:4}));
    zlabels.push(av.label("+",{left: 377,top:4}));
    zlabels.push(av.label("$l_{i,j}$",{left: 387,top:4}));
    zlabels.push(av.label("+",{left: 403,top:4}));
    zlabels.push(av.label("$y_{j-1}$",{left: 415,top:4}));
    zlabels.push(av.label(").(",{left: 440,top:4}));
    zlabels.push(av.label("^$y_{j-1}$",{left: 454,top:4}));
    zlabels.push(av.label("+",{left: 487,top:4}));
    zlabels.push(av.label("$l_{i,j+1}$",{left: 497,top:4}));
    zlabels.push(av.label("+",{left: 528,top:4}));
    zlabels.push(av.label("$y_{j}$",{left: 538,top:4}));
    zlabels.push(av.label(") ... (",{left: 551,top:4}));
    zlabels.push(av.label("^$y_{k-4}$",{left:582,top:4}));
    zlabels.push(av.label("+",{left:616,top:4}));
    zlabels.push(av.label("$l_{i,k-2}$",{left:626,top:4}));
    zlabels.push(av.label("+",{left:657,top:4}));
    zlabels.push(av.label("$y_{k-3}$",{left:667,top:4}));
    zlabels.push(av.label(")",{left:693,top:4}));
    zlabels.push(av.label("(",{left:30,top:25}));
    zlabels.push(av.label("^$y_{k-3}$",{left:37,top:25}));
    zlabels.push(av.label("+",{left:72,top:25}));
    zlabels.push(av.label("$l_{i,k-1}$+$l_k$",{left:81,top:25}));
    zlabels.push(av.label(")",{left:135,top:25}));

    av.umsg("<br><br><br>When C<sub>i</sub> is satisfiable atleast one literal in { "+
    "l<sub>i,1</sub> ... l<sub>i,k</sub> } is 1.",{preserve:true});

    av.step();

    label1=av.label("<b>If any of l<sub>i,1</sub> or l<sub>i,2</sub> is 1</b>, "
    ,{left:0,top:100});

    zlabels[1].css({color:"LimeGreen"});

    av.step();

    label2=av.label("set all the additional variables y<sub>1</sub> ,"+
    "y<sub>2</sub> ... y<sub>k-3</sub> to 0.",{left:160,top:100});

    av.step();

    label3=av.label("The first term of all the clauses in Z<sub>i</sub> "+
    "other than the first has a literal ^y<sub>n</sub> which evaluates to 1"
    ,{left:0,top:130});

    zlabels[5].css({color:"LimeGreen"});
    zlabels[11].css({color:"LimeGreen"});
    zlabels[17].css({color:"LimeGreen"});
    zlabels[23].css({color:"LimeGreen"});
    zlabels[29].css({color:"LimeGreen"});
    zlabels[36].css({color:"LimeGreen"});

    label4=av.label("<b>Z<sub>i</sub> has a satisfying assignment</b>"
    ,{left:0,top:160});

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
    }

    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();

    label1=av.label("<b>If any of l<sub>i,k-1</sub> or l<sub>i,k</sub> is 1</b>, "
    ,{left:0,top:100});

    zlabels[38].css({color:"LimeGreen"});

    av.step();

    label2=av.label("set all the additional variables y<sub>1</sub> ,"+
    "y<sub>2</sub> ... y<sub>k-3</sub> to 1.",{left:165,top:100});

    av.step();

    label3=av.label("The third term of all the clauses in Z<sub>i</sub> "+
    "other than the last has a literal y<sub>n</sub> which evaluates to 1"
    ,{left:0,top:130});

    zlabels[3].css({color:"LimeGreen"});
    zlabels[9].css({color:"LimeGreen"});
    zlabels[15].css({color:"LimeGreen"});
    zlabels[21].css({color:"LimeGreen"});
    zlabels[27].css({color:"LimeGreen"});
    zlabels[33].css({color:"LimeGreen"});

    label4.show();

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
    }

    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();

    label1=av.label("<b>If l<sub>i,j</sub> $(where \\ j \\notin \\{1,2,k-1,k\\})$ is 1</b>, "
    ,{left:0,top:100});

    zlabels[19].css({color:"LimeGreen"});

    label2=av.label("set y<sub>1</sub>...y<sub>j-2</sub> to 1 and "+
    "y<sub>j-1</sub> ... y<sub>k-3</sub> to 0.",{left:240,top:100});

    av.step ();

    label3=av.label("Let us call the clause in Z<sub>i</sub> containing "+
    "l<sub>i,j</sub> in as C'",{left:0,top:130});

    label6 = av.label("--------------------",{left:340,top:20});
    label7 = av.label("C'",{left:380,top:35});

    av.step();

    label4=av.label("The third term of all the clauses in Z<sub>i</sub> "+
    "left to C' has a literal y<sub>n</sub> ($where \\ n \\in \\{1..j-2\\}$) "
    +"which evaluates to 1",{left:0,top:160});

    zlabels[3].css({color:"LimeGreen"});
    zlabels[9].css({color:"LimeGreen"});
    zlabels[15].css({color:"LimeGreen"});

    av.step();

    label5=av.label("The first term of all the clauses in Z<sub>i</sub> "+
    "right to C' has a literal ^y<sub>n</sub> ($where \\ n \\in \\{j-1..k-3\\}$) "
    +" which evaluates to 1",{left:0,top:190});

    zlabels[23].css({color:"LimeGreen"});
    zlabels[29].css({color:"LimeGreen"});
    zlabels[36].css({color:"LimeGreen"});

    av.step();

    label8=av.label("<b>Z<sub>i</sub> has a satisfying assignment</b>"
    ,{left:0,top:220});

    av.step();

    for(var i in zlabels){
        zlabels[i].css({color:"Black"});
        zlabels[i].hide();
    }

    label1.hide();
    label2.hide();
    label3.hide();
    label4.hide();
    label5.hide();
    label6.hide();
    label7.hide();
    label8.hide();


    av.umsg("<br><br><br><b> Case 4a. When C<sub>i</sub> is satisfiable.</b>");
    av.umsg("<br><br><br> Hence when C<sub>i</sub> is satisfiable, "+
    "Z<sub>i</sub> is satisfiable.",{preserve:true});

    av.step();
    av.umsg("<b> Case 4b. When C<sub>i</sub> is not satisfiable.</b>");

    av.umsg("<br><br> $C_i$ &nbsp;&nbsp; = &nbsp; ( $l_{i,1}$ + $l_{i,2}$ + "+
    "$l_{i,3}$ + $\\cdots$ + $l_{i,k}$ ) where k>3.",{preserve:true});

    av.umsg("<br><br> Z<sub>i</sub> = ",{preserve:true});

    for(var i in zlabels){
        zlabels[i].show();
    }

    av.step();

    av.umsg("<br><br><br>When C<sub>i</sub> is not satisfiable NO literal in { "+
    "l<sub>i,1</sub> ... l<sub>i,k</sub> } is 1.",{preserve:true});
 
    zlabels[1].css({color:"Red"});
    zlabels[7].css({color:"Red"});
    zlabels[13].css({color:"Red"});
    zlabels[19].css({color:"Red"});
    zlabels[25].css({color:"Red"});
    zlabels[31].css({color:"Red"});
    zlabels[38].css({color:"Red"});

    av.step();

    av.umsg("<br><br> For Z<sub>i</sub> to be satisfiable, all its clauses "
    +"must evaluate to 1 ",{preserve:true});

    av.step();

    av.umsg("<br><br>For the first clause to be 1, y<sub>1</sub> = 1"
    ,{preserve:true});
    
    zlabels[3].css({color:"Green"});
    zlabels[5].css({color:"Red"});
    
    av.step();

    av.umsg("<br><br>Now for the second clause to be 1, y<sub>2</sub> = 1"
    ,{preserve:true});
    
    zlabels[9].css({color:"Green"});

    av.step();
    
    av.umsg("<br><br>Similarly for the third clause to be 1, y<sub>3</sub> = 1"
    ,{preserve:true});
   
    av.step();
    
    av.umsg("<br><br>y<sub>3</sub> = 1 => y<sub>4</sub> = 1 ... => y<sub>j-2</sub>"
    +" = 1 => y<sub>j-1</sub> = 1 => y<sub>j</sub> = 1 ... => y<sub>k-4</sub> "
    +"= 1 => y<sub>k-3</sub> = 1",{preserve:true});
   
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

    av.umsg("<br><br>The last clause evaluates to 0. <b> Hence Z<sub>i</sub>"
    +" is NOT SATISFIABLE</b>",{preserve:true});
   
    av.step();
    for(var i in zlabels){
        zlabels[i].hide();
    }

 
    av.umsg("<b>Case 4: Reduction of clauses containing more than three "+
    "literals.</b>");

    av.umsg("<br><br><b>Hence we proved:</b>",{preserve:true});
    av.umsg("<br><br>a. When C<sub>i</sub> is satisfiable, Z<sub>i</sub> is "
    +"satisfiable",{preserve:true});
    av.umsg("<br><br>b. When C<sub>i</sub> is not satisfiable, Z<sub>i</sub> "
    +"is not satisfiable",{preserve:true});

    av.step();

    av.umsg("<b>Reduction of SAT to 3-SAT");
    av.umsg("<br><br><br>Hence any clause in a SAT expression can be replaced by a"
    +" conjunction of clauses which contains 3 literals each.",{preserve:true});
    av.umsg("<br><br><br><b>So, a SAT problem can be reduced to an instance of 3-SAT"
    +" in polynomial time.</b>",{preserve:true});

    av.recorded(); 

}

  function about() {
    var mystring = "Reduction of SAT problem to 3-SAT problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }


$('#about').click(about);
$('#runit').click(runit);
$('#reset').click(ODSA.AV.reset);
}(jQuery));


