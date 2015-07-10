"use strict";
  
//===============================================================================================================================
// Visualization of Towers of Hanoi
(function ($) {

  var av = new JSAV("recursionTrcTOHCON");
  var label0 = av.label("0", {left: 165, top: 12});
  var label1 = av.label("1", {left: 180, top: 42});
  var label2 = av.label("2", {left: 195, top: 72});
  var label3 = av.label("3", {left: 210, top: 102});
  var label4 = av.label("4", {left: 225, top: 132});
  var label5 = av.label("5", {left: 240, top: 162});

//  The towers: define 3 vertical rectangles 
 var rectver0 = av.g.rect(105, 10, 10, 180).css({"fill": "brown"}); 
 var rectver1 = av.g.rect(375, 10, 10, 180).css({"fill": "brown"}); 
 var rectver2 = av.g.rect(605, 10, 10, 180).css({"fill": "brown"}); 

// The moving ones
  var rect0 = av.g.rect(65, 30, 90, 20).css({"fill": "grey"});
  var rect1 = av.g.rect(50, 60, 120, 20).css({"fill": "yellow"});
  var rect2 = av.g.rect(35, 90, 150, 20).css({"fill": "purple"});
  var rect3 = av.g.rect(20, 120, 180, 20).css({"fill": "green"});
  var rect4 = av.g.rect(5, 150, 210, 20).css({"fill": "red"});
  var rect5 = av.g.rect(-10, 180, 240, 20).css({"fill": "blue"});

// Labels for each tower
  var labela = av.label("A", {left: 107, top: -30});
  var labelb = av.label("B", {left: 378, top: -30});
  var labelc = av.label("C", {left: 603, top: -30});
   
  
  var pseudo = av.code({url: "../../../SourceCode/Java/RecurTutor/RecTOH.java",
                       lineNumbers: false,top:200 , left:250});

  av.umsg("The initial call is to move disk 5 from A to B"); 
  pseudo.highlight(1);
  var labelCallStack5=  av.label("Call Stack:", {left: 0, top: 200});
  var labelCallStack5=  av.label("TowersofHanoi(5, A, B, C)", {left: 0, top: 230});
  av.displayInit();
 
  av.umsg("This will require moving disk 4 from A to C");
  var labelCallStack4=  av.label("TowersofHanoi(4, A, C, B)", {left: 0, top: 260});
  av.step();
  
  av.umsg("This will require moving disk 3 from A to B");
  var labelCallStack3=  av.label("TowersofHanoi(3, A, B, C)", {left: 0, top: 290});
  av.step();

  av.umsg("This will require moving disk 2 from A to C");
  var labelCallStack2=  av.label("TowersofHanoi(2, A, C, B)", {left: 0, top: 320});
  av.step();
 
  av.umsg("This will require moving disk 1 from A to B");
  var labelCallStack1=  av.label("TowersofHanoi(1, A, B, C)", {left: 0, top: 350});
  av.step();
  
  av.umsg("This will require moving disk 0 from A to C and that what we are going to do directly.");
  var labelCallStack0=  av.label("TowersofHanoi(0, A, C, B)", {left: 0, top: 380});
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  av.step();


  pseudo.unhighlight(2);
  pseudo.highlight(4);
  rect0.hide();
  label0.hide();
  var label0 = av.label("0", {left: 660, top: 163});

  var rect06 = av.g.rect(565, 180, 90, 20).css({"fill": "grey"});
  av.step();
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect1.hide();
  label1.hide();
  
 // New label 1 in the middle
  labelCallStack0.hide();
  av.umsg("Return from recursive call and continue to disk 1 where we left off.");
  var label17 = av.label("1", {left: 440, top: 163});
  var rect17 = av.g.rect(315, 180, 120, 20).css({"fill": "yellow"});
  av.step();
   av.umsg("Disk 1 moved and we need to move smaller disks.");
  pseudo.unhighlight(9);
  av.step();
  pseudo.highlight(9); 
  rect06.hide();

  label0.hide();
  var label068 = av.label("0", {left: 425, top: 130});
  var rect068 = av.g.rect(330, 150, 90, 20).css({"fill": "grey"});
  av.step();
  pseudo.unhighlight(9);
  pseudo.highlight(10); 
  rect2.hide();
  label2.hide();

  labelCallStack1.hide();
  av.umsg("Return from recursive call and continue to disk 2 where we left off.");

  var label29 = av.label("2", {left: 698, top: 163});
  var rect29 = av.g.rect(540, 180, 150, 20).css({"fill": "purple"});
  av.step();

  av.umsg("Disk 2 moved and we need to move smaller disks.");
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  pseudo.unhighlight(10);
  pseudo.highlight(1);
  rect068.hide();
  label068.hide();
  var label06810 = av.label("0", {left: 165, top: 72});
  var  rect06810 = av.g.rect(65, 90, 90, 20).css({"fill": "grey"});
  av.step();
  
  labelCallStack0.hide();
  av.umsg("Return from recursive call and continue to disk 1 where we left off.");
  pseudo.unhighlight(1);
  pseudo.highlight(9);
  rect17.hide();
  label17.hide();
  var label1711 = av.label("1", {left: 686, top: 132});
  var rect1711 = av.g.rect(550, 150, 120, 20).css({"fill": "yellow"});
  av.step();
   av.umsg("Disk 1 moved and we need to move smaller disks.");
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect06810.hide();
  label06810.hide();
  labelCallStack0.show();
  var label0681012 = av.label("0", {left: 660, top: 102});
  var  rect0681012 = av.g.rect(565, 120, 90, 20).css({"fill": "grey"});
  av.step();
  av.umsg("This process will repeat till we have all the disks moved to support B  as we will see in the rest of this tracing visualization:");
  pseudo.unhighlight(4);
  pseudo.highlight(10);
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  pseudo.unhighlight(10);
  pseudo.highlight(9);
  labelCallStack2.hide(); 
   
  rect3.hide();
  label3.hide();
  var label313 = av.label("3", {left: 480, top: 162});
  var rect313 = av.g.rect(295, 180, 180, 20).css({"fill": "green"});
  av.step();
 
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  
  labelCallStack2.show(); 
  av.step();

  labelCallStack1.show(); 
  av.step();

  labelCallStack0.show(); 
  av.step();

  
  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect0681012.hide();
  label0681012.hide();
  var label068101214 = av.label("0", {left: 428, top: 132});
  var  rect068101214 = av.g.rect(330, 150, 90, 20).css({"fill": "grey"});
  av.step();
  
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  
  labelCallStack0.hide(); 
  rect1711.hide();
  label1711.hide();
  av.step();
  var label171115 = av.label("1", {left: 180, top: 102});
  var rect171115 = av.g.rect(50, 120, 120, 20).css({"fill": "yellow"});
  labelCallStack0.show(); 
  av.step();

  
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  rect068101214.hide();
  label068101214.hide();
  
  labelCallStack0.hide();
  var label015  = av.label("0", {left: 165, top: 72});
  var rect015 = av.g.rect(65, 90, 90, 20).css({"fill": "grey"});
  av.step();
  
  labelCallStack1.hide();
  pseudo.unhighlight(1);
  pseudo.highlight(10);
  av.step();
  
  pseudo.unhighlight(10);
  pseudo.highlight(9);
  rect29.hide();
  label29.hide();
  var label216 = av.label("2", {left: 468, top: 132});
  var rect216 = av.g.rect(315, 150, 150, 20).css({"fill": "purple"});  
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  labelCallStack1.show();
  av.step();
  
  labelCallStack0.show();
  av.step();
  
  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect015.hide();
  label015.hide();
  var label017  = av.label("0", {left: 660, top: 162});
  var rect017 = av.g.rect(565, 180, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect171115.hide();
  label171115.hide();
  labelCallStack0.hide();
  
  var label118 = av.label("1", {left: 450, top: 102});
  var rect118 = av.g.rect(315, 120, 120, 20).css({"fill": "yellow"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  
  labelCallStack0.show();
  av.step();
  
  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect017.hide();
  label017.hide();
  var label019 = av.label("0", {left: 433, top: 72});
  var rect019 = av.g.rect(340, 90, 90, 20).css({"fill": "grey"});
  labelCallStack0.hide();
  av.step();
 
  
  pseudo.unhighlight(4);
  pseudo.highlight(10);
  av.step();
  
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  av.step();
  labelCallStack3.hide();
  av.step();
  pseudo.unhighlight(10);
  pseudo.highlight(9);
  rect4.hide();
  label4.hide();
  var label420= av.label("4", {left: 730, top: 162});
  var rect420 = av.g.rect(515, 180, 210, 20).css({"fill": "red"});
  av.step();
  
  labelCallStack3.show();
  av.step();
  
  labelCallStack2.show();
  av.step();
  
  labelCallStack1.show();
  av.step();
  
  labelCallStack0.show();
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(1);

  av.step();
  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect019.hide();
  label019.hide();
  var label021 = av.label("0", {left: 165, top: 132});
  var rect021 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect118.hide();
  label118.hide();
  labelCallStack0.hide();
  
  var label122= av.label("1", {left: 680, top: 132});
  var rect122 = av.g.rect(550, 150, 120, 20).css({"fill": "yellow"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  av.step();
  
  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect021.hide();
  label021.hide();
  labelCallStack0.show();
  var label023 = av.label("0", {left: 668, top: 102});
  var rect023 = av.g.rect(565, 120, 90, 20).css({"fill": "grey"});
  av.step();
  

  pseudo.unhighlight(4);
  pseudo.highlight(10);
  av.step();

  
  pseudo.unhighlight(10);
  pseudo.highlight(9);
  
  rect216.hide();
  label216.hide();
   
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label224 = av.label("2", {left: 195, top: 132});
  var rect224 = av.g.rect(35, 150, 150, 20).css({"fill": "purple"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect023.hide();
  label023.hide();
  
  labelCallStack1.show();
  
  av.step();
  labelCallStack0.show();
  
  var label025 = av.label("0", {left: 433, top: 132});
  var rect025 = av.g.rect(330, 150, 90, 20).css({"fill": "grey"});
  av.step();

  labelCallStack0.hide();
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect122.hide();
  label122.hide();
  var label126 = av.label("1", {left: 180, top: 102});
  var rect126 = av.g.rect(50, 120, 120, 20).css({"fill": "yellow"});
  av.step();


  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect025.hide();
  label025.hide();
  labelCallStack0.show();
  var label027= av.label("0", {left: 165, top: 72});
  var rect027 = av.g.rect(65, 90, 90, 20).css({"fill": "grey"});
  av.step();
 
  pseudo.unhighlight(4);
  pseudo.highlight(10);
  av.step();
  
  pseudo.unhighlight(10);
  pseudo.highlight(9);
  rect313.hide();
  label313.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  av.step();
  
  
  var label328 =  av.label("3", {left: 720, top: 132});
  var rect328 = av.g.rect(530, 150, 180, 20).css({"fill": "green"});
  av.step();
 
  pseudo.unhighlight(9);
  pseudo.highlight(1);
  av.step();

  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect027.hide();
  label027.hide();
  labelCallStack2.show();
  av.step();
  
  labelCallStack1.show();
  av.step();
  
  labelCallStack0.show();
  
  var label029= av.label("0", {left: 668, top: 102});
  var rect029 = av.g.rect(570, 120, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect126.hide();
  label126.hide();
  
  labelCallStack0.hide();
  var label130 = av.label("1", {left: 455, top: 162});
  var rect130 = av.g.rect(330, 180, 120, 20).css({"fill": "yellow"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(1);
  av.step();

  pseudo.unhighlight(1);
  pseudo.highlight(4);
  rect029.hide();
  label029.hide();
  labelCallStack0.show();
  var label031= av.label("0", {left: 433, top: 132});
  var rect031 = av.g.rect(335, 150, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9); 
  rect224.hide();
  label224.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label232 = av.label("2", {left: 698, top: 102});
  var rect232 = av.g.rect(540, 120, 150, 20).css({"fill": "purple"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect031.hide();
  label031.hide();
  
  labelCallStack1.show();
  av.step();
  
  labelCallStack0.show();
  
  var label033 = av.label("0", {left: 165, top: 132});
  var rect033 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect130.hide();
  label130.hide();
  labelCallStack0.hide();
  var label134= av.label("1", {left: 680, top: 72});
  var rect134 = av.g.rect(550, 90, 120, 20).css({"fill": "yellow"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect033.hide();
  label033.hide();
  labelCallStack0.show();
  var label035 = av.label("0", {left: 660, top: 42});
  var rect035 = av.g.rect(565, 60, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect5.hide();
  label5.hide();
  
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  av.step();
  labelCallStack3.hide();
  av.step();
  labelCallStack4.hide();
  av.step();
  
  
  var label536 = av.label("5", {left: 500, top: 162}); 
  var rect536 = av.g.rect(260, 180, 240, 20).css({"fill": "blue"});
  av.step();
 //==============
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect035.hide();
  label035.hide();
  
  labelCallStack4.show();
  av.step();
  labelCallStack3.show();
  av.step();
  labelCallStack2.show();
  av.step();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  
  var label037= av.label("0", {left: 433, top: 132});
  var rect037 = av.g.rect(335, 150, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect134.hide();
  label134.hide();
  labelCallStack0.hide();
  var label138 = av.label("1", {left: 180, top: 162});
  var rect138 = av.g.rect(50, 180, 120, 20).css({"fill": "yellow"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect037.hide();
  label037.hide();
  labelCallStack0.show();
  var label039 = av.label("0", {left: 165, top: 132});
  var rect039 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();


  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect232.hide();
  label232.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label240 = av.label("2", {left: 468, top: 132});
  var rect240 = av.g.rect(315, 150, 150, 20).css({"fill": "purple"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect039.hide();
  label039.hide();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  var label040 = av.label("0", {left: 660, top: 102});
  var rect040 = av.g.rect(565, 120, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect138.hide();
  label138.hide();
  labelCallStack0.hide();
  var label141 = av.label("1", {left: 455, top: 102});
  var rect141 = av.g.rect(330, 120, 120, 20).css({"fill": "yellow"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect040.hide();
  label040.hide();
  labelCallStack0.show();
  var label042=  av.label("0", {left: 433, top: 72});
  var rect042 = av.g.rect(335, 90, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect328.hide();
  label328.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  var label343=  av.label("3", {left: 210, top: 162});
  var rect343 = av.g.rect(20, 180, 180, 20).css({"fill": "green"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect042.hide();
  label042.hide();
  labelCallStack2.show();
  av.step();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  var label044 = av.label("0", {left: 165, top: 132});
  var rect044 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect141.hide();
  label141.hide();
  labelCallStack0.hide();
  var label145= av.label("1", {left: 680, top: 132});
  var rect145 = av.g.rect(550, 150, 120, 20).css({"fill": "yellow"});
  av.step();


  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect044.hide();
  label044.hide();
  labelCallStack0.show();
  var label046 = av.label("0", {left: 660, top: 102});
  var rect046 = av.g.rect(565, 120, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect240.hide(); 
  label240.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label247 = av.label("2", {left: 195, top: 132});
  var rect247 = av.g.rect(35 , 150, 150, 20).css({"fill": "purple"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect046.hide();
  label046.hide();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  var label048=  av.label("0", {left: 433, top: 132});
  var rect048 = av.g.rect(335, 150, 90, 20).css({"fill": "grey"});
  av.step();


  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect145.hide();
  label145.hide();
  labelCallStack0.hide();
  var label149 = av.label("1", {left: 180, top: 102});
  var rect149 = av.g.rect(50, 120, 120, 20).css({"fill": "yellow"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect048.hide();
  label048.hide();
  labelCallStack0.show();
  var label050 = av.label("0", {left: 165, top: 72});
  var rect050 = av.g.rect(65, 90, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect420.hide();
  label420.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  av.step();
  labelCallStack3.hide();
  
  var label451 = av.label("4", {left: 488, top: 132});
  var rect451 = av.g.rect(275, 150, 210, 20).css({"fill": "red"});
  av.step();


  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect050.hide();
  label050.hide();
  
  labelCallStack3.show();
  av.step();
  
  labelCallStack2.show();
  av.step();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  
  var label052 = av.label("0", {left: 660, top: 162});
  var rect052 = av.g.rect(565, 180, 90, 20).css({"fill": "grey"});
  av.step();


  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect149.hide();
  label149.hide();
  labelCallStack0.hide();
  var label153 = av.label("1", {left: 455, top: 102});
  var rect153 = av.g.rect(330, 120, 120, 20).css({"fill": "yellow"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect052.hide();
  label052.hide();
  labelCallStack0.show();
  var label052=  av.label("0", {left: 433, top: 72});
  var rect054 = av.g.rect(335, 90, 90, 20).css({"fill": "grey"});
  av.step();

  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect247.hide();
  label247.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label255 = av.label("2", {left: 698, top: 162});
  var rect255 = av.g.rect(545 , 180, 150, 20).css({"fill": "purple"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect054.hide();
  label052.hide();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  
  var label055 = av.label("0", {left: 165, top: 132});
  var rect055 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();

 pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect153.hide();
  label153.hide();
  labelCallStack0.hide();
  var label156= av.label("1", {left: 680, top: 132});
  var rect156 = av.g.rect(550, 150, 120, 20).css({"fill": "yellow"});
  av.step();
  
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect055.hide();
  label055.hide();
   labelCallStack0.show();
  var label057 = av.label("0", {left: 660, top: 102});
  var rect057 = av.g.rect(565, 120, 90, 20).css({"fill": "grey"});
  av.step();
  
  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect343.hide();
  label343.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  var label358 = av.label("3", {left: 480, top: 102});
  var rect358 = av.g.rect(295, 120, 180, 20).css({"fill": "green"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect057.hide();
  label057.hide();
  labelCallStack2.show();
  av.step();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  var label059=  av.label("0", {left: 433, top: 72});
  var rect059 = av.g.rect(335, 90, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect156.hide();
  label156.hide();
  labelCallStack0.hide();
  var label160 = av.label("1", {left: 180, top: 162});
  var rect160 = av.g.rect(50, 180, 120, 20).css({"fill": "yellow"});
  av.step();

  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect059.hide();
  label059.hide();
  labelCallStack0.show();
  var label061 = av.label("0", {left: 165, top: 132});
  var rect061 = av.g.rect(65, 150, 90, 20).css({"fill": "grey"});
  av.step();


  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect255.hide();
  label255.hide();
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  var label262 = av.label("2", {left: 468, top: 72});
  var rect262 = av.g.rect(315 , 90, 150, 20).css({"fill": "purple"});
  av.step();


  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect061.hide();
  label061.hide();
  labelCallStack1.show();
  av.step();
  labelCallStack0.show();
  var label063 = av.label("0", {left: 660, top: 162});
  var rect063 = av.g.rect(565, 180, 90, 20).css({"fill": "grey"});
  av.step();

  pseudo.unhighlight(4);
  pseudo.highlight(9);
  rect160.hide();
  label160.hide();
  labelCallStack0.hide();
  var label164 = av.label("1", {left: 455, top: 42});
  var rect164 = av.g.rect(320, 60, 120, 20).css({"fill": "yellow"});
  av.step();
 
  pseudo.unhighlight(9);
  pseudo.highlight(4);
  rect063.hide();
  label063.hide();
  labelCallStack0.show();
  var label065=  av.label("0", {left: 433, top: 12});
  var rect065 = av.g.rect(335, 30, 90, 20).css({"fill": "grey"});
  av.step();
  
  labelCallStack0.hide();
  av.step();
  labelCallStack1.hide();
  av.step();
  labelCallStack2.hide();
  av.step();
  labelCallStack3.hide();
  av.step();
  labelCallStack4.hide();
  av.step();
  labelCallStack5.hide();
  av.step();
  
  
  av.recorded();
  
}(jQuery));



//==============================================================================================================================
