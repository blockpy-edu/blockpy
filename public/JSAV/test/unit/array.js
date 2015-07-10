/*global ok,test,module,deepEqual,equal,expect,notEqual,arrayUtils */
(function() {
  "use strict";
  module("datastructures.array", {  });
test("Initializing from HTML", function() {
  var values = [12, 22, "14", "39", false]; // array in HTML
  expect(9);
  var av = new JSAV("arraycontainer");
  ok( av, "JSAV initialized" );
  ok( av.ds.array, "Array exists" );
  var arr = av.ds.array($("#array"));
  ok( arr, "Array initialized" );
  for (var i = 0; i < values.length; i++) {
    deepEqual( arr.value(i), values[i], "Getting value of index " + i );
  }
  equal(arr.id(), "array");
});


test("Initializing from Array", function() {
  var values = [15, 26, 13, 139, 10];
  expect(8);
  var av = new JSAV("emptycontainer");
  ok( av, "JSAV initialized" );
  ok( av.ds.array, "Array exists" );
  var arr = av.ds.array(values);
  ok( arr, "Array initialized" );
  for (var i = 0; i < values.length; i++) {
    deepEqual( arr.value(i), values[i], "Getting value of index " + i );
  }
});

test("Highlighting indices in Array", function() {
  // [12, 22, 14, 39, 10] array in HTML
  var av = new JSAV("arraycontainer"),
    arr = av.ds.array($("#array"));
  arr.highlight(0);
  av.step();
  arr.highlight([1]); // highlight with an array
  av.step();
  arr.highlight(function(index) { return index>3;}); // highlight with function
  av.step();
  arr.highlight(); // highlight all
  av.recorded(); // will do rewind, nothing should be highlighted
  $.fx.off = true;

  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  
  av.forward(); // apply first highlight

  arrayUtils.testArrayHighlights(arr, [1, 0, 0, 0, 0]);

  av.forward(); // apply 2nd (array version) highlight
  arrayUtils.testArrayHighlights(arr, [1, 1, 0, 0, 0]);

  av.forward(); // apply 3rd (function version) highlight
  arrayUtils.testArrayHighlights(arr, [1, 1, 0, 0, 1]);

  av.forward(); // apply last highlight (all should now be highlighted)
  arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1, 1]);

  av.begin(); // going to beginning should remove all highlights
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  av.end(); // going to the end should reapply the highlights
  arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1, 1]);
});

test("Unhighlighting indices in Array", function() {
  // [12, 22, 14, 39, 10] array in HTML
  var av = new JSAV("arraycontainer"),
    arr = av.ds.array($("#array"));

  arr.highlight();
  av.step();
  arr.unhighlight(0);
  av.step();
  arr.unhighlight([1]); // highlight with an array
  av.step();
  arr.unhighlight(function(index) { return index>3;}); // highlight with function
  av.step();
  arr.unhighlight(); // highlight all
  av.recorded(); // will do rewind, nothing should be highlighted
  $.fx.off = true;

  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  
  av.forward(); // apply first highlight
  arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1, 1]);

  av.forward(); // apply first unhighlight
  arrayUtils.testArrayHighlights(arr, [0, 1, 1, 1, 1]);

  av.forward(); // apply 2nd (array version) unhighlight
  arrayUtils.testArrayHighlights(arr, [0, 0, 1, 1, 1]);

  av.forward(); // apply 3rd (function version) unhighlight
  arrayUtils.testArrayHighlights(arr, [0, 0, 1, 1, 0]);

  av.forward(); // apply last unhighlight (all should now be unhighlighted)
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);

  av.begin(); // going to beginning should remove all highlights
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  av.end(); // going to the end should reapply the unhighlights
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
});

test("Highlight without parameters", function() {
  var av = new JSAV("arraycontainer"),
    arr = av.ds.array($("#array"));
  arr.highlight();
  av.recorded();
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  $.fx.off = true;
  av.forward();
  arrayUtils.testArrayHighlights(arr, [1, 1, 1, 1, 1]);
});

test("Test isHighlight", function() {
  var av = new JSAV("arraycontainer"),
    arr = av.ds.array($("#array")),
    props = ["color", "background-color"];
  arr.highlight([0, 3]);
  av.recorded();
  av.end();
  ok(arr.isHighlight(0));
  ok(!arr.isHighlight(1));
  ok(!arr.isHighlight(2));
  ok(arr.isHighlight(3));
});

test("Simple swaps", function() {
  var av = new JSAV("emptycontainer"),
    arr = av.ds.array([10, 20, 30, 40]);
  arr.swap(0, 2);
  av.step();
  arr.swap(0, 3);
  av.recorded();
  $.fx.off = true;
  arrayUtils.testArrayValues(arr, [10, 20, 30, 40]);
  av.forward();
  arrayUtils.testArrayValues(arr, [30, 20, 10, 40]);
  av.forward();
  arrayUtils.testArrayValues(arr, [40, 20, 10, 30]);
  av.backward();
  arrayUtils.testArrayValues(arr, [30, 20, 10, 40]);
  av.backward();
  arrayUtils.testArrayValues(arr, [10, 20, 30, 40]);
});

test("Swaps with highlights", function() {
  var av = new JSAV("emptycontainer"),
    arr = av.ds.array([10, 20, 30, 40]);
  arr.highlight(function(index) { return index%2 === 0;});
  av.step();
  arr.swap(0, 2);
  av.step();
  arr.unhighlight(function(index) { return index%2 === 0;});
  av.recorded();
  $.fx.off = true;
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  arrayUtils.testArrayValues(arr, [10, 20, 30, 40]);
  av.forward(); // apply highlight
  arrayUtils.testArrayHighlights(arr, [1, 0, 1, 0, 0]);
  arrayUtils.testArrayValues(arr, [10, 20, 30, 40]);
  av.forward(); // apply swap
  arrayUtils.testArrayHighlights(arr, [1, 0, 1, 0, 0]);
  arrayUtils.testArrayValues(arr, [30, 20, 10, 40]);
  av.forward(); // apply unhighlight
  arrayUtils.testArrayHighlights(arr, [0, 0, 0, 0, 0]);
  arrayUtils.testArrayValues(arr, [30, 20, 10, 40]);
});
test("Swaps with indices", function() {
  var av = new JSAV("emptycontainer"),
    arr = av.ds.array([10, 20, 30, 40], {indexed: true}),
    ind0,
    ind2;
  arr.swap(0, 2);
  av.recorded();
  $.fx.off = true;
  ind0 = $($(".jsavindexed li")[0]);
  ind2 = $($(".jsavindexed li")[2]);
  // indices in the beginning should be 0 and 2
  equal(ind0.find(".jsavindexlabel").text(), "0");
  equal(ind2.find(".jsavindexlabel").text(), "2");
  av.forward();
  // .. as they should after the swap
  equal(ind0.find(".jsavindexlabel").text(), "0");
  equal(ind2.find(".jsavindexlabel").text(), "2");
});

test("Comparing arrays", function() {
  var av = new JSAV("emptycontainer"),
    arr1 = av.ds.array([10, 20, 30, 40], {indexed: true}),
    arr2 = av.ds.array([10, 30, 20, 40]),
    arr3 = av.ds.array([10, 30, 20, 40]),
    arr4 = av.ds.array([10, 30, 20, 40, 50]);
  ok(!arr1.equals([10, 20, 30, 40, 50]), "Different lengths should not match");
  ok(arr1.equals([10, 20, 30, 40]), "Equal arrays");
  ok(!arr1.equals(arr2), "Arrays with different values");
  ok(arr2.equals(arr3), "Equal JSAV arrays");
  ok(!arr3.equals(arr4), "Different lengths should not match"); 
  ok(arr2.equals(arr3, {'css': 'background-color'}), "Equals values and background-colors");
  ok(arr2.equals(arr3, {'css': ['color', 'background-color']}), "Equal values, background-colors and colors");
  ok(arr1.equals(arr2, {'css': 'background-color', 'value': false}), "Ignoring values, equal background-colors");
  arr2.highlight(2);
  av.step();
  ok(!arr2.equals(arr3, {'css': 'background-color'}), "Unequal background-colors");

  ok(!arr2.equals(arr3, {'css': ['color', 'background-color']}), "Unequal background-colors and colors");
  
  var testDiv= $('<ol class="' + arr1.element[0].className + '"><li class="jsavnode jsavindex jsavhighlight"></li><li class="jsavnode jsavindex" ></li></ol>'),
    hlDiv = testDiv.find(".jsavnode").filter(".jsavhighlight"),
    unhlDiv = testDiv.find(".jsavnode").not(".jsavhighlight"),
    hlBg = hlDiv.css("background-color"),
    unhlBg = unhlDiv.css("background-color");
  ok(arr2.equals([unhlBg, unhlBg, hlBg, unhlBg], {'css': 'background-color'}), "Equal background-colors as array.");

  // test class as equals option
  arr1.addClass(0, "someClazz");
  arr1.addClass(1, "someClazz2");
  arr3.addClass(0, "someClazz");
  ok(arr1.equals(arr3, {'class': "someClazz", value: false}, "Arrays with matching classes"));
  ok(!arr1.equals(arr2, {'class': "someClazz2"}, "Arrays with non-matching class"));
  ok(arr1.equals(arr3, {'class': "unknownClazz2", value: false}, "Non-existing class"));
  ok(arr1.equals(arr3, {'class': ["someClazz", "unknownClazz2"], value: false}, "Multiple classes"));
  ok(!arr1.equals(arr3, {'class': ["someClazz", "someClazz2", "unknownClazz2"], value: false}, "Multiple, differing classes"));
});

test("Array data-attributes", function() {
  var av = new JSAV("arraycontainer"),
      arr = av.ds.array($("#arraywithoptions")),
      arr2 = av.ds.array([10, 20, 30, 40], {layout: "bar", center: false, noop: function(){}}),
      data = arr.element.data(),
      data2 = arr2.element.data();
  ok(arr.equals(["6", "4", "2"]), "Array index value from data-attribute");
  equal(arr.options.layout, data.layout);
  equal(arr.options.layout, "bar");
  equal(arr.options.foo, data.foo);
  equal(arr.options.foo, "barber");
  
  equal(data2.layout, "bar");
  equal(data2.center, false);
  equal(data2.noop, undefined);
});

test("Array CSS", function() {
  var av = new JSAV("emptycontainer"),
    arr1 = av.ds.array([10, 20, 30, 40], {indexed: true});
  equal(arr1.css("color"), "rgb(0, 0, 0)");
  arr1.css({color: "red"});
  av.step();
  equal(arr1.css("color"), "rgb(255, 0, 0)");
  arr1.css({color: "blue", left: "20px"});
  av.step();
  equal(arr1.css("color"), "rgb(0, 0, 255)");
  equal(arr1.css("left"), "20px");
  
  av.backward();
  av.backward();
  equal(arr1.css("color"), "rgb(255, 0, 0)");
  ok(arr1.css("left") !== "20px");
  
  av.begin();
  equal(arr1.css("color"), "rgb(0, 0, 0)");
  ok(arr1.css("left") !== "20px");
  
  av.end();
  equal(arr1.css("color"), "rgb(0, 0, 255)");
  equal(arr1.css("left"), "20px");
});

test("Array values", function() {
  var av = new JSAV("emptycontainer"),
    values = [-1, 0, 1, false, true, ""],
    arr = av.ds.array(values);
  for (var i = 0; i < values.length; i++) {
    deepEqual( arr.value(i), values[i], "Getting value of index " + i );
  }
  arr.value(0, 0);
  arr.value(1, "<span>html test</span>");
  arr.value(2, false);
  arr.value(3, "");
  arr.value(4, [0]);
  arr.value(5, "0");
  av.step();
  deepEqual( arr.value(0), 0);
  deepEqual( arr.value(1), "<span>html test</span>");
  deepEqual( arr.value(2), false);
  deepEqual( arr.value(3), "");
  deepEqual( arr.value(4), [0]);
  deepEqual( arr.value(5), "0");
  ok(av.backward());
  ok(av.backward());
  for (i = 0; i < values.length; i++) {
    deepEqual( arr.value(i), values[i], "Getting value of index " + i );
  }
});

test("Test show/hide", function() {
  var av = new JSAV("arraycontainer"),
      arr = av.ds.array([0, 7, 4, 3]);
  equal(arr.element.filter(":visible").size(), 1, "Array initially visible");
  arr.hide();
  av.step();
  equal(arr.element.filter(":visible").size(), 0, "Array not visible after hide");
  arr.show();
  av.step();
  equal(arr.element.filter(":visible").size(), 1, "Array again visible after show");
  arr.show();
  av.step();
  equal(arr.element.filter(":visible").size(), 1, "Array visible after another show");
  arr.hide();
  av.step();
  equal(arr.element.filter(":visible").size(), 0, "Array not visible after hide");
  arr.hide();
  av.step(); // need to add another step, since the empty last step is pruned
  equal(arr.element.filter(":visible").size(), 0, "Array not visible after another hide");
  av.recorded();
  jQuery.fx.off = true;
  av.end();
  equal(arr.element.filter(":visible").size(), 0);
  av.backward();
  equal(arr.element.filter(":visible").size(), 0, "Undoing hiding hidden should keep it hidden");
  av.begin();
  av.forward(); // redo hide
  av.forward(); // redo show
  av.forward(); // redo another show
  equal(arr.element.filter(":visible").size(), 1, "Array visible after another show");
  av.backward(); // undo showing a visible array
  equal(arr.element.filter(":visible").size(), 1, "Undoing show of a visible should keep it visible");
});

test("Test click event", function() {
  expect(12);
  var handler1 = function(index, event) {
    equal(index, 2);
    ok(event);
    equal(this.value(index), 3);
  };
  var handler2 = function(index, myval, event) {
    equal(myval, "kissa");
    equal(index, 0);
    ok(event);
    equal(this.value(index), 5);
  };
  var handler3 = function(index, myval, myval2, event) {
    equal(myval, "kissa");
    equal(myval2, "koira");
    equal(index, 3);
    ok(event);
    equal(this.value(index), 12);
  };
  var av = new JSAV("arraycontainer"),
      arr = av.ds.array([1, 2, 3, 4]),
      arr2 = av.ds.array([5, 6, 7, 8]),
      arr3 = av.ds.array([9, 10, 11, 12]);
  arr.click(handler1);
  arr2.click("kissa", handler2);
  arr3.click(["kissa", "koira"], handler3);
  arr.element.find(".jsavindex:eq(2)").click();
  arr2.element.find(".jsavindex:eq(0)").click();
  arr3.element.find(".jsavindex:eq(3)").click();
});

test("Test on event binding and custom events", function() {
  expect(12);
  var handler1 = function(index, event) {
    equal(index, 2);
    ok(event);
    equal(this.value(index), 3);
  };
  var handler2 = function(index, myval, event) {
    equal(myval, "kissa");
    equal(index, 0);
    ok(event);
    equal(this.value(index), 5);
  };
  var handler3 = function(index, myval, myval2, event) {
    equal(myval, "kissa");
    equal(myval2, "koira");
    equal(index, 3);
    ok(event);
    equal(this.value(index), 12);
  };
  var av = new JSAV("arraycontainer"),
      arr = av.ds.array([1, 2, 3, 4]),
      arr2 = av.ds.array([5, 6, 7, 8]),
      arr3 = av.ds.array([9, 10, 11, 12]);
  arr.on("jsavclick", handler1);
  arr2.on("jsavclick", "kissa", handler2);
  arr3.on("jsavclick", ["kissa", "koira"], handler3);
  arr.element.find(".jsavindex:eq(2)").trigger("jsavclick");
  arr2.element.find(".jsavindex:eq(0)").trigger("jsavclick");
  arr3.element.find(".jsavindex:eq(3)").trigger("jsavclick");
});

  test("Test array clone", function() {
    var av = new JSAV("arraycontainer"),
        arr = av.ds.array([1, 2, 3, 4]);
    arr.layout();
    var arr2 = arr.clone();
    ok(arr.equals(arr2));
    arr.value(0, 3);
    ok(!arr.equals(arr2));

    // test style cloning
    arr.highlight(2);
    arr.css(0, {color: "blue"});
    var arr3 = arr.clone();

    ok(arr.equals(arr3));
    ok(arr.equals(arr3, {css: ["background-color", "color"]}));
    arr.highlight(0);
    ok(!arr.equals(arr3, {css: ["background-color", "color"]}));
  });

  test("Test array state", function() {
    var av = new JSAV("emptycontainer"),
        arr1 = av.ds.array([1, 2, 3, 4, 5]),
        arr2 = av.ds.array([3, 4, 5, 6, 7, 8, 9]),
        arr3 = av.ds.array([0]);

    arr1.highlight(2);
    arr1.addClass(3, "testing");
    arr1.css({"border": "2px solid blue"});
    arr1.css(0, {"color": "red"});

    ok(!arr1.equals(arr2), "Different arrays should not be equal");
    ok(!arr1.equals(arr2, {css: ["color", "background-color"]}), "Different arrays should not be equal");
    ok(!arr1.equals(arr2, {css: ["color", "background-color"], "class": ["jsavhighlight", "testing"]}), "Different arrays should not be equal");

    // set state of a longer array
    arr2.state(arr1.state());
    equal(arr2.size(), 5, "Array size after setting state");

    ok(arr1.equals(arr2), "After setting state, arrays should be equal");
    ok(arr1.equals(arr2, {css: ["color", "background-color"]}), "After setting state, arrays should be equal");
    ok(arr1.equals(arr2, {css: ["color", "background-color"], "class": ["jsavhighlight", "testing"]}), "After setting state, arrays should be equal");
    // test that the internal array values were set properly as well
    deepEqual(arr1._values, arr2._values, "Internal values of arrays should be equal after setting state");

    ok(!arr3.equals(arr1), "Different arrays should not be equal");
    ok(!arr3.equals(arr1, {css: ["color", "background-color"]}), "Different arrays should not be equal");
    ok(!arr3.equals(arr1, {css: ["color", "background-color"], "class": ["jsavhighlight", "testing"]}), "Different arrays should not be equal");

    // set state of a shorter array
    arr3.state(arr1.state());
    equal(arr3.size(), 5, "Array size after setting state");

    ok(arr3.equals(arr1), "After setting state, arrays should be equal");
    ok(arr3.equals(arr1, {css: ["color", "background-color"]}), "After setting state, arrays should be equal");
    ok(arr3.equals(arr1, {css: ["color", "background-color"], "class": ["jsavhighlight", "testing"]}), "After setting state, arrays should be equal");
    // test that the internal array values were set properly as well
    deepEqual(arr1._values, arr3._values, "Internal values of arrays should be equal after setting state");


  });

  test("Test array indices", function() {
    var av = new JSAV("arraycontainer"),
        arr = av.ds.array([1, 2, 3, 4]);
    arr.layout();

    var ind0 = arr.index(0);
    ok(ind0 instanceof JSAV._types.ds.ArrayIndex);
    ok(ind0, "Index function returns something");
    ok(!arr.index(7), "Nothing is returned when index out of bounds");
    ok(!arr.index(-1), "Nothing is returned when index out of bounds");
    ok(!arr.index("kissa"), "Nothing is returned when index out of bounds");

    equal(ind0.value(), 1, "Index value");

    arr.highlight(0);
    ok(ind0.isHighlight());
    arr.unhighlight();
    ok(!ind0.isHighlight());

    arr.css(0, {color: "rgb(0, 0, 7)"});
    equal(ind0.css("color"), "rgb(0, 0, 7)");
  });
})();