var arrayUtils = {

  testArrayHighlights: function(arr, hlIndices) {
    for (var i = 0, l = arr.size(); i < l; i++) {
      // test highlights through array.isHighlight
      equal(arr.isHighlight(i), hlIndices[i]);
      // test highlights through the corresponding index objects
      equal(arr.index(i).isHighlight(), hlIndices[i]);
    }
  },

  testArrayValues: function(arr, values) {
    equal(arr.size(), values.length, "Equal array sizes");
    for (var i = 0, l = values.length; i < l; i++) {
      // test values through array
      equal(arr.value(i), values[i], "Values in index " + i);
      // test values through the corresponding index objects
      equal(arr.index(i).value(), values[i]);
    }
  }
};
