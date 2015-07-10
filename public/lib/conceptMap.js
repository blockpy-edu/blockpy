(function ($) {
    "use strict";

    /**
    * Local odsaUtils object that makes it easier to access ODSA.UTILS and
    * allows better minification
    *
    * ODSA.UTILS is initialized in odsaUtils.js which must be included before this library
    */
    var odsaUtils = ODSA.UTILS;

    var nodeIndex = 0,
        nodes = [],
        connections = [],
        linking_phrase = [],
        graph = [],
        adjacents = [],
        array = [],
        list = [],
        defs_obj = {};


    function Graph() {
        this.numOfEdges = 0;
        this.adjacencyLists = {};
        this.nodeList = {};
    }

    function Node(id, label, edge, parent, comment) {
        this.id = id;
        this.label = label;
        this.edge = edge;
        this.parent = parent;
        this.comment = comment;
    }

    function Connection(id, from_id, to_id) {
        this.id = id;
        this.from_id = from_id;
        this.to_id = to_id;
    }

    function Phrase(id, label) {
        this.id = id;
        this.label = label;
    }


    function buildGraph() {
        var to_id = null,
            from_id = null,
            index = 0,
            fromNode = null,
            edgeLabel = null,
            parent_id = null,
            parent_node = null;

        $.each(defs_obj.connections, function (key, val) {
            index = getNodeIndex(val.from);
            if (isNode(val.from)) {
                var adjacentNodes = graph[index];
                from_id = val.from;
                to_id = val.to;

                $.each(defs_obj.connections, function (k, v) {
                    if (to_id === v.from) {
                        var toNode = getConceptLabel(v.to);
                        edgeLabel = getEdgeLabel(to_id);
                        adjacentNodes.push(new Node(v.to, toNode, edgeLabel, null, null));
                    }
                });
            }
        });
    }

    function isInGraph(from_id) {
        for (var h = 0; h < graph.length; h++) {
            var list = graph[h];
            if (list[0].id === from_id) {
                nodeIndex = h;
                return true;
            }
        } 
        return false; 
    }


    function getNodeIndex(id) {
        for (var z = 0; z < graph.length; z++) {
            var list = graph[z];
            if (list[0].id === id) {
                return z;
            }
        }
        return null; 
    }

    function getConceptLabel(id) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
                return nodes[i].label;
            }
        }
        return null;
    }

    function getDefinition(term) {
        for (var tt = 0; tt < nodes.length; tt++) {
            if (nodes[tt].label === term) {
                return nodes[tt].comment;
            }  
        }  
        return null;
    }


    function printDefinition(term, definition) {
        //var frame = document.getElementById("info");
 
        if (definition !== null) {
            //frame.contentWindow.document.write(definition);
            $("#info").html(definition);
        } else {
            $("#info").html("The term " + term  + " is not in the glossary");
        }  
    }


    function getParent(id) {
        $.each(defs_obj['connections'], function (k, v) {
            if (v['to'] === id) {
                var from_id = v['from'];
                $.each(defs_obj['connections'], function (key, val) {
                    if (val['to'] == from_id){
                        return val['from'];
                    }
                });
            }
        });
    }

    function getEdgeLabel(id) {
        var label = '';
        $.each(defs_obj.linking_phrase, function (k, v) {
            if (k === id) {
                label = v;
                return;
            }
        });
        return label;
    }



function getIncomingEdge(id) {
  $.each(defs_obj.connections, function (k, v) {
    if (v['to'] === id) {
      var label = getEdgeLabel(v['from']);
      return label;
    }
  });
  return null;
}

function isNode(id) {
  for (var k = 0; k < nodes.length; k++) {
    if (nodes[k].id === id){
      return true;
    }
  }
  return false;
}
  
    function Parser() {
        var url = location.href.substring(0, location.href.lastIndexOf('/')) + '/_static/GraphDefs.json';
        $.ajax({
            url: url,
            async: false,
            dataType: "json",
            success: function (data) {
                defs_obj = ODSA.UTILS.getJSON(data);
            },
            error: function (data) {
                data = ODSA.UTILS.getJSON(data);

                if (data.hasOwnProperty('status') && data.status === 200) {
                    console.error('JSON language file is malformed. Please make sure your JSON is valid.');
                } else {
                    console.error('Unable to load JSON language file (' + url + ')');
                }
            }
        });

        $.each(defs_obj.linking_phrase, function (key, val) {
            linking_phrase.push(new Phrase(key, val));
        });

        //Connections between nodes
        $.each(defs_obj.connections, function (key, val) {
            connections.push(new Connection(key, val.from, val.to));
        });

        //Concepts or Nodes
        $.each(defs_obj.concepts, function (key, val) {
            nodes.push(new Node(key, key, null, null, val));
        });

        $.each(defs_obj.concepts, function (key, val) {
            var thisId = key,
                thisLabel = key,
                thisDefinition = val,
                startNode = [],
                parentId = getParent(thisId),
                parentLabel = getConceptLabel(parentId),
                incomingEdge = getIncomingEdge(thisId);
            startNode.push(new Node(thisId, thisLabel, incomingEdge, parentLabel, thisDefinition));
            graph.push(startNode);
        });
    }

function printGraph(concept) {
  //var frame = document.getElementById("info");
  //frame.contentWindow.document.close();
  var oldEdge = []; 
  var processedLabels = [];
  var processedEdges = [];
  var edgesnodesDict = {};
  var edgeAsNode = null;
  var toNode = null;
  var fromNode = null; 
 
  var jsav = new JSAV( $('.avcontainer'));
  var g = jsav.ds.graph({width: 800, height: 500, layout: "automatic", directed: true});
  // var g = jsav.ds.graph({width: 800, height: 500, layout: "layered", directed: true});
  for (var l = 0; l < graph.length; l++) {
    var m = graph.length;
    var list = graph[l];    

    if (list[0].label === concept) {
      fromNode = g.addNode(list[0].label);
      var parentNodeName = list[0].parent;
      if (parentNodeName != null) {
        var parentNode = g.addNode(parentNodeName);
        var edgeNode = g.addNode(list[0].edge).css({"border-radius": "8px", "border-style":"none"}).addClass("edge");
        g.addEdge(parentNode, edgeNode)
        g.addEdge(edgeNode, fromNode);
      }
      for (var p = 1; p < list.length; p++) {
        var newEdge = list[p].edge;
        if (processedEdges.indexOf(newEdge) < 0) {
          edgeAsNode = g.addNode(list[p].edge).css({"border-radius": "8px", "border-style":"none"}).addClass("edge");
          toNode = g.addNode(list[p].label);
          g.addEdge(fromNode, edgeAsNode);
          g.addEdge(edgeAsNode, toNode);
          processedEdges.push(newEdge);
          processedLabels.push(list[p].label)
        }
        else {
          if ( processedLabels.indexOf(list[p].label) < 0 ) {
            toNode = g.addNode(list[p].label);
            g.addEdge(edgeAsNode, toNode);
            processedLabels.push(list[p].label)
          }
        }       
          oldEdge.push(list[p].edge);  
      }
      g.layout();
      // This will highlight and unhighlight if needed
      g.mouseenter(function() {
        if (this.hasClass("edge")){
          return;
        } else {
          this.highlight();
        } } ).click(function() {
        if (this.hasClass("edge")){
          return;
        } else {
          var label = this.value();
          g.clear();
          reprint(label);
        } } ).mouseleave(function() {
        if (this.hasClass("edge")){
          return;
        } else {
          this.unhighlight();
        } } );  
    }      
  }
}

  function reprint(term) {
    printGraph(term);
    var definition = getDefinition(term);
    printDefinition(term, definition);
  }

  function runit() {
    Parser();
    buildGraph();
    var odsaTermList = JSON.parse(localStorage["concept"]);
    var term = odsaTermList[odsaTermList.length - 1].toLowerCase();  
    printGraph(term); 
    var definition = getDefinition(term);
    printDefinition(term, definition); 
  }

  function getTermsList() {
    if (localStorage.getItem("concept") !== null) {
      return  JSON.parse(localStorage["concept"]);
    }
    return null;

  }


  $(document).ready(function () {
    if ( window.location.href.indexOf("conceptMap") > -1) {
      runit();
      //Add ODSAterm class to all jsavgraphnode elements
      $(".jsavgraphnode").addClass( "ODSAterm"  );
      //Remove ODSAterm class from all 'edge' nodes
      //Disable all edge nodes children
      $('.edge').removeClass("ODSAterm");
      $('.edge').attr('disabled', true);
      $('.edge').find("span").attr('disabled', true);

      // Attach a handler for concept maps terms
      $( ".ODSAterm" ).click(function (event) {
        var id = $( event.target ).text();
        var odsaTermList = [];
        odsaUtils.logUserAction('glossary-term-clicked', id);
        if ( getTermsList() !== null) {
          odsaTermList = getTermsList();
        }
  
        if (odsaTermList.indexOf(id) === -1) {
          odsaTermList.push(id);
        }
        localStorage.setItem("termIndex", odsaTermList.length -1 );
        localStorage.setItem("concept", JSON.stringify(odsaTermList));
        window.location.reload(true);
      });

  

      //Disable back button when no nodes in list or we at the bottom of the stack
      var tID = 0;
      if (localStorage.getItem("termIndex") !== null) {
        tID = localStorage.getItem("termIndex");
      } 
      else {
        localStorage.setItem("termIndex", tID);
      } 
      if ( Number(tID) === 0 ) {
        $('.termBack').attr('disabled', true);
      }
      else {
        $('.termBack').removeAttr('disabled');
      }

      //Attach a handled for back button
      $( ".termBack" ).click(function (event) {
        var odsaTermList = [];
        if ( getTermsList() !== null) {
          odsaTermList = getTermsList();
        }
        //we pop the term at the top of our list
        odsaTermList.pop();
        //we decrement the size of termIndex
        var topID = localStorage.getItem("termIndex");
        topID = topID - 1;
        localStorage.setItem("termIndex", topID);
        
        //update localstorage and reload the page
        localStorage.setItem("concept", JSON.stringify(odsaTermList));
        window.location.reload(true);
      });

      //highlight the current node
      if ( getTermsList() !== null) {
        var odsaTermList = getTermsList();
        $( ".ODSAterm" ).each( function() {
          var ancestor = $( this );
          ancestor.find(".jsavvaluelabel").each( function() {
            if ( $( this ).text() === odsaTermList[odsaTermList.length -1] ) {
              ancestor.css({'background-color': 'yellow'});
            }
          });
        });
      }
    }
  });

}(jQuery))
