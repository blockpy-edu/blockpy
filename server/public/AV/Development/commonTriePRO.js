/* global ODSA, PARAMS */
(function ($) {
  "use strict";
  // AV variables
  var initialData = [],
      size = PARAMS.size ? parseInt(PARAMS.size, 10) : 7,
      length = PARAMS.length ? parseInt(PARAMS.length, 10) : 4,
      stack,
      commonTrie,
      $insertLabel,
      $trieLabel,
      $nextButton,

      // configurations
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Create a JSAV instance
      av = new JSAV("jsavcontainer", {autoresize: false});

  av.recorded(); // we are not recording an AV with an algorithm

  av.code($.extend(codeOptions, code));

  function initialize() {

    if (stack) {
      stack.clear();
    }

    if (commonTrie) {
      commonTrie.clear();
    }

    // generate input
    initialData = generateArrayWithStrings(size, length);

    stack = av.ds.stack(initialData, {center: true});
    stack.click(function () {
      stack.removeFirst();
      stack.layout();
    });

    commonTrie = av.ds.tree({center: false, visible: true, autoresize: false, nodegap: 15});
    commonTrie.element.addClass("jsavcenter");
    showChildren(commonTrie.root());
    commonTrie.click(clickHandler);
    commonTrie.layout();

    // remove all old labels
    av.container.find(".exerciseElement").remove();

    // create new labels
    $insertLabel = $("<p class='exerciseElement'>" + interpret("av_insert") + "</p>");
    $trieLabel = $("<p class='exerciseElement'>" + interpret("av_common_trie") + "</p>");

    // style the labels
    $insertLabel.add($trieLabel)
      .css("text-align", "center")
      .css("font-weight", "bold");

    // insert the labels
    $insertLabel.insertBefore(stack.element);
    $trieLabel.insertBefore(commonTrie.element);

    // create button and position it on the right side of the stack
    $nextButton = $('<input id="next" type="button" value="' + interpret("av_next") + '" class="exerciseElement jsavcenter" />').insertAfter(stack.element);
    $nextButton.position({my: "left", at: "right", of: stack.element});
    $nextButton.css({left: "+=50"});
    $nextButton.click(function () {
      stack.removeFirst();
      stack.layout();
    });

    return commonTrie;
  }


  function modelSolution(jsav) {
    //higlights and unhighlights a path between root and node
    function highlightPath(root, node, undo) {
      var n = node;
      var css;
      if (undo) {
        css = {"stroke-width": "1", "stroke": "black"};
      } else {
        css = {"stroke-width": "4", "stroke": "blue"};
      }
      while (n !== root) {
        n.edgeToParent().css(css);
        n = n.parent();
      }
    }

    var msStack = jsav.ds.stack(initialData, {center: true});

    var msTree = jsav.ds.tree({center: true, visible: true, autoresize: false, nodegap: 15});

    showChildren(msTree.root());
    // msTree.element.addClass("jsavcenter");
    msTree.element.css("margin-top", 30);
    msTree.layout();

    jsav.displayInit();

    while (msStack.first()) {
      var str = msStack.first().value();
      str = str.substring(1, str.length - 1);
      var node = msTree.root();
      jsav.umsg(interpret("av_add_str"), {fill: {str: str}});
      jsav.step();

      for (var i = 0; i < str.length; i++) {
        node = node.child("abc".indexOf(str.charAt(i)));
        highlightPath(msTree.root(), node);
        if (node.hasClass("emptynode")) {
          showChildren(node);
          msTree.layout();
          jsav.step();
        }
      }
      if (!node.value()) {
        node.value(true);
        node.addClass("greenbg");
        jsav.umsg(interpret("av_set_true"), {fill: {str: str}});
      } else {
        jsav.umsg(interpret("av_already_true"), {fill: {str: str}});
      }
      jsav.step();
      highlightPath(msTree.root(), node, true);

      msStack.removeFirst();
      msStack.layout();
    }
    jsav.step();

    return msTree;
  }


  function showChildren(node) {
    node.removeClass("emptynode");
    node.value(false);
    // add empty node children
    node.child(0, "", {edgeLabel: "a"})
        .child(1, "", {edgeLabel: "b"})
        .child(2, "", {edgeLabel: "c"});
    node.child(0).addClass("emptynode");
    node.child(1).addClass("emptynode");
    node.child(2).addClass("emptynode");
    // call the layout function
    commonTrie.layout();
  }

  function clickHandler() {
    if (this.hasClass("emptynode")) {
      showChildren(this);
      // grade the step
      exercise.gradeableStep();
    } else {
      // toggle true/false
      this.value(!this.value());
      if (this.value()) {
        this.addClass("greenbg");
      } else {
        this.removeClass("greenbg");
      }
    }
  }

  // Generates an array of the size given in the first argument.
  // maxLength is given as the second argument.
  // Strings consist of the letters a, b and c and are surronded
  // by quotes (quotes not include in length). There is always
  // exactly one string which is empty.
  function generateArrayWithStrings(size, maxLength) {
    var result = [];

    for (var i = 0; i < size; i++) {
      var length = 1 + Math.floor(Math.random() * maxLength);
      var str = "\"";
      for (var c = 0; c < length; c++) {
        str += ["a", "b", "c"][Math.floor(Math.random() * 3)];
      }
      str += "\"";
      result.push(str);
    }

    result[1 + Math.floor(Math.random() * (size - 1))] = "\"\"";

    return result;
  }

  var exercise = av.exercise(modelSolution, initialize,
                             { feedback: "atend", grader: "finalStep",
                               modelDialog: {width: 780}});
  exercise.reset();

}(jQuery));
