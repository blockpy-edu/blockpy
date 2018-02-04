var jsplotlib = {};

// Skulpt translation
var $builtinmodule = function(name) {
    var mod = {};
    
    // Unique ID generator for charts
    var chartCounter = 0;
    
    var chart; // The aggregate object to hold multiple plots
    var labels; // Title, X-axis title, Y-axis title
    var plots; // All the plots to end up drawing
    var extents; // The highest and lowest values across each axis
    var colorCycle;
    
    function resetChart() {
        chart = null;
        colorCycle = 0;
        labels = {
            'title': '',
            'x-axis': '',
            'y-axis': ''
        };
        plots = [];
        extents = {
            'xMin': null, 
            'yMin': null, 
            'xMax': null, 
            'yMax': null
        };
    }
    resetChart();
    
    // Keep track of any plotted values for later checks
    mod.values = [];

    // Creates the aggregate chart object that will hold 1 or more plots
    var createChart = function(type) {
        if (Sk.console === undefined) {
            throw new Sk.builtin.NameError(
                "Can not resolve drawing area. Sk.console is undefined!");
        }

        if (!chart) {
            // Create a new chart
            chartCounter += 1;
            chart = {};
            
            chart.margin = {'top': 20, 'right': 30, 'bottom': 50, 'left': 40};
            chart.width = Sk.console.width - chart.margin.left - chart.margin.right;
            chart.height = Sk.console.height - chart.margin.top - chart.margin.bottom;
            chart.id = 'chart' + chartCounter;
            chart.type = type;
            
            if (Sk.console.skipDrawing) {
                return chart;
            }
            
            return chart;
        }
    };
    
    function updateMinMax(attr, array) {
        if (extents[attr+"Min"] === null) {
            extents[attr+"Min"] = d3.min(array);
        } else {
            extents[attr+"Min"] = Math.min(d3.min(array), extents[attr+"Min"])
        }
        if (extents[attr+"Max"] === null) {
            extents[attr+"Max"] = d3.max(array);
        } else {
            extents[attr+"Max"] = Math.max(d3.max(array), extents[attr+"Max"])
        }
    }
    
    function getRandomSubarray(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }

    // Main plotting function
    var plot_f = function(kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("plotk", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);        
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict
        
        // Keep a backup of the arguments for checker
        mod.values.push(args);
        
        // Parse different argument combinations
        var xdata = null;
        var ydata = null;
        var stylestring = null;
        if (args.length == 1) {
            // ydata
            ydata = Sk.ffi.remapToJs(args[0]);
        } else if (args.length == 2) {
            if (Sk.builtin.checkString(args[1])) {
                // ydata, style
                ydata = Sk.ffi.remapToJs(args[0]);
                stylestring = Sk.ffi.remapToJs(args[1]);
            } else {
                // xdata, ydata
                xdata = Sk.ffi.remapToJs(args[0]);
                ydata = Sk.ffi.remapToJs(args[1]);
            }
        } else if (args.length == 3) {
            // xdata, ydata, style
            xdata = Sk.ffi.remapToJs(args[0]);
            ydata = Sk.ffi.remapToJs(args[1]);
            stylestring = Sk.ffi.remapToJs(args[2]);
        }
        if (xdata === null) {
            xdata = [];
            for (var i = 0; i < ydata.length; i++) {
               xdata.push(i);
            }
        }

        
        if (Sk.console.skipDrawing) {
            return;
        }
        
        // empty canvas from previous plots
        createChart('line');

        // Zip up the data
        var actualData = d3.zip(xdata, ydata).map(function(e) {
            return {'x': e[0], 'y': e[1]}
        });
        // Parse formatting, also keep ColorCycler updated
        var cycle = jsplotlib.rc["axes.color_cycle"];
        var linestyle = '-', marker= '', 
            color = cycle[colorCycle % cycle.length];
        if (stylestring !== null) {
            var ftm_tuple = jsplotlib._process_plot_format(stylestring);
            linestyle = ftm_tuple.linestyle;
            marker = jsplotlib.parse_marker(ftm_tuple.marker);
            color = ftm_tuple.color;
        } else {
            colorCycle += 1;
        }
        // Save
        plots.push({
            "data": actualData, 
            "type": 'line',
            'style': {
                'linestyle': linestyle,
                'marker': marker,
                'color': jsplotlib.color_to_hex(color)
            }
        });
        // Update min/max
        updateMinMax("x", xdata)
        updateMinMax("y", ydata)
    };
    plot_f.co_kwargs = true;
    mod.plot = new Sk.builtin.func(plot_f);

    var show_f = function() {
        /*if (Sk.console.skipDrawing) {
            Sk.console.printHtml([0], plots);
            return;
        }*/
        
        if (!chart) {
            createChart('line');
        }
        if (chart.type == 'hist' && plots.length < 1) {
            resetChart();
            return;
        }
        if (plots.length == 0) {
            return;
        }
        if (extents['xMin'] === undefined || extents['yMin'] === undefined) {
            return;
        }
        
        var yAxisBuffer;
        
        // Establish x/y scalers and axes
        if (chart.type == 'scatter' || chart.type == 'line') {
            yAxisBuffer = 5*Math.max(extents['yMin'].toLocaleString().length, 
                                   extents['yMax'].toLocaleString().length);
            chart.xScale = d3.scale.linear()
                                   .domain([extents['xMin'], extents['xMax']])
                                   .range([0, chart.width-yAxisBuffer]);
            chart.xAxis = d3.svg.axis()
                                .scale(chart.xScale)
                                .orient("bottom");
        } else if (chart.type == 'hist') {
            yAxisBuffer = 5*Math.max(extents['xMin'].toLocaleString().length, 
                                   extents['xMax'].toLocaleString().length);
            chart.xScale = d3.scale.linear()
                                   .domain([extents['xMin'], extents['xMax']])
                                   .range([0, chart.width-yAxisBuffer]);
            chart.xAxis = d3.svg.axis()
                                .scale(chart.xScale)
                                .orient("bottom");
            var bins = plots[0]['bins'];
            var tempScale = d3.scale.linear()
                                    .domain([
                                        0, bins
                                    ])
                                    .range([extents['xMin'], extents['xMax']]);
            var tickArray = d3.range(bins+1)
                              .map(tempScale).map(function(e) {
                                return e;
                              });
            // TODO: support multiple histograms
            var histMapper = d3.layout.histogram().bins(
            tickArray
            //chart.xScale.ticks(bins)
            )(plots[0]['data']);
        } else if (chart.type == 'bar') {
            yAxisBuffer = 5*Math.max(extents['yMin'].toLocaleString().length, 
                                   extents['yMax'].toLocaleString().length);
            chart.xScale = d3.scale.ordinal()
                                   .domain([extents['xMin'], extents['xMax']])
                                   .rangeBands([0, chart.width-yAxisBuffer]);
            chart.xAxis = d3.svg.axis()
                                .scale(chart.xScale)
                                .tickFormat(function(d) { return d.index })
                                .orient("bottom");
        }
        if (chart.type !== 'hist') {
            chart.yScale = d3.scale.linear()
                                   .domain([extents['yMin'], extents['yMax']])
                                   .range([chart.height, 0]);
        } else {
            chart.yScale = d3.scale.linear()
                                   .domain([0, d3.max(histMapper, function(d) { return d.y; })])
                                   .range([chart.height, 0]);
        }
        chart.yAxis = d3.svg.axis()
                            .scale(chart.yScale)
                            .orient("left");
        
        chart.mapX = function(d) {return chart.xScale(d.x)};
        chart.mapY = function(d) {return chart.yScale(d.y)};
        chart.mapLine = d3.svg.line()
                              .x(function(d) { return chart.xScale(d.x); })
                              .y(function(d) { return chart.yScale(d.y); })
                              .interpolate("linear");
                            
        // set css classes
        chart.svg = d3.select(Sk.console.container).append('div').append('svg');
        //$(chart.svg.node()).parent().hide();
        chart.svg.attr('class', 'chart');
        chart.svg.attr('width', Sk.console.width);
        chart.svg.attr('height', Sk.console.height);
        chart.svg.attr('chartCount', chartCounter);
        
        var translation = "translate(" + (chart.margin.left + yAxisBuffer) + "," + chart.margin.top + ")";
        chart.canvas = chart.svg.append("g")
                                .attr("transform", translation);
        
        chart.canvas.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + chart.height + ")")
                    .call(chart.xAxis);
        chart.canvas.append("g")
                    .attr("class", "y axis")
                    .call(chart.yAxis);
        chart.canvas.select(".x.axis")
                    .selectAll("text")
                    .style("font-size","12px");
        chart.canvas.select(".y.axis")
                    .selectAll("text")
                    .style("font-size","12px");
        translation = "translate(" + ( (chart.width-yAxisBuffer) / 2) + " ," + (chart.height + chart.margin.bottom-14) + ")";
        chart.canvas.append("text")      // text label for the x axis
                    .attr("transform", translation)
                    .attr("class", "x-axis-label")
                    .style("font-size", "14px") 
                    .text(labels['x-axis'])
                    .style("text-anchor", "middle");
        chart.canvas.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("class", "y-axis-label")
                    .attr("y", 0 - chart.margin.left-yAxisBuffer)
                    .attr("x", 0 - (chart.height / 2))
                    .attr("dy", "1em")
                    .text(labels['y-axis'])
                    .style("font-size", "14px") 
                    .style("text-anchor", "middle");
        chart.canvas.append("text")
                    .attr("x", ( (chart.width-yAxisBuffer) / 2))
                    .attr("y", 0 - (chart.margin.top / 2))
                    .attr("class", "title-text")
                    .text(labels['title'])
                    .attr("text-anchor", "middle")  
                    .style("font-size", "14px") 
                    .style("text-decoration", "underline");
        chart.canvas.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .text("BlockPy")
                    .style("stroke", "#FDFDFD")
                    .style("font-size", "8px");
        chart.svg.insert('defs', ":first-child")
                    .append('style')
                    .attr("type", "text/css")
                    .text("svg { background-color: white; }\n"+
                          ".axis path,.axis line { fill: none; stroke: black; shape-rendering: crispEdges;}\n"+
                          ".line { fill: none; stroke-width: 1px;}\n"+
                          ".circle { r: 3; shape-rendering: crispEdges; }\n"+
                          ".bar { shape-rendering: crispEdges;}\n")
        
        // Actually draw the chart objects
        for (var i = 0; i < plots.length; i += 1) {
            var plot = plots[i];
            if (plot['type'] == 'line') {
                chart.canvas.append("path")
                            .style('stroke', plot['style']['color'])
                            .attr('class', "line")
                            .data(plot['data'])
                            .attr("d", chart.mapLine(plot['data']));
            } else if (plot['type'] == 'scatter') {
                chart.canvas.append("g")
                            .attr("class", "series")
                            .selectAll(".point")
                            .data(plot['data'])
                            .enter()
                            .append('circle')
                            .style('fill', plot['style']['color'])
                            .attr("class", "circle")
                            .attr("cx", chart.mapX)
                            .attr("cy", chart.mapY)
                            .attr('r', 2);
            } else if (plot['type'] == 'hist') {
                chart.canvas.selectAll('.bar')
                            .data(histMapper)
                            .enter().append("rect")
                            .attr("class", "bar")
                            .style('fill', plot['style']['color'])
                            .style('stroke', 'black')
                            .attr("x", function(d) { return chart.xScale(d.x); })
                            .attr("width", (chart.width-yAxisBuffer)/(1+histMapper.length))
                            .attr("y", function(d) { return chart.yScale(d.y); })
                            .attr("height", function(d) { return chart.height - chart.yScale(d.y); });
            }
        }
        if (Sk.console.pngMode) {
            var doctype = '<?xml version="1.0" standalone="no"?>' + '<' + '!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
            var xml = new XMLSerializer().serializeToString(chart.svg[0][0]);
            var blob = new Blob([ doctype + xml], { type: 'image/svg+xml' });
            var url = window.URL.createObjectURL(blob);
            //var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
            var img  = document.createElement("img");
            img.style.display = 'block';
            var oldChart = chart;
            var oldPlots = plots;
            Sk.console.printHtml(img, oldPlots);
            resetChart();
            oldChart.svg[0][0].parentNode.replaceChild(img, oldChart.svg[0][0])
            img.onload = function() {
                img.onload = null;
                //TODO: Make this capture a class descendant. Cross the D3/Jquery barrier!
                var canvas = document.createElement('canvas');
                canvas.width = Sk.console.width;
                canvas.height = Sk.console.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                var canvasUrl = canvas.toDataURL("image/png");
                img.setAttribute('src', canvasUrl);
                // Snip off this chart, we can now start a new one.
            }
            img.onerror = function() {
                
            }
            img.setAttribute('src', url);
        } else {
            Sk.console.printHtml(chart.svg, plots);
            // Snip off this chart, we can now start a new one.
            resetChart();
        }
    };
    mod.show = new Sk.builtin.func(show_f);

    var title_f = function(s) {
        Sk.builtin.pyCheckArgs("title", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for title; should be a string.");
        }
        
        labels['title']= Sk.ffi.remapToJs(s);
    };
    mod.title = new Sk.builtin.func(title_f);

    var xlabel_f = function(s) {
        Sk.builtin.pyCheckArgs("xlabel", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for xlabel; should be a string.");
        }
        
        labels['x-axis']= Sk.ffi.remapToJs(s);
    };
    mod.xlabel = new Sk.builtin.func(xlabel_f);

    var ylabel_f = function(s) {
        Sk.builtin.pyCheckArgs("ylabel", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for ylabel; should be a string.");
        }
        
        labels['y-axis']= Sk.ffi.remapToJs(s);
    };
    mod.ylabel = new Sk.builtin.func(ylabel_f);

    // Clear the current figure
    var clf_f = function() {
        chart = null;
        resetChart();
    };
    mod.clf = new Sk.builtin.func(clf_f);

    UNSUPPORTED = ["semilogx", "semilogy", "specgram", "stackplot", "stem", "step", "streamplot", "tricontour", "tricontourf", "tripcolor", "triplot", "vlines", "xcorr", "barbs", "cla", "grid", "table", "text", "annotate", "ticklabel_format", "locator_params", "tick_params", "margins", "autoscale", "autumn", "cool", "copper", "flag", "gray", "hot", "hsv", "jet", "pink", "prism", "spring", "summer", "winter", "spectral", "hlines", "loglog", "magnitude_spectrum", "pcolor", "pcolormesh", "phase_spectrum", "pie", "plot_date", "psd", "quiver", "quiverkey", "findobj", "switch_backend", "isinteractive", "ioff", "ion", "pause", "rc", "rc_context", "rcdefaults", "gci", "sci", "xkcd", "figure", "gcf", "get_fignums", "get_figlabels", "get_current_fig_manager", "connect", "disconnect", "close", "savefig", "ginput", "waitforbuttonpress", "figtext", "suptitle", "figimage", "figlegend", "hold", "ishold", "over", "delaxes", "sca", "gca", "subplot", "subplots", "subplot2grid", "twinx", "twiny", "subplots_adjust", "subplot_tool", "tight_layout", "box", "xlim", "ylim", "xscale", "yscale", "xticks", "yticks", "minorticks_on", "minorticks_off", "rgrids", "thetagrids", "plotting", "get_plot_commands", "colors", "colormaps", "_setup_pyplot_info_docstrings", "colorbar", "clim", "set_cmap", "imread", "imsave", "matshow", "polar", "plotfile", "_autogen_docstring", "acorr", "arrow", "axhline", "axhspan", "axvline", "axvspan", "bar", "barh", "broken_barh", "boxplot", "cohere", "clabel", "contour", "contourf", "csd", "errorbar", "eventplot", "fill", "fill_between", "fill_betweenx", "hexbin", "hist2d", 'axis']
    for (var i = 0; i < UNSUPPORTED.length; i+= 1) {
        mod[UNSUPPORTED[i]] = new Sk.builtin.func(function() {
            throw new Sk.builtin.NotImplementedError(UNSUPPORTED[i]+" is not yet implemented");
        });
    }
    
    var legend_f = function() {
        return Sk.builtin.none.none$;
    }
    mod.legend = new Sk.builtin.func(legend_f);
    
    var hist_f = function(kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("hist", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);        
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict
        
        var bins = 10;
        if ("bins" in kwargs) {
            bins = kwargs["bins"];
        }
        
        // Keep a backup of the arguments for checker
        mod.values.push(args);
        
        // Parse different argument combinations
        var data = null;
        var stylestring = null;
        if (args.length == 1) {
            // xdata
            data = Sk.ffi.remapToJs(args[0]);
        } else if (args.length == 2) {
            // xdata, style
            data = Sk.ffi.remapToJs(args[0]);
            stylestring = Sk.ffi.remapToJs(args[1]);
        }
        
        if (Sk.console.skipDrawing) {
            return;
        }
        
        // empty canvas from previous plots
        createChart('hist');

        // Parse formatting, also keep ColorCycler updated
        var cycle = jsplotlib.rc["axes.color_cycle"];
        var linestyle = ' ', marker= 'o', 
            color = cycle[colorCycle % cycle.length];
        if (stylestring !== null) {
            var ftm_tuple = jsplotlib._process_plot_format(stylestring);
            linestyle = ftm_tuple.linestyle;
            marker = jsplotlib.parse_marker(ftm_tuple.marker);
            color = ftm_tuple.color;
        } else {
            colorCycle += 1;
        }
        // Save
        plots.push({
            "data": data, 
            "type": 'hist',
            "bins": bins,
            'style': {
                'linestyle': linestyle,
                'marker': marker,
                'color': jsplotlib.color_to_hex(color)
            }
        });
        updateMinMax("x", data);
    }
    hist_f.co_kwargs = true;
    mod.hist = new Sk.builtin.func(hist_f);
    
    var scatter_f = function(kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("scatter", arguments, 1, Infinity, true, false);
        args = Array.prototype.slice.call(arguments, 1);        
        kwargs = new Sk.builtins.dict(kwa); // is pretty useless for handling kwargs
        kwargs = Sk.ffi.remapToJs(kwargs); // create a proper dict
        
        var dot_limit = 256;
        if ("dot_limit" in kwargs) {
            dot_limit = kwargs["dot_limit"];
        }
        
        // Keep a backup of the arguments for checker
        mod.values.push(args);
        
        // Parse different argument combinations
        var xdata = null;
        var ydata = null;
        var stylestring = null;
        if (args.length == 2) {
            // xdata, ydata
            xdata = Sk.ffi.remapToJs(args[0]);
            ydata = Sk.ffi.remapToJs(args[1]);
        } else if (args.length == 3) {
            // xdata, ydata, style
            xdata = Sk.ffi.remapToJs(args[0]);
            ydata = Sk.ffi.remapToJs(args[1]);
            stylestring = Sk.ffi.remapToJs(args[2]);
        }
        
        if (xdata.length > dot_limit) {
            var xdataSampled = [], ydataSampled = [];
            var LENGTH = xdata.length, RATE = LENGTH / dot_limit;
            for (var i = 0; i < dot_limit; i+= 1) {
                var index = Math.floor((i+Math.random())*RATE);
                xdataSampled.push(xdata[index])
                ydataSampled.push(ydata[index]);
            }
            xdata = xdataSampled;
            ydata = ydataSampled;
        }
        
        if (Sk.console.skipDrawing) {
            return;
        }
        
        // empty canvas from previous plots
        createChart('scatter');

        // Zip up the data
        var actualData = d3.zip(xdata, ydata).map(function(e) {
            return {'x': e[0], 'y': e[1]}
        });
        // Parse formatting, also keep ColorCycler updated
        var cycle = jsplotlib.rc["axes.color_cycle"];
        var linestyle = ' ', marker= 'o', 
            color = cycle[colorCycle % cycle.length];
        if (stylestring !== null) {
            var ftm_tuple = jsplotlib._process_plot_format(stylestring);
            linestyle = ftm_tuple.linestyle;
            marker = jsplotlib.parse_marker(ftm_tuple.marker);
            color = ftm_tuple.color;
        } else {
            colorCycle += 1;
        }
        // Save
        plots.push({
            "data": actualData, 
            "type": 'scatter',
            'style': {
                'linestyle': linestyle,
                'marker': marker,
                'color': jsplotlib.color_to_hex(color)
            }
        });
        // Update min/max
        updateMinMax("x", xdata)
        updateMinMax("y", ydata)
    };
    scatter_f.co_kwargs = true;
    mod.scatter = new Sk.builtin.func(scatter_f);
    

    return mod;
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
jsplotlib._line_counter = 0;

/** List of all supported line styles **/
jsplotlib.lineStyles = {
    '-': '_draw_solid',
    '--': '_draw_dashed',
    '-.': '_draw_dash_dot',
    ':': '_draw_dotted',
    'None': '_draw_nothing',
    ' ': '_draw_nothing',
    '': '_draw_nothing',
};

jsplotlib.lineMarkers = {
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
        if (jsplotlib.lineStyles[c]) {
            if (linestyle) {
                throw new Sk.builtin.ValueError('Illegal format string "' + fmt +
                    '"; two linestyle symbols');
            }
            linestyle = c;
        } else if (jsplotlib.lineMarkers[c]) {
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
