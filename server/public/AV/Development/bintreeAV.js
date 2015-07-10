"use strict";
/*global alert: true, ODSA */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#run').click(runIt);
  $('#reset').click(ODSA.AV.reset);

  var Bintree = function (jsav, xrange, yrange) {
    // Setup map for viewing the inputs as a map
    var mapleft = 450;
    var maptop  = 25;
    var maprect = jsav.g.rect(mapleft, maptop, xrange, yrange);

    // Enum for the node type
    // stored in node.NodeType
    var NT = {
      INTERNAL : 0,
      EMPTYEXT : 1,
      FULLEXT  : 2
    };

    // This is the JSAV base data structure, a binary tree.
    this.tree = jsav.ds.binarytree({nodegap: 10, left: 200});
    // This is the root of the tree
    this.tree.root('').hide();

    console.log("I'm making a new Bintree object. root = ", this.tree.root());
    // Set the root as an empty node
    this.tree.root().NodeType = NT.EMPTYEXT;
 
    this.doTrav = function(root) {
      if (root.NodeType === NT.INTERNAL) {
        theString = theString + "I";
        this.doTrav(root.left());
        this.doTrav(root.right());
      }
      else if (root.NodeType === NT.EMPTYEXT)
        theString = theString + "E";
      else if (root.NodeType === NT.FULLEXT)
        theString = theString + root.value();
      else
        console.log("ERROR WITH TRAVERSING TREE");
    }

    this.logtrav = function() {
      theString = "";
      this.doTrav(this.tree.root());
      console.log(theString);
    }

    this.layout = function () {
      console.log("Layout the tree");
      this.logtrav();
      this.tree.layout();
    }

    // Getter function for the root
    this.getRoot = function () {
      console.log("getRoot: ", this.tree.root());
      return this.tree.root();
    };
    
    // Tests to see if the tree is empty 
    this.isEmpty = function () {
      var returning = (this.tree.root().NodeType === NT.EMPTYEXT);
      console.log("Bintree isEmpty test: ", returning);
      return (returning);
    };

    // Helper function for creating a new internal node

    this.newInteralNode = function() {
      var ret = this.tree.newNode('').hide();
      ret.NodeType = NT.INTERNAL;
      return ret;
    }

    this.newEmptyExtNode = function() {
      var ret = this.tree.newNode('').hide();
      ret.NodeType = NT.EMPTYEXT;
      ret.addClass('bintreeemptyleaf');
      return ret;
    }
    
    // calling function for insertion
    this.add = function(INx, INy, INrec) {
      console.log("Start Insert: ", INrec, " @ (", INx, ", ", INy, ")");
      this.tree.root().hide();
      var temp = this.insert(this.tree.root(), INx, INy, INrec, 0, 0, xrange, yrange, 0);
      console.log("Setting the root to be: " + temp);
      this.tree.root(temp, {hide: false});
      this.tree.root().show();
      this.layout();
    }

    // calling function for insertion
    this.remove = function(INx, INy) {
      console.log("Start Delete: (", INx, ", ", INy, ")");
      this.tree.root().hide();
      var temp = this.delete(this.tree.root(), INx, INy, 0, 0, xrange, yrange, 0);
      console.log("Setting the root to be: " + temp);
      this.tree.root(temp, {hide: false});
      this.tree.root().show();
      this.layout();
    }

    // returns the root of tree that results from inserting the new record
    this.insert = function(rt, INx, INy, INrec, Bx, By, Bwid, Bhgt, level) {
      console.log("Bintree insert BEGIN: ", INx, INy, ", Level: ", level, ", Box: ", Bx, By, Bwid, Bhgt, ", rt Type: ", rt.NodeType);

      if (level > 15) {
        console.log("EMERGENCY STOP");
        return rt;
      }

      if (rt.NodeType === NT.EMPTYEXT) {
        console.log("insert: encountered empty leaf node: insert data and return")
        jsav.umsg("Encountered an empty leaf node: Now insert data and return.");
        jsav.step();
        console.log("Bintree insert: (LEAF) Value = ", INrec);
    
        var temp = this.tree.newNode(INrec).hide(); 
        temp.addClass('bintreefullleaf');
        temp.x = INx;
        temp.y = INy;
        temp.NodeType = NT.FULLEXT;

        jsav.g.circle(mapleft + INx, maptop + INy, 5, {fill: 'black'});

        return temp;
      }
      
      // If the entry is a full leaf
      if (rt.NodeType === NT.FULLEXT) {
        jsav.umsg("Enountered a full external node. Now replace " + 
          "with an internal node and insert both the old and new data.");
        jsav.step();
        console.log("insert: is a leaf and not empty: ", INrec, rt);
        
        if ((rt.x === INx) && (rt.y === INy)) {
          console.log("ERROR: Tried to reinsert duplicate point");
          jsav.umsg("Error: Tried to reinsert duplicate point");
          jsav.step();
          return rt;
        }
        // Create the new nodes and set them as 
        var tp = this.newInteralNode();
        var tpl = this.newEmptyExtNode();
        var tpr = this.newEmptyExtNode();
        tp.left(tpl);
        tp.right(tpr);

        var old = rt; 
        rt = tp;

        console.log("Insert old data for insert: ", INrec);
        // Insert the old data
        tp = this.insert(rt, old.x, old.y, old.value(), Bx, By, Bwid, Bhgt, level);

        console.log("Insert new data for insert: ", INrec);
        
        // Fall through and continue inserting the data.
      }

      // If it isn't a leaf, then we have an internal node to insert into
      if (level % 2 == 0) { // Branch on X
        // Split X on Y for map
        //jsav.g.line(mapleft + Bx, maptop + By, Bwid/2, Bhgt);
        jsav.g.rect(mapleft + Bx, maptop + By, Bhgt, Bwid/2); 
        if (INx < (Bx + Bwid/2)) { // Insert left
          console.log("Branch on X, Insert Left: ", rt.left().NodeType);
          rt.left(this.insert(rt.left(), INx, INy, INrec, Bx, By, Bwid/2, Bhgt, level+1));
        }
        else { // Insert on the right
          rt.right(this.insert(rt.right(), INx, INy, INrec, Bx + Bwid/2, By, Bwid/2, Bhgt, level+1));
        }
      }

      else { // Branch on Y
        // Split on X for map
        //jsav.g.line(mapleft + Bx + Bwid, maptop + By, mapleft + Bwid, maptop + Bhgt/2);
        jsav.g.rect(mapleft + Bx, maptop + By, Bhgt/2, Bwid); 
        if (INy < (By + Bhgt/2)) { // Insert up
          console.log("Branch on Y, Insert up: " + rt.left().NodeType);
          rt.left(this.insert(rt.left(), INx, INy, INrec, Bx, By, Bwid, Bhgt/2, level+1));
        }
        else {
          console.log("Branch on Y, Insert down: " + rt.right().NodeType);
          rt.right(this.insert(rt.right(), INx, INy, INrec, Bx, By + Bhgt/2, Bwid, Bhgt/2, level+1));
        }
      }

      return rt;
    } // insert


    this.delete = function(rt, INx, INy, Bx, By, Bwid, Bhgt, level) {

      // If an external node
      if (rt.NodeType === NT.FULLEXT) {
        if (rt.x === INx && rt.y === INy) {
          console.log("External node match found: " + rt.value());
          var temp = this.newEmptyExtNode();
          temp.value("DELETED");
          return temp;
        }
      }

      // We have an internal node
      if (level % 2 === 0) { // EVEN
        // Branch on X 
        if (INx < (Bx + Bwid/2)) {
            rt.left(delete(rt.left(), INx, INy, Bx, By, Bwid/2, Bhgt, level+1));
          }
        else {
          rt.right(delete(rt.right(), INx, INy, Bx + Bwid/2, By, Bwid/2, Bhgt, level+1));
        }
      }
      else { // ODD
        // Branch on Y
        if (INy < (By + Bhgt/2)) {
          rt.left(delete(rt.left(), INx, INy, Bx, By, Bwid, Bhgt/2, level+1));
        }
        else {
          rt.right(delete(rt.right(), INx, INy, Bx, By + Bhgt/2, Bwid, Bhgt/2, level+1));
        }
      } 

      // Now, check to see if there should be a merge
      if ((rt.left().NodeType === NT.EMPTYEXT) && (rt.right().NodeType === NT.FULLEXT))
        return rt.right();
      if ((rt.left().NodeType === NT.FULLEXT) && (rt.right().NodeType === NT.EMPTYEXT))
        return rt.left();

      return rt;
    } // delete
  } // bintree

  // Execute the "Run" button function
  function runIt() {
    ODSA.AV.reset(true);

    var jsav = new JSAV($('.avcontainer'));

    jsav.umsg("Let's get started");
    console.log("Setup the Bintree");
    var bint = new Bintree(jsav, 256, 256);
    console.log("I just made a new Bintree, and bint.root is: ", bint.getRoot());
    jsav.displayInit();

    // Setup the tree
    jsav.umsg("Step 1: insert node with value 'A' @ 125, 125");
    
    jsav.step();
    bint.add(125, 125, "A");
    jsav.step();
    jsav.umsg("Step 1: Insertion completed");
    
    jsav.step();

    // Insert another object
    jsav.umsg("Step 2: insert node with value \"B\" @ 50, 50");
    
    jsav.step();
    bint.add(50, 50, "B");

    jsav.step();
    jsav.umsg("Step 2: Insertion completed");

    jsav.step();

    jsav.umsg("Step 3: insert node with value \"C\" @ 175, 175");
    jsav.step();

    bint.add(175, 175, "C");
    jsav.step();
    jsav.umsg("Step 3: Insertion completed");
    jsav.step();

    jsav.umsg("Step 4: insert node with value \"D\" @ 40, 184");
    jsav.step();

    bint.add(40, 184, "D");
    jsav.step();
    jsav.umsg("Step 4: Insertion completed");
    jsav.step();

    jsav.umsg("Step 5: remove node with value \"B\" @ 50, 50");
    jsav.step();

    bint.remove(50, 50);
    jsav.step();
    jsav.umsg("Step 5: Deletion completed");

    jsav.recorded(); // mark the end
  }

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the config object with interpreter and code created by odsaUtils.js
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  var theString;

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));
});
