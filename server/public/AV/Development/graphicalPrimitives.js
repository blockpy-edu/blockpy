"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var rect;
  function runit() {
  
    av = new JSAV($(".avcontainer"));
    rect = av.g.rect(0, 120, 245, 10);
	
	av.displayInit();
	rect.translate(50,50);
	av.step();
	rect.translate(-50,-50);
	
    av.g.rect(40, 30, 5, 90);
    av.g.rect(120, 30, 5, 90);
    av.g.rect(200, 30, 5, 90);

    av.g.rect(10, 110, 65, 10).css({"fill": "gray"});
    av.g.rect(15, 100, 55, 10).css({"fill": "gray"});
    av.g.rect(20, 90, 45, 10).css({"fill": "gray"});
    av.g.rect(25, 80, 35, 10).css({"fill": "gray"});
    av.g.rect(30, 70, 25, 10).css({"fill": "gray"});
    av.g.rect(35, 60, 15, 10).css({"fill": "gray"});

    av.g.rect(280, 120, 245, 10);
    av.g.rect(320, 30, 5, 90);
    av.g.rect(400, 30, 5, 90);
    av.g.rect(480, 30, 5, 90);
    av.g.rect(290, 110, 65, 10).css({"fill": "gray"});
    av.g.rect(375, 110, 55, 10).css({"fill": "gray"});
    av.g.rect(380, 100, 45, 10).css({"fill": "gray"});
    av.g.rect(385, 90, 35, 10).css({"fill": "gray"});
    av.g.rect(390, 80, 25, 10).css({"fill": "gray"});
    av.g.rect(395, 70, 15, 10).css({"fill": "gray"});

    av.label("1",  {"top": "0px", "left": "39px"});
    av.label("2",  {"top": "0px", "left": "119px"});
    av.label("3",  {"top": "0px", "left": "199px"});
    av.label("1",  {"top": "0px", "left": "319px"});
    av.label("2",  {"top": "0px", "left": "399px"});
    av.label("3",  {"top": "0px", "left": "479px"});

    av.label("(a)",  {"top": "140px", "left": "113px"});
    av.label("(b)",  {"top": "140px", "left": "392px"});
    av.recorded();
  }

  function about() {
    var mystring = "Prim's Algorithm Visualization\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Spring, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
