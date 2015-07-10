"use strict";

//===============================================================================================================================
// Visualization of the four steps to write a recursive function
(function ($) {

  var av = new JSAV("recursionWrtSumCON");
  
  av.umsg("To solve the sum problem, we can use any of the following versions. The first one is:");
  av.displayInit();
  av.step();

  var labela = av.label("First Version", {left: 70, top: -23});
  var  pseudo = av.code(" int sum(int arr[],int size){\n if (size==0)\n  return 0;\n else {\n  int smallResult=sum(arr,size-1);\n  return smallResult + arr[size-1];\n  }\n}" , {lineNumbers:false , top:0 , left:70});
  
  av.step();
    
  av.umsg("Some people can write it in a different way. By breaking up the return statement as shown in the second version:");

  var labelb = av.label("Second Version", {left: 430, top: -23});
  var  pseudo2 = av.code("int sum(int arr[],int size){\n if (size==0)\n  result=0;\n else {\n  int smallResult=sum(arr,size-1);\n  result= smallResult + arr[size-1];\n  }\n  return result;\n}", {lineNumbers:false , top:0 , left:430});
  pseudo.highlight(6);
  pseudo2.highlight(6);
  pseudo2.highlight(8);
  av.step();

  av.umsg("You may even think there's no reason to declare smallResult and prefer to write it as shown in the third version:");
  av.step();

  var labelc = av.label("Third Version", {left: 70, top: 190});
  var  pseudo3 = av.code("int sum(int arr[],int size){\n if ( size == 0 )\n  return 0;\n return sum( arr, size - 1 ) +\n arr[ size - 1 ];\n}", {lineNumbers:false , top:215 , left:70});
  pseudo3.highlight(4);
  pseudo3.highlight(5);
  av.step();

  av.umsg("Certainly, once you gain more experience with recursive functions, the third version is the preferable version.");
  av.step();
  
  av.umsg("However, declaring a local variable to store the result of the recursive call might help you in the beginning to think about the small solution and then thinking about how to use that small solution to solve the bigger problem.");

  av.step();
  
  av.umsg("You can even have the recursive call in the if condition insted of the base case as long as you have the right condition to stop the recursice function.");
  
  var labeld = av.label("Fourth Version", {left: 430, top: 190});
  var  pseudo4 = av.code("int sum(int arr[],int size){\n if ( size > 0 )\n  return sum( arr, size - 1 ) +\n  arr[ size - 1 ];;\n return 0; \n}", {lineNumbers:false , top:215 , left:430});
  pseudo4.highlight(3);
  pseudo4.highlight(4);
  av.step();

  
  av.recorded();
  
}(jQuery));



//==============================================================================================================================
