/**
    Made by Michael Ebert for skulpt, see this modules at https://github.com/waywaaard/skulpt

    matplotlib.pyplot inspired by https://github.com/rameshvs/jsplotlib, though heavily modified.

  jsplotlib for supporting plot commands and kwargs for the matplotlib skulpt module
  Supports:
    - kwargs
    - all color specs
    - color cycle
    - rc params
    - ., o, x, s markers
    - resize function for markers
    - -, --, .- line styles
    - various Line2D attributes
    - auto scaling for axes
**/
var jsplotlib = {
    // empty object creation
};

jsplotlib.rc = {
    "lines.linewidth": 1.0,
    "lines.linestyle": "-",
    "lines.color": "blue",
    "lines.marker": "None",
    "lines.markeredgewidth": 0.5,
    "lines.markersize": 6,
    "lines.dash_joinstyle": "miter",
    "lines.dash_capstyle": "butt",
    "lines.solid_jointyle": "miter",
    "lines.solid_capstyle": "projecting",
    "lines.antialiased": true,
    "patch.linewidth": 1.0,
    "patch.facecolor": "blue",
    "patch.edgecolor": "black",
    "patch.antialiased": true,
    "text.color": "black",
    "axes.hold": true, // whether to clear the axes by default on
    "axes.facecolor": "white", // axes background color
    "axes.edgecolor": "black", // axes edge color
    "axes.grid": false,
    "axes.titlesize": "large",
    "axes.labelsize": "medium",
    "axes.labelweigth": "normal",
    "axes.labelcolor": "black",
    "axes.axisbelow": false,
    "axes.color_cycle": ["b", "g", "r", "c", "m", "y", "k"]
};

var chart_counter = 0; // for creating unique ids

jsplotlib.Bars = function(ydata, color) {
    var that = {};
    
    // Initialize parameter defaults
    that._y = ydata;
    that._color = color || null;
    
    that.color = function(cs) {
        if (cs)
            this._color = jsplotlib.color_to_hex(cs);
        return this;
    };
    
    that.draw = function(parent_chart) {
        // should be called in the pplot command
        // each plot call adds a new set of bars to our existing plot
        // object and draws them all, when show is called
        // this._init_common();
        var number_of_points = this._y.length; // implement need to move those from the original construct_graph class to lines
        if (!this._linestyle && !this._marker) {
            this._linestyle = jsplotlib.rc['lines.linestyle'];
        }

        /*
        if (!this._marker && !this._linestyle) {
          this._marker = jsplotlib.rc['lines.marker'];
        }
        */

        if (!this._color) {
            this._color = jsplotlib.color_to_hex(parent_chart.get_next_color());
        }

        // set defaults for all attributes
        if (!this._markersize) {
            this._markersize = jsplotlib.rc['lines.markersize'];
        }

        if (!this._markeredgecolor) {
            this._markeredgecolor = 'k';
        }

        if (!this._linewidth) {
            this._linewidth = jsplotlib.rc['lines.linewidth'];
        }

        if (!this._dash_capstyle) {
            this._dash_capstyle = "butt";
        }

        if (!this._solid_capstyle) {
            this._solid_capstyle = "butt";
        }

        if (!this._solid_joinstyle) {
            this._solid_joinstyle = "miter";
        }

        if (!this._dash_joinstyle) {
            this._dash_joinstyle = "miter";
        }

        // default markerfacecolor is linecolor
        if (!this._markerfacecolor) {
            this._markerfacecolor = jsplotlib.color_to_hex(this._color);
        }

        if (!this._markeredgewidth) {
            this._markeredgewidth = 0.75;
        }

        if (!this._alpha) {
            this._alpha = 1;
        }

        // local storage for drawing
        var y = this._y;
        
        /*
        var bins = parseInt(8);
        tempScale = d3.scale.linear().domain([0, bins]).range(d3.extent(y));
        tickArray = d3.range(1+bins).map(tempScale).map(function(e) {
            return e;
        });
        var histMapper = d3.layout.histogram().bins(tickArray)(ys);
        y.domain([0, d3.max(histMapper, function(d) { return d.y; })]);
        */

        // create array of point pairs with optional s value
        // from [x1,x2], [y1, y2], [s1, s2]
        // to [[x1,y1,s1],[x2,y2,s2]]
        var xscale = parent_chart.get_xscale(); // should come from axis o.O
        var yscale = parent_chart.get_yscale();

        var xformat = parent_chart._xaxis._formatter || function(x) {
            return x;
        };

        var yformat = parent_chart._yaxis._formatter || function(x) {
            return x;
        };

        // this adds the bars to the chart
        this._bars = parent_chart.chart.append("svg:g").attr("id", this._artist_id);
        this._bars_containers = this._bars.selectAll("g.pplot_bars").data(y).enter()
            .append("g").attr("class", "pplot_bars");
            
        /*
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", y(0))
            .style('fill', mainModel.settings.color().fill)
            .style('outline', '1px solid '+mainModel.settings.color().stroke)
            .attr("height", height - y(0));
        */

        // set appropriate line style
        this._bars = this._bars_containers.append("rect")
            .attr("x1", function(d) {
                return xscale(d[0][0]);
            })
            .attr("x2", function(d) {
                return xscale(d[1][0]);
            })
            .attr("y1", function(d) {
                return yscale(d[0][1]);
            })
            .attr("y2", function(d) {
                return yscale(d[1][1]);
            })
            .style("stroke", jsplotlib.color_to_hex(this._color))
            .style("stroke-linecap", this._solid_capstyle)
            .style("stroke-linejoin", this._solid_joinstyle)
            .style("stroke-opacity", this._alpha)
            .style("stroke-width", this._linewidth);

        return this;
    };
    
    /**
      Updates possible attributes provided as kwargs
    **/
    that.update = function(kwargs) {
        // we assume key value pairs
        if (kwargs && typeof kwargs === "object") {
            for (var key in kwargs) {
                if (kwargs.hasOwnProperty(key)) {
                    var val = kwargs[key];

                    switch (key) {
                    }
                }
            }
        }

        return this;
    };
    
    return that;
}

jsplotlib._line_counter = 0;

/** Line2D class for encapsulating all line relevant attributes and methods
        Rebuilds partial matplotlib.Line2D functionality. Does not inherit from
        abstract Artist class. Rather more a data representation.
 **/
jsplotlib.Line2D = function(xdata, ydata, linewidth, linestyle, color, marker,
    markersize, markeredgewidth, markeredgecolor, markerfacecolor,
    markerfacecoloralt, fillstyle, antialiased, dash_capstyle,
    solid_capstyle, dash_joinstyle, solid_joinstyle, pickradius,
    drawstyle, markevery, kwargs) {

    // "that": completed Line2D object that is returned
    var that = {}, x_values= [], y_values = [];
    // Initialize parameter defaults
    var skip = Math.max(1, ydata.length / 500);
    for (var i = 0, len = ydata.length; i < len; i=i+skip) {
        var index = Math.floor(i+Math.random()*skip);
        if (xdata.length == ydata.length) {
            x_values.push(xdata[index]);
        }
        y_values.push(ydata[index]);
    } 
    that._x = x_values; //xdata;
    that._y = y_values; //ydata;
    that._linewidth = linewidth || null;
    that._linestyle = linestyle || null;
    that._color = color || null;
    that._marker = marker || null;
    that._markersize = markersize || null;
    that._markeredgewidth = markeredgewidth || null;
    that._markeredgecolor = markeredgecolor || null;
    that._markerfacecolor = markerfacecolor || null;
    that._markerfacecoloralt = markerfacecoloralt || 'none';
    that._fillstyle = fillstyle || 'full';
    that._antialiased = antialiased || null;
    that._dash_capstyle = dash_capstyle || null;
    that._solid_capstyle = solid_capstyle || null;
    that._dash_joinstyle = dash_joinstyle || null;
    that._solid_joinstyle = solid_joinstyle || null;
    that._pickradius = pickradius || 5;
    that._drawstyle = drawstyle || null;
    that._markevery = markevery || null;
    this._line_id = jsplotlib._line_counter;
    jsplotlib._line_counter += 1;
    //kwargs

    // if only y provided, create Array from 1 to N
    if (!that._x || that._x.length === 0) {
        that._x = jsplotlib.linspace(1, that._y.length, that._y.length);
    }

    that.antialiased = function(a) {
        if (a)
            this._antialiased = a;
        return this;
    };

    that.markerfacecoloralt = function(mfca) {
        if (mfca)
            this._markerfacecoloralt = mfca;
        return this;
    };

    that.pickradius = function(pr) {
        if (pr)
            this._pickradius = pr;
        return this;
    };

    that.drawstyle = function(ds) {
        if (ds)
            this._drawstyle = ds;
        return this;
    };

    that.markevery = function(me) {
        if (me)
            this._markevery = me;
        return this;
    };

    that.color = function(cs) {
        if (cs)
            this._color = jsplotlib.color_to_hex(cs);
        return this;
    };

    that.alpha = function(a) {
        if (a)
            this._alpha = a;
        return this;
    };

    /* supports butt, round, projecting*/
    that.dash_capstyle = function(dcs) {
        if (dcs)
            this._dash_capstyle = dcs;
        return this;
    };

    /* supports butt, round, projecting*/
    that.solid_capstyle = function(scs) {
        if (scs)
            this._solid_capstyle = scs;
        return this;
    };

    /* supports miter, round, bevel' */
    that.solid_jointyle = function(sjs) {
        if (sjs)
            this._solid_joinstyle = sjs;
        return this;
    };

    /* supports miter, round, bevel' */
    that.dash_joinstyle = function(djs) {
        if (djs)
            this._dash_joinstyle = djs;
        return this;
    };

    /* random float */
    that.markersize = function(ms) {
        if (ms)
            this._markersize = ms;
        return this;
    };

    that.marker = function(ms) {
        if (ms)
            this._marker = ms;
        return this;
    };

    that.markerfacecolor = function(mfc) {
        if (mfc)
            this._markerfacecolor = jsplotlib.color_to_hex(mfc);
        return this;
    };

    that.markeredgecolor = function(mec) {
        if (mec)
            this._markeredgecolor = jsplotlib.color_to_hex(mec);
        return this;
    };

    that.markeredgewidth = function(mec) {
        if (mec)
            this._markeredgewidth = mec;
        return this;
    };

    that.linestyle = function(ls) {
        if (ls)
            ls = ls.trim();
        this._linestyle = ls;
        return this;
    };

    that.linewidth = function(lw) {
        if (lw)
            this._linewidth = lw;
        return this;
    };

    that.line_id = function(lid) {
        this._line_id = lid;
        return this;
    };

    that.xrange = function(min, max, N) {
        this._x = jsplotlib.linspace(min, max, N);
        return this;
    };

    that.yrange = function(min, max, N) {
        this._y = jsplotlib.linspace(min, max, N);
        return this;
    };

    /**
      Updates possible attributes provided as kwargs
    **/
    that.update = function(kwargs) {
        // we assume key value pairs
        if (kwargs && typeof kwargs === "object") {
            for (var key in kwargs) {
                if (kwargs.hasOwnProperty(key)) {
                    var val = kwargs[key];

                    switch (key) {
                        case 'linewidth':
                            this.linewidth(val);
                            break;
                        case 'linestyle':
                            this.linestyle(val);
                            break;
                        case 'color':
                            val = jsplotlib.to_rgb(val);
                            this.color(val);
                            break;
                        case 'marker':
                            this.marker(val);
                            break;
                        case 'markersize':
                            this.markersize(val);
                            break;
                        case 'markeredgewidth':
                            this.markeredgewidth(val);
                            break;
                        case 'markeredgecolor':
                            val = jsplotlib.to_rgb(val);
                            this.markeredgecolor(val);
                            break;
                        case 'markerfacecolor':
                            val = jsplotlib.to_rgb(val);
                            this.markerfacecolor(val);
                            break;
                        case 'markerfacecoloralt':
                            val = jsplotlib.to_rgb(val);
                            this.markerfacecoloralt(val);
                            break;
                        case 'fillstyle':
                            this.fillstyle(val);
                            break;
                        case 'antialiased':
                            this.antialiased(val);
                            break;
                        case 'dash_capstyle':
                            this.dash_capstyle(val);
                            break;
                        case 'solid_capstyle':
                            this.solid_capstyle(val);
                            break;
                        case 'dash_joinstyle':
                            this.dash_joinstyle(val);
                            break;
                        case 'solid_jointyle':
                            this.solid_jointyle(val);
                            break;
                        case 'pickradius':
                            this.pickradius(val);
                            break;
                        case 'drawstyle':
                            this.drawstyle(val);
                            break;
                        case 'markevery':
                            this.markevery(val);
                            break;
                    }
                }
            }
        }

        return this;
    };

    that.draw = function(parent_chart) {
        // should be called in the pplot command
        // each plot call adds a new line to our existing plot
        // object and draws them all, when show is called
        // this._init_common();
        var number_of_points = this._y.length || this._x.length; // implement need to move those from the original construct_graph class to lines
        if (!this._linestyle && !this._marker) {
            this._linestyle = jsplotlib.rc['lines.linestyle'];
        }

        /*
        if (!this._marker && !this._linestyle) {
          this._marker = jsplotlib.rc['lines.marker'];
        }
        */

        if (!this._color) {
            this._color = jsplotlib.color_to_hex(parent_chart.get_next_color());
        }

        // set defaults for all attributes
        if (!this._markersize) {
            this._markersize = jsplotlib.rc['lines.markersize'];
        }

        if (!this._markeredgecolor) {
            this._markeredgecolor = 'k';
        }

        if (!this._linewidth) {
            this._linewidth = jsplotlib.rc['lines.linewidth'];
        }

        if (!this._dash_capstyle) {
            this._dash_capstyle = "butt";
        }

        if (!this._solid_capstyle) {
            this._solid_capstyle = "butt";
        }

        if (!this._solid_joinstyle) {
            this._solid_joinstyle = "miter";
        }

        if (!this._dash_joinstyle) {
            this._dash_joinstyle = "miter";
        }

        // default markerfacecolor is linecolor
        if (!this._markerfacecolor) {
            this._markerfacecolor = jsplotlib.color_to_hex(this._color);
        }

        if (!this._markeredgewidth) {
            this._markeredgewidth = 0.75;
        }

        if (!this._alpha) {
            this._alpha = 1;
        }

        // local storage for drawing
        var x = this._x;
        var y = this._y;

        // create array of point pairs with optional s value
        // from [x1,x2], [y1, y2], [s1, s2]
        // to [[x1,y1,s1],[x2,y2,s2]]
        var xys = d3.zip(x, y);
        var pairs = d3.zip(xys.slice(0, -1), xys.slice(1));
        var xscale = parent_chart.get_xscale(); // should come from axis o.O
        var yscale = parent_chart.get_yscale();

        var xformat = parent_chart._xaxis._formatter || function(x) {
            return x;
        };

        var yformat = parent_chart._yaxis._formatter || function(x) {
            return x;
        };

        // this adds the line to the chart
        this._line = parent_chart.chart.append("svg:g").attr("id", this._line_id);
        this._line_containers = this._line.selectAll("g.pplot_lines").data(pairs).enter()
            .append("g").attr("class", "pplot_lines");

        // set appropriate line style
        if (this._linestyle === "-") {
            this._lines = this._line_containers.append("line")
                .attr("x1", function(d) {
                    return xscale(d[0][0]);
                })
                .attr("x2", function(d) {
                    return xscale(d[1][0]);
                })
                .attr("y1", function(d) {
                    return yscale(d[0][1]);
                })
                .attr("y2", function(d) {
                    return yscale(d[1][1]);
                })
                .style("stroke", jsplotlib.color_to_hex(this._color))
                .style("stroke-linecap", this._solid_capstyle)
                .style("stroke-linejoin", this._solid_joinstyle)
                .style("stroke-opacity", this._alpha)
                .style("stroke-width", this._linewidth);
        } else if (this._linestyle === "--") {
            this._lines = this._line_containers.append("line")
                .attr("x1", function(d) {
                    return xscale(d[0][0]);
                })
                .attr("x2", function(d) {
                    return xscale(d[1][0]);
                })
                .attr("y1", function(d) {
                    return yscale(d[0][1]);
                })
                .attr("y2", function(d) {
                    return yscale(d[1][1]);
                })
                .style("stroke", jsplotlib.color_to_hex(this._color))
                .style("stroke-width", this._linewidth)
                .style("stroke-linecap", this._dash_capstyle)
                .style("stroke-linejoin", this._dash_joinstyle)
                .style("stroke-opacity", this._alpha)
                .style("stroke-dasharray", "5,5");
        } else if (this._linestyle === ":") {
            this._lines = this._line_containers.append("line")
                .attr("x1", function(d) {
                    return xscale(d[0][0]);
                })
                .attr("x2", function(d) {
                    return xscale(d[1][0]);
                })
                .attr("y1", function(d) {
                    return yscale(d[0][1]);
                })
                .attr("y2", function(d) {
                    return yscale(d[1][1]);
                })
                .style("stroke", jsplotlib.color_to_hex(this._color))
                .style("stroke-width", this._linewidth)
                .style("stroke-dasharray", "2,5")
                .style("stroke-linejoin", this._dash_joinstyle)
                .style("stroke-opacity", this._alpha)
                .style("stroke-linecap", "round");
        } else if (this._linestyle === "-.") {
            this._lines = this._line_containers.append("line")
                .attr("x1", function(d) {
                    return xscale(d[0][0]);
                })
                .attr("x2", function(d) {
                    return xscale(d[1][0]);
                })
                .attr("y1", function(d) {
                    return yscale(d[0][1]);
                })
                .attr("y2", function(d) {
                    return yscale(d[1][1]);
                })
                .style("stroke", jsplotlib.color_to_hex(this._color))
                .style("stroke-width", this._linewidth)
                .style("stroke-linecap", this._dash_capstyle)
                .style("stroke-linejoin", this._dash_joinstyle)
                .style("stroke-opacity", this._alpha)
                .style("stroke-dasharray", "5, 5, 2, 5");
        }

        // append points
        this._points = parent_chart.chart.selectAll("g.pplot_points" + this._line_id)
            .data(xys).enter().append("g")
            .attr("x", function(d) {
                return d[0];
            })
            .attr("y", function(d) {
                return d[1];
            })
            //.attr("s", function(d) {
            //  return d[2];
            //})
            .attr("class", "pplot_points" + this._line_id);

        // init hover popups
        /*
        $("#" + chart.attr("id") + " g.pplot_points" + this._line_id).tipsy({
          gravity: "nw",
          html: true,
          title: function() {
            var d = this.__data__;
            var output = "(" + xformat(d[0]) + "," + yformat(d[1]) + ")";
            return output;
          }
        }); */

        // set appropriate marker styles
        // http://matplotlib.org/api/markers_api.html
        var marker_size = this._markersize; // store for nested call
        switch (this._marker) {
            case undefined:
            case " ":
            case "None":
            case "":
                break;
            case ".":
                this._markers = this._points.append("circle").attr("cx", function(d) {
                    return xscale(d[0]);
                }).attr("cy", function(d) {
                    return yscale(d[1]);
                }).attr("r", function(d) {
                    return 1;
                });
                break;
            case "o":
                this._markers = this._points.append("circle").attr("cx", function(d) {
                    return xscale(d[0]);
                }).attr("cy", function(d) {
                    return yscale(d[1]);
                }).attr("r", function(d) {
                    return marker_size;
                });
                break;
            case "x":
                this._points.append("line").attr("x1", function(d) {
                    return xscale(d[0]) - marker_size;
                }).attr("x2", function(d) {
                    return xscale(d[0]) + marker_size;
                }).attr("y1", function(d) {
                    return yscale(d[1]) - marker_size;
                }).attr("y2", function(d) {
                    return yscale(d[1]) + marker_size;
                });
                this._points.append("line").attr("x1", function(d) {
                    return xscale(d[0]) + marker_size;
                }).attr("x2", function(d) {
                    return xscale(d[0]) - marker_size;
                }).attr("y1", function(d) {
                    return yscale(d[1]) - marker_size;
                }).attr("y2", function(d) {
                    return yscale(d[1]) + marker_size;
                });
                this._markers = this._points.selectAll("line");
                break;
            case 's':
                this._points.append("rect")
                    .attr("x", function(d) {
                        return xscale(d[0]) - marker_size / 2;
                    })
                    .attr("y", function(d) {
                        return yscale(d[1]) - marker_size / 2;
                    })
                    .attr("width", function(d) {
                        return marker_size;
                    })
                    .attr("height", function(d) {
                        return marker_size;
                    });
                this._markers = this._points.selectAll("rect");
                break;
        }

        // resize function only supports 'o'
        var resize_function = function(resize_amount) {
            return function() {
                var marker = d3.select(this);
                if (marker.attr("r")) {
                    marker.attr("r", marker.attr("r") * resize_amount);
                } else if (marker.attr("width") && marker.attr("height")) {
                    // resizes square marker
                    var old_marker_size = parseFloat(marker.attr("width"));
                    var new_marker_size = old_marker_size * resize_amount;
                    var diff_marker_size = (new_marker_size - old_marker_size) / 2;

                    var new_x = parseFloat(marker.attr("x")) - diff_marker_size;
                    var new_y = parseFloat(marker.attr("y")) - diff_marker_size;
                    marker.attr("width", new_marker_size);
                    marker.attr("height", new_marker_size);
                    marker.attr("x", new_x);
                    marker.attr("y", new_y);
                } else {
                    return true;
                }
            };
        };

        // add marker attributes
        if (this._markers) {
            this._markers
                .style("stroke", jsplotlib.color_to_hex(this._markeredgecolor))
                .style("stroke-width", this._markeredgewidth)
                .style("stroke-opacity", this._alpha)
                .style("fill", jsplotlib.color_to_hex(this._markerfacecolor))
                .on("mouseover", resize_function(1.25))
                .on("mouseout", resize_function(0.8));
        }

        return this;
    };

    return that;
};

jsplotlib.plot = function(chart) {
    /*
      list of responsibilites
       - holds all lines, bars, etc. ("artists")
       - updates axis
       - construct axis
       - knows color_cycle
       - scatter? s() functions?
    */

    // store chart object and append own methods
    var that = {
        chart: chart
    };

    that.axes_colorcycle_position = 0;
    that.artist_count = 0;
    that._artists = []; // we support multiple artists

    that.add_artist = function(artist) {
        if (artist) {
            this._artists.push(artist);
            artist._artist_id = this.artist_count++;
            this._update_limits();
        }

        return this;
    };

    // set graph attributes
    that._chartheight = parseInt(chart.attr("height"), 10);
    that._chartwidth = parseInt(chart.attr("width"));
    that._title_string = "";
    that._title_size = 0;
    that._xaxis = jsplotlib.construct_axis(that, "x");
    that._yaxis = jsplotlib.construct_axis(that, "y");
    that._axes = [that._xaxis, that._yaxis];

    // returns the next color in the cycle
    that.get_next_color = function() {
        var cs = jsplotlib.rc['axes.color_cycle'][this.axes_colorcycle_position];
        this.axes_colorcycle_position = (this.axes_colorcycle_position + 1) %
            jsplotlib.rc['axes.color_cycle'].length;
        return cs;
    };

    // setter functions
    that.xlabel = function(xl) {
        this._xaxis.set_label(xl);
        return this;
    };

    that.ylabel = function(yl) {
        this._yaxis.set_label(yl);
        return this;
    };

    that.xaxis_off = function() {
        this._xaxis._turn_off();
        return this;
    };

    that.yaxis_off = function() {
        this._yaxis._turn_off();
        return this;
    };

    that.xaxis_on = function() {
        this._xaxis._turn_on();
        return this;
    };

    that.yaxis_on = function() {
        this._yaxis._turn_on();
        return this;
    };

    that.axis_on = function() {
        this.yaxis_on();
        this.xaxis_on();
        return this;
    };

    that.axis_off = function() {
        this.yaxis_off();
        this.xaxis_off();
        return this;
    };

    that.title = function(title_string) {
        this._title_string = title_string;
        this._title_size = this._chartheight * 0.1;
        this._title_transform_string = "translate(" + this._chartwidth / 2 + "," +
            this._title_size / 2 + ")";
        return this;
    };

    // sets the ylimits based on a minmax array/tuple
    that._ylimits = function(min_max_tuple) {
        this._yaxis._set_data_range(min_max_tuple);
        return this;
    };

    that._xlimits = function(min_max_tuple) {
        this._xaxis._set_data_range(min_max_tuple);
        return this;
    };

    that._update_limits = function() {
        //TODO: rework for histogram/bar charts
        var i;
        var xs = []; // all x-values
        var ys = []; // all y-values

        // calculate limits
        for (i = 0; i < this._artists.length; i++) {
            xs = xs.concat(this._artists[i]._x);
            ys = ys.concat(this._artists[i]._y);
        }

        this._xlimits([d3.min(xs), d3.max(xs)]);
        this._ylimits([d3.min(ys), d3.max(ys)]);

        return this;
    };

    that.yformat = function(formatter) {
        this._yaxis._set_formatter(formatter);
        return this;
    };

    that.xformat = function(formatter) {
        this._xaxis._set_formatter(formatter);
        return this;
    };

    that.get_yscale = function() {
        return this._yaxis.get_scale();
    };

    that.get_xscale = function() {
        return this._xaxis.get_scale();
    };

    // creates axes
    that._init_common = function() {
        for (var i = 0; i < 2; i++) {
            this._axes[i]._init(this);
        }
        this._height = this._chartheight - this._xaxis._size;
        this._width = this._chartwidth - this._yaxis._size;
        return this;
    };

    // draw axes and append graph title
    that._draw_axes = function() {
        for (var i = 0; i < this._axes.length; i++) {
            this._axes[i]._draw_axis(this);
            this._axes[i]._draw_label(this);
        }

        var myselector = "#" + chart.attr("id") + " .axis line, #" + chart.attr(
            "id") + " .axis path";
        $(myselector).css("fill", "none").css("stroke", "#000");
        d3.svg.axis(chart);
        if (this._title_string !== "") {
            that.chart.append("svg:g").attr("class", "graph_title").attr(
                "transform", this._title_transform_string).append("text").append(
                "tspan").attr("text-anchor", "middle").attr("class", "graph_title").attr(
                "writing-mode", "rl-tb").text(this._title_string);
        }
        return this;
    };

    // resize function for the chart
    var chart_id = that.chart.attr("id");
    that.resize_function = function(resize_amount, direction) {
        return function() {
            var node = this;
            while (node.id !== chart_id) {
                node.parentNode.appendChild(node);
                node = node.parentNode;
            }
            var object = d3.select(this);
            var x0 = parseInt(object.attr("x") || "0", 10);
            var width0 = parseInt(object.attr("width"), 10);
            var y0 = parseInt(object.attr("y") || "0", 10);
            var height0 = parseInt(object.attr("height"), 10);
            var newwidth, newheight, newx, newy;
            if (direction === "grow") {
                object.attr("x_orig", x0).attr("y_orig", y0).attr("width_orig",
                    width0).attr("height_orig", height0);
                newwidth = width0 * resize_amount;
                newheight = height0 * resize_amount;
                newx = x0 - (resize_amount - 1) * width0 / 2;
                newy = y0 - (resize_amount - 1) * height0 / 2;
            } else if (direction === "shrink") {
                newwidth = object.attr("width_orig");
                newheight = object.attr("height_orig");
                newx = object.attr("x_orig");
                newy = object.attr("y_orig");
            }
            object.attr("x", newx).attr("y", newy).attr("height", newheight).attr(
                "width", newwidth);
        };
    };
    /**
     Draws the artists. Artists are respnsible for their drawing. Here we just initialize
     the axes and the scaling.
    **/
    that.draw = function() {
        var i;

        this._init_common(); //

        // draw lines
        for (i = 0; i < this._artists.length; i++) {
            this._artists[i].draw(this);
        }

        this._draw_axes();
    };

    that.update = function(kwargs) {
        var i;

        // pass to lines
        for (i = 0; i < this._artists.length; i++) {
            this._artists[i].update(kwargs);
        }

        // update own kwargs
        if (kwargs && typeof kwargs === "object") {
            for (var key in kwargs) {
                if (kwargs.hasOwnProperty(key)) {
                    var val = kwargs[key];

                    switch (key) {
                        case 'title':
                            this.title(val);
                            break;
                        case 'xlabel':
                            this.xlabel(val);
                            break;
                        case 'ylabel':
                            this.ylabel(val);
                            break;
                    }
                }
            }
        }

        return this;
    };

    return that;
};



/** List of all supported line styles **/
jsplotlib.Line2D.lineStyles = {
    '-': '_draw_solid',
    '--': '_draw_dashed',
    '-.': '_draw_dash_dot',
    ':': '_draw_dotted',
    'None': '_draw_nothing',
    ' ': '_draw_nothing',
    '': '_draw_nothing',
};

jsplotlib.Line2D.lineMarkers = {
    '.': 'point',
    ',': 'pixel',
    'o': 'circle',
    'v': 'triangle_down',
    '^': 'triangle_up',
    '<': 'triangle_left',
    '>': 'triangle_right',
    '1': 'tri_down',
    '2': 'tri_up',
    '3': 'tri_left',
    '4': 'tri_right',
    '8': 'octagon',
    's': 'square',
    'p': 'pentagon',
    '*': 'star',
    'h': 'hexagon1',
    'H': 'hexagon2',
    '+': 'plus',
    'x': 'x',
    'D': 'diamond',
    'd': 'thin_diamond',
    '|': 'vline',
    '_': 'hline',
    //TICKLEFT: 'tickleft',
    //TICKRIGHT: 'tickright',
    //TICKUP: 'tickup',
    //TICKDOWN: 'tickdown',
    //CARETLEFT: 'caretleft',
    //CARETRIGHT: 'caretright',
    //CARETUP: 'caretup',
    //CARETDOWN: 'caretdown',
    "None": 'nothing',
    //Sk.builtin.none.none$: 'nothing',
    ' ': 'nothing',
    '': 'nothing'
};

/**
 Color short keys
**/
jsplotlib.colors = {
    'b': 'blue',
    'g': 'green',
    'r': 'red',
    'c': 'cyan',
    'm': 'magenta',
    'y': 'yellow',
    'k': 'black',
    'w': 'white'
};

/**
 Mapping of all possible CSS colors, that are supported by matplotlib
**/
jsplotlib.cnames = {
    'aliceblue': '#F0F8FF',
    'antiquewhite': '#FAEBD7',
    'aqua': '#00FFFF',
    'aquamarine': '#7FFFD4',
    'azure': '#F0FFFF',
    'beige': '#F5F5DC',
    'bisque': '#FFE4C4',
    'black': '#000000',
    'blanchedalmond': '#FFEBCD',
    'blue': '#0000FF',
    'blueviolet': '#8A2BE2',
    'brown': '#A52A2A',
    'burlywood': '#DEB887',
    'cadetblue': '#5F9EA0',
    'chartreuse': '#7FFF00',
    'chocolate': '#D2691E',
    'coral': '#FF7F50',
    'cornflowerblue': '#6495ED',
    'cornsilk': '#FFF8DC',
    'crimson': '#DC143C',
    'cyan': '#00FFFF',
    'darkblue': '#00008B',
    'darkcyan': '#008B8B',
    'darkgoldenrod': '#B8860B',
    'darkgray': '#A9A9A9',
    'darkgreen': '#006400',
    'darkkhaki': '#BDB76B',
    'darkmagenta': '#8B008B',
    'darkolivegreen': '#556B2F',
    'darkorange': '#FF8C00',
    'darkorchid': '#9932CC',
    'darkred': '#8B0000',
    'darksage': '#598556',
    'darksalmon': '#E9967A',
    'darkseagreen': '#8FBC8F',
    'darkslateblue': '#483D8B',
    'darkslategray': '#2F4F4F',
    'darkturquoise': '#00CED1',
    'darkviolet': '#9400D3',
    'deeppink': '#FF1493',
    'deepskyblue': '#00BFFF',
    'dimgray': '#696969',
    'dodgerblue': '#1E90FF',
    'firebrick': '#B22222',
    'floralwhite': '#FFFAF0',
    'forestgreen': '#228B22',
    'fuchsia': '#FF00FF',
    'gainsboro': '#DCDCDC',
    'ghostwhite': '#F8F8FF',
    'gold': '#FFD700',
    'goldenrod': '#DAA520',
    'gray': '#808080',
    'green': '#008000',
    'greenyellow': '#ADFF2F',
    'honeydew': '#F0FFF0',
    'hotpink': '#FF69B4',
    'indianred': '#CD5C5C',
    'indigo': '#4B0082',
    'ivory': '#FFFFF0',
    'khaki': '#F0E68C',
    'lavender': '#E6E6FA',
    'lavenderblush': '#FFF0F5',
    'lawngreen': '#7CFC00',
    'lemonchiffon': '#FFFACD',
    'lightblue': '#ADD8E6',
    'lightcoral': '#F08080',
    'lightcyan': '#E0FFFF',
    'lightgoldenrodyellow': '#FAFAD2',
    'lightgreen': '#90EE90',
    'lightgray': '#D3D3D3',
    'lightpink': '#FFB6C1',
    'lightsage': '#BCECAC',
    'lightsalmon': '#FFA07A',
    'lightseagreen': '#20B2AA',
    'lightskyblue': '#87CEFA',
    'lightslategray': '#778899',
    'lightsteelblue': '#B0C4DE',
    'lightyellow': '#FFFFE0',
    'lime': '#00FF00',
    'limegreen': '#32CD32',
    'linen': '#FAF0E6',
    'magenta': '#FF00FF',
    'maroon': '#800000',
    'mediumaquamarine': '#66CDAA',
    'mediumblue': '#0000CD',
    'mediumorchid': '#BA55D3',
    'mediumpurple': '#9370DB',
    'mediumseagreen': '#3CB371',
    'mediumslateblue': '#7B68EE',
    'mediumspringgreen': '#00FA9A',
    'mediumturquoise': '#48D1CC',
    'mediumvioletred': '#C71585',
    'midnightblue': '#191970',
    'mintcream': '#F5FFFA',
    'mistyrose': '#FFE4E1',
    'moccasin': '#FFE4B5',
    'navajowhite': '#FFDEAD',
    'navy': '#000080',
    'oldlace': '#FDF5E6',
    'olive': '#808000',
    'olivedrab': '#6B8E23',
    'orange': '#FFA500',
    'orangered': '#FF4500',
    'orchid': '#DA70D6',
    'palegoldenrod': '#EEE8AA',
    'palegreen': '#98FB98',
    'paleturquoise': '#AFEEEE',
    'palevioletred': '#DB7093',
    'papayawhip': '#FFEFD5',
    'peachpuff': '#FFDAB9',
    'peru': '#CD853F',
    'pink': '#FFC0CB',
    'plum': '#DDA0DD',
    'powderblue': '#B0E0E6',
    'purple': '#800080',
    'red': '#FF0000',
    'rosybrown': '#BC8F8F',
    'royalblue': '#4169E1',
    'saddlebrown': '#8B4513',
    'salmon': '#FA8072',
    'sage': '#87AE73',
    'sandybrown': '#FAA460',
    'seagreen': '#2E8B57',
    'seashell': '#FFF5EE',
    'sienna': '#A0522D',
    'silver': '#C0C0C0',
    'skyblue': '#87CEEB',
    'slateblue': '#6A5ACD',
    'slategray': '#708090',
    'snow': '#FFFAFA',
    'springgreen': '#00FF7F',
    'steelblue': '#4682B4',
    'tan': '#D2B48C',
    'teal': '#008080',
    'thistle': '#D8BFD8',
    'tomato': '#FF6347',
    'turquoise': '#40E0D0',
    'violet': '#EE82EE',
    'wheat': '#F5DEB3',
    'white': '#FFFFFF',
    'whitesmoke': '#F5F5F5',
    'yellow': '#FFFF00',
    'yellowgreen': '#9ACD32'
};

jsplotlib.color_to_hex = function(color) {
    // is color a shortcut?
    if (jsplotlib.colors[color])
        color = jsplotlib.colors[color];

    // is inside cnames array?
    if (jsplotlib.cnames[color])
        return jsplotlib.cnames[color];

    // check if it is already a hex value
    if (typeof color == "string") {
        var match = color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
        if (match && match.length === 1)
            return match[0];
    }

    // add rgb colors here
    if (Array.isArray(color) && color.length === 3) {
        return jsplotlib.rgb2hex(color);
    }

    // back to default
    return jsplotlib.cnames[jsplotlib.rc['lines.color']];
};

jsplotlib.get_color = function(cs) {
    return jsplotlib.colors[cs] ? jsplotlib.colors[cs] : jsplotlib.colors.b;
};

/**
 Creates the d3 svg element at the specified dom element with given width and height
**/
jsplotlib.make_chart = function(width, height, console, insert_mode,
    attributes) {
    chart_counter++;
    var DEFAULT_PADDING = 30;
    console = console || document.body;
    width = width - 2 * DEFAULT_PADDING || 500;
    height = height - 2 * DEFAULT_PADDING || 200;
    attributes = attributes || {};

    // create id, if not given
    if (!('id' in attributes)) {
        attributes.id = 'chart' + chart_counter;
    }

    var chart = d3.select(console.console).append('div').append('svg');
    /*
    if (!insert_mode) {
        chart = d3.select(insert_container).append('svg');
    } else {
        chart = d3.select(insert_container).insert('svg', insert_mode);
    }
    */

    // set css classes
    $(chart[0]).parent().hide();
    chart.attr('class', 'chart');
    chart.attr('width', width);
    chart.attr('height', height);
    chart.attr('chart_count', chart_counter);
    // set additional given attributes
    for (var attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            chart.attr(attribute, attributes[attribute]);
        }
    }

    $('.chart#' + attributes.id).css('padding-left', DEFAULT_PADDING + 'px');
    return chart;
};

/**
 Creates x or y axis and auto scales them
**/
jsplotlib.construct_axis = function() {
    var axis_count = 0;
    return function(parent_graph, x_or_y) {
        var that = {};
        that._id = "axis" + axis_count++;
        that._will_draw_label = false;
        that._will_draw_axis = true;
        that._x_or_y = x_or_y;
        that._size = 0;
        that._label_offset = 0;
        that._label_string = "";
        if (x_or_y === "x") {
            that._axis_proportion = 0.12;
            that._label_proportion = 0.12;
        } else if (x_or_y === "y") {
            that._axis_proportion = 0.07;
            that._label_proportion = 0.05;
        } else {
            throw "Invalid axis type (must be x or y): " + this._x_or_y;
        }
        that._proportion = that._axis_proportion;
        that.n_ticks = 4;
        that.set_n_ticks = function(n) {
            this.n_ticks = n;
        };
        that.set_label = function(label_string) {
            this._label_string = label_string;
            this._will_draw_label = true;
            this._proportion = this._axis_proportion + this._label_proportion;
            return this;
        };
        that._turn_off = function() {
            this._will_draw_axis = false;
            return this;
        };
        that._turn_on = function() {
            this._will_draw_axis = true;
            return this;
        };
        that.set_bar_limits = function(minmaxplus) {
            var min = minmaxplus[0];
            var oldmax = minmaxplus[1];
            var plus = minmaxplus[2];
            var newmax;
            if (oldmax instanceof Date) {
                newmax = new Date(oldmax.getTime() + plus);
            } else {
                newmax = oldmax + plus;
            }
            this._set_data_range([min, newmax]);
        };

        that._set_data_range = function(minmax) {
            this._min = minmax[0];
            this._max = minmax[1];
            if (this._min instanceof Date || this._max instanceof Date) {
                this._scale = d3.time.scale();
                this._min = new Date(this._min);
                this._max = new Date(this._max);
            } else {
                this._scale = d3.scale.linear();
            }
            this._domain = [this._min, this._max*1.1];
            return this;
        };
        that._set_formatter = function(formatter) {
            this._formatter = formatter;
            return this;
        };
        that.get_scale = function() {
            if (this._x_or_y === "x") {
                this._range = [parent_graph._yaxis._size, parent_graph._chartwidth];
            } else if (this._x_or_y === "y") {
                this._range = [parent_graph._height, parent_graph._title_size];
            }
            this._scale
                .domain(this._domain)
                .range(this._range);
            return this._scale;
        };
        that._init = function(chart) {
            var dimension;
            if (this._will_draw_axis) {
                var proportion_increase = 0;
                if (this._x_or_y === "x") {
                    dimension = parent_graph._chartheight;
                } else if (this._x_or_y === "y") {
                    // Handle digits on the y-axis!
                    proportion_increase += .015*this._max.toLocaleString().length;
                    dimension = parent_graph._chartwidth;
                } else {
                    throw "Invalid axis type (must be x or y): " + this._x_or_y;
                }
                this._size = dimension * (this._proportion+proportion_increase);
                this._label_offset = this._size * this._label_proportion;
            } else {
                this._size = 0;
            }
            return this;
        };
        that._compute_transform_string = function() {
            var offset_h, offset_v;
            var offset_label_h, offset_label_v;
            var label_rotation = "";
            if (this._x_or_y === "x") {
                offset_h = 0;
                offset_v = parent_graph._height;
                offset_label_h = parent_graph._yaxis._size + parent_graph._chartwidth /
                    4;
                offset_label_v = parent_graph._height + this._size - this._label_offset;
                this._writing_mode = "lr-tb";
                this._orientation = "bottom";
            } else if (this._x_or_y === "y") {
                offset_h = this._size;
                offset_v = 0;
                offset_label_h = this._label_offset;
                offset_label_v = parent_graph._chartheight / 2;
                label_rotation = "rotate(180)";
                this._writing_mode = "tb-rl";
                this._orientation = "left";
            } else {
                throw "Invalid axis type (must be x or y): " + this._x_or_y;
            }
            this._transform_string = "translate(" + offset_h + "," + offset_v +
                ")scale(1,1)";
            this._label_transform_string = "translate(" + offset_label_h + "," +
                offset_label_v + ")" + label_rotation;
        };
        that._draw_axis = function() {
            if (this._will_draw_axis) {
                this._formatter = this._formatter || this.get_scale().tickFormat(this
                    .n_ticks);
                this._compute_transform_string();
                this._axis = d3.svg.axis().scale(this.get_scale()).ticks(this.n_ticks)
                    .orient(this._orientation).tickSubdivide(0).tickFormat(this._formatter);
                parent_graph.chart.append("svg:g").attr("id", this._id).attr("class",
                    this._x_or_y + " axis").attr("transform", this._transform_string).call(
                    this._axis);
            }
        };
        that._draw_label = function() {
            this._compute_transform_string();
            if (this._will_draw_axis && this._will_draw_label) {
                parent_graph.chart.append("svg:g").attr("class", this._x_or_y +
                        " axis_label").attr("transform", this._label_transform_string).append(
                        "text").append("tspan").attr("text-anchor", "middle").attr("class",
                        this._x_or_y + " axis_label").attr("writing-mode", this._writing_mode)
                    .text(this._label_string);
            }
        };
        return that;
    };
}();

jsplotlib.parse_marker = function(style) {
    if (!style) return "x";
    switch (style) {
        case '.':
            return ".";
        case ',':
            return "x";
        case 'o':
            return "o";
        case 'v':
            return "x";
        case '^':
            return "x";
        case '<':
            return "x";
        case '>':
            return "x";
        case '1':
            return "x";
        case '2':
            return "x";
        case '3':
            return "x";
        case '4':
            return "x";
        case 's':
            return "s";
        case 'p':
            return "x";
        case '*':
            return "x";
        case 'h':
            return "x";
        case 'H':
            return "x";
        case '+':
            return "x";
        case 'x':
            return "x";
        case 'D':
            return "x";
        case 'd':
            return "x";
        case '|':
            return "x";
        case '_':
            return "x";
        default:
            return "";
    }
};

/**
Process a MATLAB style color/line style format string.  Return a
(*linestyle*, *color*) tuple as a result of the processing.  Default
values are ('-', 'b').  Example format strings include:

* 'ko': black circles
* '.b': blue dots
* 'r--': red dashed lines

.. seealso::

    :func:`~matplotlib.Line2D.lineStyles` and
    :func:`~matplotlib.pyplot.colors`
        for all possible styles and color format string.
**/
jsplotlib._process_plot_format = function(fmt) {
    var linestyle = null;
    var marker = null;
    var color = null;

    // Is fmt just a colorspec
    try {
        color = jsplotlib.to_rgb(fmt);
        if (color) {
            return {
                'linestyle': linestyle,
                'marker': marker,
                'color': color
            };
        }
    } catch (e) {}

    // handle the multi char special cases and strip them for the string
    if (fmt.search(/--/) >= 0) {
        linestyle = '--';
        fmt = fmt.replace(/--/, '');
    }
    if (fmt.search(/-\./) >= 0) {
        linestyle = '-.';
        fmt = fmt.replace(/-\./, '');
    }
    if (fmt.search(/ /) >= 0) {
        linestyle = '';
        fmt = fmt.replace(/ /, '');
    }

    var i;
    for (i = 0; i < fmt.length; i++) {
        var c = fmt.charAt(i);
        if (jsplotlib.Line2D.lineStyles[c]) {
            if (linestyle) {
                throw new Sk.builtin.ValueError('Illegal format string "' + fmt +
                    '"; two linestyle symbols');
            }
            linestyle = c;
        } else if (jsplotlib.Line2D.lineMarkers[c]) {
            if (marker) {
                throw new Sk.builtin.ValueError('Illegal format string "' + fmt +
                    '"; two marker symbols');
            }
            marker = c;
        } else if (jsplotlib.colors[c]) {
            if (color) {
                throw new Sk.builtin.ValueError('Illegal format string "' + fmt +
                    '"; two color symbols');
            }
            color = c;
        } else {
            throw new Sk.builtin.ValueError('Unrecognized character ' + c +
                ' in format string');
        }
    }

    if (!linestyle && !marker) {
        // use defaults --> rcParams['lines.linestyle']
        linestyle = '-';
    }
    if (!linestyle) {
        linestyle = ' ';
    }
    if (!marker) {
        marker = '';
    }

    return {
        'linestyle': linestyle,
        'marker': marker,
        'color': color
    };
};

/**
 https://github.com/matplotlib/matplotlib/blob/master/lib/matplotlib/colors.py
 http://matplotlib.org/api/colors_api.html

  Returns an *RGB* tuple of three floats from 0-1.

  *arg* can be an *RGB* or *RGBA* sequence or a string in any of
  several forms:

      1) a letter from the set 'rgbcmykw'
      2) a hex color string, like '#00FFFF'
      3) a standard name, like 'aqua'
      4) a string representation of a float, like '0.4',
         indicating gray on a 0-1 scale

  if *arg* is *RGBA*, the *A* will simply be discarded.
**/
jsplotlib.to_rgb = function(fmt) {
    if (!fmt) return null;

    var color = null;

    if (typeof fmt == "string") {
        fmt_lower = fmt.toLowerCase();

        if (jsplotlib.colors[fmt_lower])
            return jsplotlib.hex2color(jsplotlib.cnames[jsplotlib.colors[fmt_lower]]);

        // is inside cnames array?
        if (jsplotlib.cnames[fmt_lower])
            return jsplotlib.hex2color(jsplotlib.cnames[fmt_lower]);

        if (fmt_lower.indexOf('#') === 0) {
            return jsplotlib.hex2color(fmt_lower);
        }

        // is it simple grey shade?
        var fl = parseFloat(fmt_lower);
        if (isNaN(fl)) {
            throw new Sk.builtin.ValueError('cannot convert argument to rgb sequence');
        }

        if (fl < 0 || fl > 1) {
            throw new Sk.builtin.ValueError('gray (string) must be in range 0-1');
        }

        return [fl, fl, fl];
    }

    // check if its a color tuple [r,g,b, [a]] with values from [0-1]
    if (Array.isArray(fmt)) {
        if (fmt.length > 4 || fmt.length < 3)
            throw new Sk.builtin.ValueError('sequence length is ' + fmt.length +
                '; must be 3 or 4');

        color = fmt.slice(0, 3);
        var i;

        for (i = 0; i < 3; i++) {
            var fl_rgb = parseFloat(fmt);

            if (fl_rgb < 0 || fl_rgb > 1)
                throw new Sk.builtin.ValueError(
                    'number in rbg sequence outside 0-1 range');
        }
    }

    return color;
};

/**
  Take a hex string *s* and return the corresponding rgb 3-tuple
  Example: #efefef -> (0.93725, 0.93725, 0.93725)
**/
jsplotlib.hex2color = function(s) {
    if (!s || typeof s != "string") {
        throw new Sk.builtin.TypeError("hex2color requires a string argument");
    }
    // check if it is a hex value
    var i;
    var s_copy = s;
    var hex_tuple = [];
    for (i = 0; i < 3; i++) {
        var match = s_copy.match(/(?:[0-9a-fA-F]){1,2}$/);
        if (match && match.length === 1) {
            hex_tuple.push(match[0]);
            s_copy = s_copy.substring(0, match.index);
        }
    }
    //var match = s.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
    if (hex_tuple.length === 3) {
        // yeah positiv --> convert into right color spec
        var color = [];
        color[0] = parseInt(hex_tuple[0], 16) / 255.0;
        color[1] = parseInt(hex_tuple[1], 16) / 255.0;
        color[2] = parseInt(hex_tuple[2], 16) / 255.0;

        return color.reverse();
    } else {
        throw new Sk.builtin.ValueError('invalid hex color string "' + s + '"');
    }
};

/**
  Expects and rgb tuple with values [0,1]
**/
jsplotlib.rgb2hex = function(rgb) {
    if (!rgb) return null;

    if (rgb.length && rgb.length >= 3) {
        var i;
        // some hacky code to rebuild string format :(
        var hex_str = '#';
        for (i = 0; i < 3; i++) {
            var val = Math.round(rgb[i] * 255).toString(16);
            hex_str += val.length == 2 ? val : '0' + val;
        }

        return hex_str;
    }
};

jsplotlib.linspace = function(min, max, N) {
    var newscale = d3.scale.linear().domain([1, N]).range([min, max]);
    var data = [];
    for (var i = 1; i <= N; i++) {
        var output = newscale(i);
        if (min instanceof Date) {
            output = new Date(output);
        }
        data.push(output);
    }
    return data;
};

jsplotlib.range = function(N) {
    var l = [];
    for (var i = 0; i < N; i++) {
        l.push(i);
    }
    return l;
};

jsplotlib.ones = function(N) {
    var l = [];
    for (var i = 0; i < N; i++) {
        l.push(1);
    }
    return l;
};

// Skulpt translation
var $builtinmodule = function(name) {
    var mod = {};
    var chart;
    var plot; // TODO, we should support multiple lines here
    var canvas;

    // import numpy
    var CLASS_NDARRAY = "numpy.ndarray"; // maybe make identifier accessible in numpy module
    var np = Sk.importModule("numpy");
    var ndarray_f = np['$d'].array.func_code;
    var getitem_f = np['$d'][CLASS_NDARRAY]['__getitem__'].func_code;
    var ndarray = Sk.misceval.callsim(np['$d'].array.func_code, new Sk.builtin.list([1, 2, 3, 4]));

    var create_chart = function() {
        /* test if Canvas is available should be moved to create_chart function */
        if (Sk.console === undefined) {
            throw new Sk.builtin.NameError(
                "Can not resolve drawing area. Sk.console is undefined!");
        }

        if (!chart) {
            //$(Sk.matplotlibCanvas).empty();
            var width = Sk.console.height * 2;
            var height = Sk.console.height * 1.25;
            chart = jsplotlib.make_chart(width, height, Sk.console, false);
        }
    };

    mod.values = Array();
    // Main plotting function
    var plot_f = function(kwa) {
        // http://matplotlib.org/api/pyplot_api.html
        // http://matplotlib.org/api/artist_api.html#matplotlib.lines.Line2D
        //debugger;
        Sk.builtin.pyCheckArgs("plotk", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);
        mod.values.push(args);
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict

        // try parsing plot args
        // possible xdata, ydata, stylestring
        // or x1, y1, stylestring1, x2, y2, stylestring2
        // or ydata, stylestring
        /*
            plot(x, y)        # plot x and y using default line style and color
            plot(x, y, 'bo')  # plot x and y using blue circle markers
            plot(y)           # plot y using x as index array 0..N-1
            plot(y, 'r+')     # ditto, but with red plusses
        */

        // variable definitions for args
        var xdata = [];
        var ydata = [];
        var stylestring = []; // we support only one at the moment
        var i = 0;
        var lines = 0;
        var xdata_not_ydata_flag = true;
        var slice = new Sk.builtin.slice(0, undefined, 1); // getting complete first dimension of ndarray

        for (i = 0; i < args.length; i++) {
            if (args[i] instanceof Sk.builtin.list || Sk.abstr.typeName(args[i]) === CLASS_NDARRAY) {
                // special treatment for ndarrays, though we allow basic lists too
                var _unpacked;
                if (Sk.abstr.typeName(args[i]) === CLASS_NDARRAY) {
                    // we get the first dimension, no 2-dim data
                    _unpacked = Sk.ffi.unwrapn(args[i]);
                    var first_dim_size = 0;
                    if (_unpacked && _unpacked.shape && _unpacked.shape[0]) {
                        first_dim_size = _unpacked.shape[0];
                    } else {
                        throw new Sk.builtin.ValueError('args contain "' + CLASS_NDARRAY + '" without elements or malformed shape.');
                    }
                    _unpacked = _unpacked.buffer.slice(0, first_dim_size); // buffer array of first dimension
                    _unpacked = _unpacked.map(function(x) {
                        return Sk.ffi.remapToJs(x);
                    })
                } else {
                    _unpacked = Sk.ffi.remapToJs(args[i]);
                }

                // unwraps x and y, but no 2-dim-data
                if (xdata_not_ydata_flag) {
                    xdata.push(_unpacked);
                    xdata_not_ydata_flag = false;
                } else {
                    ydata.push(_unpacked);
                    xdata_not_ydata_flag = true;
                }
            } else if (Sk.builtin.checkString(args[i])) {
                stylestring.push(Sk.ffi.remapToJs(args[i]));
            } else {
                throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[i]) +
                    "' is not supported for *args[" + i + "].");
            }
        }

        /* handle special cases
            only supplied y
            only supplied 1 array and stylestring
        */
        if ((args.length === 1) || (args.length === 2 && (xdata.length === 1 &&
                ydata.length === 0))) {
            // only y supplied
            xdata.forEach(function(element) {
                ydata.push(element);
            });
            xdata[0] = [];
        }
        
        
        if (Sk.skip_drawing !== true) {

            // empty canvas from previous plots
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            // create line objects
            var line;

            if (xdata.length === 1 && ydata.length === 1 && stylestring.length === 0) {
                // handle case for plot(x, y)
                // Where the x and y are integers, not lists
                line = new jsplotlib.Line2D(xdata[0], ydata[0]);
                plot.add_artist(line);
            } else if (xdata.length === ydata.length && xdata.length === stylestring.length) {
                for (i = 0; i < xdata.length; i++) {
                    line = new jsplotlib.Line2D(xdata[i], ydata[i]);
                    var ftm_tuple = jsplotlib._process_plot_format(stylestring[i]);
                    line.update({
                        'linestyle': ftm_tuple.linestyle,
                        'marker': jsplotlib.parse_marker(ftm_tuple.marker),
                        'color': ftm_tuple.color
                    });
                    plot.add_artist(line);
                }
            } else {
                throw new Sk.builtin.ValueError('Cannot parse given combination of "*args"!');
            }

            // set kwargs that apply for all lines
            plot.update(kwargs);
        } else {
            if (!plot) {
                plot = {"_artists":[]};
            }
            var line;
            if (xdata.length === 1 && ydata.length === 1 && stylestring.length === 0) {
                plot._artists.push([xdata[0], ydata[0]]);
            } else if (xdata.length === ydata.length && xdata.length === stylestring.length) {
                for (i = 0; i < xdata.length; i++) {
                    plot._artists.push([xdata[i], ydata[i]]);
                }
            } else {
                throw new Sk.builtin.ValueError('Cannot parse given combination of "*args"!');
            }
            
        }

        // result
        var result = [];

        return new Sk.builtins.tuple(result);
    };
    plot_f.co_kwargs = true;
    mod.plot = new Sk.builtin.func(plot_f);

    var show_f = function() {
        // call drawing routine
        if (Sk.skip_drawing !== true) {
            if (plot && plot.draw) {
                plot.draw();
            } else {
                throw new Sk.builtin.ValueError(
                    "Can not call show without any plot created.");
            }
            if (Sk.console.png_mode) {
                var lines = plot._artists.map(function(elem) { return [elem._x, elem._y] })
                var xml = new XMLSerializer().serializeToString(chart[0][0]);
                var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
                var img  = document.createElement("img");
                img.setAttribute('src', data);
                img.style.display = 'block';
                img.onload = function() {
                    img.onload = null;
                    //TODO: Make this capture a class descendant. Cross the D3/Jquery barrier!
                    var canvas = document.createElement('canvas');
                    canvas.width = Sk.console.height * 2;
                    canvas.height = Sk.console.height * 1.25;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    var canvasUrl = canvas.toDataURL("image/png");
                    img.setAttribute('src', canvasUrl);
                    chart[0][0].parentNode.replaceChild(img, chart[0][0])
                    Sk.console.printHtml(img, lines);
                }
                img.onerror = function() {
                    
                }
            } else {
                Sk.console.printHtml(chart, lines);
            }
        } else {
            var lines = plot._artists;
            Sk.console.printHtml(chart, lines);
        }
    };
    mod.show = new Sk.builtin.func(show_f);

    var title_f = function(label, fontdict, loc) {
        Sk.builtin.pyCheckArgs("title", arguments, 1, 3);

        if (!Sk.builtin.checkString(label)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(label) +
                "' is not supported for title.");
        }

        var label_unwrap = Sk.ffi.remapToJs(label);

        if (Sk.skip_drawing !== true) {
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            if (plot && plot.title) {
                plot.title(label_unwrap);
            }
        }

        return new Sk.builtin.str(label_unwrap);
    };

    title_f.co_varnames = ['label', 'fontdict', 'loc', ];
    title_f.$defaults = [null, Sk.builtin.none.none$, Sk.builtin.none.none$,
        Sk.builtin.none.none$
    ];
    mod.title = new Sk.builtin.func(title_f);

    var axis_f = function(label, fontdict, loc) {
        Sk.builtin.pyCheckArgs("axis", arguments, 0, 3);

        // when called without any arguments it should return the current axis limits

        if (plot && plot._axes) {
            console.log(plot._axes);
        }

        // >>> axis(v)
        // sets the min and max of the x and y axes, with
        // ``v = [xmin, xmax, ymin, ymax]``.::

        //The xmin, xmax, ymin, ymax tuple is returned
        var res;

        return Sk.ffi.remapToPy([]);
    };

    axis_f.co_varnames = ['label', 'fontdict', 'loc', ];
    axis_f.$defaults = [null, Sk.builtin.none.none$, Sk.builtin.none.none$,
        Sk.builtin.none.none$
    ];
    mod.axis = new Sk.builtin.func(axis_f);

    var xlabel_f = function(s, fontdict, loc) {
        Sk.builtin.pyCheckArgs("xlabel", arguments, 1, 3);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for s.");
        }

        if (Sk.skip_drawing !== true) {
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            if (plot && plot.xlabel) {
                plot.xlabel(Sk.ffi.remapToJs(s));
            }
        }
    };

    xlabel_f.co_varnames = ['s', 'fontdict', 'loc', ];
    xlabel_f.$defaults = [null, Sk.builtin.none.none$, Sk.builtin.none.none$,
        Sk.builtin.none.none$
    ];
    mod.xlabel = new Sk.builtin.func(xlabel_f);

    var ylabel_f = function(s, fontdict, loc) {
        Sk.builtin.pyCheckArgs("ylabel", arguments, 1, 3);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for s.");
        }

        if (Sk.skip_drawing !== true) {
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            if (plot && plot.ylabel) {
                plot.ylabel(Sk.ffi.remapToJs(s));
            }
        }
    };

    ylabel_f.co_varnames = ['s', 'fontdict', 'loc', ];
    ylabel_f.$defaults = [null, Sk.builtin.none.none$, Sk.builtin.none.none$,
        Sk.builtin.none.none$
    ];
    mod.ylabel = new Sk.builtin.func(ylabel_f);

    // Clear the current figure
    var clf_f = function() {
        // clear all
        chart = null;
        plot = null;

        /*if (Sk.matplotlibCanvas !== undefined) {
            $(Sk.matplotlibCanvas).empty();
        }*/
    };

    mod.clf = new Sk.builtin.func(clf_f);

    /* list of not implemented methods */
    mod.findobj = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "findobj is not yet implemented");
    });
    mod.switch_backend = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "switch_backend is not yet implemented");
    });
    mod.isinteractive = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "isinteractive is not yet implemented");
    });
    mod.ioff = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "ioff is not yet implemented");
    });
    mod.ion = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("ion is not yet implemented");
    });
    mod.pause = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "pause is not yet implemented");
    });
    mod.rc = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("rc is not yet implemented");
    });
    mod.rc_context = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "rc_context is not yet implemented");
    });
    mod.rcdefaults = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "rcdefaults is not yet implemented");
    });
    mod.gci = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("gci is not yet implemented");
    });
    mod.sci = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("sci is not yet implemented");
    });
    mod.xkcd = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "xkcd is not yet implemented");
    });
    mod.figure = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "figure is not yet implemented");
    });
    mod.gcf = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("gcf is not yet implemented");
    });
    mod.get_fignums = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "get_fignums is not yet implemented");
    });
    mod.get_figlabels = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "get_figlabels is not yet implemented");
    });
    mod.get_current_fig_manager = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "get_current_fig_manager is not yet implemented");
    });
    mod.connect = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "connect is not yet implemented");
    });
    mod.disconnect = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "disconnect is not yet implemented");
    });
    mod.close = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "close is not yet implemented");
    });
    mod.savefig = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "savefig is not yet implemented");
    });
    mod.ginput = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "ginput is not yet implemented");
    });
    mod.waitforbuttonpress = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "waitforbuttonpress is not yet implemented");
    });
    mod.figtext = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "figtext is not yet implemented");
    });
    mod.suptitle = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "suptitle is not yet implemented");
    });
    mod.figimage = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "figimage is not yet implemented");
    });
    mod.figlegend = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "figlegend is not yet implemented");
    });
    mod.hold = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "hold is not yet implemented");
    });
    mod.ishold = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "ishold is not yet implemented");
    });
    mod.over = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "over is not yet implemented");
    });
    mod.delaxes = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "delaxes is not yet implemented");
    });
    mod.sca = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("sca is not yet implemented");
    });
    mod.gca = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("gca is not yet implemented");
    });
    mod.subplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "subplot is not yet implemented");
    });
    mod.subplots = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "subplots is not yet implemented");
    });
    mod.subplot2grid = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "subplot2grid is not yet implemented");
    });
    mod.twinx = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "twinx is not yet implemented");
    });
    mod.twiny = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "twiny is not yet implemented");
    });
    mod.subplots_adjust = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "subplots_adjust is not yet implemented");
    });
    mod.subplot_tool = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "subplot_tool is not yet implemented");
    });
    mod.tight_layout = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "tight_layout is not yet implemented");
    });
    mod.box = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("box is not yet implemented");
    });
    mod.xlim = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "xlim is not yet implemented");
    });
    mod.ylim = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "ylim is not yet implemented");
    });
    mod.xscale = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "xscale is not yet implemented");
    });
    mod.yscale = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "yscale is not yet implemented");
    });
    mod.xticks = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "xticks is not yet implemented");
    });
    mod.yticks = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "yticks is not yet implemented");
    });
    mod.minorticks_on = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "minorticks_on is not yet implemented");
    });
    mod.minorticks_off = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "minorticks_off is not yet implemented");
    });
    mod.rgrids = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "rgrids is not yet implemented");
    });
    mod.thetagrids = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "thetagrids is not yet implemented");
    });
    mod.plotting = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "plotting is not yet implemented");
    });
    mod.get_plot_commands = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "get_plot_commands is not yet implemented");
    });
    mod.colors = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "colors is not yet implemented");
    });
    mod.colormaps = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "colormaps is not yet implemented");
    });
    mod._setup_pyplot_info_docstrings = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "_setup_pyplot_info_docstrings is not yet implemented");
    });
    mod.colorbar = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "colorbar is not yet implemented");
    });
    mod.clim = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "clim is not yet implemented");
    });
    mod.set_cmap = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "set_cmap is not yet implemented");
    });
    mod.imread = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "imread is not yet implemented");
    });
    mod.imsave = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "imsave is not yet implemented");
    });
    mod.matshow = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "matshow is not yet implemented");
    });
    mod.polar = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "polar is not yet implemented");
    });
    mod.plotfile = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "plotfile is not yet implemented");
    });
    mod._autogen_docstring = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "_autogen_docstring is not yet implemented");
    });
    mod.acorr = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "acorr is not yet implemented");
    });
    mod.arrow = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "arrow is not yet implemented");
    });
    mod.axhline = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "axhline is not yet implemented");
    });
    mod.axhspan = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "axhspan is not yet implemented");
    });
    mod.axvline = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "axvline is not yet implemented");
    });
    mod.axvspan = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "axvspan is not yet implemented");
    });
    mod.bar = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("bar is not yet implemented");
    });
    mod.barh = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "barh is not yet implemented");
    });
    mod.broken_barh = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "broken_barh is not yet implemented");
    });
    mod.boxplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "boxplot is not yet implemented");
    });
    mod.cohere = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "cohere is not yet implemented");
    });
    mod.clabel = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "clabel is not yet implemented");
    });
    mod.contour = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "contour is not yet implemented");
    });
    mod.contourf = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "contourf is not yet implemented");
    });
    mod.csd = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("csd is not yet implemented");
    });
    mod.errorbar = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "errorbar is not yet implemented");
    });
    mod.eventplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "eventplot is not yet implemented");
    });
    mod.fill = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "fill is not yet implemented");
    });
    mod.fill_between = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "fill_between is not yet implemented");
    });
    mod.fill_betweenx = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "fill_betweenx is not yet implemented");
    });
    mod.hexbin = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "hexbin is not yet implemented");
    });
    
    var hist_f = function(kwa) {
        // Check kwarg argument
        Sk.builtin.pyCheckArgs("histk", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);
        mod.values.push(args);
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict
        
        // process arguments into a list
        var ydata = [];
        var stylestring = []; // we support only one at the moment
        
        if (args[0] instanceof Sk.builtin.list) {
            ydata.push(Sk.ffi.remapToJs(args[0]));
        } else {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[0]) +
                    "' is not supported for *args[" + 0 + "].");
        }
        
        if (args[1]) {
            if (Sk.builtin.checkString(args[1])) {
                stylestring.push(Sk.ffi.remapToJs(args[1]));
            } else {
                throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[1]) +
                    "' is not supported for *args[" + 1 + "].");
            }
        } else {
            stylestring.push('');
        }
        
        if (Sk.skip_drawing !== true) {

            // empty canvas from previous plots
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            // create line objects
            var bar;

            for (i = 0; i < ydata.length; i++) {
                bars = new jsplotlib.Bars(ydata[i]);
                var ftm_tuple = jsplotlib._process_plot_format(stylestring[i]);
                bars.update({
                    'linestyle': ftm_tuple.linestyle,
                    'marker': jsplotlib.parse_marker(ftm_tuple.marker),
                    'color': ftm_tuple.color
                });
                plot.add_artist(bars);
            }

            // set kwargs that apply for all lines
            plot.update(kwargs);
        } else {
            if (!plot) {
                plot = {"_artists":[]};
            }
            for (i = 0; i < ydata.length; i++) {
                plot._artists.push([ydata[i]]);
            }
            
        }

        // result
        var result = [];

        return new Sk.builtins.tuple(result);
    }
    hist_f.co_kwargs = true;
    mod.hist = new Sk.builtin.func(hist_f);
    mod.hist2d = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "hist2d is not yet implemented");
    });
    mod.hlines = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "hlines is not yet implemented");
    });
    mod.loglog = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "loglog is not yet implemented");
    });
    mod.magnitude_spectrum = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "magnitude_spectrum is not yet implemented");
    });
    mod.pcolor = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "pcolor is not yet implemented");
    });
    mod.pcolormesh = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "pcolormesh is not yet implemented");
    });
    mod.phase_spectrum = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "phase_spectrum is not yet implemented");
    });
    mod.pie = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("pie is not yet implemented");
    });
    mod.plot_date = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "plot_date is not yet implemented");
    });
    mod.psd = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("psd is not yet implemented");
    });
    mod.quiver = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "quiver is not yet implemented");
    });
    mod.quiverkey = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "quiverkey is not yet implemented");
    });
    var scatter_f = function(kwa) {
        Sk.builtin.pyCheckArgs("scatter", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);
        mod.values.push(args);
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict

        // try parsing plot args
        // possible xdata, ydata, stylestring
        /*
            plot(x, y, 'bo')  # plot x and y using blue circle markers
        */

        // variable definitions for args
        var xdata = [];
        var ydata = [];
        var stylestring = []; // we support only one at the moment
        var i = 0;
        var lines = 0;

        if (args[0] instanceof Sk.builtin.list) {
            xdata.push(Sk.ffi.remapToJs(args[0]));
        } else {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[0]) +
                "' is not supported for *args[" + 0 + "].");
        }
        if (args[1] instanceof Sk.builtin.list) {
            ydata.push(Sk.ffi.remapToJs(args[1]));
        } else {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[1]) +
                "' is not supported for *args[" + 1 + "].");
        }
        if (args[2] != undefined) {
            if (Sk.builtin.checkString(args[2])) {
                stylestring.push(Sk.ffi.remapToJs(args[2]));
            } else {
                throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(args[2]) +
                    "' is not supported for *args[" + 2 + "].");
            }
        } else {
            stylestring.push('o');
        }
        
        if (Sk.skip_drawing !== true) {

            // empty canvas from previous plots
            create_chart();
            // create new plot instance, should be replaced with Line2D and then added to the plot
            if (!plot) {
                plot = jsplotlib.plot(chart);
            }

            // create line objects
            var line;
            
            for (i = 0; i < xdata.length; i++) {
                line = new jsplotlib.Line2D(xdata[i], ydata[i]);
                var ftm_tuple = jsplotlib._process_plot_format(stylestring[i]);
                line.update({
                    'linestyle': ftm_tuple.linestyle,
                    'marker': jsplotlib.parse_marker(ftm_tuple.marker),
                    'color': ftm_tuple.color
                });
                plot.add_artist(line);
            }

            // set kwargs that apply for all lines
            plot.update(kwargs);
        } else {
            if (!plot) {
                plot = {"_artists":[]};
            }
            for (i = 0; i < xdata.length; i++) {
                plot._artists.push([xdata[i], ydata[i]]);
            }
        }

        // result
        var result = [];

        return new Sk.builtins.tuple(result);
    };
    scatter_f.co_kwargs = true;
    mod.scatter = new Sk.builtin.func(scatter_f);
    mod.semilogx = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "semilogx is not yet implemented");
    });
    mod.semilogy = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "semilogy is not yet implemented");
    });
    mod.specgram = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "specgram is not yet implemented");
    });
    mod.stackplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "stackplot is not yet implemented");
    });
    mod.stem = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "stem is not yet implemented");
    });
    mod.step = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "step is not yet implemented");
    });
    mod.streamplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "streamplot is not yet implemented");
    });
    mod.tricontour = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "tricontour is not yet implemented");
    });
    mod.tricontourf = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "tricontourf is not yet implemented");
    });
    mod.tripcolor = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "tripcolor is not yet implemented");
    });
    mod.triplot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "triplot is not yet implemented");
    });
    mod.vlines = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "vlines is not yet implemented");
    });
    mod.xcorr = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "xcorr is not yet implemented");
    });
    mod.barbs = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "barbs is not yet implemented");
    });
    mod.cla = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("cla is not yet implemented");
    });
    mod.grid = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "grid is not yet implemented");
    });
    mod.legend = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "legend is not yet implemented");
    });
    mod.table = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "table is not yet implemented");
    });
    mod.text = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "text is not yet implemented");
    });
    mod.annotate = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "annotate is not yet implemented");
    });
    mod.ticklabel_format = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "ticklabel_format is not yet implemented");
    });
    mod.locator_params = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "locator_params is not yet implemented");
    });
    mod.tick_params = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "tick_params is not yet implemented");
    });
    mod.margins = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "margins is not yet implemented");
    });
    mod.autoscale = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "autoscale is not yet implemented");
    });
    mod.autumn = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "autumn is not yet implemented");
    });
    mod.cool = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "cool is not yet implemented");
    });
    mod.copper = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "copper is not yet implemented");
    });
    mod.flag = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "flag is not yet implemented");
    });
    mod.gray = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "gray is not yet implemented");
    });
    mod.hot = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("hot is not yet implemented");
    });
    mod.hsv = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("hsv is not yet implemented");
    });
    mod.jet = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError("jet is not yet implemented");
    });
    mod.pink = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "pink is not yet implemented");
    });
    mod.prism = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "prism is not yet implemented");
    });
    mod.spring = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "spring is not yet implemented");
    });
    mod.summer = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "summer is not yet implemented");
    });
    mod.winter = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "winter is not yet implemented");
    });
    mod.spectral = new Sk.builtin.func(function() {
        throw new Sk.builtin.NotImplementedError(
            "spectral is not yet implemented");
    });

    return mod;
};
