"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var code;
  var set;
  var label_set = [];
  function runit() {
    av = new JSAV($(".avcontainer"));
    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
    $(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }); 
    $(".avcontainer").on("jsav-updatecounter", function(){ 
      // invoke MathJax to do conversion again 
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]); 
    });
    set = av.g.set(); //Graphical primitive set to hold the entire tree in a single JSAV object 
    av.umsg("We will illustrate the Sorting Lower bound proof by showing the resulted decision tree that models the processing of InsertionSort on an array of 3 elements XYZ");	
    av.displayInit();
    av.umsg("There are $6$ possible permutations of the array values XYZ, only one of them represents the sorted array");
    label_set.push(av.label("XYZ", {"top": "-13px", "left": "395px"}).css({'font-size': '16px', "text-align": "center"}));
    set.push(av.g.rect(360, 2, 100, 20).css({"fill":"orange", "opacity":"0.5"}));
    set.push(av.g.rect(360, 22, 100, 80));
    label_set.push(av.label("XYZ YZX<br>XZY ZXY<br>YXZ ZYX", {"top": "20px", "left": "380px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("The first step in insertion sort is to compare the second element Y with the first element X");
    label_set.push(av.label("$Y < X?$", {"top": "95px", "left": "390px"}).css({'font-size': '12px', "text-align": "center"}));
    av.step();
    av.umsg("If Y is less than X, the two values are swapped, and then we will end up having only $3$ permutations");
    var left_branch_1 = av.g.line(360, 100, 300, 140);
    set.push(left_branch_1);
    label_set.push(av.label("Yes", {"top": "90px", "left": "310px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.rect(275, 140, 50, 20).css({"fill":"orange", "opacity":"0.5"}));
    label_set.push(av.label("YXZ", {"top": "126px", "left": "285px"}).css({'font-size': '16px', "text-align": "center"}));
    set.push(av.g.rect(275, 160, 50, 80));
    label_set.push(av.label("YXZ<br>YZX<br>ZYX", {"top": "155px", "left": "285px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("If Y is not less than X, no swap will occur and we will end up having only $3$ permutations")
    var right_branch_1 = av.g.line(460, 100, 520, 140);
    set.push(right_branch_1);
    label_set.push(av.label("No", {"top": "90px", "left": "485px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.rect(495, 140, 50, 20).css({"fill":"orange", "opacity":"0.5"}));
    label_set.push(av.label("XYZ", {"top": "126px", "left": "505px"}).css({'font-size': '16px', "text-align": "center"}));
    set.push(av.g.rect(495, 160, 50, 80));
    label_set.push(av.label("XYZ<br>XZY<br>ZXY", {"top": "155px", "left": "505px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("Let us assume for the moment that Y is less than X and so the left branch is taken");
    left_branch_1.css({"stroke-width": 3, "stroke":"red"});
    av.step();
    av.umsg("The third element Z is compared to the second element X");
    label_set.push(av.label("$Z < X?$", {"top": "235px", "left": "275px"}).css({'font-size': '12px', "text-align": "center"}));
    av.step();
    av.umsg("Again, there are two possibilities. If Z is less than X, then these items should be swapped and we will end up having $2$ permutations");
    var left_branch_2 = av.g.line(275, 240, 215, 280);
    set.push(left_branch_2);
    label_set.push(av.label("Yes", {"top": "230px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.rect(190, 280, 50, 20).css({"fill":"orange", "opacity":"0.5"}));
    label_set.push(av.label("YZX", {"top": "266px", "left": "200px"}).css({'font-size': '16px', "text-align": "center"}));
    set.push(av.g.rect(190, 300, 50, 40));
    label_set.push(av.label("YZX<br>ZYX", {"top": "287px", "left": "200px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("If Z is not less than X, no swap will occur and we will end up having only $1$ permutation and InsertionSort is complete");
    set.push(av.g.line(325, 240, 385, 280));
    label_set.push(av.label("No", {"top": "230px", "left": "350px"}).css({'font-size': '12px', "text-align": "center"}));
    var leaf1 = av.g.rect(360, 280, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf1);
    label_set.push(av.label("YXZ", {"top": "266px", "left": "370px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("If the left branch was taken, Z is then compared to Y and InsertionSort will be completed regardless of the comparision result");
    left_branch_2.css({"stroke-width": 3, "stroke":"red"});
    label_set.push(av.label("$Z < Y?$", {"top": "335px", "left": "190px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.line(190, 340, 130, 380));
    set.push(av.g.line(240, 340, 300, 380));
    label_set.push(av.label("Yes", {"top": "330px", "left": "140px"}).css({'font-size': '12px', "text-align": "center"}));
    label_set.push(av.label("No", {"top": "330px", "left": "265px"}).css({'font-size': '12px', "text-align": "center"}));
    var leaf2 = av.g.rect(105, 380, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf2);
    label_set.push(av.label("ZYX", {"top": "366px", "left": "115px"}).css({'font-size': '16px', "text-align": "center"}));
    var leaf3 = av.g.rect(275, 380, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf3);
    label_set.push(av.label("YZX", {"top": "366px", "left": "285px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("In the first comparison, if the right branch was taken, the third element Z is then compared to the second element Y");
    left_branch_1.css({"stroke-width": 1, "stroke":"black"});
    left_branch_2.css({"stroke-width": 1, "stroke":"black"});
    right_branch_1.css({"stroke-width": 3, "stroke":"red"});
    label_set.push(av.label("$Z < Y?$", {"top": "230px", "left": "495px"}).css({'font-size': '12px', "text-align": "center"}));
    av.step();
    av.umsg("If Z is less than Y, the two values are swapped, and then we will end up having only $2$ permutations")
    var left_branch_3 = av.g.line(495, 240, 445, 280);
    set.push(left_branch_3);
    label_set.push(av.label("Yes", {"top": "230px", "left": "445px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.rect(420, 280, 50, 20).css({"fill":"orange", "opacity":"0.5"}));
    label_set.push(av.label("XZY", {"top": "266px", "left": "430px"}).css({'font-size': '16px', "text-align": "center"}));
    set.push(av.g.rect(420, 300, 50, 40));
    label_set.push(av.label("XZY<br>ZXY", {"top": "287px", "left": "430px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("If Z is not less than Y, no swap will occur and we will end up having only $1$ permutation and InsertionSort is complete");
    set.push(av.g.line(545, 240, 595, 280));
    label_set.push(av.label("No", {"top": "230px", "left": "570px"}).css({'font-size': '12px', "text-align": "center"}));
    var leaf4 = av.g.rect(570, 280, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf4);
    label_set.push(av.label("XYZ", {"top": "266px", "left": "580px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    av.umsg("If the left branch was taken, Z is then compared to X and InsertionSort will be completed regardless of the comparision result");
    left_branch_3.css({"stroke-width": 3, "stroke":"red"});
    label_set.push(av.label("$Z < X?$", {"top": "335px", "left": "420px"}).css({'font-size': '12px', "text-align": "center"}));
    set.push(av.g.line(420, 340, 360, 380));
    set.push(av.g.line(470, 340, 530, 380));
    label_set.push(av.label("Yes", {"top": "330px", "left": "370px"}).css({'font-size': '12px', "text-align": "center"}));
    label_set.push(av.label("No", {"top": "330px", "left": "505px"}).css({'font-size': '12px', "text-align": "center"}));
    var leaf5 = av.g.rect(335, 380, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf5);
    label_set.push(av.label("ZYX", {"top": "366px", "left": "345px"}).css({'font-size': '16px', "text-align": "center"}));
    var leaf6 = av.g.rect(505, 380, 50, 20).css({"fill":"green", "opacity":"0.5"});
    set.push(leaf6);
    label_set.push(av.label("YZX", {"top": "366px", "left": "515px"}).css({'font-size': '16px', "text-align": "center"}));
    av.step();
    right_branch_1.css({"stroke-width": 1, "stroke":"black"});
    left_branch_3.css({"stroke-width": 1, "stroke":"black"});
    av.umsg("The cost of the algorithm (In worst, best, and average cases) is determined by the depth of the nodes indicating the number of comparasions required to reach that node");
    av.step();
    av.umsg("The worst case of the algorithm is determined by the depth of the deepest node(s)");
    leaf2.css({"fill":"red", "opacity":"0.5"});
    leaf3.css({"fill":"red", "opacity":"0.5"});
    leaf5.css({"fill":"red", "opacity":"0.5"});
    leaf6.css({"fill":"red", "opacity":"0.5"});
    av.step();
    hideTree();
    av.umsg("Each Sorting algorithm has its own decision tree with different maximum depths");
    //First Tree
    av.g.rect(150, 10, 50, 20);
    av.g.line(150, 30, 100, 50);
    av.g.line(200, 30, 250, 50);
    av.g.rect(75, 50, 50, 20);
    av.g.rect(225, 50, 50, 20);
    av.g.line(75, 70, 60, 90);
    av.g.line(125, 70, 140, 90);
    av.g.line(225, 70, 210, 90);
    av.g.line(275, 70, 290, 90);
    av.g.rect(40, 90, 50, 20);
    av.g.rect(110, 90, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(190, 90, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(260, 90, 50, 20);
    av.g.line(40, 110, 25, 130);
    av.g.line(90, 110, 105, 130);
    av.g.line(260, 110, 245, 130);
    av.g.line(310, 110, 325, 130);
    av.g.rect(0, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(75, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(220, 130, 50, 20);
    av.g.rect(300, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.line(220, 150, 205, 170);
    av.g.line(270, 150, 285, 170);
    var n1 = av.g.rect(180, 170, 50, 20).css({"fill":"red", "opacity":"0.5"});
    var n2 = av.g.rect(260, 170, 50, 20).css({"fill":"red", "opacity":"0.5"});
    //Second Tree
    av.g.rect(550, 10, 50, 20);
    av.g.line(550, 30, 500, 50);
    av.g.line(600, 30, 650, 50);
    av.g.rect(475, 50, 50, 20);
    av.g.rect(625, 50, 50, 20);
    av.g.line(475, 70, 460, 90);
    av.g.line(525, 70, 540, 90);
    av.g.line(625, 70, 610, 90);
    av.g.line(675, 70, 690, 90);
    av.g.rect(440, 90, 50, 20);
    av.g.rect(510, 90, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(590, 90, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(660, 90, 50, 20);
    av.g.line(440, 110, 425, 130);
    av.g.line(490, 110, 505, 130);
    av.g.line(660, 110, 645, 130);
    av.g.line(710, 110, 725, 130);
    av.g.rect(400, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(475, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(620, 130, 50, 20);
    av.g.rect(700, 130, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.line(620, 150, 605, 170);
    av.g.line(670, 150, 685, 170);
    av.g.rect(580, 170, 50, 20).css({"fill":"green", "opacity":"0.5"});
    av.g.rect(660, 170, 50, 20);
    av.g.line(660, 190, 645, 210);
    av.g.line(710, 190, 725, 210);
    av.g.rect(620, 210, 50, 20).css({"fill":"red", "opacity":"0.5"});
    av.g.rect(700, 210, 50, 20).css({"fill":"red", "opacity":"0.5"});
    av.step();
    av.umsg("The best algorithm will be the one with the shallowest deepest node");
    var highlighter = av.g.rect(0, 0, 350, 200).css({"fill":"lightblue", "opacity":"0.5"});
    av.step();
    av.umsg("The depth of the shallowest deepest node depends on the number of nodes in the decision tree");
    highlighter.hide();
    n1.css({"fill":"blue", "opacity":"0.5"});
    n2.css({"fill":"blue", "opacity":"0.5"});
    av.step();
    av.umsg("The minimum number of nodes that must be in the decision tree for any comparison-based sorting algorithm for $n$ values should be $n!$ since the decision tree must have at least $n!$ leaf nodes, since at least one leaf node will correspond to each input permutation");
    av.step();
    av.umsg("A tree with $n$ nodes requires a minimum of $\\log n$ levels.");
    av.step();
    av.umsg("Because there are at least $n!$ nodes in the tree, we know that the tree must have $\\Omega(\\log{n!})$ levels");
    av.step();
    av.umsg("Accordingly, the decision tree for any comparison-based sorting algorithm must have at least one node that is $\\Omega(n\\log{n})$ levels deep. This deepest node represents the algorithm's worst case.");
    av.step();
    av.umsg("So in the worst case, any such sorting algorithm must require $\\Omega(n\\log{n})$ comparisons");
    av.recorded();   
  }
  function hideTree(){
    set.hide();
    for(var i = 0; i < label_set.length; i++){
      label_set[i].hide();
    }
  }
  function about() {
    var mystring =
    "Sorting Lower Bound Proof\nWritten by Mohammed Fawzi and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more Information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
