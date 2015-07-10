"use strict";
// Written by Cliff Shaffer
$(document).ready(function () {
  var av = new JSAV("TOHfigCON", {animationMode: "none"});

  av.g.rect(0, 120, 245, 10);
  av.g.rect(40, 30, 5, 90);
  av.g.rect(120, 30, 5, 90);
  av.g.rect(200, 30, 5, 90);

  av.g.rect(10, 110, 65, 10).css({fill: "gray"});
  av.g.rect(15, 100, 55, 10).css({fill: "gray"});
  av.g.rect(20, 90, 45, 10).css({fill: "gray"});
  av.g.rect(25, 80, 35, 10).css({fill: "gray"});
  av.g.rect(30, 70, 25, 10).css({fill: "gray"});
  av.g.rect(35, 60, 15, 10).css({fill: "gray"});

  av.g.rect(280, 120, 245, 10);
  av.g.rect(320, 30, 5, 90);
  av.g.rect(400, 30, 5, 90);
  av.g.rect(480, 30, 5, 90);
  av.g.rect(290, 110, 65, 10).css({fill: "gray"});
  av.g.rect(375, 110, 55, 10).css({fill: "gray"});
  av.g.rect(380, 100, 45, 10).css({fill: "gray"});
  av.g.rect(385, 90, 35, 10).css({fill: "gray"});
  av.g.rect(390, 80, 25, 10).css({fill: "gray"});
  av.g.rect(395, 70, 15, 10).css({fill: "gray"});

  av.label("1",  {top: "-15px", left: "37px"});
  av.label("2",  {top: "-15px", left: "117px"});
  av.label("3",  {top: "-15px", left: "197px"});
  av.label("1",  {top: "-15px", left: "317px"});
  av.label("2",  {top: "-15px", left: "397px"});
  av.label("3",  {top: "-15px", left: "477px"});

  av.label("(a)",  {top: "125px", left: "112px"});
  av.label("(b)",  {top: "125px", left: "391px"});
});
