"use strict";
/*global ODSA, setPointerL */

(function ($) {
/* Description for some global variables used :
 * g: The graph that is constructed for the reduction. Any pair of
 * nodes in any path P_i in G has 2 edges (say forward for left-to-right
 * and reverse for right-to-left) between them. However display of such
 * pair of edges is not yet supported in jsav. So only forward edges are
 * included as a part of graph g.  
 * 
 * g1 : For the problem described above, as a workaround we have g1,
 * a second graph which contains a copy of all nodes in g that requires
 * both reverse and forward edges. These nodes of g1 are not visible and
 * are placed 5 units beneath the corresponding nodes in g. These nodes
 * are used to draw the reverse edges on the canvas. 
 *
 * source : the source node
 * target : the target node
 *
 * P: The array in which the ith row holds the nodes in the paths P_i
 * in the graph g.
 * P1: The array in which the ith row holds all the invisible nodes 
 * corresponding to path P_i in graph g1.
 *
 * PE: The array in which the [i,j,0]'th item holds the forward edge
 * for jth node of path P_i (from g) and [i,j,1]'th item holds the
 * reverse edge (from g1).
 *
 * PE1: The array holds all the edges connecting the source and target to 
 * the rest of the graph.
 *
 * PE2: The array holds all the interconnecting edges that connects wo
 * paths P_i and P_j.
 *
 * PE3: The array contains the edges that connect clause-nodes to the
 * nodes in a path.
 *
 * C: The array that holds the clause nodes of the graph. 
 */

  var jsav;
  var x= 200 , y = 10 , r = 15;

  var label1, label2, label3, label4, label5, label6,label7,label8,label9,label10,label11, 
    g, g1, source,  target, line1, line2, 
    varlabel, exprlabel, 
    literalLabels = new Array(4),
    clauses = new Array(3),
    P = new Array(4),
    C = new Array(3),
    P1 = new Array(4),
    color = new Array(3),
    PLabel = new Array(4),
    PE = new Array(4),
    PE1 = new Array(5),
    PE2 = new Array(4),
    PE3 = new Array(3);

  var input=[["$x_1$", "$x_2$", "$\\bar{x_3}$"],
             ["$\\bar{x_2}$", "$x_3$", "$x_4$"],
	     ["$x_1$", "$\\bar{x_2}$", "$x_4$"]];

  function hideGraph(){
    exprlabel.hide();

    for(var i=0;i<5;i++)
      PE1[i].hide();

    for(var i=0;i<4;i++){
      if(i > 0) {
	for(var j=0;j<4;j++)
	  PE2[i-1][j].hide();
      }
      PLabel[i].hide();
      for(var j=0;j<6;j++){
	if(j>0){
	  PE[i][j][0].hide();
	  PE[i][j][1].hide();
	}
	P[i][j].hide();
      }
    }
    source.hide(); target.hide();
    for(var i=0;i<3;i++) {
      C[i].hide();
      for(var j=0;j<8;j++)
	clauses[i][j].hide();
      for(var j=0;j<3;j++){
	PE3[i][j][0].hide();
	PE3[i][j][1].hide();
      }
    }
    line1.hide(); line2.hide();
  }

  function runit() {
//    ODSA.AV.reset(true);
    jsav = new JSAV($('.avcontainer'));
    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]);
    }); $(".avcontainer").on("jsav-updatecounter" ,  function(){ 
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });  

    //color array for clauses
    color = ["#669966" , "SlateBlue" , "IndianRed"];

    g = jsav.ds.graph({width: 800,  height: 550,  left: 100,  top: 50,
			    layout: "manual" ,  directed: true});
    g1 = jsav.ds.graph({width: 800,  height: 550,  left: 100,  top: 50,
                      layout: "manual",  directed: true});

    // Slide 1
    jsav.umsg("<b>Objective</b>"); 
    jsav.umsg("<br><br><br>This slideshow explains the reduction of 3CNF"+
" Satisfiability to Hamiltonian Cycle in polynomial time",{preserve:true}); 
    jsav.displayInit();

    jsav.step();
    jsav.umsg("<b>3-SAT and  HAMILTONIAN CYCLE.</b>");
    label1=jsav.label("For a 3-SAT expression containing $n$ variables," +
              " there are $2^n$ possible assignments.",
              {left:0,top:-30});
    label2=jsav.label("We model these $2^n$ possible truth assignments using a graph with" 
              +" $2^n$ different Hamiltonian cycles <br>by the following method." , 
              {left:0,top:0});
    jsav.step();
    
    label1.hide();
    label2.hide();
    jsav.umsg("<b>Step1: Construction of paths</b>");
    label1=jsav.label("Construct $n$ paths $P_1$, $P_2$, ..., $P_n$ corresponding to the" 
              +" $n$ variables." , {left:0,top:-30});
    label2=jsav.label("Each path $P_i$ should consist of $2k$ nodes ($v_{i,1}$, $v_{i,2}$"
              +", ..., $v_{i,2k}$) where $k$ is the number of clauses in the "+
              "expression." , {left:0,top:0});
    jsav.step();
  
    // Slide 3
    label3=jsav.label("For example:" , {left:0,top:30});
    label4=jsav.label("Consider the following boolean expression with 4 variables: ",
              {left:0,top:60});
    label5=jsav.label("$x_1$, $x_2$, $x_3$, $x_4$" , {left:0,top:90});
    label6=jsav.label("Expression: $(x_1 + x_2 + \\bar{x_3}).(\\bar{x_2} + x_3 + x_4).(x_1 + \\bar{x_2} + x_4)$",
              {left:0,top:120});
    label7=jsav.label("We construct 4 paths with 6 nodes each",
              {left:0,top:150});
    label8=jsav.label("$P_1$ with nodes $v_{1,1}, v_{1,2}, v_{1,3}, v_{1,4}, v_{1,5}, v_{1,6}$",
              {left:0,top:180});
    label9=jsav.label("$P_2$ with nodes $v_{2,1}, v_{2,2}, v_{2,3}, v_{2,4}, v_{2,5}, v_{2,6}$",
              {left:0,top:210});
    label10=jsav.label("$P_3$ with nodes $v_{3,1}, v_{3,2}, v_{3,3}, v_{3,4}, v_{3,5}, v_{3,6}$",
              {left:0,top:240});
    label11=jsav.label("$P_4$ with nodes $v_{4,1}, v_{4,2}, v_{4,3}, v_{4,4}, v_{4,5}, v_{4,6}$",
              {left:0,top:270});
    jsav.step();

    // Slide 4, 5, 6, 7
    // display the boolean variables

    label1.hide(), label2.hide(); label3.hide(); 
    label4.hide(), label5.hide(); label6.hide(); 
    label7.hide(), label8.hide(); label9.hide(); 
    label10.hide(), label11.hide(); 
 
    jsav.umsg("<b>Step 1a: Adding nodes for the paths</b>");
    varlabel = jsav.label("Variables:" , {left:10 , top:-30});
    x = 100; y=65;
    for(var i=0;i<6;i=i+2) {
      literalLabels[i]=jsav.label("$x_"+(i/2+1)+"$" , {left:x , top:-30});
      literalLabels[i+1]=jsav.label("," , {left:x+30 , top:-30});
      x=x+45;
    }
    literalLabels[i]=jsav.label("$x_"+(i/2+1)+"$" , {left:x , top:-30});

    for(var i=0;i<4;i++) {
      x=10;
      P[i]=new Array(6);
      P1[i]=new Array(6);
      PE[i]=new Array(6);
      PLabel[i]=jsav.label("$P_"+(i+1)+"$" , {"left":x+70 , "top":y+55});
      if(i>0) {
	literalLabels[2*(i-1)].css({"font-size":"100%"});
	for(var j=0;j<6;j++) {
	  P[i-1][j].css({"opacity":0.5});
	}
      }

      for(var j=0;j<6;j++) {
	// Add nodes corresponding to the paths to g and g1
	// Display the nodes one by one
	P[i][j] = g.addNode(""+(j+1) , {"top":y , "left":x})
	            .css({"background-color":"Tan" , "width":"30px" , 
                       "height":"30px" , "min-width":"30px" , 
                       "min-height":"30px" , "opacity":1});
	P1[i][j] = g1.addNode(" " , {"top":y+5 , "left":x})
                     .css({"width":"30px" , "height":"30px" , 
                         "min-width":"30px" , "min-height":"30px" , 
                         "opacity":0});
	if(j>0) {
	  // Add the forward edges between the nodes to g and reverse edges to g1
	  PE[i][j]=new Array(2);
	  PE[i][j][0]=g.addEdge(P[i][j-1] , P[i][j])
                       .css({"stroke":"DarkGreen", "stroke-width":"1.5px"});
	  PE[i][j][0].hide();
	  PE[i][j][1]=g1.addEdge(P1[i][j] , P1[i][j-1])
                        .css({"stroke":"FireBrick", "stroke-width":"1.5px"});
	  PE[i][j][1].hide();
	}
	x = x+85;
      }

      // Add the interconnecting edges between the paths to g
      if(i>0){
	PE2[i-1]=new Array(4);
	PE2[i-1][0]=g.addEdge(P[i-1][0] , P[i][0])
                     .css({"stroke":"DarkViolet", "stroke-width":"1.5px"});
	PE2[i-1][1]=g.addEdge(P[i-1][0] , P[i][j-1])
                     .css({"stroke":"DarkViolet", "stroke-width":"1.5px"});
	PE2[i-1][2]=g.addEdge(P[i-1][j-1] , P[i][0])
                     .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
	PE2[i-1][3]=g.addEdge(P[i-1][j-1] , P[i][j-1])
                     .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
	for(j=0;j<4;j++)
	  PE2[i-1][j].hide(); 
      }  
      y = y+60;
      g.layout();
      g1.layout();
      literalLabels[2*i].css({"font-size":"125%"});
      jsav.step();
    }

    // Slide 8
    for(var j=0;j<6;j++){
      P[i-1][j].css({"opacity":0.5});
    }
    literalLabels[2*(i-1)].css({"font-size":"100%"});
    varlabel.hide();
    for( var i=0;i<7;i++)
      literalLabels[i].hide();

    //display forward edges
    jsav.umsg("<b>Step 1b: Adding edges to the paths</b>");
    label1=jsav.label("Add edges from $v_{i,j-1}$ to $v_{i,j}$ (i.e. left to right) on" 
	      +" $P_i$ to correspond to the assignment  $x_i = 1$" , 
              {left:0,top:-30} );
    for(var i=0;i<4;i++){
      for(var j=0;j<6;j++){
	if(j>0)
	  PE[i][j][0].show();
      }
    }
    jsav.step();

    // Slide 9
    // Display reverse edges
    label1.hide();
    jsav.umsg("<b>Step 1b: Adding edges to the paths</b>");
    label1=jsav.label("Add edges from $v_{i,j}$ to $v_{i,j-1}$ (i.e. right to left) on"+ 
	      " $P_i$ to correspond to the assignment $x_i = 0$" ,
              {left:0,top:-30} );
    for(var i=0;i<4;i++){
      for(var j=0;j<6;j++){
	if(j>0)
	  PE[i][j][1].show();
      }
    }
    jsav.step();

    // Slide 10
    // Display interconnecting edges
    label1.hide();
    jsav.umsg("<b>Step 2: Inter-connecting the paths</b>");
    label1=jsav.label("Add edges from  $v_{i,1}$ and $v_{i,6}$  to  $v_{i+1,1}$ and " 
	      +"$v_{i+1,6}$" ,
              {left:0,top:-30} );
    for(var i=1;i<4;i++){
      for(var j=0;j<4;j++)
	PE2[i-1][j].show();
    }
    jsav.step();
 
    // Slide 11
    jsav.umsg("<b>Step 3: Adding source and target nodes</b>");
    y = 65;

    //add source and target nodes to g and display.
    source  = g.addNode("<b>s</b>" , {"top":-5 , "left":220})
               .css({"background-color":"Khaki" , "width":"40px" , 
                     "height":"40px" , "min-width":"40px" , "min-height":"40px" ,
                     "opacity":0.65});
    target  = g.addNode("<b>t</b>" , {"top":y+250 , "left":220})
               .css({"background-color":"Khaki" , "width":"40px", "height":"40px" 
                     ,"min-width":"40px", "min-height":"40px" , "opacity":0.65});
    var tmpnode = g.addNode(" " , {"top":-5 , "left":-200})
                   .css({"width":"40px", "height":"40px", "min-width":"40px", 
                         "min-height":"40px", "opacity":0});

    //add edges for souce and target to g.
    PE1[0] = g.addEdge(source , P[0][0])
              .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
    PE1[1] = g.addEdge(source , P[0][5])
              .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
    PE1[2] = g.addEdge(P[3][0] , target)
              .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
    PE1[3] = g.addEdge(P[3][5] , target)
              .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});
    PE1[4]=g.addEdge(tmpnode , source)
            .css({"stroke":"DarkViolet" , "stroke-width":"1.5px"});

    for(i=0;i<5;i++)
      PE1[i].hide();

    line1 = jsav.g.line(100 , 80 , 100 , 405);
    line1.css({"stroke":"DarkViolet"});
    line2 = jsav.g.line(100 , 405 , 320 , 405);
    line2.css({"stroke":"DarkViolet"});
    line1.hide();
    line2.hide();

    g.layout();
    jsav.step();
 
    // Slide 12
    // display the edges connecting source and target to path nodes in g. 

    label1.hide();
    jsav.umsg("<b>Step 4: Connecting  source and target nodes to the "
              +"paths</b>");
    label1=jsav.label("Add edges from '$s$' to $v_{1,1}$ and $v_{1,6}$ and from "+
              "$v_{4,1}$ and $v_{4,6}$ to '$t$'" , 
              {left:0,top:-30} );
    for(var i=0;i<4;i++)
      PE1[i].show();
    jsav.step();

    // Slide 13
    //display he edge from target to source.
    label1.hide();
    jsav.umsg("<b>Step 5: Adding a backpath from target to source");
    label1=jsav.label("Being the only path from target to source, this path will " +
              "always be present in any Hamiltonian Cycle of the graph.",
              {left:0,top:-30} );
    line2.show();
    line1.show();
    PE1[4].show();
    jsav.step();

    // Slide 14
    label1.hide();
    jsav.umsg("<b>Step 6: Adding nodes corresponding to clauses</b>");
    x=150;
    y=-10;

    //display the CNF expression with each clause in different color. 
    exprlabel = jsav.label("3-CNF expression: " , {"top":y , "left":10});
    for(var i=0;i<3;i++){
      clauses[i] = new Array(8);
      x=x+15;
      clauses[i][0]=jsav.label("(", {left:x , top:y}).css({"color":color[i]});
      x=x+15;
      for(var j=1;j<5;j=j+2) {
	clauses[i][j] = jsav.label(input[i][(j-1)/2],
                                   {left:x, top:y}).css({"color":color[i]});
	x=x+25;
	clauses[i][j+1] = jsav.label("+", {left:x, top:y}).css({"color":color[i]});
	x=x+15;
      }
      clauses[i][j] = jsav.label(input[i][(j-1)/2], {left:x, top:y}).css({"color":color[i]});
      x=x+25;
      clauses[i][6] = jsav.label(")", {left:x+5, top:y}).css({"color":color[i]});
      x=x+15;
      clauses[i][7]=jsav.label(".", {left:x+5, top:y});
    }

    // Add the caluse nodes to g and display.
    C[0] = g.addNode("<b>C1</b>" , {"top":-15 , "left":430})
            .css({"background-color":color[0] , "width":"50px" , "height":"50px",
                  "min-width":"50px" , "min-height":"50px" , "opacity":0.65});
    C[1] = g.addNode("<b>C2</b>" , {"top":305 , "left":400})
            .css({"background-color":color[1] , "width":"50px" , "height":"50px",
                  "min-width":"50px" , "min-height":"50px" , "opacity":0.65});
    C[2] = g.addNode("<b>C3</b>" , {"top":300 , "left":580})
            .css({"background-color":color[2] , "width":"50px" , "height":"50px",
                  "min-width":"50px" , "min-height":"50px" , "opacity":0.65});

  for(var i=0;i<3;i++){
    PE3[i] = new Array(3);
    for(var j=0;j<3;j++)
      PE3[i][j] = new Array(2);
  }  

  // add the edges connecting clause nodes to path nodes in g
  PE3[0][0][0] = g.addEdge(P[0][0], C[0]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});
  PE3[0][0][1] = g.addEdge(C[0], P[0][1]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});
  PE3[0][1][0] = g.addEdge(P[1][0], C[0]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});
  PE3[0][1][1] = g.addEdge(C[0], P[1][1]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});
  PE3[0][2][0] = g.addEdge(C[0], P[2][0]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});
  PE3[0][2][1] = g.addEdge(P[2][1], C[0]).css({"stroke":"SlateGray",
                                               "stroke-width":"1.5px"});

  PE3[1][0][0]=g.addEdge(P[1][3] , C[1]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[1][0][1]=g.addEdge(C[1] , P[1][2]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[1][1][0]=g.addEdge(P[2][2] , C[1]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[1][1][1]=g.addEdge(C[1] , P[2][3]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[1][2][0]=g.addEdge(C[1] , P[3][2]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[1][2][1]=g.addEdge(P[3][3] , C[1]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});

  PE3[2][0][0]=g.addEdge(P[0][5] , C[2]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[2][0][1]=g.addEdge(C[2] , P[0][4]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[2][1][0]=g.addEdge(P[1][4] , C[2]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[2][1][1]=g.addEdge(C[2] , P[1][5]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[2][2][0]=g.addEdge(C[2] , P[3][4]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});
  PE3[2][2][1]=g.addEdge(P[3][5] , C[2]).css({"stroke":"SlateGray" , 
						 "stroke-width":"1.5px"});

  for(var i=0;i<3;i++){
    for(var j=0;j<3;j++){
      PE3[i][j][0].hide();
      PE3[i][j][1].hide();
    }
  }
  g.layout();
  jsav.step();

  // Slide 15
  hideGraph();
  jsav.umsg("<b>Step 7: Connecting clauses to the paths</b>");
  label1=jsav.label("If a clause $C_j$ contains the variable $x_i$,",
            {left:0,top:-30} );
  label2=jsav.label("&nbsp;&nbsp;&nbsp;1.Connect $C_j$ to $v_{i,2j-1}$ and "+
            "$v_{i,2j}$" ,
            {left:0,top:0} );
  label3=jsav.label("&nbsp;&nbsp;&nbsp;2.The direction of the path connecting $C_j$"+
            ",$v_{i,2j-1}$ and $v_{i,2j}$ should be:" , 
            {left:0,top:30} );
  jsav.step();

  // Slide 16
  label4 = jsav.label("a. right to left if $C_j$ contains $x_i$" , 
                     {"left":40 , "top":75} );
  label5 = jsav.label("For example : $C_1$ i.e. ($x_1$ + $x_2$ + $\\bar{x_3}$)" 
                      +" contains $x_1$. So $C_1$ should be connected as:" , 
                      {"left":40 , "top":105} );
  var g2 = jsav.ds.graph({width: 200 ,  height: 100 ,  left: 100 ,  top: 120 ,  
                          layout: "manual" ,  directed: true});
  var tmpnode1, tmpnode2, tmpnode3;
  label6 = jsav.label("$P_1$" , {"left":100 , "top":215});
  tmpnode1 = g2.addNode("1" , {"top":85 , "left":30})
               .css({"background-color":"Tan", "width":"30px", "height":"30px", 
                     "min-width":"30px", "min-height":"30px", "opacity":0.5});
  tmpnode2 = g2.addNode("2" , {"top":85, "left":130})
               .css({"background-color":"Tan", "width":"30px", "height":"30px", 
                     "min-width":"30px", "min-height":"30px", "opacity":0.5});
  tmpnode3 = g2.addNode("C1" , {"top":20, "left":90})
               .css({"background-color":"Teal", "width":"50px", "height":"50px", 
                     "min-width":"50px", "min-height":"50px", "opacity":0.65});
  g2.addEdge(tmpnode1 , tmpnode3).css({"stroke-width":"1.5px"});
  g2.addEdge(tmpnode3 , tmpnode2).css({"stroke-width":"1.5px"});
  g2.layout();
  jsav.step();

  // Slide 17
  y=250;
  label7 = jsav.label("b. left to right if $C_j$ contains $\\bar{x_i}$", 
                      {"left":40 , "top":y} );
  label8 = jsav.label("For example : $C_2$ i.e. ($\\bar{x_2}$ + $x_3$ + $x_4$) " 
                     +"contains $\\bar{x_2}$. So $\\bar{C_2}$ should be connected"
                     +" as:" , {"left":40 , "top":y+30} );
  var g3 = jsav.ds.graph({width: 200 ,  height: 100 ,  left: 100 ,  top: y+45 ,  
                          layout: "manual" ,  directed: true});
  label9 = jsav.label("$P_2$" , {"left":100 , "top":y+125});
  tmpnode1 = g3.addNode("3" , {"top":75 , "left":30})
               .css({"background-color":"Tan", "width":"30px", "height":"30px", 
                     "min-width":"30px", "min-height":"30px", "opacity":0.5});
  tmpnode2 = g3.addNode("4" , {"top":75, "left":130})
               .css({"background-color":"Tan", "width":"30px", "height":"30px", 
                     "min-width":"30px", "min-height":"30px", "opacity":0.5});
  tmpnode3 = g3.addNode("C2" , {"top":10 , "left":90})
               .css({"background-color":"Teal", "width":"50px", "height":"50px", 
                     "min-width":"50px", "min-height":"50px", "opacity":0.65});
  g3.addEdge(tmpnode3 , tmpnode1).css({"stroke-width":"1.5px"});
  g3.addEdge(tmpnode2 , tmpnode3).css({"stroke-width":"1.5px"});
  g3.layout();
  jsav.step();

  // Slide 18
  jsav.umsg("<b>Step7: Connecting clauses to the paths</b>");
  //display the graph on canvas
  g2.hide();
  g3.hide();
  label1.hide();
  label2.hide();
  label3.hide();
  label4.hide();
  label5.hide();
  label6.hide();
  label7.hide();
  label8.hide();
  label9.hide();
  line2.show();
  line1.show();

  for(var i=0;i<5;i++)
    PE1[i].show();

  for(var i=0;i<4;i++){
    if(i>0){
      for(var j=0;j<4;j++)
	PE2[i-1][j].show();
    }
    PLabel[i].show();
    for(var j=0;j<6;j++){
      if(j>0){
	PE[i][j][0].show();
	PE[i][j][1].show();
      }
      P[i][j].show();
    }
  }

  source.show(); target.show();

  exprlabel.show();
  for(var i=0;i<3;i++)
    for(var j=0;j<8;j++)
      clauses[i][j].show();
  C[0].show(); C[1].show(); C[2].show();

  jsav.step();

  // Slide 19
  // Slide 20 , side 21 , slide 22 , slide 23 , slide 24 , slide 25 , slide 26
  // Slide 27 , slide 28

  // these slides show animation for displaying all the edges for each clause one 
  // by one

  for(var i=0;i<3;i++){
    if(i>0){
      clauses[i-1][5].css({"font-size":"100%"});
      PE3[i-1][2][0].css({"stroke-width":"1.5px"});
      PE3[i-1][2][1].css({"stroke-width":"1.5px"});
     
    }
    for(var j=0;j<3;j++){
      if(j>0){
	clauses[i][2*j-1].css({"font-size":"100%"});
	PE3[i][j-1][0].css({"stroke-width":"1.5px"});
	PE3[i][j-1][1].css({"stroke-width":"1.5px"});
      }
      clauses[i][2*j+1].css({"font-size":"125%"});
      PE3[i][j][0].css({"stroke-width":"3px"});
      PE3[i][j][1].css({"stroke-width":"3px"});
      PE3[i][j][0].show();
      PE3[i][j][1].show();
      jsav.step();
    }
  }

  clauses[2][5].css({"font-size":"100%"});

  PE3[2][2][0].css({"stroke-width":"1.5px"});
  PE3[2][2][1].css({"stroke-width":"1.5px"});

  jsav.step();

  // Slide 29
  line1.hide(); line2.hide();

  exprlabel.hide();
  g.hide();
  g1.hide();

  for(var i=0;i<4;i++)
    PLabel[i].hide();

  for(var i=0;i<3;i++)
    for(j=0;j<8;j++)
      clauses[i][j].hide();

  jsav.umsg("<b>Insights about the constructed graph</b><br><br><br>");

  label1=jsav.label("1. Any Hamiltonian Cycle in the constructed graph ($G$) traverses" 
           +" $P_i$ either from right-to-left or left-to-right.<br>"
  +"This is because any path entering a node $v_{i,j}$ has to exit "+
            "from $v_{i,j+1}$ either immediately or  via one <br> clause-node"+
            " in between, in order to maintain Hamiltonian property<br>"+
  "Similarly all paths entering at $v_{i,j-1}$ has to exit from "+ 
            "$v_{i,j}$.<br><br>"+
  "2. Since each path $P_i$ can be traversed in $2$ possible ways "+
            "and we have $n$ paths mapping to $n$ variables, <br>there can be $2^n$"
            +" Hamiltonian cycles in the graph $G$ - {$C_1$, $C_2$ $\\cdots$ "
            +"$C_k$}.<br>"+
  "Each one of this $2^n$ Hamiltonian cycles corresponds to a particular"
            +" assignment for variables $x_1$, $x_2$ $\\cdots$  $x_n$.<br>"
+"<br><br>3. <b>This graph can be constructed in polynomial time.</b>" 
            ,{left:0,top:-30} );
  
  jsav.step();

  // Slide 30
  label1.hide();
  jsav.umsg("<b>3-SAT and Hamiltonian Cycle</b><br><br><br>");
  label1=jsav.label("1. <b>If there exists a Hamiltonian cycle $H$ in the graph $G$," 
            +"</b><br><br>" +
  "If $H$ traverses $P_i$ from left to right, assign $x_i = 1$<br>"+ 
  "If $H$ traverses $P_i$ from right to left, assign $x_i \\geq 0$"+
            "<br><br>"+
  "Since H visits each clause node $C_j$, atleast one one $P_i$ was"
            +" traversed in the right direction relative to the node $C_j$"+
            "<br><br>"+
  "<b>The assignment obtained here satisfies the given 3 CNF.</b>"+
            "<br><br><br>",{left:0,top:0});
  jsav.step();

  // Slide 31
  label2=jsav.label("2. <b>If there exists a satisfying assignment for the 3 CNF</b>," 
            +"<br><br>"+
  "Select the path that traverses $P_i$ from left-to-right if $x_i" 
            +"\\geq 1$ or right-to-left if $x_i \\geq 0$<br>"+
  "Include the clauses in the path wherever possible.<br>"+
  "Connect the source to $P_1$, $P_n$ to target and $P_i$ to "+
            "$P_{i+1}$ appropriately so as to maintain the continuity of "+
            "the path <br>"+
  "Connect the target to source to complete the cycle<br><br>"
  +"Since the assignment is such that every clause is satisfied, all " 
            +"the clause-nodes are included in the path.<br>The $P_i$ nodes and "
            +"source and target are all included and since the path traverses "+
            "unidirectional, <br>no node is repeated twice <br><br>"+ 
  "<b> The path obtained is a Hamiltonian Cycle</b><br><br>",{left:0,top:180});
  jsav.step();

  // Slide 32

  label1.hide();
  label2.hide();
  line1.show(); line2.show();
  g.show();
  g1.show();

  for(var i=0;i<3;i++)
    for(j=0;j<8;j++)
      clauses[i][j].show();

  for(var i=0;i<4;i++)
    PLabel[i].show();

  for(var i=0;i<PE1.length;i++)
    PE1[i].css({"opacity":0.5});

  for(var i=0;i<4;i++){
    for(j=1;j<6;j++){
      PE[i][j][0].css({"opacity":0.5});
      PE[i][j][1].css({"opacity":0.5});
    }
  }

  for(var i=0;i<3;i++){
    for(var j=0;j<4;j++)
      PE2[i][j].css({"opacity":0.5});
  }

  for(var i=0;i<3;i++){
    for(var j=0;j<3;j++){
      PE3[i][j][0].css({"opacity":0.5});
      PE3[i][j][1].css({"opacity":0.5});
    }
  }

  jsav.umsg("<b>Hamiltonian Cycle in the constructed graph</b><br><br><br>");
  label1 = jsav.label("The graph $G$ has a Hamiltonian cycle<br>" , {left:0,top:-30});

  for(var i=0;i<3;i++)
    for(j=0;j<8;j++)
      clauses[i][j].hide();

  // highlight the hamiltonian cycle on the graph in blue.

  line1.css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  line2.css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  PE1[4].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE1[0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE1[2].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE3[0][0][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE3[0][0][1].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  for(var i=2;i<=5;i++)
    PE[0][i][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  PE2[0][3].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  for(var i=1;i<=5;i++)
    PE[1][i][1].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  PE2[1][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  for(var i=1;i<=5;i++)
    if(i!=3)
      PE[2][i][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  PE2[2][3].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  for(var i=1;i<=4;i++)
    PE[3][i][1].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});

  PE3[1][1][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE3[1][1][1].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE3[2][2][0].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  PE3[2][2][1].css({"stroke":"Blue" , "stroke-width":"3px" , "opacity":1});
  jsav.step();

  // Slide 33
  label1.hide();
  jsav.umsg("<b>Assignment for 3-SAT</b><br><br><br>");
  label1=jsav.label("From the Hamiltonian cycle below the assignment is : <br><br>"
  +"<b>$x_1 = 1$  ,  $x_2 = 0$  ,  $x_3 = 1$  ,  $x_4 = 0$</b><br><br>",
            {left:0,top:-30});
  exprlabel.hide();
  for(var i=0;i<3;i++)
    for(j=0;j<8;j++)
      clauses[i][j].hide();
  jsav.step();

  // Slide 34
  label1.hide();
  jsav.umsg("<b>Satisfiability of 3-CNF</b><br><br><br>");
  hideGraph();
  jsav.umsg("From the Hamiltonian cycle below the assignment is : <br><br>",
            {'preserve':true});
  label1=jsav.label("<b>$x_1 = 1$, $x_2 = 0$, $x_3 = 1$, $x_4 = 0$</b><br><br>"+
  "The above assignment satisfies the 3CNF ($x_1$ + $x_2$ + "+ 
            "$\\bar{x_3}$).($\\bar{x_2}$ + $x_3$ + $x_4$).($x_1$ + "
            +"$\\bar{x_2}$ + $x_4$)<br>" , {left:0,top:0});
  jsav.recorded();
}
  function about() {
    var mystring = "Reduction of 3-SAT to Hamiltonian Cycle\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
