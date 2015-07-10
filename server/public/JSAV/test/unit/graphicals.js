/*global ok,test,module,deepEqual,equal,expect,notEqual */
(function() {
  "use strict";
  module("graphicals.circle", {  });
  test("Testing Circle", function() {
    var av = new JSAV("emptycontainer");

    var c = av.g.circle(50, 60, 70);
    ok(c, "circle created");
    equal(c.center().cx, 50, "circle center x");
    equal(c.center().cy, 60, "circle center y");
    equal(c.radius(), 70, "circle radius");
    equal(c.css("stroke"), "#000", "circle stroke color");
    equal(c.css("stroke-width"), 1, "circle stroke width");
    equal(c.css("fill"), "none", "circle fill");
    equal(c.css("opacity"), 1, "circle opacity");
    var origBB = $.extend(true, {}, c.rObj.getBBox());
    av.step();
    c.center({cx: 80, cy: 90});
    av.step();
    c.radius(90);
    av.step();
    c.translate(30, 40);
    av.step();
    c.scale(2);
    av.step();
    c.css({"stroke-width": 4, "stroke": "red", "fill": "rgb(120,120,120)"});
    av.step();
    c.hide();
    av.step();
    c.show();
    av.recorded();
    $.fx.off = true;

    equal(c.css("opacity"), 0, "circle opacity initially");
    av.forward();
    equal(c.center().cx, 50, "circle center x");
    equal(c.center().cy, 60, "circle center y");
    equal(c.radius(), 70, "circle radius");
    equal(c.css("stroke"), "#000", "circle stroke color");
    equal(c.css("stroke-width"), 1, "circle stroke width");
    equal(c.css("fill"), "none", "circle fill");

    equal(c.css("opacity"), 1, "circle opacity");

    av.end();
    av.begin();
    av.forward();

    var currBB = c.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width), "scale undone correctly");

    av.forward(); // apply center
    equal(c.center().cx, 80, "circle center x");
    equal(c.center().cy, 90, "circle center y");
    currBB = c.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 30);
    equal(Math.round(currBB.y - origBB.y), 30);

    av.forward(); // apply radius
    equal(c.radius(), 90, "circle radius");
    currBB = c.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 10);
    equal(Math.round(currBB.y - origBB.y), 10);

    av.forward(); // apply translate
    currBB = c.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 40);
    equal(Math.round(currBB.y - origBB.y), 50);

    av.forward(); // apply scale
    currBB = c.rObj.getBBox();
    equal(Math.floor(currBB.width), Math.round((origBB.width+40)*2), "scale redone correctly");

    av.forward(); // apply css
    equal(c.center().cx, 80, "circle center x");
    equal(c.center().cy, 90, "circle center y");
    equal(c.radius(), 90, "circle radius");
    equal(c.css("stroke"), "red", "circle stroke color");
    equal(c.css("stroke-width"), 4, "circle stroke width");
    equal(c.css("fill"), "rgb(120,120,120)", "circle fill");
    equal(c.css("opacity"), 1, "circle opacity");

    av.forward(); // apply hide
    equal(c.css("opacity"), 0, "circle opacity");

    av.forward(); // apply show
    equal(c.css("opacity"), 1, "circle opacity");

    ok(!av.forward()); // no more steps
  });


  module("graphicals.ellipse", {  });

  test("Testing Ellipse", function() {
    var av = new JSAV("emptycontainer");

    var e = av.g.ellipse(70, 60, 50, 40);
    ok(e, "ellipse created");
    equal(e.center().cx, 70, "ellipse center x");
    equal(e.center().cy, 60, "ellipse center y");
    equal(e.radius().rx, 50, "ellipse radius x");
    equal(e.radius().ry, 40, "ellipse radius y");
    equal(e.css("stroke"), "#000", "ellipse stroke color");
    equal(e.css("stroke-width"), 1, "ellipse stroke width");
    equal(e.css("fill"), "none", "ellipse fill");
    equal(e.css("opacity"), 1, "ellipse opacity");
    var origBB = $.extend(true, {}, e.rObj.getBBox());
    av.step();
    e.center({cx: 80, cy: 90});
    av.step();
    e.radius([30, 20]);
    av.step();
    e.translate(30, 40);
    av.step();
    e.scale(2);
    av.step();
    e.css({"stroke-width": 4, "stroke": "red", "fill": "rgb(120,120,120)"});
    av.step();
    e.hide();
    av.step();
    e.show();
    av.recorded();
    $.fx.off = true;

    // should be initially hidden
    equal(e.css("opacity"), 0, "ellipse opacity initially");
    equal(e.center().cx, 70, "ellipse center x");
    equal(e.center().cy, 60, "ellipse center y");
    equal(e.radius().rx, 50, "ellipse radius x");
    equal(e.radius().ry, 40, "ellipse radius y");
    equal(e.css("stroke"), "#000", "ellipse stroke color");
    equal(e.css("stroke-width"), 1, "ellipse stroke width");
    equal(e.css("fill"), "none", "ellipse fill");

    av.forward();
    equal(e.css("opacity"), 1, "ellipse opacity");

    av.end();
    av.begin();

    av.forward();

    var currBB = e.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width), "horizontal scale undone correctly");
    equal(Math.round(currBB.height), Math.round(origBB.height), "vertical scale undone correctly");

    $.fx.off = true;

    av.forward(); // apply center
    equal(e.center().cx, 80, "ellipse center x");
    equal(e.center().cy, 90, "ellipse center y");
    currBB = e.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 10);
    equal(Math.round(currBB.y - origBB.y), 30);

    av.forward(); // apply radius
    equal(e.radius().rx, 30, "ellipse radius x");
    equal(e.radius().ry, 20, "ellipse radius y");
    currBB = e.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 30);
    equal(Math.round(currBB.y - origBB.y), 50);

    av.forward(); // apply translate
    currBB = e.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 60);
    equal(Math.round(currBB.y - origBB.y), 90);

    av.forward(); // apply scale
    currBB = e.rObj.getBBox();
    equal(Math.floor(currBB.width), Math.round((origBB.width-40)*2), "hor scale redone correctly");
    equal(Math.floor(currBB.height), Math.round((origBB.height-40)*2), "vert scale redone correctly");

    av.forward(); // apply css
    equal(e.center().cx, 80, "ellipse center x");
    equal(e.center().cy, 90, "ellipse center y");
    equal(e.radius().rx, 30, "ellipse radius x");
    equal(e.radius().ry, 20, "ellipse radius y");
    equal(e.css("stroke"), "red", "ellipse stroke color");
    equal(e.css("stroke-width"), 4, "ellipse stroke width");
    equal(e.css("fill"), "rgb(120,120,120)", "ellipse fill");
    equal(e.css("opacity"), 1, "ellipse opacity");

    av.forward(); // apply hide
    equal(e.css("opacity"), 0, "ellipse opacity");

    av.forward(); // apply show
    equal(e.css("opacity"), 1, "ellipse opacity");

    ok(!av.forward()); // no more steps
  });


  module("graphicals.rect", {  });

  test("Testing Rectangle", function() {
    var av = new JSAV("emptycontainer");

    var r = av.g.rect(70, 60, 50, 40);
    ok(r, "rect created");
    equal(r.width(), 50, "rectangle width");
    equal(r.height(), 40, "rectangle height");
    equal(r.css("stroke"), "#000", "rectangle stroke color");
    equal(r.css("stroke-width"), 1, "rectangle stroke width");
    equal(r.css("fill"), "none", "rectangle fill");
    equal(r.css("opacity"), 1, "rectangle opacity");
    var origBB = $.extend(true, {}, r.rObj.getBBox());
    av.step();
    r.width(80);
    av.step();
    r.height(30);
    av.step();
    r.translate(30, 40);
    av.step();
    r.scale(2);
    av.step();
    r.css({"stroke-width": 4, "stroke": "red", "fill": "rgb(120,120,120)"});
    av.step();
    r.hide();
    av.step();
    r.show();
    av.recorded();
    $.fx.off = true;

    equal(r.width(), 50, "rectangle width");
    equal(r.height(), 40, "rectangle height");
    equal(r.css("stroke"), "#000", "rectangle stroke color");
    equal(r.css("stroke-width"), 1, "rectangle stroke width");
    equal(r.css("fill"), "none", "rectangle fill");
    equal(r.css("opacity"), 0, "rectangle opacity");

    av.forward();
    equal(r.css("opacity"), 1, "rectangle opacity");

    av.end();
    av.begin();

    av.forward();

    var currBB = r.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width), "horizontal scale undone correctly");
    equal(Math.round(currBB.height), Math.round(origBB.height), "vertical scale undone correctly");

    $.fx.off = true;

    av.forward(); // apply width
    equal(r.width(), 80, "rectangle width");
    equal(r.height(), 40, "rectangle height");
    currBB = r.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width) + 30);
    equal(Math.round(currBB.height), Math.round(origBB.height));

    av.forward(); // apply height
    equal(r.width(), 80, "rectangle width");
    equal(r.height(), 30, "rectangle height");
    currBB = r.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width) + 30);
    equal(Math.round(currBB.height), Math.round(origBB.height) - 10);

    av.forward(); // apply translate
    currBB = r.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 30);
    equal(Math.round(currBB.y - origBB.y), 40);

    av.forward(); // apply scale
    currBB = r.rObj.getBBox();
    equal(Math.floor(currBB.width), Math.round((origBB.width+30)*2), "hor scale redone correctly");
    equal(Math.floor(currBB.height), Math.round((origBB.height-10)*2), "vert scale redone correctly");

    av.forward(); // apply css
    equal(r.width(), 80, "rectangle width");
    equal(r.height(), 30, "rectangle height");
    equal(r.css("stroke"), "red", "rectangle stroke color");
    equal(r.css("stroke-width"), 4, "rectangle stroke width");
    equal(r.css("fill"), "rgb(120,120,120)", "rectangle fill");
    equal(r.css("opacity"), 1, "rectangle opacity");

    av.forward(); // apply hide
    equal(r.css("opacity"), 0, "rectangle opacity");

    av.forward(); // apply show
    equal(r.css("opacity"), 1, "rectangle opacity");

    ok(!av.forward()); // no more steps
  });


  module("graphicals.line", {  });

  test("Testing Line", function() {
    var av = new JSAV("emptycontainer");

    var l = av.g.line(10, 20, 150, 140);
    ok(l, "line created");
    var origBB = $.extend(true, {}, l.rObj.getBBox());
    equal(origBB.width, 140, "line BB width");
    equal(origBB.height, 120, "line BB height");
    equal(l.css("stroke"), "#000", "line stroke color");
    equal(l.css("stroke-width"), 1, "line stroke width");
    equal(l.css("fill"), "none", "line fill");
    equal(l.css("opacity"), 1, "line opacity");
    av.step();
    l.translatePoint(0, 20, 10);
    av.step();
    l.translatePoint(1, 10, 20);
    av.step();
    l.translate(30, 40);
    av.step();
    l.scale(2);
    av.step();
    l.scale(0.5);
    av.step();
    l.movePoints([[0, 10, 20], [1, 150, 140]]);
    av.step();
    l.movePoints(50, 60, 90, 100);
    av.step();
    l.css({"stroke-width": 4, "stroke": "red", "fill": "rgb(120,120,120)"});
    av.step();
    l.hide();
    av.step();
    l.show();
    av.recorded();

    $.fx.off = true;

    var currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width), "horizontal scale undone correctly");
    equal(Math.round(currBB.height), Math.round(origBB.height), "vertical scale undone correctly");
    equal(l.css("stroke"), "#000", "line stroke color");
    equal(l.css("stroke-width"), 1, "line stroke width");
    equal(l.css("fill"), "none", "line fill");
    equal(l.css("opacity"), 0, "line opacity");

    av.forward();
    equal(l.css("opacity"), 1, "line opacity");

    av.end();
    av.begin();
    av.forward();

    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width), "horizontal scale undone correctly");
    equal(Math.round(currBB.height), Math.round(origBB.height), "vertical scale undone correctly");

    av.forward(); // apply translate point 0
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x) + 20);
    equal(Math.round(currBB.y), Math.round(origBB.y) + 10);
    equal(Math.round(currBB.width), Math.round(origBB.width) - 20);
    equal(Math.round(currBB.height), Math.round(origBB.height) - 10);

    av.forward(); // apply translate point 1
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x) + 20);
    equal(Math.round(currBB.y), Math.round(origBB.y) + 10);
    equal(Math.round(currBB.width), Math.round(origBB.width) - 10);
    equal(Math.round(currBB.height), Math.round(origBB.height) + 10);

    av.forward(); // apply translate
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 50);
    equal(Math.round(currBB.y - origBB.y), 50);

    av.forward(); // apply scale
    currBB = l.rObj.getBBox();
    equal(Math.floor(currBB.width), Math.round((origBB.width-10)*2), "hor scale redone correctly");
    equal(Math.floor(currBB.height), Math.round((origBB.height+10)*2), "vert scale redone correctly");

    av.forward(); // apply scale 0.5
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x - origBB.x), 50);
    equal(Math.round(currBB.y - origBB.y), 50);

    av.forward(); // apply move points
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), Math.round(origBB.x) + 30);
    equal(Math.round(currBB.y), Math.round(origBB.y) + 40);
    equal(Math.round(currBB.width), Math.round(origBB.width));
    equal(Math.round(currBB.height), Math.round(origBB.height));

    av.forward(); // apply second type of move points
    currBB = l.rObj.getBBox();
    equal(Math.round(currBB.x), 50 + 30);
    equal(Math.round(currBB.y), 60 + 40);
    equal(Math.round(currBB.width), 40);
    equal(Math.round(currBB.height), 40);

    av.forward(); // apply css
    equal(l.css("stroke"), "red", "line stroke color");
    equal(l.css("stroke-width"), 4, "line stroke width");
    equal(l.css("fill"), "rgb(120,120,120)", "line fill");
    equal(l.css("opacity"), 1, "line opacity");

    av.forward(); // apply hide
    equal(l.css("opacity"), 0, "line opacity");

    av.forward(); // apply show
    equal(l.css("opacity"), 1, "line opacity");

    ok(!av.forward()); // no more steps
  });
  test("Test line movePoints", function() {
    var av = new JSAV("emptycontainer");

    var l = av.g.line(10, 20, 150, 140);
    ok(l, "line created");
    var origBB = $.extend(true, {}, l.rObj.getBBox());
    av.displayInit();
    l.movePoints([[0, 10, 20], [1, 150, 140]]);
    av.step();
    l.movePoints([[0, 30, 40], [1, 170, 160]]);
    av.recorded();

    $.fx.off = true;

    ok(av.forward());
    var currBB = $.extend(true, {}, l.rObj.getBBox());
    equal(Math.round(currBB.x), Math.round(origBB.x));
    equal(Math.round(currBB.y), Math.round(origBB.y));
    equal(Math.round(currBB.width), Math.round(origBB.width));
    equal(Math.round(currBB.height), Math.round(origBB.height));

    ok(av.forward());
    currBB = $.extend(true, {}, l.rObj.getBBox());
    equal(Math.round(currBB.x), Math.round(origBB.x) + 20);
    equal(Math.round(currBB.y), Math.round(origBB.y) + 20);
    equal(Math.round(currBB.width), Math.round(origBB.width));
    equal(Math.round(currBB.height), Math.round(origBB.height));
  });

  module("label", {  });
  test("Test Label show/hide", function() {
    var av = new JSAV("emptycontainer"),
        label = av.label("label");
    equal(label.element.filter(":visible").size(), 1, "Label initially visible");
    label.hide();
    av.step();
    equal(label.element.filter(":visible").size(), 0, "Label not visible after hide");
    label.show();
    av.step();
    equal(label.element.filter(":visible").size(), 1, "Label again visible after show");
    label.show();
    av.step();
    equal(label.element.filter(":visible").size(), 1, "Label visible after another show");
    label.hide();
    av.step();
    equal(label.element.filter(":visible").size(), 0, "Label not visible after hide");
    label.hide();
    av.step(); // need to add another step, since the empty last step is pruned
    equal(label.element.filter(":visible").size(), 0, "Label not visible after another hide");
    av.recorded();
    jQuery.fx.off = true;
    av.end();
    equal(label.element.filter(":visible").size(), 0);
    av.backward();
    equal(label.element.filter(":visible").size(), 0, "Undoing hiding hidden should keep it hidden");
    av.begin();
    av.forward(); // redo hide
    av.forward(); // redo show
    av.forward(); // redo another show
    equal(label.element.filter(":visible").size(), 1, "Label visible after another show");
    av.backward(); // undo showing a visible Label
    equal(label.element.filter(":visible").size(), 1, "Undoing show of a visible should keep it visible");
  });

  test("Test Label state() function", function() {
    var av = new JSAV("emptycontainer"),
        label1 = av.label("labeli1"),
        label2 = av.label("labeli2");
    label1.addClass("testing");
    label2.addClass("testing2");
    label1.css("font-size", "23px");
    label2.css("border", "1px solid black");

    ok(!label1.equals(label2));
    ok(!label1.equals(label2, {css: ["font-size", "border"]}));
    ok(!label1.equals(label2, {css: ["font-size", "border"], "class": ["testing", "testing2"]}));

    label2.state(label1.state());

    ok(label1.equals(label2));
    ok(label1.equals(label2, {css: ["font-size", "border"]}));
    ok(label1.equals(label2, {css: ["font-size", "border"], "class": ["testing", "testing2"]}));
  });



  test("Test click event", function() {
    expect(9); // expect 9 assertions to be made
    var handler1 = function(event) {
      equal(this.id(), circle.id());
      ok(event);
    };
    var handler2 = function(myval, event) {
      equal(this.id(), line.id());
      equal(myval, "kissa");
      ok(event);
    };
    var handler3 = function(myval, myval2, event) {
      equal(this.id(), path.id());
      equal(myval, "kissa");
      equal(myval2, "koira");
      ok(event);
    };
    var av = new JSAV("arraycontainer"),
        circle = av.g.circle(50, 60, 70),
        line = av.g.line(10, 20, 150, 140),
         path = av.g.path("M175 200 A100 100 0 0 0 270 250");
    circle.click(handler1);
    line.click(["kissa"], handler2);
    path.click(["kissa", "koira"], handler3);
    circle.element.click();
    line.element.click();
    path.element.click();
  });

  test("Test on event binding and custom events", function() {
    expect(9); // expect 9 assertions to be made
    var handler1 = function(event) {
      equal(this.id(), circle.id());
      ok(event);
    };
    var handler2 = function(myval, event) {
      equal(this.id(), line.id());
      equal(myval, "kissa");
      ok(event);
    };
    var handler3 = function(myval, myval2, event) {
      equal(this.id(), path.id());
      equal(myval, "kissa");
      equal(myval2, "koira");
      ok(event);
    };
    var av = new JSAV("arraycontainer"),
        circle = av.g.circle(50, 60, 70),
        line = av.g.line(10, 20, 150, 140),
        path = av.g.path("M175 200 A100 100 0 0 0 270 250");

    circle.on("jsavclick", handler1);
    line.on("jsavclick", "kissa", handler2);
    path.on("jsavclick", ["kissa", "koira"], handler3);
    circle.element.trigger("jsavclick");
    line.element.trigger("jsavclick");
    path.element.trigger("jsavclick");
  });
}());