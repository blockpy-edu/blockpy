//g.transitionFunction takes a single node and returns an array of node values
//assumes all nodes have unique values! 
//uses underscore.js

//inefficient: should create a new state object to put in the arrays, or use css classes

  var convertToDFA = function(jsav, graph, opts) {
    // $('button').hide();
    // $('input').hide();
    // jsav.label("Converted:");
    var g = jsav.ds.fa($.extend({layout: 'automatic'}, opts)),
        alphabet = Object.keys(graph.alphabet),
        startState = graph.initial,
        newStates = [];
    var first = lambdaClosure([startState.value()], graph).sort().join();
    newStates.push(first);
    var temp = newStates.slice(0);

    //jsav.displayInit();
    first = g.addNode({value: val}); 
    g.makeInitial(first);
    //first.addClass("start");
    g.layout();
    //jsav.step();
    while (temp.length > 0) {
      var val = temp.pop(),
          valArr = val.split(',');
      var prev = g.getNodeWithValue(val);
      for (var i = 0; i < alphabet.length; i++) {
        var letter = alphabet[i];
        var next = [];
        for (var j = 0; j < valArr.length; j++) {
          next = _.union(next, lambdaClosure(graph.transitionFunction(graph.getNodeWithValue(valArr[j]), letter), graph));
        }
        var node = next.sort().join();
        if (node) {
          if (!_.contains(newStates, node)) {
            temp.push(node);
            newStates.push(node);
            node = g.addNode({value: node});
          } else {
            node = g.getNodeWithValue(node);
          }
          var edge = g.addEdge(prev, node, {weight: letter});

          //g.layout();
          //jsav.step();
        }
      }
    }
    addFinals(g, graph);
    g.layout();
    var nodes = g.nodes();
    for (var next = nodes.next(); next; next = nodes.next()) {
      next.stateLabel(next.value());
      next.stateLabelPositionUpdate();
      //next.hide();
      //next._stateLabel.hide();
    }
    g.updateNodes();
    return g;
    // var edges = g.edges();
    // for (next = edges.next(); next; next = edges.next()) {
    //   next.hide();
    // }
    // graph.hide();

    // jsav.displayInit();
    // var bfs = [],
    //     visited = [];
    // bfs.push(g.initial);
    // visited.push(g.initial);
    // while (bfs.length > 0) {
    //   var cur = bfs.shift();
    //   cur.show();
    //   cur._stateLabel.show();
    //   var successors = cur.neighbors();
    //   for (var next = successors.next(); next; next = successors.next()) {
    //     if (!_.contains(visited, next)) {
    //       bfs.push(next);
    //       visited.push(next);
    //     }
    //   }
    //   jsav.step();
    // }
    // for (var i = 0; i < visited.length; i++) {
    //   var outgoing = visited[i].getOutgoing();
    //   for (var j = 0; j < outgoing.length; j++) {
    //     outgoing[j].show();
    //   }
    //   jsav.step();
    // }
    // jsav.recorded();
    //could move the values into mouseover and rename all of the nodes

  };
  var addFinals = function(g1, g2) {
    var nodes = g1.nodes();
    for (var next = nodes.next(); next; next = nodes.next()) {
      var values = next.value().split(',');
      for (var i = 0; i < values.length; i++) {
        if (g2.getNodeWithValue(values[i]).hasClass('final')) {
          next.addClass('final');
          break;
        }
      }
    }
  };

  var lambdaClosure = function(input, graph) {
    //input as an array of values, returns an array
    var l = "\&lambda;",
        arr = [];
    for (var i = 0; i < input.length; i++) {
      arr.push(input[i]);
      var next = graph.transitionFunction(graph.getNodeWithValue(input[i]), l);
      arr = _.union(arr, next);
    }
    var temp = arr.slice(0);
    while (temp.length > 0) {
      var val = temp.pop(),
          next = graph.transitionFunction(graph.getNodeWithValue(val), l);
      next = _.difference(next, arr);
      arr = _.union(arr, next);
      temp = _.union(temp, next);

    }
    return arr;
  };


  var minimize = function (graph) {
    // this assumes all of the edges are in the alphabet
    //remove all unreachable states
    var reachable = [graph.initial],
        nodes = graph.nodes();
    dfs(reachable, graph.initial);
    for (var next = nodes.next(); next; next = nodes.next()) {
      if ($.inArray(next, reachable) < 0) {
        graph.removeNode(next);
      }
    }

    //todo: nondistinguishable states
    
  };
  //helper depth-first search to find connected component
  var dfs = function (visited, node, options) {
    var successors = node.neighbors();
    for (var next = successors.next(); next; next = successors.next()) {
      if (!_.contains(visited, next)) {
        visited.push(next);
        dfs(visited, next);
      }
    }
  };
