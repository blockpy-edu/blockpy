"use strict";

/* Static image of incorrect huffman trie */
(function ($) {
  var av = new JSAV("InvalidTree");
  var cirOpt = {fill: "white"};

  av.label("V", {visible: true, left: 66, top: 95});
  av.label("U", {visible: true, left: 185, top: 95});
  av.label("L<sub>1</sub>", {visible: true, left: 33, top: 152});
  av.label("L<sub>2</sub>", {visible: true, left: 93, top: 152});
  av.label("X", {visible: true, left: 216, top: 154});

  // lines
  av.g.line(130, 55, 190, 10);
  av.g.line(130, 64, 70, 105);
  av.g.line(130, 64, 190, 105);
  av.g.line(70, 105, 40, 147);
  av.g.line(70, 105, 100, 147);
  av.g.line(190, 105, 160, 148);
  av.g.line(190, 105, 220, 148);
  av.g.line(220, 165, 190, 207);
  av.g.line(220, 165, 250, 207);

  // root
  av.g.circle(130, 55, 18, cirOpt);

  // root.left
  av.g.circle(70, 105, 18, cirOpt);
  // root.left.left
  av.g.rect(22, 147, 36, 36, cirOpt);
  // root.left.right
  av.g.rect(82, 147, 36, 36, cirOpt);

  // root.right
  av.g.circle(190, 105, 18, cirOpt);
  // root.right.left
  av.g.polygon([[160, 148], [142, 183], [178, 183]], cirOpt);
  // root.right.right
  av.g.circle(220, 165, 18, cirOpt);
  // root.right.right.left
  av.g.polygon([[190, 207], [172, 243], [208, 243]], cirOpt);
  // root.right.right.right
  av.g.polygon([[250, 207], [232, 243], [268, 243]], cirOpt);
}(jQuery));
