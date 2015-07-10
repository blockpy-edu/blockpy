//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA, setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "cliqueCON";

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

    var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
    var y = 0;
  
    av.umsg("<br><b>Introduction to the Clique problem </b>"); 
    var nl1=av.label("This slideshow introduces and explains the \"Clique\"  Problem."
+"</b> <br><br><br> We start with some definitions  and background.",{top:0});


    av.displayInit();

    av.step();
    nl1.hide();
    av.umsg("<br><b>Clique </b>");
    nl1=av.label("A Clique is complete graph i.e. a graph where each node"+
" is connected to every other nodes by atleast one edge.",{top:-10}); 

    av.step();
    var nl2=av.label("Example of a clique :",{top:60});

    var  g = av.ds.graph({width: 400, height: 450,
    layout: "manual", directed: false,top:60,left:200});
    var x=20;
    y=0;


    g.addNode("A", {"left": x+150, "top": y+50});
    g.addNode("B", {"left": x+50, "top": y+100});
    g.addNode("C", {"left": x+250,"top": y+100});
    g.addNode("D", {"left": x+25, "top": y+200});
    g.addNode("E", {"left": x+275, "top": y+200});
    g.addNode("F", {"left": x+150, "top": y+250});

    var gnodes = g.nodes();
    for(var i=0;i<6;i++)
        for(var j=i+1;j<6;j++)
            g.addEdge(gnodes[i],gnodes[j]);

    g.layout();


    av.step();
    nl1.hide();
    nl2.hide();
    av.umsg("<br><b>Clique in a graph </b>");
    g.hide();
    y=0; 
    nl1=av.label("If in a graph $G$, their exists a complete subgraph of "+
"$k$ nodes, $G$ is said to contain a $k$-clique  ",{top:-10}); 

    av.step();
    label1 = av.label("For example: The following graph contains a "+
"$3$-clique",{top:40,left:0}); 

    var  g3 = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false,left:220,top:70});
    x=0;
    y=0;
    var n1 = g3.addNode("1", {"left": x+50, "top": y+100});
    var n2 = g3.addNode("2", {"left": x+250,"top": y+100});
    var n3 = g3.addNode("3", {"left": x+50, "top": y+200});
    var n4 = g3.addNode("4", {"left": x+250, "top": y+200});
    var n5 = g3.addNode("5", {"left": x+175, "top": y+50});
    var n6 = g3.addNode("6", {"left": x+175, "top": y+250});
   
    var ne1 = g3.addEdge(n3, n2);
    var ne2 = g3.addEdge(n3, n4);
    var ne4 = g3.addEdge(n5, n2);
    var ne5 = g3.addEdge(n4, n2);
    var ne6 = g3.addEdge(n5, n4);
    var ne7 = g3.addEdge(n5, n3);
    var ne8 = g3.addEdge(n1, n3);
    var ne8 = g3.addEdge(n6, n3);

    ne7.css({"stroke":"LightCoral","stroke-width":"5"});
    ne6.css({"stroke":"LightCoral","stroke-width":"5"});
    ne2.css({"stroke":"LightCoral","stroke-width":"5"});

    g3.layout();
    g3.show();
    av.step();
    nl1.hide();
    label1.hide();
    g3.hide();


    nl1=av.label("The clique with largest number of vertices in a graph $G$"
+" is called Maximum Clique in $G$",{top:-10}); 
    av.step();
    label1 = av.label("For example: Maximum Clique in the "+
"graph is a $4$-clique",{top:40,left:0}); 
    g3.show();
    ne1.css({"stroke":"LightCoral","stroke-width":"5"});
    ne4.css({"stroke":"LightCoral","stroke-width":"5"});
    ne5.css({"stroke":"LightCoral","stroke-width":"5"});


    g3.layout();


    av.step();
    nl1.hide();
    g3.hide();
    label1.hide();
    av.umsg("<br><b>The Clique Problem </b>");
    nl1=av.label("The Clique Problem can be defined as either "
+"of the following: <br><br><br><b>Given a graph $G = (V , E)$,"+
" find the Maximum Clique in $G$.</b><br><br><br>Or<br><br><br><b>"+
"Given a graph $G = (V , E)$, and an number  $k$, does $G$ contain a"+
" Clique of size >= $k$ ?</b> ",{top:0});

    av.step();
    nl1.hide();
    var  g1 = av.ds.graph({width: 400, height: 450,
    layout: "manual", directed: false});

    label1.hide();

    av.umsg("<br><b>Example of Clique Problem: </b>");  

    nl1=av.label("In the graph below does there exist a clique of size >=$5$ ?"
,{top:-10}); 
 
    x=20;
    y = 320;
    var c7 = g1.addNode("a", {"left":x , "top":y });
    var c4 = g1.addNode("b", {"left":x+150 , "top":y+20 });
    var c5 = g1.addNode("c", {"left":x+300, "top":y });
    var c10 = g1.addNode("d", {"left":x-20, "top":y-120 });
    var c9 = g1.addNode("e", {"left":x+200, "top":y-80 });
    var c3 = g1.addNode("f", {"left":x+320, "top":y-140 });
    var c2 = g1.addNode("g", {"left":x+120, "top":y-190 });
    var c6 = g1.addNode("h", {"left":x+215, "top":y-190 });
    var c1 = g1.addNode("i", {"left":x+100, "top":y-260 });
    var c8 = g1.addNode("j", {"left":x+195, "top":y-260 });

    var e1 = g1.addEdge(c1, c2);
    var e2 = g1.addEdge(c1, c6);
    var e3 = g1.addEdge(c1, c8);
    g1.addEdge(c1, c10);
    var e4 = g1.addEdge(c2, c8);
    var e5 = g1.addEdge(c2, c6);
    g1.addEdge(c2, c4);
    g1.addEdge(c2, c7);
    g1.addEdge(c2, c9);
    g1.addEdge(c2, c10);
    g1.addEdge(c3, c5);
    g1.addEdge(c3, c6);
    g1.addEdge(c3, c8);
    g1.addEdge(c3, c9);
    g1.addEdge(c4, c9);
    g1.addEdge(c4, c10);
    g1.addEdge(c5, c9);
    g1.addEdge(c5, c6);
    g1.addEdge(c5, c10);
    var e6 = g1.addEdge(c6, c8);
    g1.addEdge(c6, c9);
    g1.addEdge(c6, c10);
    g1.addEdge(c7, c9);
    g1.addEdge(c7, c10);
    g1.addEdge(c9, c10);
    g1.layout();
 
    av.step();

    label1 = av.label("<b>No</b>",{top:20}).css({"text-align": "center"}); 

    av.step();
    nl1.hide();
  
    av.umsg("<br><b>Example of Clique Problem: </b>");  

    nl1=av.label("In the graph below does there exist a clique of size >= $4$ ?"
,{top:-10}); 
    label1.hide();    
    av.step(); 

    label1 = av.label("<b>Yes</b>",{top:20}).css({"text-align": "center"}); 
    e1.css({"stroke": "LightCoral","stroke-width":"7"});
    e2.css({"stroke": "LightCoral","stroke-width":"7"});
    e3.css({"stroke": "LightCoral","stroke-width":"7"});
    e4.css({"stroke": "LightCoral","stroke-width":"7"});
    e5.css({"stroke": "LightCoral","stroke-width":"7"});
    e6.css({"stroke": "LightCoral","stroke-width":"7"});

    g1.layout();
  av.recorded();
});

