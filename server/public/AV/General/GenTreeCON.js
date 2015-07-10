/*global ODSA */
"use strict";
// Written by Kevin Ellis
$(document).ready(function () {
  var av_name = "GenTreeCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name, {animationMode: "none"});
  
  av.g.circle(120, 307, 115);
  
  av.g.circle(51, 280, 9).css({fill: "black"});
  av.g.line(51, 280, 123, 205, {"stroke-width": 3});
  av.g.circle(123, 280, 9).css({fill: "black"});
  av.g.line(123, 280, 123, 205, {"stroke-width": 3});
  av.g.circle(196, 280, 9).css({fill: "black"});
  av.g.line(196, 280, 123, 205, {"stroke-width": 3});
  av.g.circle(196, 363, 9).css({fill: "black"});
  av.g.line(196, 363, 196, 280, {"stroke-width": 3});

  av.g.circle(123, 205, 9).css({fill: "black"});
  av.g.line(123, 205, 247, 121, {"stroke-width": 3});

  av.g.circle(247, 121, 9).css({fill: "black"});
  av.g.circle(247, 198, 9).css({fill: "black"});
  av.g.line(247, 121, 247, 198, {"stroke-width": 3});

  av.g.circle(283, 198, 9).css({fill: "black"});
  av.g.line(247, 121, 283, 198, {"stroke-width": 3});

  av.g.circle(326, 38, 9).css({fill: "black"});
  av.g.line(326, 38, 247, 121, {"stroke-width": 3});
  av.g.line(326, 38, 406, 117, {"stroke-width": 3});
  av.g.circle(406, 117, 9).css({fill: "black"});
  av.g.line(406, 198, 406, 117, {"stroke-width": 3});
  av.g.circle(406, 198, 9).css({fill: "black"});

  av.label("C1",  {top: "255px", left: "17px"});
  av.label("C2",  {top: "255px", left: "89px"});
  av.label("C3",  {top: "255px", left: "163px"});
  av.label("V",  {top: "180px", left: "100px"});
  av.label("P",  {top: "76px", left: "241px"});
  av.label("R",  {top: "-6px", left: "320px"});
  av.label("S1",  {top: "191px", left: "240px"});
  av.label("S2",  {top: "191px", left: "275px"});

  av.label(interpret("av_tag1"), {top: "425px", left: "84px"});
  av.label(interpret("av_tag2"), {top: "300px", left: "279px"});
  av.label(interpret("av_tag3"), {top: "240px", left: "350px"});
  av.label(interpret("av_tag4"), {top: "15px", left: "460px"});
  av.label(interpret("av_tag5"), {top: "10px", left: "207px"});
  av.label(interpret("av_tag6"), {top: "90px", left: "120px"});
  av.g.line(120, 435, 50, 292, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(120, 435, 122, 292, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(120, 435, 194, 292, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(270, 325, 240, 315, {"stroke-width": 2, "arrow-end": "classic"});
  
  av.g.line(160, 130, 235, 120, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(240, 40, 315, 40, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(454, 40, 335, 40, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(454, 40, 260, 117, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(340, 265, 285, 265, {"stroke-width": 2});
  av.g.line(285, 265, 285, 225, {"stroke-width": 2, "arrow-end": "classic"});
  av.g.line(285, 265, 255, 225, {"stroke-width": 2, "arrow-end": "classic"});
});
