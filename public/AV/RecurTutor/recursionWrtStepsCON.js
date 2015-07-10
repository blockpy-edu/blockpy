"use strict";
//===============================================================================================================================
// Visualization of the four steps to write a recursive function
(function ($) {

  var av = new JSAV("recursionWrtStepsCON");
  
  av.umsg("Step 1: Write and define the prototype of the function.");
  av.displayInit();
  av.step();

  av.umsg("Since functions are the basic unit of recursion, it's important to know what the function does. The prototype  you use  will dictate how the recursion behaves. ");
  av.step();
  
  av.umsg("Let's look at an example. Here's a function which will sum the first n elements of an array.");
  var pseudo = av.code("// Sums the first n elements of the array, arr \n  int sum( int arr[], int n )", {lineNumbers: false});
  pseudo.highlight(2);
  av.step();

  pseudo.hide();
  av.umsg("Step 2: Write out a sample function call. Once you've determined what the function does, then we imagine a function call.");
  av.step();

  var pseudo2 = av.code("int result = sum( arr, n );", {lineNumbers: false});
  pseudo2.highlight(1);
  av.step();
  
  pseudo2.hide();
  av.umsg("So, the call is sum( arr, n ). This will sum the first n elements of arr. Pick the most generic function call. For example, you don't want to have a call like:");
  var pseudo3 = av.code("int result = sum( arr, 10 );", {lineNumbers: false});
  av.step();
  

  
  av.umsg("That's picking a constant. You want to use variables when possible, because that's the most general way to call the function.");
  av.step();

  pseudo3.hide();
  av.umsg(" Step 3: Think of the smallest version of the problem. The smallest version is called the base case. Most people mistakenly pick a base case that's too large. In this case, you will pick a specific value for n.");
  av.step();

  av.umsg("    So, what is the smallest version of the problem? Here are three choices:");
  av.step();

  var pseudo4 = av.code(" sum( arr, 2 ); \n sum( arr, 1 ); \n sum( arr, 0 );", {lineNumbers: true });
  av.umsg("Some people pick choice 1, reasoning that if you are to sum elements of an array, then you must have at least two elements to sum.");
  pseudo4.highlight(1);
  av.step();

  pseudo4.unhighlight(1);
  av.umsg("However, that is really not necessary. In math, there is something called a  summation. It is perfectly valid to have a summation of only one element. You just return that one element. ");
  av.step();

  av.umsg("Some people pick choice 2, because it doesnt make sense to sum an array of size 0, whereas an array of size 1 seems to make sense.");
  pseudo4.highlight(2);
  av.step();

  pseudo4.unhighlight(2);   
  av.umsg("However, it turns out choice 3 is the smallest choice possible. You can sum zero elements of an array. What value should it return? It should return 0.");
  pseudo4.highlight(3);
  av.step();

  av.umsg("As it turns out, 0 is the additive identity. Anything added to 0 is that number. If we wanted to multiply all elements of an array, we would have picked the multiplicative identity, which is 1.");
  av.step();

  pseudo4.unhighlight(3);
  pseudo4.hide();
  av.umsg("Step 4: Think of smaller versions of the function call. Here's the function call: ");
  var pseudo5 = av.code("// sums first n elements of arr \n sum( arr, n ) )  ", {lineNumbers: false});
  av.step();

  pseudo5.hide();
  av.umsg("It tries to solves a problem of size n. We want to think of a smaller problem which we will assume can be solved correctly. The next smallest problem is to sum n - 1 elements. ")
   var pseudo6 = av.code("// sums first n - 1 elements of arr \n sum( arr, n - 1 )  ", {lineNumbers: false});
   av.step();

   pseudo6.highlight(2);
   av.step();

   pseudo6.unhighlight(2);  
   av.umsg("Assume this problem has been solved for you. How would you solve the original, larger problem?");
   av.step();

   av.umsg(" If the first n - 1 elements have already been summed then only the nth element is left to be summed. The n-th element is actually at index n - 1 (because arrays start at index 0). So, the solution to solving sum(arr,n) is to add sum(arr, n-1) to arr[n-1].");
   av.step();

   pseudo6.hide();
   av.umsg(" Putting it All Together. So, writing a recursive function requires putting the base case and the recursive case together. Here is the usual format:");
   av.step();

   var peseudo7 = av.code("if ( base case )\n // return some simple expression\nelse {\n // recursive case\n // some work before \n // recursive call \n // some work after \n}" , {lineNumbers:false , top:0 , left:70});
   peseudo7.highlight(1);
   peseudo7.highlight(3);
   av.step();
   
   av.umsg(" You can also put it all together in an alternative format:");
   var labela = av.label("Usual Format:", {left: 70, top: -23});
   var labela = av.label("Alternative Format:", {left: 430, top: -23});
   var peseudo7 = av.code("if ( recursive case ){\n // some work before \n // recursive call \n // some work after \n}\nelse{\n //base case // return some simple expression }" , {lineNumbers:false , top:0 , left:430});
   peseudo7.highlight(1);
   peseudo7.highlight(6);
   av.step();
   
   av.recorded();
  
}(jQuery));



//==============================================================================================================================
