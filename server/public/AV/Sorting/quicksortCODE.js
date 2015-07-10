"use strict";

/**
 * These extensions are a temporary measure until an annotation mechanism can be added to JSAV
 * We recommend AGAINST using these functions
 */

(function ($) {
//*****************************************************************************
//*************                  JSAV Extensions                  *************
//*****************************************************************************

  /**
   * Creates a left bound indicator above the specified indices
   * Does nothing if the element already has a left bound arrow above it
   */
  JSAV._types.ds.AVArray.prototype.setLeftArrow = JSAV.anim(function (indices) {
    var $elems = JSAV.utils._helpers.getIndices($(this.element).find("li"), indices);

    // Sets the arrow for every element specified
    $elems.each(function (index, item) {
      if (!$elems.hasClass("jsavarrow")) {
        $elems.toggleClass("jsavarrow");
      }

      if ($elems.hasClass("rightarrow")) {
        // If the selected index already has a right arrow, remove it
        // and add leftrightarrow class
        $elems.toggleClass("rightarrow");
        $elems.toggleClass("leftrightarrow");
      } else if (!$elems.hasClass("leftarrow")) {
        // If the index does not have a right arrow, add a left one
        $elems.toggleClass("leftarrow");
      }
    });
  });

  /**
   * Creates a right bound indicator above the specified indices
   * Does nothing if the element already has a right bound arrow above it
   */
  JSAV._types.ds.AVArray.prototype.setRightArrow = JSAV.anim(function (indices) {
    var $elems = JSAV.utils._helpers.getIndices($(this.element).find("li"), indices);

    // Sets the arrow for every element specified
    $elems.each(function (index, item) {
      if (!$elems.hasClass("jsavarrow")) {
        $elems.toggleClass("jsavarrow");
      }

      if ($elems.hasClass("leftarrow")) {
        // If the selected index already has a left arrow, remove it
        // and add leftrightarrow class
        $elems.toggleClass("leftarrow");
        $elems.toggleClass("leftrightarrow");
      } else if (!$elems.hasClass("rightarrow")) {
        // If the index does not have a left arrow, add a right one
        $elems.toggleClass("rightarrow");
      }
    });
  });

  /**
   * Removes a left arrow (if it exists) from above the specified indices
   */
  JSAV._types.ds.AVArray.prototype.clearLeftArrow = JSAV.anim(function (indices) {
    var $elems = JSAV.utils._helpers.getIndices($(this.element).find("li"), indices);

    // Clears the arrow for every element specified
    $elems.each(function (index, item) {
      if ($elems.hasClass("leftrightarrow")) {
        // Replace the shared bound indicator with a right bound indicator
        $elems.toggleClass("leftrightarrow");
        $elems.toggleClass("rightarrow");
      } else if ($elems.hasClass("leftarrow")) {
        // Remove the left arrow
        $elems.toggleClass("leftarrow");
        $elems.toggleClass("jsavarrow");
      }
    });
  });

  /**
   * Removes a right arrow (if it exists) from above the specified indices
   */
  JSAV._types.ds.AVArray.prototype.clearRightArrow = JSAV.anim(function (indices) {
    var $elems = JSAV.utils._helpers.getIndices($(this.element).find("li"), indices);

    // Clears the arrow for every element specified
    $elems.each(function (index, item) {
      if ($(item).hasClass("leftrightarrow")) {
        // Replace the shared bound indicator with a left bound indicator
        $(item).toggleClass("leftrightarrow");
        $(item).toggleClass("leftarrow");
      } else if ($(item).hasClass("rightarrow")) {
        // Remove the right arrow
        $(item).toggleClass("rightarrow");
        $(item).toggleClass("jsavarrow");
      }
    });
  });

  /**
   * Extends the standard swap function to also swap the highlighting associated with each array element
   */
  JSAV._types.ds.AVArray.prototype.swapWithStyle = function (index1, index2) {
    this.swap(index1, index2);
    this.unhighlightBlue(index1);
    this.highlightBlue(index2);
  };
}(jQuery));
