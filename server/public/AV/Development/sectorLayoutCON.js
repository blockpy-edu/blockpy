"use strict";

(function ($) {
  var av = new JSAV("disk", {"animationMode": "none"});

  av.g.rect(0, 25, 75, 50);
  av.g.rect(100, 25, 100, 50);
  av.g.rect(250, 25, 75, 50);
  av.g.rect(350, 25, 100, 50);


  
  av.label("Sector", {"top": "30px", "left": "10px"});
  av.label("Header", {"top": "45px", "left": "10px"});
  av.label("Sector", {"top": "30px", "left": "260px"});
  av.label("Header", {"top": "45px", "left": "260px"});

  av.label("Sector", {"top": "30px", "left": "130px"});
  av.label("Data", {"top": "45px", "left": "130px"});
  av.label("Sector", {"top": "30px", "left": "380px"});
  av.label("Data", {"top": "45px", "left": "380px"});

  av.label("Intrasector Gap ", {"top": "80px", "left": "87px"});
  av.label("Intersector Gap", {"top": "0px", "left": "225px"});

  av.g.line(87,  80,  87, 50, {'arrow-end': 'classic-wide-long', 'stroke-width' : 2});
  av.g.line(225,  20,  225, 50, {'arrow-end': 'classic-wide-long', 'stroke-width' : 2});


}(jQuery));




