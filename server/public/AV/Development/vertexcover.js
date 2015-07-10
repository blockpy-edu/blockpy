/*global ODSA, setPointerL */
//"use strict";
(function ($) {
//  var av = new JSAV(av_name);
  var av;
 
 function runit(){

  av = new JSAV($('.avcontainer'));
  
  var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
  //slide2
  var y = 0;

  av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow introduces"+
" and explains the \"Vertex Cover\" Problem."
+"</b> <br><br><br> We start with some definitions  and background.");


    av.displayInit();

    av.step();

  av.umsg("<br><b>Vertex Cover</b>"); 

   av.umsg("<br><br><br>A Vertex Cover of a graph is a set of vertices such that "+
"any edge of the graph is incident on at least one vertex of the set.",
{preserve:true}); 
  av.step();

  av.umsg("<br><br><br>The smallest possible Vertex Cover of a graph is called "+
"the \"Minimum Vertex cover\".",{preserve:true});

  av.step();

  var  g = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false});
  x=50;
  y=50;
  var c1 = g.addNode("1", {"left": x-70, "top": y+100});
  var c2 = g.addNode("2", {"left": x+35, "top": y+100});
  var c3 = g.addNode("3", {"left": x+160,"top": y+100});
  var c4 = g.addNode("4", {"left": x-70, "top": y+200});
  var c5 = g.addNode("5", {"left": x+35, "top": y+200});
  var c6 = g.addNode("6", {"left": x+160, "top": y+200});
  var c7 = g.addNode("7", {"left": x+260, "top": y+200});
  
 
  var e1 = g.addEdge(c1, c2);
  var e2 = g.addEdge(c1, c4);
  var e3 = g.addEdge(c2, c3);
  var e4 = g.addEdge(c2, c5);
  var e5 = g.addEdge(c3, c5);
  var e6 = g.addEdge(c5, c6);
  var e7 = g.addEdge(c3, c6);
  var e8 = g.addEdge(c3, c7);

  c3.css({"background-color":"Brown"});
  e3.css({"stroke":"Brown","stroke-width":"2"});
  e5.css({"stroke":"Brown","stroke-width":"2"});
  e7.css({"stroke":"Brown","stroke-width":"2"});
  e8.css({"stroke":"Brown","stroke-width":"2"});

  c5.css({"background-color":"#669966"});
  e4.css({"stroke":"#669966","stroke-width":"2"});
  e6.css({"stroke":"#669966","stroke-width":"2"});

  c1.css({"background-color":"#996699"});
  e1.css({"stroke":"#996699","stroke-width":"2"});
  e2.css({"stroke":"#996699","stroke-width":"2"});

  g.layout();
  g.show();
  //slide 3

   av.step();
   label1 = av.label("The colored vertices in this graph form a Vertex Cover."
,{left:500,top: 150});
   label2 = av.label("The Vertex Cover is {1, 3, 5}",{left:500,top: 200});
  
   av.step();

   av.umsg("<br><b>Example of Vertex Cover in graph </b>");
   g.hide();
   label1.hide();
   label2.hide();
  y=0; 
  av.umsg("<br><br><br>The following graph contains a Vertex Cover  of size"+
" 6. (i.e. {1,2,3,6,9,10})",{preserve:true}); 

  x=50;
  y=100;
  var  g1 = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false});

  var ca1 = g1.addNode("1", {"left": x+100, "top": y+70});
  var ca2 = g1.addNode("2", {"left": x+10, "top": y+125});
  var ca3 = g1.addNode("3", {"left": x+190,"top": y+125});
  var ca4 = g1.addNode("4", {"left": x+35, "top": y+220});
  var ca5 = g1.addNode("5", {"left": x+165, "top": y+220});
  var ca6 = g1.addNode("6", {"left": x+100, "top": y-20});
  var ca7 = g1.addNode("7", {"left": x-70, "top": y+80});
  var ca8 = g1.addNode("8", {"left": x+270, "top": y+80});
  var ca9 = g1.addNode("9", {"left": x-45, "top": y+280});
  var ca10 = g1.addNode("10", {"left": x+245, "top": y+280});
  
 
  var ea1 = g1.addEdge(ca1, ca6);
  var ea2 = g1.addEdge(ca1, ca4);
  var ea3 = g1.addEdge(ca1, ca5);
  var ea4 = g1.addEdge(ca2, ca7);
  var ea5 = g1.addEdge(ca2, ca3);
  var ea6 = g1.addEdge(ca2, ca5);
  var ea7 = g1.addEdge(ca3, ca8);
  var ea8 = g1.addEdge(ca3, ca4);
  var ea9 = g1.addEdge(ca4, ca9);
  var ea10 = g1.addEdge(ca5, ca10);

  var ea11 = g1.addEdge(ca6, ca8);
  var ea12 = g1.addEdge(ca6, ca7);
  var ea13 = g1.addEdge(ca9, ca7);
  var ea14 = g1.addEdge(ca8, ca10);
  var ea15 = g1.addEdge(ca9, ca10);

  ca6.css({"background-color":"Brown"});
  ea1.css({"stroke":"Brown","stroke-width":"2"});
  ea11.css({"stroke":"Brown","stroke-width":"2"});
  ea12.css({"stroke":"Brown","stroke-width":"2"});

  ca1.css({"background-color":"#669966"});
  ea2.css({"stroke":"#669966","stroke-width":"2"});
  ea3.css({"stroke":"#669966","stroke-width":"2"});


  ca2.css({"background-color":"Silver"});
  ea4.css({"stroke":"Silver","stroke-width":"2"});
  ea5.css({"stroke":"Silver","stroke-width":"2"});
  ea6.css({"stroke":"Silver","stroke-width":"2"});



  ca3.css({"background-color":"#996699"});
  ea7.css({"stroke":"#996699","stroke-width":"2"});
  ea8.css({"stroke":"#996699","stroke-width":"2"});



  ca10.css({"background-color":"#00CCCC"});
  ea10.css({"stroke":"#00CCCC","stroke-width":"2"});
  ea14.css({"stroke":"#00CCCC","stroke-width":"2"});
  ea15.css({"stroke":"#00CCCC","stroke-width":"2"});


  ca9.css({"background-color":"#FF6699"});
  ea9.css({"stroke":"#FF6699","stroke-width":"2"});
  ea13.css({"stroke":"#FF6699","stroke-width":"2"});

  g1.layout();
  g1.show();
//slide 4 
 av.step();
 y=0;
   av.umsg("<br><b>Example of Vertex Cover in graph </b>");
   g1.hide();
  av.umsg("<br><br><br>The following graph contains a Vertex Cover  of size"+
" 3. (i.e. {1,2,3})",{preserve:true}); 
 
  x=50;
  y=70;

  var  g2 = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false});
  var cb1 = g2.addNode("1", {"left": x+50, "top": y+50});
  var cb2 = g2.addNode("2", {"left": x+50, "top": y+150});
  var cb3 = g2.addNode("3", {"left": x+50,"top": y+250});
  var cb4 = g2.addNode("4", {"left": x+250, "top": y});
  var cb5 = g2.addNode("5", {"left": x+250, "top": y+100});
  var cb6 = g2.addNode("6", {"left": x+250, "top": y+200});
  var cb7 = g2.addNode("7", {"left": x+250, "top": y+300});
  
 
  var eb1 = g2.addEdge(cb1, cb5);
  var eb2 = g2.addEdge(cb1, cb6);
  var eb3 = g2.addEdge(cb2, cb4);
  var eb4 = g2.addEdge(cb2, cb6);
  var eb5 = g2.addEdge(cb2, cb7);
  var eb6 = g2.addEdge(cb3, cb5);
  var eb7 = g2.addEdge(cb3, cb6);
  var eb8 = g2.addEdge(cb1, cb4);
  var eb9 = g2.addEdge(cb3, cb7);
  var eb10 = g2.addEdge(cb2, cb5);

  cb1.css({"background-color":"Brown"});
  eb1.css({"stroke":"Brown","stroke-width":"2"});
  eb2.css({"stroke":"Brown","stroke-width":"2"});
  eb8.css({"stroke":"Brown","stroke-width":"2"});

  cb2.css({"background-color":"#669966"});
  eb3.css({"stroke":"#669966","stroke-width":"2"});
  eb4.css({"stroke":"#669966","stroke-width":"2"});
  eb5.css({"stroke":"#669966","stroke-width":"2"});

  cb3.css({"background-color":"#996699"});
  eb6.css({"stroke":"#996699","stroke-width":"2"});
  eb7.css({"stroke":"#996699","stroke-width":"2"});
  eb9.css({"stroke":"#996699","stroke-width":"2"});

  g2.layout();
  g2.show();



 //slide 5 
  av.step();
  label2.hide();
  g2.hide();
    av.umsg("<br><b>The Vertex Cover Problem </b>");
    av.umsg("<br><br><br>The Vertex Cover Problem can be defined as either "
+"of the following: ",{preserve:true});
    av.umsg("<br><br><br><b>Given a graph <i> G = (V , E) </i>, find the Minimum "
+"Vertex Cover in <i>G</i>.</b>",{preserve:true});
    av.umsg("<br><br><br>Or",{preserve:true});
    av.umsg("<br><br><br><b>Given a graph <i> G = (V , E) </i>, and a number "
+"<i>k</i>, does <i>G</i> contain an Vertex Cover of size <= <i>k</i> ?</b>",{preserve:true});


  av.step();
  y=0;



  av.umsg("<br><b>Example of Vertex Cover Problem: </b>");  

  av.umsg("<br><br><br>Does the graph below have a vertex cover of size "
+"<=3 ?",{preserve:true}); 

  x=50;
  y=100;

  var  g4 = av.ds.graph({width: 400, height: 450,layout: "manual", directed: false});
  var cc1 = g4.addNode("1", {"left": x+100, "top": y+70});
  var cc2 = g4.addNode("2", {"left": x+10, "top": y+125});
  var cc3 = g4.addNode("3", {"left": x+190,"top": y+125});
  var cc4 = g4.addNode("4", {"left": x+35, "top": y+220});
  var cc5 = g4.addNode("5", {"left": x+165, "top": y+220});
  var cc6 = g4.addNode("6", {"left": x+100, "top": y-20});
  var cc7 = g4.addNode("7", {"left": x-70, "top": y+80});
  var cc8 = g4.addNode("8", {"left": x+270, "top": y+80});
  var cc9 = g4.addNode("9", {"left": x-45, "top": y+280});
  var cc10 = g4.addNode("10", {"left": x+245, "top": y+280});
  
 
  var ec1 = g4.addEdge(cc1, cc6);
  var ec2 = g4.addEdge(cc1, cc4);
  var ec3 = g4.addEdge(cc1, cc5);
  var ec4 = g4.addEdge(cc2, cc7);
  var ec5 = g4.addEdge(cc2, cc3);
  var ec6 = g4.addEdge(cc2, cc5);
  var ec7 = g4.addEdge(cc3, cc8);
  var ec8 = g4.addEdge(cc3, cc4);
  var ec10 = g4.addEdge(cc5, cc10);
  var ec11 = g4.addEdge(cc2, cc6);
  var ec12 = g4.addEdge(cc2, cc9);
  var ec13 = g4.addEdge(cc3, cc6);
  var ec14 = g4.addEdge(cc3, cc10);
  var ec16 = g4.addEdge(cc4, cc10);
  var ec17 = g4.addEdge(cc10, cc9);
  var ec19 = g4.addEdge(cc1, cc7);
  var ec20 = g4.addEdge(cc1, cc8);


  g4.layout();
  g4.show();

  av.step();

  label2 = av.label("<b>No</b>",{top:40}).css({"text-align": "center"}); 
  g4.show();


  av.step();
  label2.hide();
  av.umsg("<br><b>Example of Vertex Cover Problem: </b>");  
  g4.show();
  

  av.umsg("<br><br><br>Does the graph below have a vertex cover of size "
+"<=4 ?",{preserve:true}); 

  av.step();

  y=0;

  label2 = av.label("<b>Yes</b>",{top:40}).css({"text-align": "center"}); 
  label2.show();


  cc1.css({"background-color":"Brown"});
  cc2.css({"background-color":"#669966"});
  cc3.css({"background-color":"#996699"});
  cc10.css({"background-color":"#00CCCC"});


  ec1.css({"stroke":"Brown" ,"stroke-width":"2"});
  ec2.css({"stroke":"Brown" ,"stroke-width":"2"});
  ec3.css({"stroke":"Brown" ,"stroke-width":"2"});
  ec4.css({"stroke":"#669966" ,"stroke-width":"2"});
  ec5.css({"stroke":"#669966" ,"stroke-width":"2"});
  ec6.css({"stroke":"#669966" ,"stroke-width":"2"});
  ec7.css({"stroke":"#996699" ,"stroke-width":"2"});
  ec8.css({"stroke":"#996699" ,"stroke-width":"2"});
  ec10.css({"stroke":"#00CCCC" ,"stroke-width":"2"});
  ec11.css({"stroke":"#669966" ,"stroke-width":"2"});
  ec12.css({"stroke":"#669966" ,"stroke-width":"2"});
  ec13.css({"stroke":"#996699" ,"stroke-width":"2"});
  ec14.css({"stroke": "#996699","stroke-width":"2"});
  ec16.css({"stroke":"#00CCCC" ,"stroke-width":"2"});
  ec17.css({"stroke":"#00CCCC" ,"stroke-width":"2"});
  ec19.css({"stroke":"Brown" ,"stroke-width":"2"});
  ec20.css({"stroke":"Brown" ,"stroke-width":"2"});

  g4.show();
  av.recorded();
}
  function about() {
    var mystring = "Introduction of Vertex Cover Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));

