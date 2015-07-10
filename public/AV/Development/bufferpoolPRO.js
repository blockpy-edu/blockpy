// make user do everything
// moving elements up down
// deleting elements
// etc.
"use strict";
// bst stack things
(function ($) {
  $(document).ready(function () {
    var settings = new JSAV.utils.Settings($(".jsavsettings"));
    // add the layout setting preference
    var arrayLayout = settings.add("layout", {"type": "select",
          "options": {"bar": "Bar", "array": "Array"},
          "label": "Array layout: ", "value": "array"});

    //containing HTML element with id ShellsortProficiency.
    var av = new JSAV($('.avcontainer'), {settings: settings});
    av.recorded();

    // Create a convenience function named tell for writing to the
    // output buffer
    var tell = function (msg, color) { av.umsg(msg, {color: color}); };

    var ArraySize = 9; // Size of the exercise array

    var lines = [],
    main_memory,
    buffer_pool,
    temp_storage,
    stack,
    insert_array = []

    var counter = 0;
    var mode = "insert_new";
    var old_val = -1;

    function help() {
    }

    // Process About button: Pop up a message with an Alert
    function about() {
    }

    function initialize() {
      if (stack) {
        stack.clear();
      }
      stack = av.ds.stack({left: 500, top: 450, center: true});
      var random = [];
      random.length = ArraySize;
      insert_array.length = ArraySize;
      for (var i = 0; i < ArraySize; i++) {
        random[i] = Math.floor(Math.random() * (ArraySize - 0 + 1)) + 0;
        stack.addLast(random[i]);
        insert_array[i] = random[i];
      }
      stack.layout();
      stack.first().highlight();
      var index = [];
      index.length = ArraySize;
      for (i = 0; i < 9; i++) {
        index[i] = i;
      }
      main_memory = av.ds.array(index, {top: 55, left: 150, index: true, layout: "vertical"});
      
      var empty = [];
      empty.length = 1;
      temp_storage = av.ds.array(empty, {top:300, left: 500});
      temp_storage.click(clickHandlerTemp);

      empty.length = 4;
      buffer_pool = av.ds.array(empty, {top: 55, left: 500, layout: "vertical"});
      buffer_pool.click(clickHandler);
      av.forward();
      return buffer_pool;
    }

    function model_solution(jsav) {
      var empty = [];
      empty.length = buffer_pool.size();
      var model_array = jsav.ds.array(empty, {top: -165, left: 475, layout: "vertical"});
      empty.length = 1;
      var temp_array = jsav.ds.array(empty);
      jsav.displayInit();
      // number of elements in array
      var size = 0;
      var i;
      for (var i = 0; i < insert_array.length; i++) {
        var index = contains(model_array, insert_array[i]);
        if (index != -1) {
          var storage = model_array.value(index);
          model_array.value(index, "");
          temp_array.value(0, storage);
          jsav.gradeableStep();
          var j;
          for (j = index-1; j > -1; j--) {
            var temp = model_array.value(j);
            model_array.value(j, "");
            model_array.value(j+1, temp);
            jsav.gradeableStep();
          }
          temp_array.value(0, "");
          model_array.value(0, insert_array[i]);
          jsav.gradeableStep();
        }
        else if (size < buffer_pool.size() && size == 0) {
          model_array.value(i, insert_array[i]);
          jsav.gradeableStep();
          size++;
        }
        else if (size < buffer_pool.size() && size > 0) {
          var j;
          for (j = size-1; j > -1; j--) {
            var temp = model_array.value(j);
            model_array.value(j, "");
            model_array.value(j+1, temp);
            jsav.gradeableStep();
          }
          model_array.value(0, insert_array[i]);
          jsav.gradeableStep();
          size++;
        }
        else if (size >=buffer_pool.size()) {
          model_array.value(buffer_pool.size()-1, "");
          jsav.gradeableStep();
          for (j = buffer_pool.size()-2; j > -1; j--) {
            var temp = model_array.value(j);
            model_array.value(j, "");
            model_array.value(j+1, temp);
            jsav.gradeableStep();
          }
          model_array.value(0, insert_array[i]);
          jsav.gradeableStep();
        }
      }
      return model_array;
    }

    // searches the array for a value, returns the index
    // if found, -1 if not
    function contains(array, value) {
      var i; 
      for (i = 0; i < array.size(); i++) {
        if (array.value(i) === value) {
          return i;
        }
      }
      return -1;
    }
    function clickHandler(index) {
      // has element
      if (buffer_pool.value(index) || buffer_pool.value(index) !== "") {
        if (mode == "move_old" && old_val == -1) {
          old_val = this.value(index);
          this.value(index, "");
        }
        if (mode == "delete") {
          this.value(index, "");
          exer.gradeableStep();
        }
      }
      // empty box
      else if (!buffer_pool.value(index) || buffer_pool.value(index) === "") {
        if (mode == "insert_new") {
          counter++;
          this.value(index, stack.first().value());
          stack.removeFirst();
          stack.layout();
          if(stack.first())
            stack.first().highlight();
          exer.gradeableStep();
        }
        else if (mode == "move_old" && old_val != -1) {
          this.value(index, old_val);
          old_val = -1;
          exer.gradeableStep();
        }
      }
    }
    function clickHandlerTemp(index) {
      console.log(old_val);
      // has element
      if (temp_storage.value(index) || temp_storage.value(index) !== "") {
        if (mode == "move_old" && old_val == -1) {
          old_val = this.value(index);
          temp_storage.value(index, "");
        }
      }
      else {
        if (mode == "move_old" && old_val != -1) {
          temp_storage.value(index, old_val);
          old_val = -1;
          stack.removeFirst();
          stack.layout();
          if(stack.first())
            stack.first().highlight();
          exer.gradeableStep();
        }
      }
      console.log(index);
    }
    // When button insert is pressed
    function insert() {
      mode = "insert_new";
    }
    // When button move is pressed
    function  move() {
      mode = "move_old";
    }
    // When button delete is pressed
    function deleting() {
      mode = "delete";
    }
    // initialize the exercise
    var exer = av.exercise(model_solution, initialize,
                           { compare: {css: "background-color"}, 
                             feedback: "continuous"});
    exer.reset();

    $('#help').click(help);
    $('#about').click(about);
    $('#insert').click(insert);
    $('#move').click(move);
    $('#delete').click(deleting);
  });

}(jQuery));