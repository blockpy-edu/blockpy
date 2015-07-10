//change text-box with generated block sizes to stack -- look at buffer pool for stack impl.
//bst delete for rendomly generated numbers


"use strict";
/*global alert: true, ODSA */
(function ($) {
  $(document).ready(function () {

    // settings for the AV
    var settings = new JSAV.utils.Settings($(".jsavsettings"));

    // add the layout setting preference
    var arrayLayout = settings.add("layout", {"type": "select",
          "options": {"bar": "Bar", "array": "Array"},
          "label": "Array layout: ", "value": "array"});

    //containing HTML element with id ShellsortProficiency.
    var av = new JSAV($('.avcontainer'), {settings: settings});
    av.recorded();

    var ArraySize = 4; // Size of the exercise array

    var incrs = [], //array of randomly generated blocks to insert
        freeValues = [], //array of free block sizea
        initialArray = [], // needed for model answer
        theArray,
        stack,
        currIncrIndex = 0, //index of the current block size array
        usedNum,
        freeNum,
        usedAmountLabel,
        freeAmountLabel,
        freeStartArray,
        freeFinArray,
        blocks = [],
        labels = [],
        connectStartArray,
        linesArray = [];

    //creates the initial visualization of the memory pool, rectangles are created based
    //on the randomly generated values for the free list.
    function OriginalMemBlock() {

      var memPoolLabel = av.label("Memory Pool", {"left": 150, "top": 195});
      
      var used1Size = Math.floor(Math.random() * 3) + 25;
      var used2Size = Math.floor(Math.random() * 3) + 58;
      var used3Size = Math.floor(Math.random() * 3) + 30;
      var used4Size = Math.floor(Math.random() * 3) + 21;

      var free1Start = 150;
      var free1Finish = free1Start + (freeValues[0]*2);

      var free2Start = free1Finish + used1Size;
      var free2Finish = free2Start + (freeValues[1]*2);

      var free3Start = free2Finish + used2Size;
      var free3Finish = free3Start + (freeValues[2]*2);

      var free4Start = free3Finish + used3Size;    
      var free4Finish = free4Start + (freeValues[3]*2);

      var rectY = 215;
      var rectHeight = 60;

      //used blocks in memory pool
      var used1 = av.g.rect(free1Finish, rectY, used1Size, rectHeight).css({"fill": "coral"});
      var used2 = av.g.rect(free2Finish, rectY, used2Size, rectHeight).css({"fill": "coral"});
      var used3 = av.g.rect(free3Finish, rectY, used3Size, rectHeight).css({"fill": "coral"});
      var used4 = av.g.rect(free4Finish, rectY, used4Size, rectHeight).css({"fill": "coral"});

      //free blocks in memory pool
      var free1 = av.g.rect(free1Start, rectY, freeValues[0]*2, rectHeight).css({"fill": "cornflowerblue"});
      var free2 = av.g.rect(free2Start, rectY, freeValues[1]*2, rectHeight).css({"fill": "cornflowerblue"});
      var free3 = av.g.rect(free3Start, rectY, freeValues[2]*2, rectHeight).css({"fill": "cornflowerblue"});
      var free4 = av.g.rect(free4Start, rectY, freeValues[3]*2, rectHeight).css({"fill": "cornflowerblue"});
      
      freeStartArray = new Array(free1Start, free2Start, free3Start, free4Start);
      freeFinArray = new Array(free1Finish, free2Finish, free3Finish, free4Finish);

      var smallRectY = 135;
      var usedRec = av.g.rect(620, smallRectY, 30, 40).css({"fill": "coral"});
      var freeRec = av.g.rect(720, smallRectY, 30, 40).css({"fill": "cornflowerblue"});
      
      var labelY = 175;
      var usedLabel = av.label("Used Space", {left :  600, top:  labelY});
      var freeLabel = av.label("Free Space", {left :  700, top:  labelY});
      
      usedNum = used1Size + used2Size + used3Size + used4Size;
      freeNum = freeValues[0] + freeValues[1] + freeValues[2] + freeValues[3];
      
      var numLabelY = 145;
      usedAmountLabel = av.label(usedNum, {left :  622, top:  numLabelY});
      usedAmountLabel.css({"z-index": 500});

      freeAmountLabel = av.label(freeNum, {left :  722, top:  numLabelY});
      freeAmountLabel.css({"z-index": 500});

      var connect1Start = 300;
      var connect2Start = 350;
      var connect3Start = 390;
      var connect4Start = 440;

      var lineY1 = 390;
      var lineY2 = 275; 

      connectStartArray = new Array(connect1Start, connect2Start, connect3Start, connect4Start);

      var connect1end = (free1Start + free1Finish)/2;
      var connect2end = (free2Start + free2Finish)/2;
      var connect3end = (free3Start + free3Finish)/2;
      var connect4end = (free4Start + free4Finish)/2;

      //lines connecting the free list ot the memry pool (for visualization purposes)
      var connect1 = av.g.line(connect1Start, lineY1, connect1end, lineY2);
      var connect2 = av.g.line(connect2Start, lineY1, connect2end, lineY2);
      var connect3 = av.g.line(connect3Start, lineY1, connect3end, lineY2);
      var connect4 = av.g.line(connect4Start, lineY1, connect4end, lineY2);

      linesArray = new Array(connect1, connect2, connect3, connect4);
      labels = new Array(memPoolLabel, usedLabel, freeLabel, usedAmountLabel, freeAmountLabel);
      blocks = new Array(used1, used2, used3, used4, free1, free2, free3, free4, usedRec, freeRec);
    }

    //resets the exercise by getting rid of the existing memory pool (part of reset function)
    function resetAV() {
      if(blocks.length != 0) {
        for(i = 0; i < linesArray.length; i++) {
          linesArray[i].hide();
        }

        for(i = 0; i < blocks.length; i++) {
          blocks[i].hide();
        }

        for(i = 0; i < labels.length; i++) {
          labels[i].clear();
        }
      }
      currIncrIndex = 0;
    }

      
    // Generate a random (but constrained) set of four block sizes to insert
    function generateInsertionBlocks() {

      incrs[0] = Math.floor(Math.random() * 3) + 36;
      incrs[1] = Math.floor(Math.random() * 3) + 10; 
      // incrs[1] is something between incrs[0] and incrs[2]
      incrs[2] = Math.floor(Math.random() * (incrs[0] - incrs[1] - 1)) + incrs[1] + 1;
      incrs[3] = Math.floor(Math.random() * 3) + 3;
    }

    //Generate a random (but constrained) set of free blocks in the memory pool
    function generateMemoryValues() {
      freeValues[0] = Math.floor(Math.random() * 3) + 20;
      freeValues[1] = Math.floor(Math.random() * 3) + 40; 

      // freeValues[1] is something between incrs[0] and incrs[2]
      freeValues[2] = Math.floor(Math.random() * (incrs[0] - incrs[1] - 1)) + incrs[1] + 1;
      freeValues[3] = Math.floor(Math.random() * 3) + 50;
    }

    // Process reset button: Re-initialize everything, including the free blocks to insert
    function initialize() {

      //reset the exercise
      resetAV();
      generateInsertionBlocks();
      generateMemoryValues();

      //create stack to store list of block sizes for user to input
      if (stack) {
        stack.clear();
      }
      stack = av.ds.stack({top: 140, left: 40});

      for (var i = 0; i < ArraySize; i++) {
        stack.addLast(incrs[i]);
      }
      stack.layout();
      stack.first().highlight();
      
      // Log the initial state of the exercise
      OriginalMemBlock();
      var initData = {};
      initData.gen_array = initialArray;
      initData.gen_incrs = incrs;
      ODSA.AV.logExerciseInit(initData);

      if(!theArray) {
        theArray = av.ds.array(freeValues, {center: false, layout: arrayLayout.val()}).css({"x": "275", "y": "180"});
      } else {
        for(i = 0; i < 4; i++) {
          theArray.value(i, freeValues[i]);
          theArray.unhighlight(i);
        }
      }
      av.forward();
      av._undo = [];
      return theArray;
    }

    function insertIntoBlock(index) {

      var currIncr = incrs[currIncrIndex];
      var newUsedRect = av.g.rect(freeStartArray[index], 215, currIncr * 2, 60).css({"fill": "coral"});

      freeStartArray[index] = freeStartArray[index] + currIncr * 2;

     //move connecting line accordingly
      linesArray[index].movePoints([[0, connectStartArray[index], 390], [1, ((freeStartArray[index] + freeFinArray[index])/2), 275]]).css({"stroke-width": 1});
      
      freeAmountLabel.text(freeNum - currIncr);
      usedNum = usedNum + currIncr;
      usedAmountLabel.text(usedNum);

      var newValue = theArray.value(index)-currIncr;
      theArray.value(index, newValue);

      currIncrIndex += 1;
    }

    function modelSolution(jsav) {

      var modelStack = jsav.ds.stack({left: 250, center: true});
      
      for (var i = 0; i < ArraySize; i++) {
        modelStack.addLast(incrs[i]);
      }
      modelStack.layout();
      modelStack.first().highlight();

      var modelarr = jsav.ds.array([freeValues[0], freeValues[1], freeValues[2], freeValues[3]], {top: 50, left: 200});
      jsav.displayInit();

      var i, j;

      for (i = 0; i < 4; i += 1) {
        for(j = 0; j < 4; j += 1) {
          
          if(incrs[i] <= modelarr.value(j)) {

            modelarr.highlight(j);
            modelarr.unhighlight(j);
            jsav.stepOption("grade", true);


            var newVal = modelarr.value(j) - incrs[i];
            modelarr.value(j, newVal);

            modelStack.removeFirst();
            modelStack.layout();
            if (modelStack.first()) {
              modelStack.first().highlight();
            }
            jsav.step();
            break;
          }
        }
      }
      return modelarr;
    }

    // Process help button: Give a full help page for this activity
    // We might give them another HTML page to look at.
    function help() {
      //window.open("shellsorthelpPRO.html", 'helpwindow');
    }

    // Process About button: Pop up a message with an Alert
    function about() {
      //alert("Shellsort Proficiency Exercise\nWritten by Cliff Shaffer and Ville Karavirta\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    // Initialize the exercise
    // Defines the function to call on reset (initialize()), and the
    //  function to call to generate the model answer (modelSolution())
    var exer = av.exercise(modelSolution, initialize,
                           { compare:  [{css: "background-color"}, {}],
                             controls: $('.jsavexercisecontrols')});
    exer.reset();
    
    // register click handlers for the array indices
    theArray.click(function (index) {

      if (!theArray.isHighlight(index)) {
        
        theArray.highlight(index);
        setTimeout(function(){theArray.unhighlight(index)}, 250);
        exer.gradeableStep();
        //inserts "used" rectangle in memory pool (visualize using up space)
        insertIntoBlock(index);
        
        stack.removeFirst();
        stack.layout();
        //highlight the next value in the stack
        if (stack.first()) {
         stack.first().highlight();
        }
      } else {
        theArray.unhighlight(index);
      }
      av.step();
    });

    // Connect the action callbacks to the HTML entities
    $('#help').click(help);
    $('#about').click(about);
  });
}(jQuery));
