/*global ODSA, setPointerL */
//"use strict";
(function ($) {
//  var av = new JSAV(av_name);
  var av;
 
  function runit(){ 
    av = new JSAV($('.avcontainer'));
    var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
    var y = 0;
  
    av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow introduces"+
" and explains the \"Clique\"  Problem."
+"</b> <br><br><br> We start with some definitions  and background.");


    av.displayInit();

    av.step();
    av.umsg("<br><b>Clique </b>"
+"<br><br><br>A Clique is complete graph i.e. a graph where each node"+
" is connected to every other nodes by atleast one edge."); 

    av.step();

    var  g = av.ds.graph({width: 400, height: 450,
    layout: "manual", directed: false});
    x=20;
    y=100;

    av.umsg("<br><br><br> Example of a clique :",{preserve:true});

    g.addNode("A", {"left": x+150, "top": y+50});
    g.addNode("B", {"left": x+50, "top": y+100});
    g.addNode("C", {"left": x+250,"top": y+100});
    g.addNode("D", {"left": x+25, "top": y+200});
    g.addNode("E", {"left": x+275, "top": y+200});
    g.addNode("F", {"left": x+150, "top": y+250});

    var gnodes = g.nodes();
    for(i=0;i<6;i++)
        for(j=i+1;j<6;j++)
            g.addEdge(gnodes[i],gnodes[j]);

    g.layout();


    av.step();
    av.umsg("<b>Clique in a graph </b>");
    g.hide();
    y=0; 
    av.umsg("<br><br> If in a graph <i>G</i>, their exists a complete subgraph of "+
"<i>k</i> nodes, <i>G</i> is said to contain a <i>k-clique</i>  ",{preserve:true}); 

    av.step();
    label1 = av.label("<br><br><br> For example The following graph contains a "+
"<i>3-clique</i>",{top:0,left:0}); 

    var  g3 = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false});
    x=50;
    y=50;
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
    label1.hide();
    g3.hide();


    av.umsg("<br><br><br> The clique with largest number of vertices in a graph <i>G</i>"
+" is called Maximum Clique in <i>G</i> ",{preserve:true}); 
    av.step();
    label1 = av.label("<br><br><br> For e.g Maximum Clique in the "+
"graph is a <i>4-clique</i>",{top:0,left:0}); 
    g3.show();
    ne1.css({"stroke":"LightCoral","stroke-width":"5"});
    ne4.css({"stroke":"LightCoral","stroke-width":"5"});
    ne5.css({"stroke":"LightCoral","stroke-width":"5"});


    g3.layout();


    av.step();
    g3.hide();
    label1.hide();
    av.umsg("<b>The Clique Problem </b>");
    av.umsg("<br><br><br>The Clique Problem can be defined as either "
+"of the following: ",{preserve:true});
    av.umsg("<br><br><br><b>Given a graph <i> G = (V , E) </i>, find the Maximum "
+"Clique in <i>G</i>.</b>",{preserve:true});
    av.umsg("<br><br><br>Or",{preserve:true});
    av.umsg("<br><br><br><b>Given a graph <i> G = (V , E) </i>, and an number "
+"<i>k</i>, does <i>G</i> contain a Clique of size >= <i>k</i> ?</b> ",{preserve:true});

    av.step();

    var  g1 = av.ds.graph({width: 400, height: 450,
    layout: "manual", directed: false});

    label1.hide();

    av.umsg("<b>Example of Clique Problem: </b>");  

    av.umsg("<br><br><br>In the graph below does there exist a clique of size >=5 ?"
,{preserve:true}); 
 
    x=20;
    y = 350
    var c7 = g1.addNode("a", {"left":x , "top":y });
    var c4 = g1.addNode("b", {"left":x+150 , "top":y+20 });
    var c5 = g1.addNode("c", {"left":x+300, "top":y });
    var c10 = g1.addNode("d", {"left":x-20, "top":y-120 });
    var c9 = g1.addNode("e", {"left":x+200, "top":y-80 });
    var c3 = g1.addNode("f", {"left":x+320, "top":y-140 });
    var c2 = g1.addNode("g", {"left":x+120, "top":y-190 });
    var c6 = g1.addNode("h", {"left":x+215, "top":y-190 });
    var c1 = g1.addNode("i", {"left":x+100, "top":y-290 });
    var c8 = g1.addNode("j", {"left":x+195, "top":y-290 });

    e1 = g1.addEdge(c1, c2);
    e2 = g1.addEdge(c1, c6);
    e3 = g1.addEdge(c1, c8);
    g1.addEdge(c1, c10);
    e4 = g1.addEdge(c2, c8);
    e5 = g1.addEdge(c2, c6);
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
    e6 = g1.addEdge(c6, c8);
    g1.addEdge(c6, c9);
    g1.addEdge(c6, c10);
    g1.addEdge(c7, c9);
    g1.addEdge(c7, c10);
    g1.addEdge(c9, c10);
    g1.layout();
 
    av.step();

    label1 = av.label("<b>No</b>",{top:20}).css({"text-align": "center"}); 

    av.step();

  
    av.umsg("<b>Example of Clique Problem: </b>");  

    av.umsg("<br><br><br>In the graph below does there exist a clique of size >= 4 ?"
,{preserve:true}); 
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
}
  function about() {
    var mystring = "Introduction of Clique Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));

