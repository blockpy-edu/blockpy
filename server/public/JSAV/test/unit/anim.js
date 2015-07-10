/*global ok,test,module,deepEqual,equal,expect,notEqual,arrayUtils */
(function() {
  "use strict";
  module("anim", {});

  test("slideshow counter", function() {
    var av = new JSAV("arraycontainer"),
      arr = av.ds.array($("#array")),
      i = 0,
      counter = $("#arraycontainer .jsavcounter");
    arr.highlight(0);
    av.step();
    arr.highlight(1);
    av.recorded(); // will rewind it
    // bind listener to test event firing as well
    av.container.bind("jsav-updatecounter", function(e) { i++; });
    equal("1 / 3", counter.text(), "Testing counter text");
    av.forward();
    equal("2 / 3", counter.text(), "Testing counter text");
    av.forward();
    equal("3 / 3", counter.text(), "Testing counter text");
    av.forward(); // does nothing, updatecounter does not fire
    equal("3 / 3", counter.text(), "Testing counter text");
    av.begin(); // fires two events, one for each step forward
    equal("1 / 3", counter.text(), "Testing counter text");
    av.end(); // fires two events, one for each step backward
    equal("3 / 3", counter.text(), "Testing counter text");
    av.backward();
    equal("2 / 3", counter.text(), "Testing counter text");
    av.forward();
    equal("3 / 3", counter.text(), "Testing counter text");
    av.backward();
    av.backward();
    equal("1 / 3", counter.text(), "Testing counter text");
    av.backward(); // does nothing, updatecounter does not fire
    equal("1 / 3", counter.text(), "Testing counter text");
    equal(i, 10, "Number of updatecounter events fired");
  });

  test("animator control events", function() {
    var av = new JSAV("emptycontainer"),
      arr = av.ds.array([10, 20, 30, 40]),
      props = ["color", "background-color"];
    arr.highlight(0);
    av.step();
    arr.highlight(1);
    av.step();
    arr.highlight(2);
    av.recorded(); // will rewind it
    jQuery.fx.off = true; // turn off smooth animation
    av.RECORD = true; // fake to not animate the properties
    arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0], props);
    av.container.trigger("jsav-end"); // apply all highlights
    arrayUtils.testArrayHighlights(arr, [1, 1, 1, 0], props);
    av.container.trigger("jsav-begin"); // undo everything
    arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0], props);
    jQuery.fx.off = true; // turn off smooth animation
    av.container.trigger("jsav-forward");
    arrayUtils.testArrayHighlights(arr, [1, 0, 0, 0], props);
    av.container.trigger("jsav-forward"); // second highlight
    arrayUtils.testArrayHighlights(arr, [1, 1, 0, 0], props);
    av.container.trigger("jsav-backward"); // undo second highlight
    arrayUtils.testArrayHighlights(arr, [1, 0, 0, 0], props);
  });

  test("backward/forward filters", function() {
    var av = new JSAV("emptycontainer"),
      arr = av.ds.array([10, 20, 30, 40]),
      props = ["color", "background-color"];
    arr.highlight(0);
    av.stepOption("stop0", true);
    av.step();
    arr.highlight(1);
    av.stepOption("stop1", true);
    av.step();
    arr.highlight(2);
    av.step();
    av.stepOption("stop2", true);
    arr.highlight(3);
    av.recorded(); // will rewind it
    arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0], props);
    av.end();
    arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1], props);

    jQuery.fx.off = true; // turn off smooth animation
    av.backward(function(step) { return step.options.stop0; }); // should go to beginning
    equal(av.currentStep(), 0);
    arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0], props);

    av.end();
    av.backward(function(step) { return step.options.stop1; }); // should go to step 1
    arrayUtils.testArrayHighlights(arr, [1, 0, 0, 0], props);
    equal(av.currentStep(), 1);
    av.begin();

    av.forward(function(step) { return step.options.stop2; }); // end
    arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1], props);
    equal(av.currentStep(), 4);
    av.begin();

    av.forward(function(step) { return step.options.stop1; }); // step 2
    arrayUtils.testArrayHighlights(arr, [1, 1, 0, 0], props);
    equal(av.currentStep(), 2);

  });
})();