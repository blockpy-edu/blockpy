"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var code;
  var arr, count, out;
  var arr_values = [];
  
  function runit() {
    av = new JSAV($(".avcontainer"));
    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
    $(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }); 
    $(".avcontainer").on("jsav-updatecounter", function(){ 
      // invoke MathJax to do conversion again 
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]); 
    });  
    av.umsg("Radixsort starts with an input array of $n$ keys with $k$ digits. Here we have $n=12$ and $k=2$");
    for (var i = 0;i < 12;i++){
      arr_values[i] = parseInt(Math.random()*100 + 1);
    }
    arr = av.ds.array(arr_values, {"left":10, "top":0,"indexed":true});
    av.label("|-------------------------------- $n$ ---------------------------------|", {"top": "-5px", "left": "20px"}).css({'font-size': '14px', "text-align": "center"});
    av.displayInit();
    code = av.code({url: "../../SourceCode/Processing/Sorting/RadixsortNoComments.pde",
                    lineNumbers: false,
                    startAfter: "/* *** ODSATag: Radixsort *** */",
                    endBefore: "/* *** ODSAendTag: Radixsort *** */", top: -30, left: 400});
    av.umsg("The outer loop will be executed $k$ times, one pass for each digit of key values");
    code.css(4,{"background-color":"#99FF66"});	
    av.step();
    av.umsg("The first inner loop initializes the count array of size $r$, where $r$ is the base of the key values. This requires $r$ units of work");
    code.css(5,{"background-color":"#00CCFF"});	
    code.css(4,{"background-color":"white"});
    arr_values = [];
    for (var i = 0; i < 10; i++){
      arr_values[i] = 0;
    }
    count = av.ds.array(arr_values, {"left":10, "top":120,"indexed":true});
    av.label("|-------------------------- $r$ ---------------------------|", {"top": "115px", "left": "20px"}).css({'font-size': '14px', "text-align": "center"});
    av.step();
    av.umsg("The Second inner loop counts the number of keys to be inserted in each bin. This requires a single pass over the input array that takes $n$ units of work");
    code.css(7,{"background-color":"#00CCFF"});	
    code.css(5,{"background-color":"white"});
    for (var i = 0; i < 12; i++){
      count.value(arr.value(i) % 10, count.value(arr.value(i) % 10) + 1);
    }
    arr.highlight();
    av.step();
    av.umsg("The third inner loop sets the values in the input array to their proper indices within the output array. This requires a single pass over the count array that takes $r$ units of work");
    arr.unhighlight();
    count.highlight();
    code.css(10,{"background-color":"#00CCFF"});	
    code.css(7,{"background-color":"white"});
    count.value(0, count.value(0)-1);
    for (var i = 1; i < 10; i++){
      count.value(i, count.value(i) + count.value(i-1));
    } 
    av.step();
    av.umsg("The fourth loop assigns the keys from the input array to the bins within the output array according to the indices stored in the count array. This requires $n$ units of work");
    count.unhighlight();
    code.css(12,{"background-color":"#00CCFF"});	
    code.css(10,{"background-color":"white"});
    arr_values = [];
    for (var i = arr.size()-1; i >= 0; i--){
      arr_values[count.value(arr.value(i) % 10)] = arr.value(i);
      count.value(arr.value(i) % 10 , count.value(arr.value(i) % 10) - 1);
    }
    out = av.ds.array(arr_values, {"left":10, "top":240,"indexed":true});
    av.label("|-------------------------------- $n$ ---------------------------------|", {"top": "235px", "left": "20px"}).css({'font-size': '14px', "text-align": "center"});
    av.step();
    av.umsg("The last inner loop simply copies the keys from the output array back to the input array to be ready for the next pass of the outer loop. This requires $n$ units of work");
    code.css(16,{"background-color":"#00CCFF"});	
    code.css(12,{"background-color":"white"});
    for (var i = 0; i < out.size(); i++){
      arr.value(i, out.value(i));
      out.value(i, " ");
    }
    av.step();
    av.umsg("Since we have $k=2$, the outer loop will be executed once more and all the previous steps are repeated for the leftmost digit (Tens digit)");
    code.css(4,{"background-color":"#99FF66"});	
    code.css(16,{"background-color":"white"});
    //Repeat the steps again in a single slide
    for (var i = 0; i < 10; i++){
      count.value(i, 0);
    }
    for (var i = 0; i < arr.size(); i++){
      count.value(parseInt(arr.value(i)/10)% 10, count.value(parseInt(arr.value(i)/10) % 10) + 1);
      console.log(count.value(arr.value(i)/10 % 10));
    }
    count.value(0, count.value(0)-1);
    for (var i = 1; i < count.size(); i++){
      count.value(i, count.value(i) + count.value(i-1));
    } 
    for (var i = arr.size()-1; i >= 0; i--){
      out.value(count.value(parseInt(arr.value(i)/10)% 10), arr.value(i));
      count.value(parseInt(arr.value(i)/10)% 10 , count.value(parseInt(arr.value(i)/10)% 10) - 1);
    }
    for (var i = 0; i < out.size(); i++){
      arr.value(i, out.value(i));
      //out.value(i, " ");
    }
    av.step();
    code.css([5, 7, 10, 12, 16],{"background-color":"#00CCFF"});
    av.umsg("At the end, since the outer loop is executed $k$ times and some of the inner loops execute $n$ times, while others are executed $r$ times, we have the total amount of work required is $\\theta(nk + rk)$");
    av.step();
    code.css([5, 7, 10, 12, 16],{"background-color":"white"});
    av.umsg("Because $r$ is the size of the base, it might be rather small and it can be treated as a constant. Thus, the total amount of work will be $\\theta(nk)$");
    av.step();
    av.umsg("In the case of unique key values, we have $k\\geq\\log_{r}{n}$, and thus the total running time of radixsort is $\\Omega(n\\log{n})$");
    av.recorded();    
  }
  function about() {
    var mystring =
    "Radix Sort Analysis\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more Information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
