/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Insertion Sort Average Case
$(document).ready(function () {
  var av_name = "InsertionSortAverageCaseCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code).hide();
  var arr;
  var insert_equation = function (current, added) {
    var new_equation;
    var end_index = current.indexOf("\\end{eqnarray*}");
    new_equation = current.substr(0, end_index) + added + current.substr(end_index);
    return new_equation;
  };
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();

  // Slide 2 
  pseudo.show();
  av.umsg(interpret("Slide 2"));
  arr = av.ds.array(["0", "1", "...", "i-1", "i", "...", "n-1"], {"left": 300, "top": 20, "indexed": false});
  pseudo.highlight("loop2");
  arr.highlight(4);
  av.step();
  
  //Slide 3
  av.umsg(interpret("Slide 3"));
  arr.css([0, 1, 2, 3], {"background-color": "#00FA9A"});
  av.step();

  //Slide 4  
  av.umsg(interpret("Slide 4"));
  pseudo.unhighlight("loop2");
  av.step();

  //Slide 5  
  av.umsg(interpret("Slide 5"));
  var eq = av.label("$\\frac{\\displaystyle\\sum_{j=1}^{i}j}{i}$",  {"top": "-30px", "left": "15px"}).css({'font-size': '16px', "text-align": "left"});
  av.step();

  //Slide 6  
  av.umsg(interpret("Slide 6"));
  eq.hide();
  eq = av.label("$\\begin{eqnarray*}\\displaystyle\\sum_{i=1}^{n-1}\\frac{\\displaystyle\\sum_{j=1}^{i}j}{i}\\end{eqnarray*}$", {"top": "-30px", "left": "15px"}).css({'font-size': '16px', "text-align": "left"});
  var label = av.label("|------- $n-1$ --------|",  {"top": "50px", "left": "320px"}).css({'font-size': '20px', "text-align": "center"});
  pseudo.highlight("loop1");
  arr.unhighlight(4);
  arr.css([0, 1, 2, 3], {"background-color": "white"});
  av.step();
  
  //Slide 7
  av.umsg(interpret("Slide 7"));
  var current_content = eq.text();
  var added_content = "&=&\\displaystyle\\sum_{i=1}^{n-1}\\frac{i+1}{2} \\\\";
  var new_content = insert_equation(current_content, added_content);
  eq.hide();
  eq = av.label(new_content,  {"top": "-30px", "left": "15px"}).css({'font-size': '16px', "text-align": "left"});
  av.step();
  
  //Slide 8
  current_content = eq.text();
  added_content = "&=&\\frac{(n-1)(n+4)}{4}";
  new_content = insert_equation(current_content, added_content);
  eq.hide();
  eq = av.label(new_content,  {"top": "-30px", "left": "15px"}).css({'font-size': '16px', "text-align": "left"});
  av.step();
  
  //Slide 9
  av.umsg(interpret("Slide 9"));
  pseudo.unhighlight("loop2");
  label.hide();
  av.recorded();
});
