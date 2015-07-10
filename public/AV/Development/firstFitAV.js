"use strict";
(function ($) {
  var jsav,              // JSAV
      defCtrlState,   // Stores the default state of the controls
      submitRec,      //the rectangle that's created when the user hits submit
      linesArray,
      freeStartArray,
      requestedBlockLabel,
      connectStartArray,
      recArraySize,
      freeOrNot,
      startArray,
      freeFinArray,
      freeAmountLabel,
      freeNum,
      usedAmountLabel,
      usedNum,
      rectNumber = 0,
      end = false,
      array,
      insert,
      index = 0,
      finn,
      flag,
      prevClick,
      startIndex = 0,
      sizee,
      ins = 0,
      fit = 0,
      total,
      endOfBlock;


  function setDefaultControlState() {
    defCtrlState = {};
    defCtrlState.fitAlgorithm = 0;
  
    var params = JSAV.utils.getQueryParameter();

    if(params.fitAlgorithm) {
      if(params.fitAlgorithm > 0 && params.fitAlgorithm <= 4) {
        defCtrlState.fitAlgorithm = params.fitAlgorithm;
        // Disable so user can't change the value set by parameter
        $('#fitAlgorithm').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter method: " + params.hashFunct);
      }
    }
  }
  

  function about() {
    alert("First Fit Algorithm Visualization\nWritten by Cliff Shaffer and Mauricio De La Barra\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
  }

  // Reset the visualization
  function reset() {
    console.log("In reset");
    // Clear any existing messages and hash table data
    jsav.clearumsg();
    
    // Reset controls to their default state
    $("#fitAlgorithm").val(defCtrlState.fitAlgorithm);

    if (defCtrlState.fitAlgorithm === 0) {
      // Ensure user selected a fit function
      jsav.umsg("Please select a fit algorithm");
    }
    else {
      $("#fitAlgorithm").change()
    }
    //enable the input box 
    $("#input").val("");
    OriginalMemBlock();
    $('#next').attr("disabled", "disabled");
    if($("#fitAlgorithm").val() === 0) {
      $('#submit').attr("disabled", "disabled");
    }
  }

  //function that declares the original memory blocks
  //also declares 2 arrays that refrence the memory blocks 
  //also declare a jsav array for the free array
  function OriginalMemBlock() {


     ins = 0;
     fit = 0;
     startIndex = 0;
     index = 0;

    
      var free1Size = Math.floor(Math.random() * 5) + 25;
      var free2Size = Math.floor(Math.random() * 5) + 32;
      var free3Size = Math.floor(Math.random() * 5) + 35;
      var free4Size = Math.floor(Math.random() * 5) + 45;

      

      var used1Size = Math.floor(Math.random() * 5) + 10;
      var used2Size = Math.floor(Math.random() * 5) + 25;
      var used3Size = Math.floor(Math.random() * 5) + 18;
      var used4Size = Math.floor(Math.random() * 5) + 20;

       total = free1Size + free2Size + free3Size + free4Size + used1Size + used2Size + used3Size + used4Size;

      var freeValues = new Array(free1Size, free2Size, free3Size, free4Size);

      var free1Start = 280;
      var free1Finish = free1Start + (freeValues[0]*2.5);

      var free2Start = free1Finish + used1Size*2.5;
      var free2Finish = free2Start + (freeValues[1]*2.5);

      var free3Start = free2Finish + used2Size*2.5;
      var free3Finish = free3Start + (freeValues[2]*2.5);

      var free4Start = free3Finish + used3Size*2.5;    
      var free4Finish = free4Start + (freeValues[3]*2.5);

      var rectY = 150;
      var rectHeight = 30;

      endOfBlock = free4Finish + used4Size*2.5;

      //used blocks in memory pool
      var used1 = jsav.g.rect(free1Finish, rectY, used1Size*2.5, rectHeight).css({"fill": "coral"});
      var used2 = jsav.g.rect(free2Finish, rectY, used2Size*2.5, rectHeight).css({"fill": "coral"});
      var used3 = jsav.g.rect(free3Finish, rectY, used3Size*2.5, rectHeight).css({"fill": "coral"});
      var used4 = jsav.g.rect(free4Finish, rectY, used4Size*2.5, rectHeight).css({"fill": "coral"});

      //click handler for used blocks
      $("rect").on("click", changeUsed);

      //free blocks in memory pool
      var free1 = jsav.g.rect(free1Start, rectY, freeValues[0]*2.5, rectHeight).css({"fill": "cornflowerblue"});
      var free2 = jsav.g.rect(free2Start, rectY, freeValues[1]*2.5, rectHeight).css({"fill": "cornflowerblue"});
      var free3 = jsav.g.rect(free3Start, rectY, freeValues[2]*2.5, rectHeight).css({"fill": "cornflowerblue"});
      var free4 = jsav.g.rect(free4Start, rectY, freeValues[3]*2.5, rectHeight).css({"fill": "cornflowerblue"});

      
    startArray = new Array(30);

    //array inicating if a given block is free
    //1 indicates free 0 is not
    freeOrNot = new Array(30);  
    

    startArray[0] = free1Start;
    startArray[1] = free1Finish;
    startArray[2] = free2Start;
    startArray[3] = free2Finish; 
    startArray[4] = free3Start; 
    startArray[5] = free3Finish; 
    startArray[6] = free4Start;
    startArray[7] = free4Finish;
    startArray[8] = endOfBlock; 

    freeOrNot[0] = 1;
    freeOrNot[1] = 0;
    freeOrNot[2] = 1;
    freeOrNot[3] = 0;
    freeOrNot[4] = 1;
    freeOrNot[5] = 0;
    freeOrNot[6] = 1;
    freeOrNot[7] = 0;

    freeStartArray = new Array(free1Start, free2Start, free3Start, free4Start);

    
    freeFinArray = new Array(free1Finish, free2Finish, free3Finish, free4Finish);
    
    //2 rectangles at top of screen that show how much memory is used/remains
    var usedRec = jsav.g.rect(620, 20, 30, 30).css({"fill": "coral"});
    var freeRec = jsav.g.rect(720, 20, 30, 30).css({"fill": "cornflowerblue"});
    //labels the blocks at the top of the screen
    var usedLabel = jsav.label("Used Space", {left :  600, top:  45});
    var freeLabel = jsav.label("Free Space", {left :  700, top:  45});
    
    //initial new and used nums
    usedNum = used1Size + used2Size + used3Size + used4Size;
    freeNum = free2Size + free3Size + free1Size + free4Size;
    
    //label declaring how much is initially used
    usedAmountLabel = jsav.label(usedNum, {left :  625, top:  10});
    usedAmountLabel.css({"z-index": 500});

    //label declaring how much is initially free
    freeAmountLabel = jsav.label(freeNum, {left :  720, top:  10});
    freeAmountLabel.css({"z-index": 500});

  
    //jsav array object to act as the free list
    array = jsav.ds.array([free1Size, free2Size, free3Size, free4Size], {"left": 280, "top": 400, "bottom": 500});

    //labels the free list
    var freeLabel = jsav.label("Free List", {left : 300, top: 450});


    var connect1Start = 300;
    var connect2Start = 330;
    var connect3Start = 360;
    var connect4Start = 390;
    connectStartArray = new Array(connect1Start, connect2Start, connect3Start, connect4Start);

    //initial lines connecting free list to mem pool
    var lbottom = 416;
    var ltop = 180;
    var connect1 = jsav.g.line(connect1Start, lbottom, (free1Start + free1Finish)/2, ltop);
    var connect2 = jsav.g.line(connect2Start, lbottom, (free2Start + free2Finish)/2, ltop);
    var connect3 = jsav.g.line(connect3Start, lbottom, (free3Start + free3Finish)/2, ltop);
    var connect4 = jsav.g.line(connect4Start, lbottom, (free4Start + free4Finish)/2, ltop);

    linesArray = new Array(connect1, connect2, connect3, connect4);

    //initaial size of the rec array
    recArraySize = 8;

    //global var set to 0, used when inserting
    insert = 0;
  }

  //function makes the rec that appears on your screen right after hitting submit
  function newRec(sizeX)
  {
    sizeX = sizeX*2.5; //note size gets multiplied by 2.5 before going to jsav, original size is too small
    submitRec = jsav.g.rect(280, 300, sizeX, 30).css({"fill": "cyan"});
    requestedBlockLabel = jsav.label("Requested Block", {"left": 280, "top": 270}).css({"font-weight": "bold"});

  }

  //function that utilizes the click handler
  //use of flags because after multiple rectangles are added and merged
  //multiple click handlers can be on the same spot
  //flag system works by not allowing two back to back
  //clicks on the same spot unless a rec is inserted between
  function changeUsed(event)
  {
    var x, y;
    console.log("this: " + this + ", event: " + event);
    this.setAttribute("fill", "cornflowerblue");
    var click = event.pageX;
     var i = 0;
     //subtract 23 because of html and jsav difference
     var clickSpot = click -23;

      while(clickSpot > startArray[i])
      {
        i++;
      }
       i--;
       
       
       if(flag == 1)
       {
          if(clickSpot != prevClick)
          {
            
            merge(click);
            
          }
         
       }
       else
       {
        
          merge(click);
          
          flag = 1;
       }
  

        prevClick = clickSpot;
   
  }

  function enableAllButtons() {
    $("#input").removeAttr("disabled");
    $("#submit").removeAttr("disabled");
    $("#next").removeAttr("disabled");
  }
  //function merges rectangles when a used one is deallocated
  function merge(clickSpot)
  {
      //subtract 23 because of html and jsav difference
      clickSpot = clickSpot -23; 
      
      var i = 0;
      //loop - 1 gets the clickspot
      while(clickSpot > startArray[i])
      {
        i++;
      }
       i--;
      //click occued on block on the right (special case)
      if(clickSpot <= endOfBlock && clickSpot >= startArray[recArraySize -1])
      {
        
        var start = startArray[recArraySize-2];
        //calculate size of rec to insert
        var diff = endOfBlock - start;
        var newrec = jsav.g.rect(start, 150, diff, 30).css({"fill": "cornflowerblue"});
        newrec.css({"z-index": 500});
        startArray[i] = endOfBlock;
        freeOrNot[recArraySize -1] = null;
        freeOrNot[recArraySize -2] = 1;
        recArraySize--;
        
        flag = 1;
        end = true;

      }
      //click occurs in first block (another special case)
      else if(i == 0 && freeOrNot[0] == 0)
      {
        //calculating size of block
        var diff = startArray[2]-280;
        //free blocks and used blocks shift
        freeOrNot[0] = 1;
        freeOrNot[1] = 0;
        startArray[1] = startArray[2];
        var j;
        //all blocks after the first two also shift
        for(j =2; j < recArraySize; j++)
        {
          freeOrNot[j-1] = freeOrNot[j];
          startArray[j-1] = startArray[j];
        }
        freeOrNot[0] = 1;
        //block 0 always starts at 280
        startArray[0] = 280;
        //note new recs are not given click handlers because they are free
        var newRect = jsav.g.rect(280, 150, diff, 30).css({"fill": "cornflowerblue"});
        newRect.css({"z-index": 500});
        //size shrinks when 2 blocks merge
        recArraySize--;
      }
      else if(freeOrNot[i] == 0)
      {  
        
        //calculating size of block 
        var diff = startArray[i +2] - startArray[i-1];
        //note new recs are not given click handlers because they are free
        var newRect = jsav.g.rect(startArray[i-1], 150, diff, 30).css({"fill": "cornflowerblue"});
        newRect.css({"z-index": 500});
        //updating size of the number of blocks in the mem pool
        if(recArraySize > 2)
        {
          recArraySize = recArraySize - 2;
        }
        else if(recArraySize == 2)
        {
          recArraySize = recArraySize -1;
        }
        var j = recArraySize;
        //all elements after i shift
        for(i; i < j; i++)
        {
          //recArray[i] = recArray[i + 2];
          startArray[i] = startArray[i + 2];
          freeOrNot[i] = freeOrNot[i+2];
          // finArray[i] = finArray[i + 2];
       }

       startArray[recArraySize +1] = null;
       freeOrNot[recArraySize +1 ] = null;
       freeOrNot[recArraySize] = null;
       startArray[recArraySize] = null;
       // recArray[recArraySize +1] = null;
       // recArray[recArraySize] = null;
       // finArray[recArraySize] = null;
       // finArray[recArraySize + 1] = null;
     }
          //setting all unused spots in the array to null to prevent miscalculation
          var n = recArraySize;
          for (n; n<30; n++)
            {
              startArray[n] = null;
              //recArray[n] = null;
            }
            if(end == true)
            {
              //startArray[recArraySize] = 780;
              if(recArraySize ==1)
                {
                  startArray[recArraySize -1] = 280;
                }
            }
            //last elemnt in the start array + 1 is always end of block
            startArray[recArraySize] = endOfBlock;
            freeCheck();
            //update array and merge lines
            updateArray();
            updateLinesOnMerge();
 }
    //assures the free or not array is correct
    function freeCheck()
    {
      var i = 0;

          for(i; i<recArraySize;i++)
          {
            if(freeOrNot[i] == 0)
            {
              freeOrNot[i+1] = 1;
            }
            else if(freeOrNot[i] == 1)
            {
              freeOrNot[i+1] = 0;
            }
          }
          freeOrNot[recArraySize] = null;
      }
      
    
    //updates the jsav array after an insert or merge
    function updateArray()
    {
        
        //in this case there is only one free rec of size the total
        if(recArraySize == 1 && freeOrNot[0] == 1)
        {
          array.hide();
          array = jsav.ds.array([total], {"left": 280, "top": 400, "bottom": 500});
        }
        else
        {
          
          var i;
          var num = 0;
          var one;
          var two;
          var three; 
          var four;
          for(i = 0; i < recArraySize; i++)
          {
            if(freeOrNot[i] == 1) 
            {
              num++;
              //if statements calculate the size of each free block and divide by 2.5 to put into scale
              if(num == 1)
              {
                one = startArray[i +1] - startArray[i];
                one = one/2.5;
                one = Math.round(one);
                
              }
               else if(num == 2)
              {
                two = startArray[i +1] - startArray[i];
                two = two/2.5;
                two = Math.round(two);
              }
               else if(num == 3)
              {
                three = startArray[i +1] - startArray[i];
                three = three/2.5;
                three = Math.round(three);

              }
               else if(num == 4)
              {
           
                four = startArray[i+1] - startArray[i];
              
                four = four/2.5
               four = Math.round(four);
                //four = 55;
               
                
              }
              // if(one < 1 || one == null)
              // {
                 
              //    one = 780 - startArray[i];
              //    one = one/2.5;
              //    one = Math.round(one);
                
              // }
              // else if(two < 1 || two == null)
              // {
                 
              //    two= 780 - startArray[i];
              //    two = two/2.5;
              //   two = Math.round(two);
                
              // }
              // else if(three < 1 || three == null)
              // {
                
              //    three = 780 - startArray[i];
              //    three = three/2.5;
              //   three = Math.round(three);
                 
              // }
              // else if(four < 1 || four == null)
              // {
                  
                 
              //    four = 780 - startArray[i];
              //    four = four/2.5;
              //    four = Math.round(four);
                 
              // }
              
            }

          }
          //sees of many free blocks there are
          var count;
          var i;
          for(i=0; i < recArraySize; i++)
          {
            if(freeOrNot[i]==1)
            {
              count++;
            }
          }
          
          
           //hides the old array so the new one can be added 
          array.hide();
              if(num == 1)
              {

                array = jsav.ds.array([one], {"left": 280, "top": 400, "bottom": 500});
              }
              else if(num ==2)
              {
                array = jsav.ds.array([one, two], {"left": 280, "top": 400, "bottom": 500});
              }
              else if (num == 3)
              {
                array = jsav.ds.array([one, two, three], {"left": 280, "top": 400, "bottom": 500});
              }
              else if (num == 4)
              {
                array = jsav.ds.array([one, two, three, four], {"left": 280, "top": 400, "bottom": 500});
              }
              else if(count == 0)
              {
                array = jsav.ds.array([], {"left": 280, "top": 400, "bottom": 500});
              }


            
    
        }
        // var i = 0;
        // while(freeOrNot[i] == 0)
        // {
        //   if(i == recArraySize)
        //   {
        //     array.hide();
        //   }
        //   i++;

        // }

        //updates the labels with the new free amount and used amount
        updateLabels();
        
    }
    //gets the size of a block, not the actual jsav size (jsav/2.5)
    function getSize(rect)
    {
        //var rec = rect -1;
        var size = startArray[rect +1] - startArray[rect];
        size = size/2.5;
        return size;
  
  }
  //updates labels of free num and used num
  function updateLabels()
  {
      usedAmountLabel.clear();
      freeAmountLabel.clear();

      var one = 0;
      var two = 0;
      var three = 0;
      var four = 0;

      if(array.value(0) != null)
      {
        var one = array.value(0);
      }
      if(array.value(1) != null)
      {
        two = array.value(1);
      }
      
      if(array.value(2) != null)
      {
        three = array.value(2);
      }
      
      if(array.value(3) != null)
      {
         four = array.value(3);
      }
      
     

     
      freeNum = one + two + three + four;
      usedNum = total - freeNum;
      usedAmountLabel = jsav.label(usedNum, {left :  625, top:  10});
      usedAmountLabel.css({"z-index": 500});

      freeAmountLabel = jsav.label(freeNum, {left :  720, top:  10});
      freeAmountLabel.css({"z-index": 500});

      var i = 0;
      var count = 0;
      //calculates number of free blocks
      for(i; i <recArraySize; i++)
      {
        if(freeOrNot[i]==1)
        {
          count++;
        }
      }
      //if there are no free blcoks then used num = total and free = 0
      if(count == 0)
      {
        usedAmountLabel.clear();
        freeAmountLabel.clear();
        usedNum = total;
        freeNum = 0;
         usedAmountLabel = jsav.label(usedNum, {left :  625, top:  10});
        usedAmountLabel.css({"z-index": 500});

        freeAmountLabel = jsav.label(freeNum, {left :  720, top:  10});
        freeAmountLabel.css({"z-index": 500});
       
      }
  }
  //updates the lines if an add occurs
  function updateLinesOnAdd() {   var j = 0;
    var lbottom = 416;
    var ltop = 180;
    //loop calculates which blocks were effected
    //finn is the array spot the block was inseerted to
    while(i < recArraySize) {
      if(freeOrNot[i] == 1) {
	j++;
      }
      if(i == finn) {
	break;
      }
      i++;
    }
    var k = 0;
    i = 0;
    while(i < recArraySize) { 
      //calculates where free blocks start and finsih to be used to move lines
      if(freeOrNot[i] == 1) {
	freeStartArray[k] = startArray[i];
	freeFinArray[k]= startArray[i+1];
	if(i == 0) {
	  freeStartArray[i] = 280;
	}
	if(i == 1) {
            freeStartArray[0] = startArray[1];
	}
	k++;
      }
      i++;
    }
    //used to check if any free blocks remain
    var count =0;
    for(i = 0; i <recArraySize; i++) {
      if( freeOrNot[i] == 1) {
	count++;
      }
    }
    //group of if/if else statements use previously claculated start and end points to update lines
    if(array.size() == 4) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, connectStartArray[2], lbottom], [1, ((freeStartArray[2] + freeFinArray[2])/2), ltop]]).css({"stroke-width": 1});
      linesArray[3].movePoints([[0, connectStartArray[3], lbottom], [1, ((freeStartArray[3] + freeFinArray[3])/2), ltop]]).css({"stroke-width": 1});
    } else if(array.size() == 3) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, connectStartArray[2], lbottom], [1, ((freeStartArray[2] + freeFinArray[2])/2), ltop]]).css({"stroke-width": 1});
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else if(array.size() == 2) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else if(array.size() == 1 & count != 0) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else {
      linesArray[0].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[1].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]); 
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]); 
    }
    var as = array.size();
  }
  

  //very similar to method above except these line shifts occur on merges
  function updateLinesOnMerge() {
    var lbottom = 416;
    var ltop = 180;
    var j = 0;
    while(i < recArraySize) {
      if(freeOrNot[i] == 1) {
	j++;
      }
      if(i == finn) {
	break;
      }
      i++;
    }
    var k = 0;
    i = 0;
    while(i < recArraySize) { 
      if(freeOrNot[i] == 1) {
	//seperate method needed for add and merge becuase 
	//on merge 3 blcoks turn to one free block
	freeStartArray[k] = startArray[i-1];
	freeFinArray[k]= startArray[i+1];
	if(i == 0) {
	  freeStartArray[i] = 280;
	}
	if(i > 0) {
	  freeStartArray[k] = startArray[i];
	  freeFinArray[k] = startArray[i + 1];
	}
	k++;
      }
      i++;
    }
    var size = array.size();

    if(array.size() == 4) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, connectStartArray[2], lbottom], [1, ((freeStartArray[2] + freeFinArray[2])/2), ltop]]).css({"stroke-width": 1});
      linesArray[3].movePoints([[0, connectStartArray[3], lbottom], [1, ((freeStartArray[3] + freeFinArray[3])/2), ltop]]).css({"stroke-width": 1});
    } else if(array.size() == 3) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, connectStartArray[2], lbottom], [1, ((freeStartArray[2] + freeFinArray[2])/2), ltop]]).css({"stroke-width": 1});
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else if(array.size() == 2) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, connectStartArray[1], lbottom], [1, ((freeStartArray[1] + freeFinArray[1])/2), ltop]]).css({"stroke-width": 1});
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else if(array.size() == 1) {
      linesArray[0].movePoints([[0, connectStartArray[0], lbottom], [1, ((freeStartArray[0] + freeFinArray[0])/2), ltop]]).css({"stroke-width": 1});
      linesArray[1].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]);
    } else if(array.value(0) == null) {
      linesArray[0].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[1].movePoints([[0, 0, 0], [1,0,0]]);
      linesArray[2].movePoints([[0, 0, 0], [1,0,0]]); 
      linesArray[3].movePoints([[0, 0, 0], [1,0,0]]); 
    }
  }
  
  //method to show users how search for correct block works
  //the blocks new spot in the array and its size are passed in
  //used by all algos except circular fit
  function stepsToInsert(fin, size)
  {
      
      var whichRec;
      var i = 0;
      var j = 0;
      //calculates which free block fin corresponds to
      while(i < recArraySize)
      {
        if(freeOrNot[i] == 1)
        {
          j++;
        }
        if(i == fin)
        {
          
          break;
        }
        i++;
      }
      fin = j;

      var error = array.size();
      //cant be a fin greater than the size of the free array
      if(fin > error)
      {
        jsav.umsg("There is an error with your allocation")
      }
      //if fin == insert we have a match
      //insert starts at 0 and counts up until it reaches fin
      //each click of next is another step
      if(fin == insert && finn != 30)
      {
        
        //jsav.umsg("Press Next to allocate")
        //adds rec to appropriate block
        addRec(finn, size);
        //next button disabled until next submit is pressed
         $('#next').attr("disabled", "disabled");
        ins = 0;
        insert = 0;

      }
      else if(fin > insert && insert <= 3) //we do not have a good block yet
      {
          var size = array.value(insert);
          jsav.umsg("Free List Block " + insert + " size " + size)
          linesArray[insert].css({"stroke-width": 3});  //darken stroke width of current line  
          if(insert != 0)
          {
            linesArray[insert-1].css({"stroke-width": 1}); //undarken stroke width of previous line
          }
          array.unhighlight(insert -1);
          array.highlight(insert);
          insert++; //increase insert so it moves closer to fin
          if(fin == insert && finn != 30)
          {
            jsav.umsg("We have a Fit at Free Block " + fin)
            jsav.umsg("Press next to allocate")
          }
          

      }
      else if(insert == 4)  //insert == 4 only if the size of the allocation is too big
      {
          
          array.unhighlight(insert -1);
          array.highlight(insert);
          linesArray[insert].css({"stroke-width": 3});
          if(insert != 0)
          {
            linesArray[insert-1].css({"stroke-width": 1});
          }
            jsav.umsg("Your allocation is too big  deallocate and try again")
           $('#next').attr("disabled", "disabled");
           ins = 0;
          insert = 0; //reset insert
      }

      

  }


  //algorithm for first fit
  function firstFit(inputVal) {
    //multiply input by 2.5 so it is scaled up to size of mem blocks
    var size = inputVal *2.5;
    var freeAmount = array.size();
    var rec1Size;
    var rec2Size;
    var rec3Size;
    var rec4Size;

    var freeRecs = new Array(0, 0, 0, 0);
    var i = 0;
    var j = 0;
    //adds free recs to array of free recs
    for(i; i < recArraySize ; i++)
    {

        if(freeOrNot[i] == 1)
        {
          freeRecs[j] = i;
          j++;
        }

    }

    var rec1 = freeRecs[0];
    var rec2 = freeRecs[1];
    var rec3 = freeRecs[2];
    var rec4 = freeRecs[3];

    var fin;
    //if statements get the size of the free recs
    //get size returns scaled sclaed down size
    if(rec1 != null)
    {
        rec1Size = getSize(rec1);
    }
    if(rec2 != null)
    {
        rec2Size = getSize(rec2);
    }
    if(rec3 != null)
    {
        rec3Size = getSize(rec3);
    }
    if(rec4 != null)
    {
        rec4Size = getSize(rec4);
    }
    //checks if input val is less than the recs size strating with the first
    //if there is one that fits we have our guy
    if(inputVal <= rec1Size)
    {
        fin = rec1;
    }
    else if(inputVal <= rec2Size)
    {
        fin = rec2;
    }
    else if(inputVal <= rec3Size)
    {
        fin = rec3;
    }
    else if(inputVal <= rec4Size)
    {
        fin = rec4;
    }
    else{
      fin = 30; //assign fin to 30 if no match becuase the array of recs can hold a max of 30 elements
    }

    finn = fin;
    sizee = size;
    var range = size/2.5;
    //calls method to insert block
    stepsToInsert(fin, size);
    
  }
  //method adds newly allocated block to mem pool
function addRec(fin, size)
{

  var showSize = size /2.5;
  var size1 = size;
    //if the array position to add is not 0
    if(fin != 0 )
    {
      //if the size of the allocated blcok and the free block are not the same
      if(getSize(fin) != showSize)
       { 
        //gets size of block to add
        var add = getSize(fin-1);
        add = add*2.5;
        size1 =size;
        size = add + size;
        var newRect2 = jsav.g.rect(startArray[fin - 1], 150, size, 30).css({"fill": "coral"});
        //rec gets click handler since it is used
        $("rect").on("click", changeUsed);
        newRect2.css({"z-index": 500});
        startArray[fin] =startArray[fin] + size1;
        var i;
       } 
      else if(getSize(fin) == showSize) //if the block does match the siz eof th efree space
      {
        var next = startArray[fin+2] - startArray[fin-1];
        if(next < 0)
        {
          next = endOfBlock - startArray[fin-1];
        }
        var newRect2 = jsav.g.rect(startArray[fin - 1], 150, next, 30).css({"fill": "coral"});
        $("rect").on("click", changeUsed);
        newRect2.css({"z-index": 500});
        var i;
        
        var dif = startArray[fin +1] - startArray[fin-1];
        var a = startArray[fin+2] - startArray[fin+1];
        startArray[fin] = a + dif;
        freeOrNot[fin -1] = 0;
       //loop to update both arrays after new rec has been added
        for(i = fin + 2; i< recArraySize +1; i++)
        {
          if(startArray[i-2] > 0)
          {
            
            startArray[i-2]= startArray[i];
            freeOrNot[i-2] = freeOrNot[i];
            
          }
        }
        recArraySize= recArraySize - 2;
      }
        else{
              startArray[fin] = startArray[fin] + size1;
          }
      

  }
  //if the block is to be added to postiton 0
  else if(fin == 0)
  {
      if(freeOrNot[1] == 0)
      {
        //if block isnt size of free space
        if(getSize(fin) != showSize)
        {  
          var newRect2 = jsav.g.rect(280, 150, size1, 30).css({"fill": "coral"});
          $("rect").on("click", changeUsed);
          newRect2.css({"z-index": 500});
          recArraySize++;
          var j;
          var tmpStArray = new Array(30);
          var tmpfreeArray = new Array(30);
          tmpStArray[0] = 280;
          tmpStArray[1] = 280 + size;
          tmpfreeArray[0] = 0;
          tmpfreeArray[1] = 1;
          
            for(j = 2;j< 20; j++)
            {
              tmpfreeArray[j] = freeOrNot[j-1];
              tmpStArray[j] = startArray[j-1];
            }
          
              freeOrNot = tmpfreeArray;
              startArray = tmpStArray;
          }
            else if(getSize(fin) == showSize)
            {
                
                var diff = startArray[2] -280;
                var newRect2 = jsav.g.rect(280, 150, diff, 30).css({"fill": "coral"});
                $("rect").on("click", changeUsed);
                newRect2.css({"z-index": 500});
                var i = 1;
                startArray[0] = 280;
                freeOrNot[1] = 0;
                //startArray[1] = startArray[2];
                freeOrNot[0] = 0;
                freeOrNot[1] = freeOrNot[2];
                startArray[1] = startArray[2];
               
                for(i =1; i < recArraySize+1;i++)
                {
                  startArray[i-1]= startArray[i];
                  freeOrNot[i-1] = freeOrNot[i];
                }
              freeOrNot[0] = 0;
              startArray[0] = 280;
              recArraySize--;
            }
           
        }
         else if(freeOrNot[0] == 1)
            {   
                var newRect2 = jsav.g.rect(280, 150, size, 30).css({"fill": "coral"});
                $("rect").on("click", changeUsed);
                newRect2.css({"z-index": 500});
                startArray[1] = 280 + size;
                freeOrNot[0] = 0;
                freeOrNot[1] = 1;
                startArray[2] = endOfBlock;
                recArraySize++;
                
            }

            
    }     //last spot in the array goes to the very end 
          startArray[recArraySize] =endOfBlock;
 
            

    freeCheck();
    updateArray();
    updateLabels();
    updateLinesOnAdd();
    //block has been added so flag is back at 0;
    flag = 0;
    jsav.umsg("Enter Another Size to Allocate and Click Submit")
    $("#input").val("");

}
//worst fit algorithm
function worstFit(inputVal)
{
    var size = inputVal *2.5;
    var rec1Size;
    var rec2Size;
    var rec3Size;
    var rec4Size;
    var freeRecs = new Array(0, 0, 0, 0);
    var i = 0;
    var j = 0;
    //free recs are put into freeRecs
    for(i; i < recArraySize ; i++)
    {

        if(freeOrNot[i] == 1)
        {
          freeRecs[j] = i;
          j++;
        }

    }

    var rec1 = freeRecs[0];
    var rec2 = freeRecs[1];
    var rec3 = freeRecs[2];
    var rec4 = freeRecs[3];
    var fin;
    //if size not null assign
    if(rec1 != null)
    {
        rec1Size = getSize(rec1);
    }
    if(rec2 != null)
    {
        rec2Size = getSize(rec2);
    }
    if(rec3 != null)
    {
        rec3Size = getSize(rec3);
    }
    if(rec4 != null)
    {
        rec4Size = getSize(rec4);
    }

    var free = new Array(rec1Size,rec2Size,rec3Size,rec4Size);
    //takes the max out of the array(worst fit)
    var max = free.indexOf(Math.max.apply(Math, free));
    //make blcok isnt too big
    if(max == 0  && inputVal <= rec1Size)
    {
        fin = freeRecs[0];
    }
    else if(max == 1 && inputVal <= rec2Size)
    {
        fin = freeRecs[1];
    }
    else if(max == 2 && inputVal <= rec3Size)
    {
        fin = freeRecs[2];
    }
    else if(max == 3 && inputVal <= rec4Size)
    {
      
        fin = freeRecs[3];
       
    }
    else
    {
      fin = 30;
    }
    stepsToInsert(fin, size);
    //addRec(fin, size);
    finn = fin;
    sizee = size;


}
//best fit algorithm
function bestFit(inputVal)
{
    var size = inputVal;
    var rec1Size;
    var rec2Size;
    var rec3Size;
    var rec4Size;
    var freeRecs = new Array(0, 0, 0, 0);
    var i = 0;
    var j = 0;
    //adds free blocks to array
    for(i; i < recArraySize ; i++)
    {

        if(freeOrNot[i] == 1)
        {
          freeRecs[j] = i;
          j++;
        }

    }
    var rec1 = freeRecs[0];
    var rec2 = freeRecs[1];
    var rec3 = freeRecs[2];
    var rec4 = freeRecs[3];
    var fin;
    //get size of free blocks
    if(rec1 != null)
    {
        rec1Size = getSize(rec1);
    }
    if(rec2 != null)
    {
        rec2Size = getSize(rec2);
    }
    if(rec3 != null)
    {
        rec3Size = getSize(rec3);
    }
    if(rec4 != null)
    {
        rec4Size = getSize(rec4);
   }

   var minArray = new Array(4);
   var arraySize = array.size();
   
   //assure that the blocks are large enough
   //if not given value of 300 to ensure they wont be min
   if(rec1Size >= size)
    {
        
        minArray[0] = rec1Size - size;
    }
      else
      {
        minArray[0] = 300;
      }
    if(rec2Size >= size)
    {
        
        minArray[1] = rec2Size - size;
        if(arraySize < 2)
        {
          minArray[1] = 300;
        }
    }
     else
      {
        minArray[1] = 300;
      }
    if(rec3Size >= size)
    {
        
        minArray[2] = rec3Size - size;
        if(arraySize < 3)
        {
          minArray[2] = 300;
        }
    }
     else
      {
        minArray[2] = 300;
      }
    if(rec4Size >= size)
    {

        minArray[3] = rec4Size - size;
        if(arraySize < 4)
        {
          minArray[3] = 300;
        }
    }
     else
      {
        minArray[3] = 300;
      }
      //takes the min of values in the array, the min is th ebest fit
    var min = minArray.indexOf(Math.min.apply(Math, minArray));
    //assures not all elements are = 300
    if(minArray[0] != 300 || minArray[1] != 300 || minArray[2] != 300 || minArray[3] != 300)
    {
      if(min == 0)
      {
          min = rec1Size;
      }
      else if(min == 1)
      {
        min = rec2Size;
      }
      else if(min == 2)
      {
        min = rec3Size;
      }
      else if(min == 3)
      {
        min = rec4Size;
      }

      var i = 0;
      for(i; i< recArraySize; i++)
      {
        if(getSize(i) == min && freeOrNot[i] == 1)
        {
          fin = i;
          break;
        }
      }
    }
    else{
          fin = 30;  //fin = 30 if no free blocks are large enough
      }
finn = fin;
sizee = size*2.5;
//insert the block
stepsToInsert(fin, size);



}
//circualr fit algorithm
function circularFit(inputVal)
{
    //index = 0;
    var size = inputVal;
    var rec1Size;
    var rec2Size;
    var rec3Size;
    var rec4Size;
    var freeFin;
    var freeRecs = new Array(0, 0, 0, 0);
    var i = 0;
    var j = 0;
    //index is a global variable to keep track of where the search starts from
    var startIndex = index;
    //add free blocks to list
    for(i; i < recArraySize ; i++)
    {

        if(freeOrNot[i] == 1)
        {
          freeRecs[j] = i;
          j++;
        }

    }
    var rec1 = freeRecs[0];
    var rec2 = freeRecs[1];
    var rec3 = freeRecs[2];
    var rec4 = freeRecs[3];
    var fin;
    
    var arrSize = array.size();
    if(arrSize == 3)
    {
        freeRecs[3] = 0;
    }
    else if(arrSize == 2)
    {
      freeRecs[3] = 0;
      freeRecs[2] = 0;
    }
    else if(arrSize == 1)
    {
      freeRecs[3] = 0;
      freeRecs[2] = 0;
      freeRecs[1] = 0;
    }
    //if index reaches a value equal to the size of the array, it returns to 0
    if(index == arrSize)
    {
      index = 0;
    }

    for(index; index < arrSize; i++)
    {
      //checks the size to make sure it fits
      //had a bug that would allow 0's to be chosen so added an extra check
      if(size <= getSize(freeRecs[index]) && getSize(freeRecs[index]) != 0)
      {

          freeFin = index;
          break;
      }
      else
      {
        index++;
      }  
      if(index == arrSize)
      {
        index = 0;
      }
      //there is no block that fits
      if(index == startIndex)
      {
        fin = 30;
        break;
      }

  }
  //get the size on the free rec
  var rec = getSize(freeRecs[index]);
  if(fin != 30)
  {
    //index only refrences free blocks this gets the array number for being added to group of all blocks
    if(freeOrNot[0] == 1)
    {

      fin = 2*index;
    }
    else
    {
      fin = 2* index;
      fin = fin + 1;
    }
    

  }

  //size = getSize(i);
  finn = fin;
  size = inputVal *2.5;
  sizee = size;
  var finish = index;
  //add block using circle fit insert
  circleFitInsert(fin, size, finish);
  

}

function circleFitInsert(fin, size, index)
  {
      var arrSize = array.size();
      //incase array shrunk since last circular fit
      if(startIndex >= arrSize)
      {
        startIndex = 0;
      }
      var i = 0;
      var j = 0;
      var tooBig = fin;
      //we have a match, set insert to 1, and will insert on next next
      if(startIndex == index && tooBig != 30 && insert == 0)
      {
          insert = 1;
          if(startIndex != 0)
          {
            array.unhighlight(startIndex -1);
            linesArray[startIndex - 1].css({"stroke-width": 1});
            
          }
          else if(startIndex == 0)
          {
            var aSize = array.size();
            array.unhighlight(aSize-1);
            linesArray[aSize-1].css({"stroke-width": 1});
          }
          
          array.highlight(startIndex);
          linesArray[startIndex].css({"stroke-width": 3});
        
      }
      else if(insert == 1)
      {
        jsav.umsg("Free List Block " + insert + " size " + size)
        jsav.umsg("We have a fit")
        addRec(finn, sizee);
        ins = 0;
        insert = 0;
        rectNumber = 0;
        $('#next').attr("disabled", "disabled");
      }
      else if(startIndex == index && tooBig == 30 && rectNumber == 1)
      {

            array.unhighlight(startIndex -1);
          
            linesArray[0].css({"stroke-width": 1});
            linesArray[1].css({"stroke-width": 1});
            linesArray[2].css({"stroke-width": 1});
            linesArray[3].css({"stroke-width": 1});



          jsav.umsg("Your allocation is too big  deallocate and try again")
          rectNumber = 0;
           $('#next').attr("disabled", "disabled");
           ins = 0;
           insert = 0;
      }
      else if(startIndex != index || (startIndex == index && rectNumber == 0))
      {
          var size = array.value(startIndex);
          jsav.umsg("Free List Block " + startIndex  + " size " + size)
          array.unhighlight(startIndex -1);
          array.highlight(startIndex);
          linesArray[startIndex].css({"stroke-width": 3});
          if(startIndex != 0)
          {
            linesArray[startIndex-1].css({"stroke-width": 1});
          }
          
         
          startIndex++;
          rectNumber = 1;
          if(startIndex == 4)
          {
            startIndex = 0;
          }

      }
    

      
  }

  $(document).ready(function () {
    jsav = new JSAV($('.avcontainer'));

    // If the user hits 'Enter' while the focus is on the textbox,
    // click 'Next' rather than refreshing the page
    $("#input").keypress(function (event) {
      // Capture 'Enter' press
      if (event.which === 13) {
        // Prevent 'Enter' from posting the form and refreshing the page
        event.preventDefault();

        // If the user entered a value and inserting is allowed, trigger 'Next'
        if ($("#input").val() !== "" && !$('#next').attr('disabled')) {
	        $('#next').click();
        }
      }
    });

    $('#submit').click(function () {
      var i = 0;
      rectNumber = 0;
      var inputVal = $("#input").val();
      if (inputVal < 1 || inputVal > total || isNaN(inputVal)) {
        jsav.umsg("Please enter a number in the range of 1-" + total);
        $('#next').attr("disabled", "disabled");


      } else { 
        jsav.umsg("The request has been scheduled.");
        jsav.umsg("Size Request: " + inputVal);

        newRec(inputVal);
        $('#submit').attr("disabled", "disabled");
        $("#next").removeAttr("disabled");
      }
      
    });

    $('#next').click(function () {

      submitRec.css({"opacity": "0"});
      requestedBlockLabel.css({"opacity": "0"});

      var inputValue = $("#input").val();
      
      //ins is used to force call to given function
      //then on remaining next calls steps to insert is called
      console.log("Now fitalgorithm is: " + $("#fitAlgorithm").val());
      switch ($("#fitAlgorithm").val()) {
        case '0':  // No function chosen
	  console.log("Call reset 1");
          reset();
          break;
        case '1':
          if(ins == 0)
          {  
            
            firstFit(inputValue);
            ins = 1;
          }
          else{
              stepsToInsert(finn, sizee);
          }
          break;
        case '2':
        if(ins == 0)
          {  
           
            circularFit(inputValue);
            ins = 1;
          }
          else{
            circleFitInsert(finn, sizee, index);
              
          }
         break;
          
        case '3':
        if(ins == 0)
          {  
           
            bestFit(inputValue);
            ins = 1;
          }
          else{
              stepsToInsert(finn, sizee);
          }
          break;
        case '4':
        if(ins == 0)
          {  
            
            worstFit(inputValue);
            ins = 1;
          }
          else{
              stepsToInsert(finn, sizee);
          }
          
          break;
        // case '5':
        //   sequentialFit(inputValue);
        //   break;
      }
      $("#submit").removeAttr("disabled");
    });

    //messages that appear when an algorithm is selected
    $("#fitAlgorithm").change(function () {
     // OriginalMemBlock();
      console.log("Now fitalgorithm is: " + $("#fitAlgorithm").val());
      switch ($("#fitAlgorithm").val()) {
        case '0':  // No function chosen
	  console.log("Call reset 2");
          reset();
          break;
        case '1':
          jsav.clearumsg();
          jsav.umsg("First Fit Selected")
          
          jsav.umsg("To allocate a block, enter a size and click submit")
          jsav.umsg("To deallocate a used block click on an allocated block of memory(a red block) and free it")
          enableAllButtons(); 
           $('#next').attr("disabled", "disabled");
          
          break;
        case '2':
          jsav.clearumsg();
          jsav.umsg("Circular Fit Selected")
          jsav.umsg("To allocate a block, enter a size and click submit")
          jsav.umsg("To deallocate a used block click on an allocated block of memory(a red block) and free it")
         enableAllButtons();
          $('#next').attr("disabled", "disabled");
          break;
        case '3':
          jsav.clearumsg();
          jsav.umsg("Best Fit Selected")
          jsav.umsg("To allocate a block, enter a size and click submit")
          jsav.umsg("To deallocate a used block click on an allocated block of memory(a red block) and free it")
          enableAllButtons();
           $('#next').attr("disabled", "disabled");
          break;
        case '4':
          jsav.clearumsg();
          jsav.umsg("Worst Fit Selected")
          jsav.umsg("To allocate a block, enter a size and click submit")
          jsav.umsg("To deallocate a used block click on an allocated block of memory(a red block) and free it")
          enableAllButtons();
           $('#next').attr("disabled", "disabled");
          break;
      }
    });

    $('#reset').click(function () {
          var i = 0;
          while(i < 4)
          {
            //blockLabelArray[i].clear();
            linesArray[i].hide();
            i++;
          }
          freeAmountLabel.clear();
          usedAmountLabel.clear();
          array.clear();
        reset();
        

        submitRec.css({"opacity": "0"});
        requestedBlockLabel.css({"opacity": "0"});
    });


    $('#about').click(about);

    $('#help').click(function () {
      window.open("hashAVHelp.html", 'helpwindow');
    });

    var settings = new JSAV.utils.Settings($(".jsavsettings"));
    setDefaultControlState();
    reset();
    if($("#fitAlgorithm").val() === 0)
    {
      $('#submit').attr("disabled", "disabled");
    }
  });
}(jQuery));
