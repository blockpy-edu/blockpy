"use strict";
// Recursive multiplication visualization with Sally's point of view
(function ($) {
  var av = new JSAV("recurIntroDetailsCON");
  var pseudo = av.code({url: "../../../SourceCode/Java/RecurTutor/Recmultiply.java",
                       lineNumbers: false});

  // create a label for the icon
  var label = av.label("x*y?", {left: 0, top: 170});

  // Slide 1
  pseudo.highlight(1);
  av.umsg("You want to multiply two numbers x and y.");
  av.displayInit();

  // Slide 2
  av.umsg("If the numbers are simple enough, then you will do the task on your own.");
  pseudo.highlight([2, 3]);
  pseudo.unhighlight(1);
  av.step();

  av.umsg("Otherwise, you will simplify and delegate this task to a friend.");
  pseudo.unhighlight([2, 3]);
  pseudo.highlight(5);
  av.step();


  av.umsg("Your friend will do a smaller version of the problem by multiplying x-1 and y. When he returns the result back, you will add a y to that result to complete your task.");
  pseudo.unhighlight(5);
  av.step();

  av.umsg("What you need to understand is that your friend will behave exactly as you do. If the problem is simple, he will just solve the problem. But if the problem is too hard, then he will ask another friend to help with a smaller version of the problem. The second friend will multiply $x-1-1$ by $y$.");
  var Pointer1 = av.g.line(80 , 210,130, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer1.show(); 
  
  var label2 = av.label("(x-1)*y?", {left: 0, top: 170}); // create a label for the icon
  label2.css({left: "+=117px", top: "+=0px"}); // move the icon
  av.step();

  av.umsg("Who will do exactly the same with a  third friend.");
  var Pointer2 = av.g.line(200 , 210,250, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer2.show(); 
  
  var label3 = av.label("(x-2)*y?", {left: 0, top: 170}); // create a label for the icon
  label3.css({left: "+=237px", top: "+=0px"}); // move the icon
  av.step();
  
  av.umsg(" The problem gets smaller as it goes from one friend to another. Eventually it reaches the <b> base case</b>, where $x$ is $1$ for some friend. This friend will find the task simple enough to be done on his own without doing any delegation.");
  pseudo.highlight(2);
  var Pointer3 = av.g.line(320 , 210,370, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer3.show(); 
  
  var dots1 = av.g.circle(390, 210, 2);
  var dots2 = av.g.circle(430, 210, 2);
  var dots3 = av.g.circle(470, 210, 2);
  
  var Pointer4 = av.g.line(490 , 210,540, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer4.show(); 
  
  var label4 = av.label("1*y?", {left: 0, top: 170}); // create a label for the icon
  label4.css({left: "+=550px", top: "+=0px"}); // move the icon
  av.step();
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  av.umsg("That friend will send back the result of multiplying $1$ and $y$. Then he will return back the result to the previous friend");
  // All the way back
  
  label.hide();
  label2.hide();
  label3.hide();
  label4.hide();
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  Pointer4.hide();
  dots1.hide();
  dots2.hide();
  dots3.hide();

 
  //last friend will send back the result of multiplying a one and y. The last friend willl be returning back the result to the previous friend
  label4 = av.label("y", {left: 0, top: 170}); // create a label for the icon
  label4.css({left: "+=550px", top: "+=0px"}); // move the icon
  Pointer4 = av.g.line(540 , 210,490, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer4.show();
  av.step();
  pseudo.unhighlight(3);
  pseudo.highlight(5);
  av.umsg("This process will continue all the way back until the result of $x-2$ multiplied by $y$ is back to your friend");

  dots3 = av.g.circle(470, 210, 2);
  dots2 = av.g.circle(430, 210, 2);
  dots1 = av.g.circle(390, 210, 2);
  
  
  Pointer3 = av.g.line(370 , 210,320, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer3.show(); 
    
  
  label3 = av.label("(x-2)*y", {left: 0, top: 170}); // create a label for the icon
  label3.css({left: "+=237px", top: "+=0px"}); // move the icon
 
  av.step();
  av.umsg("Your friend will add $y$ and send you the result of multiplying $x-1$  by $y$.");
  Pointer2 = av.g.line(250 , 210,200, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer2.show(); 
  
  
  label2 = av.label("(x-1)*y", {left: 0, top: 170}); // create a label for the icon
  label2.css({left: "+=117px", top: "+=0px"}); // move the icon
  av.step();
  av.umsg("When the result is back to you, you will simply add $y$ to the result. Then you will be done with your task!");
  Pointer1 = av.g.line(130 , 210,80, 210,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":5});
  Pointer1.show(); 
  
  label = av.label("x*y", {left: 0, top: 170}); // create a label for the icon
  av.step();
  
  av.recorded();
  
}(jQuery));
