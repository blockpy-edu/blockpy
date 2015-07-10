/**
* Module that contains the deterministic finite automata (DFA) implementation.
* Depends on JSAV.js
*/

  // CREATE AN ARRAY OF STATES, WHERE INDEX == ID.
  var DFA = function(jsav, options) {
    this.init(jsav, options);
	};
	var dfaproto = DFA.prototype;
  // Called when DFA is instantiated
	dfaproto.init = function(jsav, options) {
		this.jsav = jsav;
		this.options = options;
    this.allStates = [];
    this.currentStateId = 0;
	};
  // Instantiates and adds a new State to the DFA
	dfaproto.addState = function(xPos, yPos, color, isFinalState) {
    // Assigns Unique ID to the new State object, where Unique ID == size of DFA before adding (just like Array)
    // The first State added becomes a start state.
    var id = this.allStates.length;
    this.allStates.push(new State(this.jsav, xPos, yPos, color, id == 0, isFinalState, id));
    return this.allStates[id];
  };
  
  dfaproto.getCurrentState = function() {
    return this.allStates[this.currentStateId];
  };

  dfaproto.reset = function() {
    this.getCurrentState().unhighlight();
    this.currentStateId = 0;
    this.getCurrentState().highlight();       
  }
  
  dfaproto.traverse = function(letter) {
    var nextState = this.getCurrentState().traverse(letter);
    if (nextState == -1) {
      return - 1;
    }
    this.getCurrentState().unhighlight();
    this.currentStateId = nextState;
    this.getCurrentState().highlight();
  };
  
  dfaproto.simulate = function(inputStr, explicitLog) {
    console.log("Beginning simulation with String: " + inputStr);
    console.log("Initial state: %d \n", this.currentStateId);
    if (explicitLog === "undefined") {
      explicitLog = true;
    }
    for (var i = 0; i < inputStr.length; i++) {
      console.log("Current letter: " + inputStr.charAt(i));
      this.traverse(inputStr.charAt(i), false);
      console.log("The current state is: " + this.currentStateId);
    }
    console.log("Traversal complete");

    if (this.getCurrentState().isFinal) {
      console.log("The current state is a final state.");
      console.log("The string " + inputStr + " is valid.");
      return true;
    } else {
      console.log("The current state is not a final state.");
      console.log("The string " + inputStr + " is rejected.");
      return false;     
    }
  };

  

  var StateEdge = function(jsav, currentState, nextState, acceptedChars) {
    this.jsav = jsav;
    // A reference to the edge
    this.g = null;
    var allChars = acceptedChars.toString();    
    // x, y coordinates of Circle 1 center
    var x1 = currentState.myXPos * 120 + 70;
    var y1 = currentState.myYPos * 120 + 70;

    // x, y coordinates of Circle 2 center
    var x2 = nextState.myXPos * 120 + 70;
    var y2 = nextState.myYPos * 120 + 70;

    var dX = x2 - x1;
    var dY = y2 - y1;
    var p1X, p1Y, p2X, p2Y = 0;

    // THIS RADIUS SHOULD MATCH THAT OF STATE
    var radius = 50;

    // If same circle
    if (currentState.getUniqueID() == nextState.getUniqueID()) {
//      this.jsav.g.text(x1 - 20, y1 - radius - 10, allChars);
      this.jsav.label(allChars, {left: x1 - 20, top: y1 - radius - 10});
      return;
    }

    if (dX == 0) {
      p1X = x1;
      p2X = x2;
      p1Y = y1 + Math.sign(dY) * radius;
      p2Y = y2 - Math.sign(dY) * radius; 
    } else if (dY == 0) {
      p1Y = y1;
      p2Y = y2;
      p1X = x1 + Math.sign(dX) * radius;
      p2X = x2 - Math.sign(dX) * radius;
    } else {
      var theta = Math.atan(Math.abs(dY) / Math.abs(dX));
      var rX = 50 * Math.cos(theta);
      var rY = 50 * Math.sin(theta);

      // SIMPLIFY MATH HERE. Don't need Math.sign when adding.
      p1X = x1 + Math.sign(dX) * rX;
      p2X = x2 - Math.sign(dX) * rX;

      p1Y = y1 + Math.sign(dY) * rY;
      p2Y = y2 - Math.sign(dY) * rY;
    }

    var midPX = getAverage(p1X, p2X);
    var midPY = getAverage(p1Y, p2Y);

    var nextStatePointsBack = ""+currentState.getUniqueID() in nextState.nextStates;
    if (nextStatePointsBack) {
      // Remove original edge pointing from next state to current state
      nextState.edges[""+currentState.getUniqueID()].g.clear();
      this.g = this.jsav.g.ellipse(midPX, midPY, getDistance(p1X, p1Y, p2X, p2Y) / 2, 6);
//      this.jsav.g.text(midPX, midPY + 12, allChars);
      this.jsav.label(allChars, {left: midPX, top: midPY + 12});

        // Simplify this section (repeated later)
        if (Math.sign(dX) == Math.sign(dY)) {
          this.g.rotate(radiansToDegrees(theta));
        } else {
          this.g.rotate(radiansToDegrees((2*3.14 - theta)));
        }

    } else {
      this.g = this.jsav.g.line(p1X, p1Y, p2X, p2Y, {stroke: "black", "stroke-width": 1});      
//      this.jsav.g.text(midPX, midPY - 12, allChars);
      this.jsav.label(allChars, {left: midPX, top: midPY - 12});
    }

//    this.gElements.push(jsav.g.circle(p2X, p2Y, 5, {"fill": "black"}));

    if (dX == 0) {
      var arrow = this.jsav.g.polygon([[p2X, p2Y], [p2X + 5, p2Y - Math.sign(dY) * 5], [p2X - 5, p2Y - Math.sign(dY) * 5]], {"fill":"black"});
    } else {
      var arrow = this.jsav.g.polygon([[p2X, p2Y], [p2X - Math.sign(dX) * 5, p2Y + 5], [p2X - Math.sign(dX) * 5, p2Y - 5]], {"fill":"black"});
    }
    
    if (typeof theta === "undefined") {
      if (dX == 0) {
        theta = 3.14 / 2;
      } else {
        theta = 0;
      }
    }

    if (Math.sign(dX) == Math.sign(dY)) {
      arrow.rotate(radiansToDegrees(theta));
    } else if (dX != 0 && dY != 0) {
      arrow.rotate(radiansToDegrees((2*3.14 - theta)));
    }
  }

  function getDistance(x1, y1, x2, y2) {
    var dXSquared = Math.pow((x1 - x2), 2);
    var dYSquared = Math.pow((y1 - y2), 2);
    return Math.sqrt(dXSquared + dYSquared);  
  }

  function getAverage() {
    if (arguments.length == 0) return 0;

    var sum = 0;
    for (var i = 0; i < arguments.length; i++) {
      sum += arguments[i];
    }
    return sum / arguments.length;
  }

  function radiansToDegrees(rad) {
    return rad * 57.30;
  }

  // State implementation
  var State = function(jsav, xPos, yPos, color, isStartState, isFinalState, uniqueId) {
    this.jsav = jsav;
    this.myXPos = xPos;
    this.myYPos = yPos;
    this.myColor = color;
    this.isStart = isStartState;
    this.isFinal = isFinalState;
    this.uniqueId = uniqueId;
    // Dictionary of possible next states, along with accepted characters
    this.nextStates = {};
    // Dictionary of all edges. nextStates and edges can be combined, as they contain redundant data.
    this.edges = {};
    
    this.g = this.jsav.g.circle(this.myXPos * 120 + 70, this.myYPos * 120 + 70, 50, {fill: color});
    
    // Event handling example.
    // See "Events" section of http://jsav.io/graphicalprimitives/ for more.
    this.g.click(function() { 
        alert(uniqueId + " clicked!");
    });

    if (this.isStart == true) {
       this.jsav.g.polygon([[this.myXPos * 120, this.myYPos * 120 + 40], [this.myXPos  * 120, this.myYPos * 120 + 100], [this.myXPos * 120 + 20, this.myYPos * 120 + 70]]);
       // Highlight start State
       this.highlight();
    }

    if (this.isFinal == true) {
       this.jsav.g.circle(this.myXPos * 120 + 70, this.myYPos * 120 + 70, 45);    
    }

    this.jsav.label("q" + this.getUniqueID(), {left:this.myXPos * 120 + 63, top:this.myYPos * 120 + 67, fill:"black"});
  };

  var stateproto = State.prototype;
 
  stateproto.getUniqueID = function() {
    return this.uniqueId;
  };

  stateproto.addNextState = function(nextState, acceptedChars) {
    // COMBINE INTO ONE DATA STRUCTURE.
    this.nextStates[""+nextState.getUniqueID()] = acceptedChars;
    this.edges[""+nextState.getUniqueID()] = new StateEdge(this.jsav, this, nextState, acceptedChars);
   };

  stateproto.traverse = function(letter) {
    for (var state in this.nextStates) {
      if (this.nextStates.hasOwnProperty(state)) {
          for (var i = 0; i < this.nextStates[state].length; i++) {
              var acceptedChar = this.nextStates[state][i];
              if (acceptedChar == letter) {
                return Number(state);
              }
          }
      }
    }
    return -1;
  };

  stateproto.highlight = function() {
    this.g.css({fill: "#ffaaaa"});
  };

  stateproto.unhighlight = function() {
    this.g.css({fill: this.myColor});
  }

	JSAV.ext.dfa = function(options) {
		return new DFA(this, options);
	};
