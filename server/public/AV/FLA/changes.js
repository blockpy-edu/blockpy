
    var Text = function(jsav, raphael, x, y, r, props) {
      this.rObj = raphael.text(x, y, r);
      return this;
    }
    JSAV.utils.extend(Text, JSAVGraphical);

    JSAV.ext.g = {
      text : function(x, y, text, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Text(this, svgCanvas, x, y, text, props);        
      },
    };
