/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Merge Sort Analysis
$(document).ready(function () {
  var av_name = "MergeSortAnalysisCON";
  // Load the config object with interpreter
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var arr, arr11, arr12, arr21, arr22, arr23, arr24,
  arr31, arr32, arr33, arr34, arr35, arr36, arr37, arr38;
  var arr_values = [];
  var merge = function (a1, a2, return_into) {
    var i = 0, j = 0, k = 0, l;
    for (k; k < a1.size() * 2; k++) {
      if (a1.value(i) <= a2.value(j)) {
        av.effects.moveValue(a1, i, return_into, k);
        i++;
        if (i === a1.size()) {
          for (l = j; l < a2.size(); l++) {
            k++;
            av.effects.moveValue(a2, l, return_into, k);
          }
          return;
        }
      }
      else {
        av.effects.moveValue(a2, j, return_into, k);
        j++;
      }
      if (j === a2.size()) {
        for (l = i; l < a1.size(); l++) {
          k++;
          av.effects.moveValue(a1, l, return_into, k);
        }
        return;
      }
    }
  };
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  for (var i = 0; i < 8; i++) {
    arr_values[i] = parseInt(Math.random() * 20, 10);
  }
  arr = av.ds.array(arr_values, {"left": 60, "top": 0, "indexed": false});
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  arr.highlight();
  av.step();
  
  // Slide 4
  arr11 = av.ds.array([arr_values[0], arr_values[1], arr_values[2], arr_values[3]], {"left": 40, "top":  75, "indexed": false});
  arr12 = av.ds.array([arr_values[4], arr_values[5], arr_values[6], arr_values[7]], {"left": 200, "top": 75, "indexed": false});
  av.label("<b><u>Splitting Work</u></b>",  {"top": "-30px", "left": "430px"}).css({'font-size': '16px', "text-align": "center"});
  av.label("|----------- $n$ -----------|",  {"top": "-10px", "left": "405px"});
  for (i = 0; i < 8; i++) {
    av.g.rect(400 + (i * 20), 30, 20, 20);
  }
  av.step();
  
  // Slide 5
  av.umsg(interpret("Slide 5"));
  arr11.highlight();
  arr.unhighlight();
  av.step();
  
  // Slide 6
  arr21 = av.ds.array([arr_values[0], arr_values[1]], {"left": 20, "top": 150, "indexed": false});
  arr22 = av.ds.array([arr_values[2], arr_values[3]], {"left": 120, "top": 150, "indexed": false});
  av.label("|--- $\\frac{n}{2}$ ---|", {"top": "65px", "left": "405px"});
  for (i = 0; i < 4; i++) {
    av.g.rect(400 + (i * 20), 105, 20, 20);
  }
  av.step();
  
  // Slide 7
  av.umsg(interpret("Slide 7"));
  arr21.highlight();
  arr11.unhighlight();
  av.step();
  
  // Slide 8
  arr31 = av.ds.array([arr_values[0]], {"left": 0, "top": 225, "indexed": false});
  arr32 = av.ds.array([arr_values[1]], {"left": 70, "top": 225, "indexed": false});
  av.label("|- $\\frac{n}{4}$ -|", {"top": "140px", "left": "398px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(400 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  // Slide 9
  av.umsg(interpret("Slide 9"));
  arr31.css(0, {"background-color": "green"});
  arr32.css(0, {"background-color": "green"});
  av.step();
  
  // Slide 10
  merge(arr31, arr32, arr21);
  arr31.hide();
  arr32.hide();
  av.label("<b><u>Merging Work</u></b>",  {"top": "-30px", "left": "640px"}).css({'font-size': '16px', "text-align": "center"});
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "562px"});
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "592px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(560 + (i * 20 + i * 10), 255, 20, 20);
  }
  arr21.unhighlight();
  av.clearumsg();
  av.step();
  
  // Slide 11
  av.umsg(interpret("Slide 11"));
  arr22.highlight();
  av.step();
  
  // Slide 12
  arr33 = av.ds.array([arr_values[2]], {"left": 100, "top": 225, "indexed": false});
  arr34 = av.ds.array([arr_values[3]], {"left": 170, "top": 225, "indexed": false});
  av.label("|- $\\frac{n}{4}$ -|",  {"top": "140px", "left": "448px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(450 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  // Slide 13
  av.umsg(interpret("Slide 13"));
  arr33.css(0, {"background-color": "green"});
  arr34.css(0, {"background-color": "green"});
  av.step();
  
  // Slide 14
  merge(arr33, arr34, arr22);
  arr33.hide();
  arr34.hide();
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "622px"});
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "652px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(620 + (i * 20 + i * 10), 255, 20, 20);
  }
  arr22.unhighlight();
  av.clearumsg();
  av.step();
  
  // Slide 15
  av.umsg(interpret("Slide 15"));
  arr21.css([0, 1], {"background-color": "green"});
  arr22.css([0, 1], {"background-color": "green"});
  av.step();
  
  // Slide 16
  merge(arr21, arr22, arr11);
  arr21.hide();
  arr22.hide();
  av.label("|--- $\\frac{n}{2}$ ---|",  {"top": "140px", "left": "615px"});
  for (i = 0; i < 4; i++) {
    av.g.rect(610 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  // Slide 17
  av.umsg(interpret("Slide 17"));
  arr12.highlight();
  av.step();
  
  // Slide 18
  arr23 = av.ds.array([arr_values[4], arr_values[5]], {"left": 180, "top": 150, "indexed": false});
  arr24 = av.ds.array([arr_values[6], arr_values[7]], {"left": 280, "top": 150, "indexed": false});
  av.label("|--- $\\frac{n}{2}$ ---|",  {"top": "65px", "left": "495px"});
  for (i = 0; i < 4; i++) {
    av.g.rect(490 + (i * 20), 105, 20, 20);
  }
  av.step();
  
  // Slide 19
  av.umsg(interpret("Slide 19"));
  arr23.highlight();
  arr12.unhighlight();
  av.step();
  
  // Slide 20
  arr35 = av.ds.array([arr_values[4]], {"left": 160, "top": 225, "indexed": false});
  arr36 = av.ds.array([arr_values[5]], {"left": 230, "top": 225, "indexed": false});
  av.label("|- $\\frac{n}{4}$ -|",  {"top": "140px", "left": "498px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(500 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  //Slide 21
  av.umsg(interpret("Slide 21"));
  arr35.css(0, {"background-color": "green"});
  arr36.css(0, {"background-color": "green"});
  av.step();
  
  // Slide 22
  merge(arr35, arr36, arr23);
  arr35.hide();
  arr36.hide();
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "682px"});
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "712px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(680 + (i * 20 + i * 10), 255, 20, 20);
  }
  arr23.unhighlight();
  av.clearumsg();
  av.step();
  
  // Slide 23
  av.umsg(interpret("Slide 23"));
  arr24.highlight();
  av.step();
  
  // Slide 24
  arr37 = av.ds.array([arr_values[6]], {"left": 260, "top": 225, "indexed": false});
  arr38 = av.ds.array([arr_values[7]], {"left": 330, "top": 225, "indexed": false});
  av.label("|- $\\frac{n}{4}$ -|",  {"top": "140px", "left": "548px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(550 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  //Slide 25
  av.umsg(interpret("Slide 25"));
  arr37.css(0, {"background-color": "green"});
  arr38.css(0, {"background-color": "green"});
  av.step();
  
  // Slide 26
  merge(arr37, arr38, arr24);
  arr37.hide();
  arr38.hide();
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "742px"});
  av.label("$\\frac{n}{8}$ ",  {"top": "215px", "left": "772px"});
  for (i = 0; i < 2; i++) {
    av.g.rect(740 + (i * 20 + i * 10), 255, 20, 20);
  }
  arr24.unhighlight();
  av.clearumsg();
  av.step();
  
  // Slide 27
  av.umsg(interpret("Slide 27"));
  arr23.css([0, 1], {"background-color": "green"});
  arr24.css([0, 1], {"background-color": "green"});
  av.step();
  
  // Slide 28
  merge(arr23, arr24, arr12);
  arr23.hide();
  arr24.hide();
  av.label("|--- $\\frac{n}{2}$ ---|",  {"top": "140px", "left": "705px"});
  for (i = 0; i < 4; i++) {
    av.g.rect(700 + (i * 20), 180, 20, 20);
  }
  av.step();
  
  // Slide 29
  av.umsg(interpret("Slide 29"));
  arr11.css([0, 1, 2, 3], {"background-color": "green"});
  arr12.css([0, 1, 2, 3], {"background-color": "green"});
  av.step();
  
  // Slide 30
  merge(arr11, arr12, arr);
  arr11.hide();
  arr12.hide();
  av.label("|----------- $n$ -----------|",  {"top": "65px", "left": "615px"});
  for (i = 0; i < 8; i++) {
    av.g.rect(610 + (i * 20), 105, 20, 20);
  }
  av.clearumsg();
  av.step();
  
  // Slide 31
  av.umsg(interpret("Slide 31"));
  av.label("|--------------- $\\log{n+1}$---------------|", {"top": "125px", "left": "250px"}).css({'font-size': '16px', "text-align": "center"}).addClass("rotated");
  av.step();
  
  // Slide 32
  av.umsg(interpret("Slide 32"));
  av.step();
  
  // Slide 33
  av.umsg(interpret("Slide 33"));
  av.recorded();
});
