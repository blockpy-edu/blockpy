"use strict";
// Helper function for creating a pointer
function setPointer(name, obj) {
  return obj.jsav.pointer(name, obj, {visible: true,
    anchor: "left top",
    myAnchor: "right bottom",
    left: 20,
    top: -20});
}
