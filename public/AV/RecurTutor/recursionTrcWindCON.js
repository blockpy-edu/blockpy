"use strict";

//===============================================================================================================================
// Visualization of the four steps to write a recursive function
(function ($) {

  var av = new JSAV("recursionTrcWindCON");
  
  av.umsg("Suppose function a() has a call to function b().");
  var  pseudo = av.code(" a()\n{ \n  b();  \n}" , {lineNumbers:false , top:0 , left:100}); 
  var Pointer1 = av.g.line(165 , 80,215, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer1.show(); 
  var  pseudo2 = av.code(" b()\n{ \n c();  \n}" , {lineNumbers:false , top:0 , left:200});
  av.displayInit();
  av.step();
  
  av.umsg("Function b() has a call to function c().");
  var Pointer2 = av.g.line(255 , 80,315, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer2.show(); 
  var  pseudo3 = av.code(" c()\n{ \n d();  \n}" , {lineNumbers:false , top:0 , left:300});
 
  av.step();
  av.umsg("Function c() has a call to function d().");
  var Pointer3 = av.g.line(355 , 80,415, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer3.show(); 
  var  pseudo4 = av.code(" d()\n{ \n      \n}" , {lineNumbers:false , top:0 , left:400});
  av.step();
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  
  av.umsg("Once function d() is done, what happens next?");
  av.step();
  av.umsg("It goes back to c()");
  var Pointer4 = av.g.line(415 , 80,355, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer4.show(); 
  av.step();

  av.umsg("then to b()");
  var Pointer5 = av.g.line(315 , 80,255, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer5.show();  
  av.step();
  
  av.umsg("and finally back to a()");
  var Pointer6 = av.g.line( 215, 80,165, 30,{"arrow-end": "classic-wide-long", "opacity": 0, "stroke":'black',"stroke-width":2});
  Pointer6.show();
  av.step();

  Pointer4.hide();
  Pointer5.hide();
  Pointer6.hide();  
  

  av.umsg("So you can think of going from a() to d() as the ”winding” of the recursion");

  Pointer1.show();
  Pointer2.show();
  Pointer3.show();
  av.step();

  av.umsg("and returning back to a() as the unwinding");
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  
  Pointer4.show();
  Pointer5.show();
  Pointer6.show();
  av.step();
  
  av.umsg("The same thing happens with recursive functions, which goes to show you that recursive functions aren’t any more special than normal functions.");
  av.step();
  
  pseudo.hide();
  pseudo2.hide();
  pseudo3.hide(); 
  pseudo4.hide();
  Pointer4.hide();
  Pointer5.hide();
  Pointer6.hide();
  av.umsg("If function f() makes a recursive call to function f()");

  var  pseudo5 = av.code(" f()\n{ \n  f();  \n}" , {lineNumbers:false , top:0 , left:100}); 
  Pointer1.show(); 
  var  pseudo6 = av.code(" f()\n{ \n f();  \n}" , {lineNumbers:false , top:0 , left:200});
  av.step();
  av.umsg("Which makes a call to function f()");
  Pointer2.show(); 
  var  pseudo7 = av.code(" f()\n{ \n f();  \n}" , {lineNumbers:false , top:0 , left:300});
  av.step();
  av.umsg("which makes a call to function f()");
  Pointer3.show(); 
  var  pseudo8 = av.code(" f()\n{ \n f(); \n}" , {lineNumbers:false , top:0 , left:400});
  av.step();
 
  Pointer1.hide();
  Pointer2.hide();
  Pointer3.hide();
  
  av.umsg("When reaching the base case, it will eventually go back to f()");
  Pointer4.show();
  av.step();

  av.umsg("then f()");
  Pointer5.show();
  av.step();


  av.umsg("and finally back to the original f()");
  Pointer6.show();
  av.step();
  
  av.umsg("So it’s really the same principle of winding and unwiding of normal functions");
  av.recorded();
  
}(jQuery));



//==============================================================================================================================
