"use strict";
// Written by Jun Yang and Cliff Shaffer
// Diagram showing Two stacks implemented within in a single array.
$(document).ready(function () {
  var av = new JSAV("lstackTwostackCON", {animationMode: "none"});
  // Relative offsets
  var leftMarg = 180;
  var topMarg = 50;
  var rect = av.g.rect(leftMarg, topMarg, 500, 31);
  var line1 = av.g.line(leftMarg + 31, topMarg, leftMarg + 31, topMarg + 31);
  var line2 = av.g.line(leftMarg + 31 * 2, topMarg,
                        leftMarg + 31 * 2, topMarg + 31);
  for (var i = 0; i < 4; i++) {
    av.g.line(leftMarg + 376 + 31 * i, topMarg,
              leftMarg + 376 + 31 * i, topMarg + 31);
  }
  var top1Label = av.label("top1", {left: leftMarg + 20, top: topMarg - 55});
  var top1Arrow = av.g.line(leftMarg + 30, topMarg - 20,
                            leftMarg + 45, topMarg - 2,
                            {"arrow-end": "classic-wide-long", "stroke-width": 2});
  var top2Label = av.label("top2", {left: leftMarg + 376 + 20,
                                    top: topMarg - 55});
  var top2Arrow = av.g.line(leftMarg + 376 + 30, topMarg - 20,
                            leftMarg + 376 + 15, topMarg - 2,
                            {"arrow-end": "classic-wide-long", "stroke-width": 2});
  var arrow1 = av.g.line(leftMarg + 82, topMarg + 16,
                         leftMarg + 82 + 35, topMarg + 16,
                         {"stroke-width": 2, "arrow-end": "block-wide-long"});
  var arrow2 = av.g.line(leftMarg + 356, topMarg + 16,
                         leftMarg + 356 - 35, topMarg + 16,
                         {"stroke-width": 2, "arrow-end": "block-wide-long"});
  av.recorded();
});
