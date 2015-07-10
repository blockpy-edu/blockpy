/*global ok,test,module,deepEqual,equal,expect,equals,notEqual */
module("core", {  });

test("JSAV", function() {
  expect(4);
  ok( JSAV, "JSAV" );
  ok( JSAV.ext, "JSAV extensions");
  ok( JSAV.init, "JSAV init");
  var av = new JSAV("emptycontainer");
  ok( av, "JSAV initialized" );
});

test("JSAV container options", function() {
  var avDOM = new JSAV(document.getElementById("emptycontainer"));
  ok(avDOM, "Passing a DOM element");

  var avjQuery = new JSAV($("#emptycontainer"));
  ok(avjQuery, "Passing a jQuery object");

  var avStringId = new JSAV("emptycontainer");
  ok(avStringId, "Passing an element id");

  var avDOMOpt = new JSAV({element: document.getElementById("emptycontainer")});
  ok(avDOMOpt, "Passing a DOM element as an option");

  var avjQueryOpt = new JSAV({element: jQuery("#emptycontainer")});
  ok(avjQueryOpt, "Passing a jQuery object as an option");

  var avSelectorOpt = new JSAV({element: "#emptycontainer"});
  ok(avSelectorOpt, "Passing a selector as an option");

  window.JSAV_OPTIONS = {element: "#emptycontainer"};
  var avSelectorGlobalOpt = new JSAV();
  ok(avSelectorGlobalOpt, "Element as a selector in global JSAV_OPTION");
  delete window.JSAV_OPTIONS;
});

test("JSAV Options", function() {
  // simple test to see if global JSAV_OPTIONS works
  window.JSAV_OPTIONS = {cat: 0, dog: 1};
  var av = new JSAV("emptycontainer", {cat: 3, turtle: 42});
  equal(av.options.turtle, 42, "Basic option preserved");
  equal(av.options.dog, 1, "Global option");
  equal(av.options.cat, 3, "Global option also specified on initialization");
  // delete the global variable
  delete window.JSAV_OPTIONS;
});