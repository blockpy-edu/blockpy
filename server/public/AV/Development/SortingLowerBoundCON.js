/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Sorting Lower Bound
$(document).ready(function () {
  var av_name = "SortingLowerBoundCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var set = av.g.set(); //Graphical primitive set to hold the entire tree in a single JSAV object;
  var label_set = [];
  
  var hideTree = function () {
    set.hide();
    for (var i = 0; i < label_set.length; i++) {
      label_set[i].hide();
    }
  };
  
  // Slide 1  
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  label_set.push(av.label("XYZ", {"top": "-13px", "left": "395px"}).css({'font-size': '16px',    "text-align": "center"}));
  set.push(av.g.rect(360, 2, 100, 20).css({"fill": "orange", "opacity": "0.5"}));
  set.push(av.g.rect(360, 22, 100, 80));
  label_set.push(av.label("XYZ YZX<br>XZY ZXY<br>YXZ ZYX", {"top": "15px", "left": "380px"}).css({'font-size': '16px', "text-align": "center"}));
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  label_set.push(av.label("$Y < X?$", {"top": "95px", "left": "390px"}).css({'font-size': '12px', "text-align": "center"}));
  av.step();
  
  // Slide 4
  av.umsg(interpret("Slide 4"));
  var left_branch_1 = av.g.line(360, 100, 300, 140);
  set.push(left_branch_1);
  label_set.push(av.label("Yes", {"top": "90px", "left": "310px"}).css({'font-size': '12px', "text-align": "center"}));
  set.push(av.g.rect(275, 140, 50, 20).css({"fill": "orange", "opacity": "0.5"}));
  label_set.push(av.label("YXZ", {"top": "126px", "left": "285px"}).css({'font-size': '16px',  "text-align": "center"}));
  set.push(av.g.rect(275, 160, 50, 80));
  label_set.push(av.label("YXZ<br>YZX<br>ZYX", {"top": "155px", "left": "285px"}).css({'font-size':  '16px', "text-align": "center"}));
  av.step();
  
  // Slide 5
  av.umsg(interpret("Slide 5"));
  var right_branch_1 = av.g.line(460, 100, 520, 140);
  set.push(right_branch_1);
  label_set.push(av.label("No", {"top": "90px", "left": "485px"}).css({'font-size': '12px', "text-align": "center"}));
  set.push(av.g.rect(495, 140, 50, 20).css({"fill": "orange", "opacity": "0.5"}));
  label_set.push(av.label("XYZ", {"top": "126px", "left": "505px"}).css({'font-size': '16px', "text-align": "center"}));
  set.push(av.g.rect(495, 160, 50, 80));
  label_set.push(av.label("XYZ<br>XZY<br>ZXY", {"top": "155px", "left": "505px"}).css({'font-size':  '16px', "text-align": "center"}));
  av.step();
  
  // Slide 6
  av.umsg(interpret("Slide 6"));
  left_branch_1.css({"stroke-width": 3, "stroke": "red"});
  av.step();
  
  // Slide 7
  av.umsg(interpret("Slide 7"));
  label_set.push(av.label("$Z < X?$", {"top": "235px", "left": "275px"}).css({'font-size': '12px', "text-align": "center"}));
  av.step();
  
  // Slide 8
  av.umsg(interpret("Slide 8"));
  var left_branch_2 = av.g.line(275, 240, 215, 280);
  set.push(left_branch_2);
  label_set.push(av.label("Yes", {"top": "230px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"}));
  set.push(av.g.rect(190, 280, 50, 20).css({"fill": "orange", "opacity": "0.5"}));
  label_set.push(av.label("YZX", {"top": "266px", "left": "200px"}).css({'font-size': '16px',  "text-align": "center"}));
  set.push(av.g.rect(190, 300, 50, 40));
  label_set.push(av.label("YZX<br>ZYX", {"top": "282px", "left": "200px"}).css({'font-size': '16px', "text-align": "center"}));
  av.step();
  
  // Slide 9
  av.umsg(interpret("Slide 9"));
  set.push(av.g.line(325, 240, 385, 280));
  label_set.push(av.label("No", {"top": "230px", "left": "350px"}).css({'font-size': '12px', "text-align": "center"}));
  var leaf1 = av.g.rect(360, 280, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf1);
  label_set.push(av.label("YXZ", {"top": "266px", "left": "370px"}).css({'font-size': '16px', "text-align": "center"}));
  av.step();
  
  // Slide 10
  av.umsg(interpret("Slide 10"));
  left_branch_2.css({"stroke-width": 3, "stroke": "red"});
  label_set.push(av.label("$Z < Y?$", {"top": "335px", "left": "190px"}).css({'font-size': '12px',  "text-align": "center"}));
  set.push(av.g.line(190, 340, 130, 380));
  set.push(av.g.line(240, 340, 300, 380));
  label_set.push(av.label("Yes", {"top": "330px", "left": "140px"}).css({'font-size': '12px',  "text-align": "center"}));
  label_set.push(av.label("No", {"top": "330px", "left": "265px"}).css({'font-size': '12px',  "text-align": "center"}));
  var leaf2 = av.g.rect(105, 380, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf2);
  label_set.push(av.label("ZYX", {"top": "366px", "left": "115px"}).css({'font-size': '16px',  "text-align": "center"}));
  var leaf3 = av.g.rect(275, 380, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf3);
  label_set.push(av.label("YZX", {"top": "366px", "left": "285px"}).css({'font-size': '16px',  "text-align": "center"}));
  av.step();
  
  // Slide 11
  av.umsg(interpret("Slide 11"));
  left_branch_1.css({"stroke-width": 1, "stroke": "black"});
  left_branch_2.css({"stroke-width": 1, "stroke": "black"});
  right_branch_1.css({"stroke-width": 3, "stroke": "red"});
  label_set.push(av.label("$Z < Y?$", {"top": "230px", "left": "495px"}).css({'font-size': '12px',  "text-align": "center"}));
  av.step();
  
  // Slide 12
  av.umsg(interpret("Slide 12"));
  var left_branch_3 = av.g.line(495, 240, 445, 280);
  set.push(left_branch_3);
  label_set.push(av.label("Yes", {"top": "230px", "left": "445px"}).css({'font-size': '12px',  "text-align": "center"}));
  set.push(av.g.rect(420, 280, 50, 20).css({"fill": "orange", "opacity": "0.5"}));
  label_set.push(av.label("XZY", {"top": "266px", "left": "430px"}).css({'font-size': '16px',   "text-align": "center"}));
  set.push(av.g.rect(420, 300, 50, 40));
  label_set.push(av.label("XZY<br>ZXY", {"top": "282px", "left": "430px"}).css({'font-size': '16px',   "text-align": "center"}));
  av.step();
  
  // Slide 13
  av.umsg(interpret("Slide 13"));
  set.push(av.g.line(545, 240, 595, 280));
  label_set.push(av.label("No", {"top": "230px", "left": "570px"}).css({'font-size': '12px', "text-align": "center"}));
  var leaf4 = av.g.rect(570, 280, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf4);
  label_set.push(av.label("XYZ", {"top": "266px", "left": "580px"}).css({'font-size': '16px',  "text-align": "center"}));
  av.step();
  
  // Slide 14
  av.umsg(interpret("Slide 14"));
  left_branch_3.css({"stroke-width": 3, "stroke": "red"});
  label_set.push(av.label("$Z < X?$", {"top": "335px", "left": "420px"}).css({'font-size': '12px', "text-align": "center"}));
  set.push(av.g.line(420, 340, 360, 380));
  set.push(av.g.line(470, 340, 530, 380));
  label_set.push(av.label("Yes", {"top": "330px", "left": "370px"}).css({'font-size': '12px',   "text-align": "center"}));
  label_set.push(av.label("No", {"top": "330px", "left": "505px"}).css({'font-size': '12px',  "text-align": "center"}));
  var leaf5 = av.g.rect(335, 380, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf5);
  label_set.push(av.label("ZYX", {"top": "366px", "left": "345px"}).css({'font-size': '16px',  "text-align": "center"}));
  var leaf6 = av.g.rect(505, 380, 50, 20).css({"fill": "green", "opacity": "0.5"});
  set.push(leaf6);
  label_set.push(av.label("YZX", {"top": "366px", "left": "515px"}).css({'font-size': '16px',  "text-align": "center"}));
  av.step();
  
  // Slide 15
  right_branch_1.css({"stroke-width": 1, "stroke": "black"});
  left_branch_3.css({"stroke-width": 1, "stroke": "black"});
  av.umsg(interpret("Slide 15"));
  av.step();
  
  // Slide 16
  av.umsg(interpret("Slide 16"));
  leaf2.css({"fill": "red", "opacity": "0.5"});
  leaf3.css({"fill": "red", "opacity": "0.5"});
  leaf5.css({"fill": "red", "opacity": "0.5"});
  leaf6.css({"fill": "red", "opacity": "0.5"});
  av.step();
  
  // Slide 17
  hideTree();
  av.umsg(interpret("Slide 17"));
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
  av.g.rect(110, 90, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(190, 90, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(260, 90, 50, 20);
  av.g.line(40, 110, 25, 130);
  av.g.line(90, 110, 105, 130);
  av.g.line(260, 110, 245, 130);
  av.g.line(310, 110, 325, 130);
  av.g.rect(0, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(75, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(220, 130, 50, 20);
  av.g.rect(300, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.line(220, 150, 205, 170);
  av.g.line(270, 150, 285, 170);
  var n1 = av.g.rect(180, 170, 50, 20).css({"fill": "red", "opacity": "0.5"});
  var n2 = av.g.rect(260, 170, 50, 20).css({"fill": "red", "opacity": "0.5"});
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
  av.g.rect(510, 90, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(590, 90, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(660, 90, 50, 20);
  av.g.line(440, 110, 425, 130);
  av.g.line(490, 110, 505, 130);
  av.g.line(660, 110, 645, 130);
  av.g.line(710, 110, 725, 130);
  av.g.rect(400, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(475, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(620, 130, 50, 20);
  av.g.rect(700, 130, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.line(620, 150, 605, 170);
  av.g.line(670, 150, 685, 170);
  av.g.rect(580, 170, 50, 20).css({"fill": "green", "opacity": "0.5"});
  av.g.rect(660, 170, 50, 20);
  av.g.line(660, 190, 645, 210);
  av.g.line(710, 190, 725, 210);
  av.g.rect(620, 210, 50, 20).css({"fill": "red", "opacity": "0.5"});
  av.g.rect(700, 210, 50, 20).css({"fill": "red", "opacity": "0.5"});
  av.step();
  
  // Slide 18
  av.umsg(interpret("Slide 18"));
  var highlighter = av.g.rect(0, 0, 350, 200).css({"fill": "lightblue", "opacity": "0.5"});
  av.step();
  
  // Slide 19
  av.umsg(interpret("Slide 19"));
  highlighter.hide();
  n1.css({"fill": "blue", "opacity": "0.5"});
  n2.css({"fill": "blue", "opacity": "0.5"});
  av.step();
  
  // Slide 20
  av.umsg(interpret("Slide 20"));
  av.step();
  
  // Slide 21
  av.umsg(interpret("Slide 21"));
  av.step();
  
  // Slide 22
  av.umsg(interpret("Slide 22"));
  av.step();
  
  // Slide 23
  av.umsg(interpret("Slide 23"));
  av.step();
  
  // Slide 24
  av.umsg(interpret("Slide 24"));
  av.recorded();
});
