// Plain vanilla insert -- no animation
var insert = function (node, insval) {
  var val = node.value();
  if (!val || val === "jsavnull") { // no value in node
    node.value(insval);
  } else if (val >= insval) { // go left
    if (node.left()) {
      insert(node.left(), insval);
    } else {
      node.left(insval);
    }
  } else { // go right
    if (node.right()) {
      insert(node.right(), insval);
    } else {
      node.right(insval);
    }
  }
};


var remove = function (node, delval) {
  if (node.value() == delval) {
    if (!node.right() || node.right() == "jsavnull") {
      if (!node.parent() || node.parent() == "jsavnull") {
        bt.root(node.left().value());
        return true;
      }
      else if (node.value() <= node.parent().value()) {
        node.parent().left(node.left());
        return true;
      }
      else {
        node.parent().right(node.left());
        return true;
      }
    }
    else if (!node.right().left() || node.right().left() == "jsavnull") {
      node.right().left(node.left());
      if (!node.parent() || node.parent() == "jsavnull") {
        bt.root(node.right().value());
        return true;
      }
      else if (node.value() <= node.parent().value()) {
        node.parent().left(node.right());
        return true;
      }
      else {
        node.parent().right(node.right());
        return true;
      }
    }
    else {
      node.value(removeMin(node.right().left()));
      return true;
    }
  }
  else if (delval <= node.value()) {
    if (!node.left() || node.left() == "jsavnull") {
      return false;
    }
    else {
      return remove(node.left(), delval);
    }
  }
  else {
    if (!node.right() || node.right() == "jsavnull") {
      return false;
    }
    else {
      return remove(node.right(), delval);
    }
  }
};

var removeMin = function (p) {
  if (!p.left() || p.left() == "jsavnull") {
    var temp = p.value();
    p.parent().left("jsavnull");
    return temp;
  }
  else {
    return removeMin(p.left());
  }
};

// Insert with animation
var insert_anim = function (node, insval) {
  var val = node.value();
  if (!val || val === "jsavnull") { // no value in node
    node.value(insval);
    node.css("background-color", "red");
    bt.layout();
    jsav.step();
  } else {
    node.css("background-color", "yellow");
    caption_label.text(caption_text + ", comparing to " + node.value());
    bt.layout();
    jsav.step();
    if (val >= insval) { // go left
      if (node.left()) {
        insert_anim(node.left(), insval);
      } else {
        node.left(insval);
        node.left().css("background-color", "red");
        caption_label.text(caption_text + " completed ");
        bt.layout();
        jsav.step();
      }
    } else { // go right
      if (node.right()) {
        insert_anim(node.right(), insval);
      } else {
        node.right(insval);
        node.right().css("background-color", "red");
        caption_label.text(caption_text + " completed ");
        bt.layout();
        jsav.step();
      }
    }
  }
};

// traverse to re-set background color of the entire tree
var traverse_color = function (node, col) {
  var val = node.value();
  if (!val || val === "jsavnull") { // no value in node
    return;
  } else {
    node.css("background-color", col);
    if (node.left())
      traverse_color(node.left(), col);
    if (node.right())
      traverse_color(node.right(), col);
  }
};
