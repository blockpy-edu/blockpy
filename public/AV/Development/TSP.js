/*global ODSA, setPointerL */
//"use strict";
(function ($) {
//  var av = new JSAV(av_name);
  var av;
 var minC, minPath=[];
 var gnodes; //must be populated with the using g.nodes() befire calling getSol on g.
 var visited; //must be initialized to an array containing as many nodes as g, all setto zero, before calling getSol on g.
 var getSol= function(g,curr,start,path,length){
      visited[curr]=1;
      path.push(curr);
      var flag=0;
      for(var i=0;i<gnodes.length;i++){
          if(i==curr){
              continue;
          }
          if(visited[i]==1){
		continue;
          }
          flag=1;
          var newlength = length + g.getEdge(gnodes[curr],gnodes[i]).weight();
          if(minC >= 0 && newlength>=minC)
                continue;
          getSol(g,i,start,path,newlength);
      }
      if(flag==0){
          newlength = length + g.getEdge(gnodes[curr],gnodes[start]).weight();
          if(minC<0 || minC > newlength){
             minC=newlength;
             minPath = path.slice(0);
             path.pop();
             visited[curr]=0;
             return;  
          }
     }    
     path.pop();
     visited[curr]=0;
      return;
 };

 function runit(){
  av = new JSAV($('.avcontainer'));
  
  var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
  //slide2
  var y = 0;

    av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow introduces"+
" and explains the \"Traveling Salesman\" Problem.");


    av.displayInit();

    av.step();

  av.umsg("<br><b>Traveling Salesman</b>"); 

  av.umsg("<br><br><br>There are <i>n</i> cities. Every pair of cities is separated"
+" by some distance. A traveling salesman aims to visit them all in a way that no city"
+" is visited more than once and the total distance covered during the tour is as "
+"short as possible",{preserve:true}); 

 av.step();

  av.umsg("<br><br><br>This can be modelled as a complete graph where each node "
+"represents a particular city and the weight of the edges denote the distance"+
" between the two cities it connects. <br> The problem now can be stated as finding"+
" the shortest simple cycle in the graph that passes through all vertices in the graph. ( The length of a cycle being"
+" the sum of weights of all the edges included in the cycle",{preserve:true}); 

 av.umsg("<br><br><br>Note: A simple cycle may be defined as a closed walk with no repetitions of vertices and edges allowed, other than the repetition of the starting and ending vertex.</b>",{preserve:true});


  av.step();

  av.umsg("<br><br><br><b>An example :</b>",{preserve:true});

  var g1 = av.ds.graph({width: 400,  height: 200, layout: "manual",
  directed: false,top:250});
  var nodes = new Array(5);
  var x = 50;
  var y = 0;
  nodes[0] = g1.addNode("A",{left:x+50,top:y}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px","font-size":"75%", "background-color":"AntiqueWhite"});;
  nodes[1] = g1.addNode("B",{left:x+200,top:y}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px","font-size":"75%", "background-color":"AntiqueWhite"});;
  nodes[2] = g1.addNode("C",{left:x,top:y+75}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[3] = g1.addNode("D",{left:x+280,top:y+100}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[4] = g1.addNode("E",{left:x+150,top:y+150}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  for(i=0;i<4;i++)
      for(j=i+1;j<5;j++)
        g1.addEdge(nodes[j],nodes[i]).weight(2*i+j);
  g1.layout();
 /* minC=-1;
  gnodes=g1.nodes();
  visited = new Array(gnodes.length);
  for(var i in visited)
      visited[i]=0;
  getSol(g1,0,0,[],0);
  console.log(minPath);
*/
  av.step();
  label1 = av.label("The red edges form a minimum-length tour with total length being 24",{left:450,top:250});
  g1.getEdge(nodes[0],nodes[2]).css({"stroke" : "IndianRed","stroke-width":"5px",opacity:0.75});
  g1.getEdge(nodes[3],nodes[2]).css({"stroke" : "IndianRed","stroke-width":"5px",opacity:0.75});
  g1.getEdge(nodes[3],nodes[1]).css({"stroke" : "IndianRed","stroke-width":"5px",opacity:0.75});
  g1.getEdge(nodes[4],nodes[1]).css({"stroke" : "IndianRed","stroke-width":"5px",opacity:0.75});
  g1.getEdge(nodes[4],nodes[0]).css({"stroke" : "IndianRed","stroke-width":"5px",opacity:0.75});
 
  av.step();

  label1.hide();
  g1.hide();
  av.umsg("<br><b>The Traveling Salesman Problem</b>");
  av.umsg("<br><br><br>The Traveling Salesman problem can be defined either as a decision problem or not. The decision form is know to be NP-complete."
+  "<br><br><br>Given a graph G=(V,E), find the shortest simple cycle that passes through all vertices of the graph."+
"The length of the cycle is the sum of weights of its edges."
+"<br><br>OR<br><br>"
+"(Decision Problem Form:) Given a graph G=(V,E) and integer k, does the graph contain a simple cycle that passes through all vertices and has length <= k?"
,{preserve:true});


  av.step();

  av.umsg("<br><b>Example of Traveling Salesman Problem (decision form)</b>");
  var g = av.ds.graph({width: 600,  height: 450, layout: "manual",
  directed: false,left:100,top:30});
  nodes = new Array(7);
  var x = 0;
  var y = 0;
  nodes[0] = g.addNode("A",{left:x+200,top:y}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px","font-size":"75%", "background-color":"AntiqueWhite"});;
  nodes[1] = g.addNode("B",{left:x+440,top:y}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px","font-size":"75%", "background-color":"AntiqueWhite"});;
  nodes[2] = g.addNode("C",{left:x-5,top:y+130}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[3] = g.addNode("D",{left:x+550,top:y+140}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[4] = g.addNode("E",{left:x+5,top:y+250}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[5] = g.addNode("F",{left:x+540,top:y+300}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;
  nodes[6] = g.addNode("G",{left:x+175,top:y+360}).css({"width":"30px", "height":"30px",
"min-width":"30px", "min-height":"30px" ,"font-size":"75%","background-color":"AntiqueWhite"});;

  for(i=0;i<6;i++)
      for(j=i+1;j<7;j++)
        g.addEdge(nodes[j],nodes[i]).weight(2*i+j);
  g.layout();
  
/*  minC=-1;
  gnodes=g.nodes();
  visited = new Array(gnodes.length);
  for(var i in visited)
      visited[i]=0;
  getSol(g,0,0,[],0);
  console.log(minPath);
  console.log(minC);
*/
  av.umsg("<br><br> Does this graph have a simple cycle that includes all vertices and has length <= 50?",{preserve:true});
  av.step();
  av.umsg("<br><br><b>No</b>",{preserve:true});
  av.step();
  av.umsg("<br><b>Example of Traveling Salesman Problem</b>");
  av.umsg("<br><br> Does this graph have a simple cycle that includes all vertices and has length <= 55?",{preserve:true});
  av.step();
  av.umsg("<br><br><b>Yes</b> <br>[The following cycle has a length of 51]",{preserve:true});
  g.getEdge(nodes[0],nodes[3]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[4],nodes[3]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[4],nodes[1]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[5],nodes[1]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[5],nodes[2]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[6],nodes[2]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});
  g.getEdge(nodes[6],nodes[0]).css({"stroke" : "IndianRed","stroke-width":"8px",opacity:0.75});


 
  av.recorded();
}
  function about() {
    var mystring = "Introduction of Traveling Salesman Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));

