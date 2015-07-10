(function() {
   /*global ODSA */
   "use strict";
   var av = new JSAV("container");

   var s0 = {"background-color":"lightgray"};
   var s1 = {"background-color":"sandybrown"};
   var s2 = {"background-color":"skyblue"};
   var s3 = {"background-color":"lightgreen"};
   var s4 = {"background-color":"violet"};
   var s5 = {"background-color":"hotpink"};
   var lam = "&#955;";
   
   var exp = ["(",lam,"x",".","x"," ","y",")"];
   var js = [["(","function","(","x",")","{"],
      ["","return"," ","x",";"],
      ["}",")","(","y",")"]];

   //lists of lists of indices for styling
   var l_left = [[1,2,3,4],[1,2,3,4,5],[0,1,2,3,4],[0]];
   var l_right = [[6],[],[],[3]];
   var l_paren = [[0,5,7],[0],[],[1,2,4]];

   /*initialize and position JSAV arrays*/
   var init = function(){
      exp = av.ds.array(exp, {"indexed":"true"});
      exp.css(true, s0);
      for(var i=0; i<js.length; i++){
         var arr = i<1 ? exp : js[i-1];
         js[i] = av.ds.array(js[i],
            {"relativeTo":arr,"anchor":"left bottom","myAnchor":"left top",
            "center":"false","indexed":"true"}
         );
         js[i].css(true, s0);
      }
      //hide arrays only after relative positions established
      exp.hide();
      for(var i=0; i<js.length; i++)
         js[i].hide();
   }

   /*indices in list l are highlighted and have style s applied*/
   var style = function(l, s){
      exp.highlight(l[0]);
      exp.unhighlight();
      exp.css(l[0], s);
      for(var i=0; i<js.length; i++){
         js[i].highlight(l[i+1]);
         js[i].unhighlight();
         js[i].css(l[i+1], s);
      }
   }

   //commence edumacating
   init();

   //slide 1
   av.umsg("Lambda effing calculus!");
   av.displayInit();

   //slide 2
   av.umsg("app placeholder");
   exp.show();
   av.step();

   //slide 3
   av.umsg("app placeholder");
   for(var i=0; i<js.length; i++)
      js[i].show();
   av.step();

   //slide 4
   av.umsg("app placeholder");
   style(l_left, s1);
   av.step();

   //slide 5
   av.umsg("app placeholder");
   style(l_right, s2);
   av.step();

   //slide 6
   av.umsg("app placeholder");
   style(l_paren, s3);
   av.step();

   av.recorded();
}());
