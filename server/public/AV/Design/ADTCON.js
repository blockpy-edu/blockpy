/*global ODSA */
"use strict";
// Written by Cliff Shaffer
$(document).ready(function () {
  var av_name = "ADTCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name, {animationMode: "none"});

  av.g.rect(1, 1, 358, 213);
  av.label(interpret("av_tag1")).css({"text-align": "center", "font-size": "18px"});
  av.g.rect(10, 30, 338, 75);
  av.label(interpret("av_tag2"), {top: "20px", left: "20px"});
  av.g.circle(25, 67, 2);
  av.label(interpret("av_tag3"), {top: "40px", left: "30px"});
  av.g.circle(25, 87, 2);
  av.label(interpret("av_tag4"), {top: "60px", left: "30px"});
  av.g.rect(180, 40, 158, 55);
  av.label(interpret("av_tag5"),  {top: "30px", left: "185px"});
  av.label(interpret("av_tag6"),  {top: "50px", left: "195px"});

  av.g.line(180, 105, 180, 130, {"stroke-width": "3", "arrow-end": "classic"});

  av.g.rect(10, 130, 338, 75);
  av.label(interpret("av_tag7"), {top: "120px", left: "20px"});
  av.g.circle(25, 167, 2);
  av.label(interpret("av_tag8"), {top: "140px", left: "30px"});
  av.g.circle(25, 187, 2);
  av.label(interpret("av_tag9"), {top: "160px", left: "30px"});
  av.g.rect(180, 140, 158, 55);
  av.label(interpret("av_tag10"), {top: "130px", left: "185px"});
  av.label(interpret("av_tag11"), {top: "150px", left: "195px"});
});
