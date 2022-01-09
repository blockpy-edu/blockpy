Sk.jsplotlib = Sk.jsplotlib || {};

// Skulpt translation
export let $builtinmodule = function (name) {
    let mod = {__name__: "matplotlib.pyplot"};

    const STRING_COLOR = new Sk.builtin.str("color");
    const STRING_COLORS = new Sk.builtin.str("colors");
    const STRING_DATA = new Sk.builtin.str("data");
    const STRING_LABEL = new Sk.builtin.str("label");
    const STRING_ALPHA = new Sk.builtin.str("alpha");
    const STRING_DASH_CAPSTYLE = new Sk.builtin.str("dash_capstyle");
    const STRING_DASH_JOINSTYLE = new Sk.builtin.str("dash_joinstyle");
    const STRING_FILLSTYLE = new Sk.builtin.str("fillstyle");
    const STRING_LINEWIDTH = new Sk.builtin.str("linewidth");
    const STRING_MARKER = new Sk.builtin.str("marker");
    const STRING_LINESTYLE = new Sk.builtin.str("linestyle");
    const STRING_LINESTYLES = new Sk.builtin.str("linestyles");
    const STRING_BINS = new Sk.builtin.str("bins");
    const STRING_ALIGN = new Sk.builtin.str("align");
    const STRING_DOT_LIMIT = new Sk.builtin.str("dot_limit");
    const STRING_S = new Sk.builtin.str("s");
    const STRING_C = new Sk.builtin.str("c");
    const STRING_LINEWIDTHS = new Sk.builtin.str("linewidths");
    const STRING_EDGECOLORS = new Sk.builtin.str("edgecolors");
    const STRING_WIDTH = new Sk.builtin.str("width");
    const STRING_TICK_LABEL = new Sk.builtin.str("tick_label");
    const STRING_ROTATION = new Sk.builtin.str("rotation");

    const DEFAULT_PLOT_PADDING = .5;


    if (Sk.console === undefined) {
        throw new Sk.builtin.NameError("Can not resolve drawing area. Sk.console is undefined!");
    }
    function getConsole() {
        return Sk.console;
    }

    // Unique ID generator for charts
    let chartCounter = 0;

    function makePlot(type, data, style, label) {
        return {
            type: type,
            data: data,
            style: style,
            label: label
        };
    }

    function makeChart() {
        let margin = {top: 20, right: 30, bottom: 50, left: 40};
        let chartIdNumber = chartCounter++;
        return {
            plots: [],
            labels: {
                title: "",
                "x-axis": "",
                "y-axis": ""
            },
            extents: {
                xMin: null,
                xMax: null,
                yMin: null,
                yMax: null
            },
            ticks: {
                x: {},
                y: {},
                xRotate: "horizontal",
                yRotate: "horizontal",
                xEstimate: new Set(),
                yEstimate: new Set()
            },
            margin: margin,
            width: getConsole().getWidth() - margin.left - margin.right,
            height: getConsole().getHeight() - margin.top - margin.bottom,
            idNumber: chartIdNumber,
            id: "chart" + chartIdNumber,
            colorCycle: 0
        };
    }

    function updateExtent(chart, attr, array, padding) {
        if (padding === undefined) {
            padding = 0;
        }
        if (chart.extents[attr + "Min"] === null) {
            chart.extents[attr + "Min"] = d3.min(array)-padding;
        } else {
            chart.extents[attr + "Min"] = Math.min(d3.min(array)-padding, chart.extents[attr + "Min"]);
        }
        if (chart.extents[attr + "Max"] === null) {
            chart.extents[attr + "Max"] = d3.max(array)+padding;
        } else {
            chart.extents[attr + "Max"] = Math.max(d3.max(array)+padding, chart.extents[attr + "Max"]);
        }
    }

    let chart = null;
    function getChart() {
        if (!chart) {
            chart = makeChart();
        }
        return chart;
    }

    function resetChart() {
        chart = makeChart();
    }

    function parseFormat(styleString, chart, kwargs, defaultLinestyle, defaultMarker) {
        // TODO: Handle ls, lw, and other abbreviated keyword parameters
        let format = {
            alpha: getKeywordParameter(kwargs, STRING_ALPHA, null),
            dash_capstyle: getKeywordParameter(kwargs, STRING_DASH_CAPSTYLE, "butt"),
            dash_joinstyle: getKeywordParameter(kwargs, STRING_DASH_JOINSTYLE, "miter"),
            fillstyle: getKeywordParameter(kwargs, STRING_FILLSTYLE, "full"),
            linewidth: getKeywordParameter(kwargs, STRING_LINEWIDTH, 1),
        };
        if (styleString) {
            let ftmTuple = Sk.jsplotlib._process_plot_format(styleString);
            format["linestyle"] = getKeywordParameter(kwargs, STRING_LINESTYLE, ftmTuple.linestyle);
            format["marker"] = getKeywordParameter(kwargs, STRING_MARKER, Sk.jsplotlib.parse_marker(ftmTuple.marker));
            format["color"] = getKeywordParameter(kwargs, STRING_COLOR, Sk.jsplotlib.color_to_hex(ftmTuple.color));
        } else {
            let cycle = Sk.jsplotlib.rc["axes.color_cycle"];
            format["linestyle"] = getKeywordParameter(kwargs, STRING_LINESTYLE, defaultLinestyle);
            format["marker"] = getKeywordParameter(kwargs, STRING_MARKER, defaultMarker);
            format["color"] = getKeywordParameter(kwargs, STRING_COLOR, Sk.jsplotlib.color_to_hex(cycle[chart.colorCycle % cycle.length]));
            chart.colorCycle += 1;
        }
        return format;
    }

    function getIndices(values) {
        return values.map((value, index) => index);
    }

    function chompPlotArgs(args, data) {
        if (data !== null) {
            if (args.length >= 2) {
                throw new Sk.builtin.ValueError("Must provide at least 2 arguments when plotting with 'data' keyword");
            }
            let xAttr = args[0];
            let yAttr = args[1];
            let xs = [], ys = [];
            const values = Sk.misceval.arrayFromIterable(data);
            for (let i = 0; i < values.length; i++) {
                if (values[i].sq$contains(xAttr)) {
                    xs.push(values[i].mp$subscript(xAttr));
                    ys.push(values[i].mp$subscript(yAttr));
                } else {
                    throw new Sk.builtin.ValueError(`Item at index ${i} is missing expected attribute.`);
                }
            }
            return [xs, ys, args[2]];
        } else {
            // x, y, style
            if (args.length >= 3) {
                if (Sk.builtin.checkString(args[2])) {
                    return [[args[0], args[1], args[2]].map(Sk.ffi.remapToJs)].concat(chompPlotArgs(args.slice(3), data));
                }
            }
            if (args.length >= 2) {
                let ys = Sk.ffi.remapToJs(args[0]);
                if (Sk.builtin.checkString(args[1])) {
                    // y, style
                    let xs = getIndices(ys);
                    let style = Sk.ffi.remapToJs(args[1]);
                    return [[xs, ys, style]].concat(chompPlotArgs(args.slice(2), data));
                } else {
                    // x, y
                    let xs = ys;
                    ys = Sk.ffi.remapToJs(args[1]);
                    return [[xs, ys, ""]].concat(chompPlotArgs(args.slice(2), data));
                }
            }
            if (args.length >= 1) {
                // y
                let ys = Sk.ffi.remapToJs(args[0]);
                let xs = getIndices(ys);
                return [[xs, ys, ""]].concat(chompPlotArgs(args.slice(1), data));
            }
            return [];
        }
    }

    function getKeywordParameter(kwargs, key, otherwise) {
        if (kwargs.sq$contains(key)) {
            return Sk.ffi.remapToJs(kwargs.mp$subscript(key));
        } else {
            return otherwise;
        }
    }

    function updateTickEstimates(chart, xValues, yValues) {
        xValues.forEach(value => chart.ticks.xEstimate.add(value));
        yValues.forEach(value => chart.ticks.yEstimate.add(value));
    }

    // Main plotting function
    let plot_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("plot", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object
        let data = getKeywordParameter(kwargs, STRING_DATA, null);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let chart = getChart();
        let plotData = chompPlotArgs(args, data);
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let zippedData = d3.zip(plotDatum[0], plotDatum[1]).map(value => {return {x: value[0], y: value[1]};});
            let style = parseFormat(plotDatum[2], chart, kwargs, "-", "");
            let plot = makePlot("line", zippedData, style, label);
            chart.plots.push(plot);
            updateExtent(chart, "x", plotDatum[0], DEFAULT_PLOT_PADDING);
            updateExtent(chart, "y", plotDatum[1], DEFAULT_PLOT_PADDING);
            updateTickEstimates(chart, plotDatum[0], plotDatum[1]);
        }
    };
    plot_f.co_kwargs = true;
    mod.plot = new Sk.builtin.func(plot_f);


    let hist_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("hist", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        // Parse different args combinations
        let plotData = Sk.ffi.remapToJs(args[0]);
        if (plotData.length > 0) {
            if (!Array.isArray(plotData[0])) {
                plotData = [plotData];
            }
        }

        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let chart = getChart();
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let style = parseFormat(null, chart, kwargs, "", "");
            let plot = makePlot("hist", plotDatum, style, label);
            plot.bins = getKeywordParameter(kwargs, STRING_BINS, null);
            plot.align = getKeywordParameter(kwargs, STRING_ALIGN, "mid");
            let estimatedBins = plotDatum;
            if (Array.isArray(plot.bins)) {
                let max = d3.max(plot.bins), min = d3.min(plot.bins);
                plot.data = plotDatum = plot.data.map((value) => Math.max(Math.min(value, max), min));
                estimatedBins = plot.bins;
            }
            chart.plots.push(plot);
            updateExtent(chart, "x", plotDatum, DEFAULT_PLOT_PADDING);
            updateTickEstimates(chart, estimatedBins, d3.range(plotDatum.length));
        }
        // Ensure that the axis line is always the middle!
        updateExtent(chart, "y", [0]);
    };
    hist_f.co_kwargs = true;
    mod.hist = new Sk.builtin.func(hist_f);

    let scatter_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("scatter", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let data = getKeywordParameter(kwargs, STRING_DATA, null);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);

        let plotData = chompPlotArgs(args, data);

        // Special dot_limit parameter to prevent crashing from too many dots in browser
        let dotLimit = getKeywordParameter(kwargs, STRING_DOT_LIMIT, 256);
        if (plotData[0] && plotData[0].length > dotLimit) {
            let xSampled = [], ySampled = [];
            let LENGTH = plotData[0].length, RATE = LENGTH / dotLimit;
            for (let i = 0; i < dotLimit; i += 1) {
                let index = Math.floor((i + Math.random()) * RATE);
                xSampled.push(plotData[0][index]);
                ySampled.push(plotData[1][index]);
            }
            plotData[0] = xSampled;
            plotData[1] = ySampled;
        }


        let chart = getChart();
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let style = parseFormat(plotDatum[2], chart, kwargs, " ", "o");
            let zippedData = d3.zip(plotDatum[0], plotDatum[1]).map(value => {return {x: value[0], y: value[1]};});
            let plot = makePlot("scatter", zippedData, style, label);
            plot.sizes = getKeywordParameter(kwargs, STRING_S, null);
            plot.colors = getKeywordParameter(kwargs, STRING_C, null);
            plot.linewidths = getKeywordParameter(kwargs, STRING_LINEWIDTHS, 1.5);
            plot.edgecolors = getKeywordParameter(kwargs, STRING_EDGECOLORS, "face");
            chart.plots.push(plot);
            updateExtent(chart, "x", plotDatum[0], DEFAULT_PLOT_PADDING);
            updateExtent(chart, "y", plotDatum[1], DEFAULT_PLOT_PADDING);
            updateTickEstimates(chart, plotDatum[0], plotDatum[1]);
        }
    };
    scatter_f.co_kwargs = true;
    mod.scatter = new Sk.builtin.func(scatter_f);

    let bar_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("bar", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let data = getKeywordParameter(kwargs, STRING_DATA, null);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let tickLabels = getKeywordParameter(kwargs, STRING_TICK_LABEL, []);

        let plotData = chompPlotArgs(args, data);

        let chart = getChart();
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let zippedData = d3.zip(plotDatum[0], plotDatum[1]).map(value => {return {x: value[0], y: value[1]};});
            let style = parseFormat(null, chart, kwargs, "", "");
            let plot = makePlot("bar", zippedData, style, label);
            plot.width = getKeywordParameter(kwargs, STRING_WIDTH, 0.8);
            plot.align = getKeywordParameter(kwargs, STRING_ALIGN, "center");
            for (let x=0; x<Math.min(tickLabels.length, plotDatum[0].length); x+=1) {
                chart.ticks.x[plotDatum[0][x]] = tickLabels[x];
            }
            chart.plots.push(plot);
            let lowestX = d3.min(plotDatum[0])-(plot.align === "center" ? 1 : 0), lowestY = d3.max(plotDatum[0])+1;
            updateExtent(chart, "x", plotDatum[0].concat([lowestX, lowestY])); // Account for width
            updateExtent(chart, "y", plotDatum[1]);
            updateTickEstimates(chart, plotDatum[0].concat([lowestX, lowestY]), plotDatum[1]);
        }
        // Ensure that the axis line is always the middle!
        updateExtent(chart, "y", [-.1]);
    };
    bar_f.co_kwargs = true;
    mod.bar = new Sk.builtin.func(bar_f);

    let boxplot_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("boxplot", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let plotData = Sk.ffi.remapToJs(args[0]);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let chart = getChart();
        let dataSorted = plotData.sort(d3.ascending);
        let q1 = d3.quantile(dataSorted, .25);
        let median = d3.quantile(dataSorted, .5);
        let q3 = d3.quantile(dataSorted, .75);
        let interQuantileRange = q3 - q1;
        let min = d3.min(plotData);
        let max = d3.max(plotData);
        let data = {x: chart.plots.length+1, y: [min, q1, median, q3, max]};
        let style = parseFormat(null, chart, kwargs, "", "");
        let plot = makePlot("boxplot", data, style, label);
        chart.plots.push(plot);
        console.log(plot);
        updateExtent(chart, "x", [data.x-1, data.x, data.x+1]); // Account for width
        updateExtent(chart, "y", data.y);
        updateExtent(chart, "y", [-.1]);
        updateTickEstimates(chart, [data.x-1, data.x+1], data.y);
    };
    boxplot_f.co_kwargs = true;
    mod.boxplot = new Sk.builtin.func(boxplot_f);

    function getLinesData(args) {
        args = args.slice(0, 3).map(Sk.ffi.remapToJs);
        let length = d3.max(args.filter(Array.isArray).map(a => a.length)) || 1;
        args = args.map(a => Array.isArray(a) ? a : Array(length).fill(a));
        return d3.zip(args[0], args[1], args[2]);
    }

    let hlines_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("hlines", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let data = getKeywordParameter(kwargs, STRING_DATA, null);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let colors = getKeywordParameter(kwargs, STRING_COLORS, null);
        let linestyles = getKeywordParameter(kwargs, STRING_LINESTYLES, null);

        let plotData = getLinesData(args);

        let chart = getChart();
        let style = parseFormat(null, chart, kwargs, "", "");
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let zippedData = {x1: plotDatum[1], x2: plotDatum[2], y1: plotDatum[0], y2: plotDatum[0]};
            let plot = makePlot("one_line", zippedData, style, label);
            plot.color = Array.isArray(colors) ? colors[i] : plot.color;
            plot.linestyle = linestyles === null ? plot.linestyle : linestyles;
            chart.plots.push(plot);
            updateExtent(chart, "x", [zippedData.x1, zippedData.x2]); // Account for width
            updateExtent(chart, "y", [zippedData.y1, zippedData.y2]);
            updateTickEstimates(chart, [zippedData.x1, zippedData.x2], [zippedData.y1, zippedData.y2]);
        }
    };
    hlines_f.co_kwargs = true;
    mod.hlines = new Sk.builtin.func(hlines_f);

    let vlines_f = function (kwa) {
        // Parse arguments
        Sk.builtin.pyCheckArgs("vlines", arguments, 1, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let data = getKeywordParameter(kwargs, STRING_DATA, null);
        let label = getKeywordParameter(kwargs, STRING_LABEL, null);
        let colors = getKeywordParameter(kwargs, STRING_COLORS, null);
        let linestyles = getKeywordParameter(kwargs, STRING_LINESTYLES, null);

        let plotData = getLinesData(args);

        let chart = getChart();
        let style = parseFormat(null, chart, kwargs, "", "");
        for (let i=0; i<plotData.length; i+= 1) {
            let plotDatum = plotData[i];
            let zippedData = {x1: plotDatum[0], x2: plotDatum[0], y1: plotDatum[1], y2: plotDatum[2]};
            let plot = makePlot("one_line", zippedData, style, label);
            plot.color = Array.isArray(colors) ? colors[i] : plot.color;
            plot.linestyle = linestyles === null ? plot.linestyle : linestyles;
            chart.plots.push(plot);
            updateExtent(chart, "x", [zippedData.x1, zippedData.x2]); // Account for width
            updateExtent(chart, "y", [zippedData.y1, zippedData.y2]);
            updateTickEstimates(chart, [zippedData.x1, zippedData.x2], [zippedData.y1, zippedData.y2]);
        }
    };
    vlines_f.co_kwargs = true;
    mod.vlines = new Sk.builtin.func(vlines_f);

    function getRotation(chart, dimension) {
        let amount = chart.ticks[dimension+"Rotate"];
        switch (amount) {
            case "horizontal": return "rotate(0)";
            case "vertical": return "rotate(275)";
            default: return "rotate("+(-amount)+")";
        }
    }

    function attachCanvasToChart(chart, yAxisBuffer) {
        let outputTarget = Sk.console.plot(chart);
        chart.svg = d3.select(outputTarget.html[0]).append("div").append("svg");
        chart.svg.attr("class", "chart");
        chart.svg.attr("width", Sk.console.getWidth());
        chart.svg.attr("height", Sk.console.getHeight());
        chart.svg.attr("chartCount", chart.idNumber);

        let translation = "translate(" + (chart.margin.left + yAxisBuffer) + "," + chart.margin.top + ")";
        chart.canvas = chart.svg.append("g")
            .attr("transform", translation);
        // X-axis
        chart.canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.xAxis);
        // Y-axis
        chart.canvas.append("g")
            .attr("class", "y axis")
            .call(chart.yAxis);
        // X-axis ticks
        let xticks = chart.canvas.select(".x.axis")
            .selectAll("text")
            .style("font-size", "12px");
        if (chart.ticks.xRotate !== "horizontal") {
            xticks.style("text-anchor", "end").attr("transform", getRotation(chart, "x"));
        }
        // Y-axis ticks
        let yticks = chart.canvas.select(".y.axis")
            .selectAll("text")
            .style("font-size", "12px");
            //.style("text-anchor", "start")
        if (chart.ticks.yRotate !== "horizontal") {
            yticks.attr("transform", getRotation(chart, "y"));
        }

        translation = "translate(" + ((chart.width - yAxisBuffer) / 2) + " ," + (chart.height + chart.margin.bottom - 14) + ")";
        // X-axis label
        chart.canvas.append("text")      // text label for the x axis
            .attr("transform", translation)
            .attr("class", "x-axis-label")
            .style("font-size", "14px")
            .text(chart.labels["x-axis"])
            .style("text-anchor", "middle");
        // Y-axis label
        chart.canvas.append("text")
            .attr("transform", "rotate(-90)")
            .attr("class", "y-axis-label")
            .attr("y", 0 - chart.margin.left - yAxisBuffer)
            .attr("x", 0 - (chart.height / 2))
            .attr("dy", "1em")
            .text(chart.labels["y-axis"])
            .style("font-size", "14px")
            .style("text-anchor", "middle");
        // Title text
        chart.canvas.append("text")
            .attr("x", ((chart.width - yAxisBuffer) / 2))
            .attr("y", 0 - (chart.margin.top / 2))
            .attr("class", "title-text")
            .text(chart.labels["title"])
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("text-decoration", "underline");
        // Hidden watermark
        chart.canvas.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .text("BlockPy")
            .style("stroke", "#FDFDFD")
            .style("font-size", "8px");
        // Additional CSS
        chart.svg.insert("defs", ":first-child")
            .append("style")
            .attr("type", "text/css")
            .text("svg { background-color: white; }\n" +
                ".axis path,.axis line { fill: none; stroke: black; shape-rendering: crispEdges;}\n" +
                ".line { fill: none; stroke-width: 1px;}\n" +
                ".circle { r: 3; shape-rendering: crispEdges; }\n" +
                ".bar { shape-rendering: crispEdges;}\n");
        return chart;
    }

    function getDigits(value) {
        return value.toLocaleString().length;
    }

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    function makeHistogram(plot) {
        let domain = d3.extent(plot.data);
        // Adjust bin sizes to capture last group properly
        if (Array.isArray(plot.bins)) {
            domain[1] += 1;
            plot.bins[plot.bins.length-1] += 1;
        }
        let histogram = d3.histogram().domain(domain);
        if (plot.bins) {
            histogram = histogram.thresholds(plot.bins);
        }
        let result = histogram(plot.data);
        // Unadjust bin sizes
        if (Array.isArray(plot.bins)) {
            result[result.length - 1].x1 -= 1;
        }
        return result;
    }

    function finalizeHistogram(chart) {
        if (!chart.plots.some(plot => plot.type === "hist")) {
            return false;
        }
        let yMax = 0;
        for (let i = 0; i < chart.plots.length; i += 1) {
            let plot = chart.plots[i];
            if (plot.type !== "hist") {
                continue;
            }
            let histogram = makeHistogram(plot);
            yMax = Math.max(yMax, d3.max(histogram, (d) => d.length));
        }
        chart.extents.yMax = Math.max(yMax, chart.extents.yMax);
        return true;
    }

    function setupXScale(chart, yAxisBuffer) {
        // Calculate an appropriate offset based on the width of the numbers on the axis
        // Set up x-scaling
        chart.xScale = d3.scaleLinear()
            .domain([chart.extents.xMin, chart.extents.xMax])
            .range([0, chart.width - yAxisBuffer]);
        // Set up x-axis
        chart.xAxis = d3.axisBottom()
            .scale(chart.xScale);
        // Choose a smaller number of ticks if few discrete points
        if (chart.ticks.xEstimate.size < 10) {
            console.log(chart.ticks.xEstimate.size);
            chart.xAxis.ticks(chart.ticks.xEstimate.size);
        }
        // If necessary, add in X ticks
        if (!isEmpty(chart.ticks.x)) {
            chart.xAxis = chart.xAxis.ticks().tickFormat(function (d) {
                return chart.ticks.x[d];
            });
        }
    }

    function setupYScale(chart) {
        chart.yScale = d3.scaleLinear()
            .domain([chart.extents.yMin, chart.extents.yMax])
            .range([chart.height, 0]);
        chart.yAxis = d3.axisLeft()
            .scale(chart.yScale);
        // Choose a smaller number of ticks if few discrete points
        if (chart.ticks.yEstimate.size < 10) {
            chart.yAxis.ticks(chart.ticks.yEstimate.size);
        }
        // If necessary, add in Y ticks
        if (!isEmpty(chart.ticks.y)) {
            chart.yAxis = chart.yAxis.ticks().tickFormat(function (d) {
                return chart.ticks.y[d];
            });
        }
    }

    function finalizeChart(chart) {
        let doctype = "<?xml version=\"1.0\" standalone=\"no\"?>" + "<" + "!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
        let xml = new XMLSerializer().serializeToString(chart.svg.node());
        let blob = new Blob([doctype + xml], {type: "image/svg+xml"});
        let url = window.URL.createObjectURL(blob);
        //var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
        let anchor = document.createElement("a");
        let img = document.createElement("img");
        img.style.display = "block";
        let oldChart = chart;
        let filename = chart.labels.title;
        resetChart();
        //outputTarget.html[0].appendChild(img);
        // TODO: Consider using the SVG as the actual image, and using this as the href
        //       surrounding it instead.
        oldChart.svg.node().parentNode.replaceChild(anchor, oldChart.svg.node());
        img.onload = function () {
            img.onload = null;
            //TODO: Make this capture a class descendant. Cross the D3/Jquery barrier!
            let canvas = document.createElement("canvas");
            canvas.width = Sk.console.getWidth();
            canvas.height = Sk.console.getHeight();
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            let canvasUrl = canvas.toDataURL("image/png");
            img.setAttribute("src", canvasUrl);
            img.setAttribute("title", "Generated plot titled: " + filename);
            img.setAttribute("alt", "Generated plot titled: " + filename);
            anchor.setAttribute("href", canvasUrl);
            anchor.setAttribute("download", filename);
            // Snip off this chart, we can now start a new one.
        };
        img.onerror = function (e) {
            console.error(e);
        };
        img.setAttribute("src", url);
        anchor.appendChild(img);
    }

    const DEFAULT_MARKER_SIZE = 2;

    let show_f = function () {
        let chart = getChart();

        // Sanity checks
        if (chart.plots.length === 0) {
            return;
        }
        if (chart.extents.xMin === undefined || chart.extents.yMin === undefined) {
            return;
        }

        // Establish x/y scalers and axes
        let yAxisBuffer = 5 * Math.max(getDigits(chart.extents.xMin), getDigits(chart.extents.xMax),
                                       getDigits(chart.extents.yMin), getDigits(chart.extents.yMin));
        setupXScale(chart, yAxisBuffer);
        finalizeHistogram(chart);
        setupYScale(chart);

        chart.mapX = d => chart.xScale(d.x);
        chart.mapY = d => chart.yScale(d.y);
        chart.mapLine = d3.line().x(chart.mapX).y(chart.mapY);
        attachCanvasToChart(chart, yAxisBuffer);

        // Actually draw the chart objects
        for (let i = 0; i < chart.plots.length; i += 1) {
            let plot = chart.plots[i];
            switch (plot.type) {
                case "line":
                    chart.canvas.append("path")
                        .style("fill", "none")
                        .style("stroke", plot.style.color)
                        .style("stroke-width", plot.style["linewidth"])
                        .style("fill-opacity", plot.style["alpha"])
                        .attr("class", "line")
                        //.data(plot.data)
                        .attr("d", chart.mapLine(plot.data));
                    break;
                case "one_line":
                    chart.canvas.append("line")
                        .style("stroke", plot.style.color)
                        .style("stroke-width", plot.style["linewidth"])
                        .style("fill-opacity", plot.style["alpha"])
                        .attr("x1", chart.xScale(plot.data.x1))
                        .attr("x2", chart.xScale(plot.data.x2))
                        .attr("y1", chart.yScale(plot.data.y1) )
                        .attr("y2", chart.yScale(plot.data.y2) );
                    break;
                case "scatter":
                    chart.canvas.append("g")
                        .attr("class", "series")
                        .selectAll(".point")
                        .data(plot.data)
                        // Entering
                        .enter()
                        .append("circle")
                        .style("fill", (d, i) => {
                            if (plot.colors == null) {
                                return plot.style.color;
                            } else if (Array.isArray(plot.colors)) {
                                return plot.colors[i] || plot.style.color;
                            } else {
                                return plot.colors;
                            }
                        })
                        .style("fill-opacity", plot.style["alpha"])
                        .attr("class", "circle")
                        .attr("cx", chart.mapX)
                        .attr("cy", chart.mapY)
                        .attr("r", (d, i) => {
                            if (plot.sizes == null) {
                                return DEFAULT_MARKER_SIZE;
                            } else if (Array.isArray(plot.sizes)) {
                                return plot.sizes[i] || DEFAULT_MARKER_SIZE;
                            } else {
                                return plot.sizes;
                            }
                        });
                    break;
                case "hist":
                    let histogram = makeHistogram(plot);
                    chart.canvas.selectAll(".bar")
                        .data(histogram)
                        // Enter
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .style("fill", plot["style"]["color"])
                        .style("stroke", "black")
                        .attr("x", function (d) {
                            // TODO: Handle align
                            return chart.xScale(d.x0);
                        })
                        .attr("width", (d) => chart.xScale(d.x1) - chart.xScale(d.x0))
                        .attr("y", function (d) {
                            return chart.yScale(d.length);
                        })
                        .attr("height", function (d) {
                            return chart.height - chart.yScale(d.length);
                        });
                    break;
                case "bar":
                    chart.canvas.selectAll(".bar")
                        .data(plot.data)
                        // Enter
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .style("fill", plot["style"]["color"])
                        .style("stroke", "black")
                        .attr("x", function (d) {
                            let increment = (plot.align === "center" ? plot.width/2 : 0);
                            return chart.xScale(d.x-increment);
                        })
                        .attr("width", function (d) {
                            return chart.xScale(d.x+plot.width) - chart.xScale(d.x);
                        })
                        .attr("y", chart.mapY)
                        .attr("height", function (d) {
                            return chart.height - chart.yScale(d.y);
                        });
                    break;
                case "boxplot":
                    const WIDTH = .6;
                    chart.canvas.append("line")
                        .attr("x1", chart.xScale(plot.data.x))
                        .attr("x2", chart.xScale(plot.data.x))
                        .attr("y1", chart.yScale(plot.data.y[0]) )
                        .attr("y2", chart.yScale(plot.data.y[1]) )
                        .attr("stroke", "black");
                    chart.canvas.append("line")
                        .attr("x1", chart.xScale(plot.data.x))
                        .attr("x2", chart.xScale(plot.data.x))
                        .attr("y1", chart.yScale(plot.data.y[3]) )
                        .attr("y2", chart.yScale(plot.data.y[4]) )
                        .attr("stroke", "black");
                    chart.canvas.append("rect")
                        .attr("x", chart.xScale(plot.data.x-WIDTH/2))
                        .attr("y", chart.yScale(plot.data.y[3]) )
                        .attr("height", (chart.yScale(plot.data.y[1])-chart.yScale(plot.data.y[3])))
                        .attr("width", chart.xScale(WIDTH) )
                        .attr("stroke", "black")
                        .style("fill", "none");
                    chart.canvas.selectAll(".boxplot")
                        .data([plot.data.y[0], plot.data.y[2], plot.data.y[4]])
                        .enter()
                        .append("line")
                        .attr("x1", chart.xScale(plot.data.x-WIDTH/2))
                        .attr("x2", chart.xScale(plot.data.x+WIDTH/2))
                        .attr("y1", chart.yScale )
                        .attr("y2", chart.yScale )
                        .attr("class", "boxplot")
                        .attr("stroke", "black");
                    break;
            }
        }
        ////////////////////////////////////////////////////////////////////

        finalizeChart(chart);
    };
    mod.show = new Sk.builtin.func(show_f);

    let title_f = function (s) {
        Sk.builtin.pyCheckArgs("title", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for title; should be a string.");
        }

        getChart().labels["title"] = Sk.ffi.remapToJs(s);
    };
    mod.title = new Sk.builtin.func(title_f);

    let xlabel_f = function (s) {
        Sk.builtin.pyCheckArgs("xlabel", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for xlabel; should be a string.");
        }
        getChart().labels["x-axis"] = Sk.ffi.remapToJs(s);
    };
    mod.xlabel = new Sk.builtin.func(xlabel_f);

    let ylabel_f = function (s) {
        Sk.builtin.pyCheckArgs("ylabel", arguments, 1, 1);

        if (!Sk.builtin.checkString(s)) {
            throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(s) +
                "' is not supported for ylabel; should be a string.");
        }
        getChart().labels["y-axis"] = Sk.ffi.remapToJs(s);
    };
    mod.ylabel = new Sk.builtin.func(ylabel_f);

    let xticks_f = function (kwa) {
        Sk.builtin.pyCheckArgs("xticks", arguments, 0, Infinity, true, false);
        let args = Array.prototype.slice.call(arguments, 1);
        let kwargs = new Sk.builtins.dict(kwa); // Get argument as object

        let rotation = getKeywordParameter(kwargs, STRING_ROTATION, "horizontal");

        let chart = getChart();
        if (args.length === 1) {
            chart.ticks.x = {};
            for (let i=0; i<args[0].length;i+= 1) {
                chart.ticks.x[i] = i;
            }
        } else if (args.length === 2) {
            chart.ticks.x = {};
            for (let i=0; i<args[0].length;i+= 1) {
                chart.ticks.x[i] = args[2][i];
            }
        }
        chart.ticks.xRotate = rotation;
    };
    xticks_f.co_kwargs = true;
    mod.xticks = new Sk.builtin.func(xticks_f);

    // Clear the current figure
    let clf_f = function () {
        resetChart();
    };
    mod.clf = new Sk.builtin.func(clf_f);

    const UNSUPPORTED = ["semilogx", "semilogy", "specgram", "stackplot", "stem", "step", "streamplot",
                         "tricontour", "tricontourf", "tripcolor", "triplot", "xcorr", "barbs",
                         "cla", "grid", "table", "text", "annotate", "ticklabel_format", "locator_params",
                         "tick_params", "margins", "autoscale", "autumn", "cool", "copper", "flag", "gray",
                         "hot", "hsv", "jet", "pink", "prism", "spring", "summer", "winter", "spectral",
                         "loglog", "magnitude_spectrum", "pcolor", "pcolormesh", "phase_spectrum",
                         "pie", "plot_date", "psd", "quiver", "quiverkey", "findobj", "switch_backend",
                         "isinteractive", "ioff", "ion", "pause", "rc", "rc_context", "rcdefaults",
                         "gci", "sci", "xkcd", "figure", "gcf", "get_fignums", "get_figlabels",
                         "get_current_fig_manager", "connect", "disconnect", "close", "savefig",
                         "ginput", "waitforbuttonpress", "figtext", "suptitle", "figimage", "figlegend",
                         "hold", "ishold", "over", "delaxes", "sca", "gca", "subplot", "subplots",
                         "subplot2grid", "twinx", "twiny", "subplots_adjust", "subplot_tool",
                         "tight_layout", "box", "xlim", "ylim", "xscale", "yscale", "yticks",
                         "minorticks_on", "minorticks_off", "rgrids", "thetagrids", "plotting", "get_plot_commands",
                         "colors", "colormaps", "_setup_pyplot_info_docstrings", "colorbar", "clim", "set_cmap",
                         "imread", "imsave", "matshow", "polar", "plotfile", "_autogen_docstring", "acorr",
                         "arrow", "axhline", "axhspan", "axvline", "axvspan",, "broken_barh", "cohere",
                         "clabel", "contour", "contourf", "csd", "errorbar", "eventplot", "fill", "fill_between",
                         "fill_betweenx", "hexbin", "hist2d", "axis"];

    for (let i = 0; i < UNSUPPORTED.length; i += 1) {
        mod[UNSUPPORTED[i]] = new Sk.builtin.func(function () {
            throw new Sk.builtin.NotImplementedError(UNSUPPORTED[i] + " is not yet implemented");
        });
    }

    let legend_f = function () {
        return Sk.builtin.none.none$;
    };
    mod.legend = new Sk.builtin.func(legend_f);


    return mod;
};

//TODO: Make font size controllable
Sk.jsplotlib.rc = {
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

Sk.jsplotlib._line_counter = 0;

/** List of all supported line styles **/
Sk.jsplotlib.lineStyles = {
    "-": "_draw_solid",
    "--": "_draw_dashed",
    "-.": "_draw_dash_dot",
    ":": "_draw_dotted",
    "None": "_draw_nothing",
    " ": "_draw_nothing",
    "": "_draw_nothing",
};

Sk.jsplotlib.lineMarkers = {
    ".": "point",
    ",": "pixel",
    "o": "circle",
    "v": "triangle_down",
    "^": "triangle_up",
    "<": "triangle_left",
    ">": "triangle_right",
    "1": "tri_down",
    "2": "tri_up",
    "3": "tri_left",
    "4": "tri_right",
    "8": "octagon",
    "s": "square",
    "p": "pentagon",
    "*": "star",
    "h": "hexagon1",
    "H": "hexagon2",
    "+": "plus",
    "x": "x",
    "D": "diamond",
    "d": "thin_diamond",
    "|": "vline",
    "_": "hline",
    //TICKLEFT: 'tickleft',
    //TICKRIGHT: 'tickright',
    //TICKUP: 'tickup',
    //TICKDOWN: 'tickdown',
    //CARETLEFT: 'caretleft',
    //CARETRIGHT: 'caretright',
    //CARETUP: 'caretup',
    //CARETDOWN: 'caretdown',
    "None": "nothing",
    //Sk.builtin.none.none$: 'nothing',
    " ": "nothing",
    "": "nothing"
};

/**
 Color short keys
 **/
Sk.jsplotlib.colors = {
    "b": "blue",
    "g": "green",
    "r": "red",
    "c": "cyan",
    "m": "magenta",
    "y": "yellow",
    "k": "black",
    "w": "white"
};

/**
 Mapping of all possible CSS colors, that are supported by matplotlib
 **/
Sk.jsplotlib.cnames = {
    "aliceblue": "#F0F8FF",
    "antiquewhite": "#FAEBD7",
    "aqua": "#00FFFF",
    "aquamarine": "#7FFFD4",
    "azure": "#F0FFFF",
    "beige": "#F5F5DC",
    "bisque": "#FFE4C4",
    "black": "#000000",
    "blanchedalmond": "#FFEBCD",
    "blue": "#0000FF",
    "blueviolet": "#8A2BE2",
    "brown": "#A52A2A",
    "burlywood": "#DEB887",
    "cadetblue": "#5F9EA0",
    "chartreuse": "#7FFF00",
    "chocolate": "#D2691E",
    "coral": "#FF7F50",
    "cornflowerblue": "#6495ED",
    "cornsilk": "#FFF8DC",
    "crimson": "#DC143C",
    "cyan": "#00FFFF",
    "darkblue": "#00008B",
    "darkcyan": "#008B8B",
    "darkgoldenrod": "#B8860B",
    "darkgray": "#A9A9A9",
    "darkgreen": "#006400",
    "darkkhaki": "#BDB76B",
    "darkmagenta": "#8B008B",
    "darkolivegreen": "#556B2F",
    "darkorange": "#FF8C00",
    "darkorchid": "#9932CC",
    "darkred": "#8B0000",
    "darksage": "#598556",
    "darksalmon": "#E9967A",
    "darkseagreen": "#8FBC8F",
    "darkslateblue": "#483D8B",
    "darkslategray": "#2F4F4F",
    "darkturquoise": "#00CED1",
    "darkviolet": "#9400D3",
    "deeppink": "#FF1493",
    "deepskyblue": "#00BFFF",
    "dimgray": "#696969",
    "dodgerblue": "#1E90FF",
    "firebrick": "#B22222",
    "floralwhite": "#FFFAF0",
    "forestgreen": "#228B22",
    "fuchsia": "#FF00FF",
    "gainsboro": "#DCDCDC",
    "ghostwhite": "#F8F8FF",
    "gold": "#FFD700",
    "goldenrod": "#DAA520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#ADFF2F",
    "honeydew": "#F0FFF0",
    "hotpink": "#FF69B4",
    "indianred": "#CD5C5C",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "lavenderblush": "#FFF0F5",
    "lawngreen": "#7CFC00",
    "lemonchiffon": "#FFFACD",
    "lightblue": "#ADD8E6",
    "lightcoral": "#F08080",
    "lightcyan": "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgreen": "#90EE90",
    "lightgray": "#D3D3D3",
    "lightpink": "#FFB6C1",
    "lightsage": "#BCECAC",
    "lightsalmon": "#FFA07A",
    "lightseagreen": "#20B2AA",
    "lightskyblue": "#87CEFA",
    "lightslategray": "#778899",
    "lightsteelblue": "#B0C4DE",
    "lightyellow": "#FFFFE0",
    "lime": "#00FF00",
    "limegreen": "#32CD32",
    "linen": "#FAF0E6",
    "magenta": "#FF00FF",
    "maroon": "#800000",
    "mediumaquamarine": "#66CDAA",
    "mediumblue": "#0000CD",
    "mediumorchid": "#BA55D3",
    "mediumpurple": "#9370DB",
    "mediumseagreen": "#3CB371",
    "mediumslateblue": "#7B68EE",
    "mediumspringgreen": "#00FA9A",
    "mediumturquoise": "#48D1CC",
    "mediumvioletred": "#C71585",
    "midnightblue": "#191970",
    "mintcream": "#F5FFFA",
    "mistyrose": "#FFE4E1",
    "moccasin": "#FFE4B5",
    "navajowhite": "#FFDEAD",
    "navy": "#000080",
    "oldlace": "#FDF5E6",
    "olive": "#808000",
    "olivedrab": "#6B8E23",
    "orange": "#FFA500",
    "orangered": "#FF4500",
    "orchid": "#DA70D6",
    "palegoldenrod": "#EEE8AA",
    "palegreen": "#98FB98",
    "paleturquoise": "#AFEEEE",
    "palevioletred": "#DB7093",
    "papayawhip": "#FFEFD5",
    "peachpuff": "#FFDAB9",
    "peru": "#CD853F",
    "pink": "#FFC0CB",
    "plum": "#DDA0DD",
    "powderblue": "#B0E0E6",
    "purple": "#800080",
    "red": "#FF0000",
    "rosybrown": "#BC8F8F",
    "royalblue": "#4169E1",
    "saddlebrown": "#8B4513",
    "salmon": "#FA8072",
    "sage": "#87AE73",
    "sandybrown": "#FAA460",
    "seagreen": "#2E8B57",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "silver": "#C0C0C0",
    "skyblue": "#87CEEB",
    "slateblue": "#6A5ACD",
    "slategray": "#708090",
    "snow": "#FFFAFA",
    "springgreen": "#00FF7F",
    "steelblue": "#4682B4",
    "tan": "#D2B48C",
    "teal": "#008080",
    "thistle": "#D8BFD8",
    "tomato": "#FF6347",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "wheat": "#F5DEB3",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "yellow": "#FFFF00",
    "yellowgreen": "#9ACD32"
};

Sk.jsplotlib.color_to_hex = function (color) {
    // is color a shortcut?
    if (Sk.jsplotlib.colors[color]) {
        color = Sk.jsplotlib.colors[color];
    }

    // is inside cnames array?
    if (Sk.jsplotlib.cnames[color]) {
        return Sk.jsplotlib.cnames[color];
    }

    // check if it is already a hex value
    if (typeof color == "string") {
        var match = color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
        if (match && match.length === 1) {
            return match[0];
        }
    }

    // add rgb colors here
    if (Array.isArray(color) && color.length === 3) {
        return Sk.jsplotlib.rgb2hex(color);
    }

    // back to default
    return Sk.jsplotlib.cnames[Sk.jsplotlib.rc["lines.color"]];
};

Sk.jsplotlib.get_color = function (cs) {
    return Sk.jsplotlib.colors[cs] ? Sk.jsplotlib.colors[cs] : Sk.jsplotlib.colors.b;
};

Sk.jsplotlib.parse_marker = function (style) {
    if (!style) {
        return "x";
    }
    switch (style) {
        case ".":
            return ".";
        case ",":
            return "x";
        case "o":
            return "o";
        case "v":
            return "x";
        case "^":
            return "x";
        case "<":
            return "x";
        case ">":
            return "x";
        case "1":
            return "x";
        case "2":
            return "x";
        case "3":
            return "x";
        case "4":
            return "x";
        case "s":
            return "s";
        case "p":
            return "x";
        case "*":
            return "x";
        case "h":
            return "x";
        case "H":
            return "x";
        case "+":
            return "x";
        case "x":
            return "x";
        case "D":
            return "x";
        case "d":
            return "x";
        case "|":
            return "x";
        case "_":
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
Sk.jsplotlib._process_plot_format = function (fmt) {
    var linestyle = null;
    var marker = null;
    var color = null;

    // Is fmt just a colorspec
    try {
        color = Sk.jsplotlib.to_rgb(fmt);
        if (color) {
            return {
                "linestyle": linestyle,
                "marker": marker,
                "color": color
            };
        }
    } catch (e) {
    }

    // handle the multi char special cases and strip them for the string
    if (fmt.search(/--/) >= 0) {
        linestyle = "--";
        fmt = fmt.replace(/--/, "");
    }
    if (fmt.search(/-\./) >= 0) {
        linestyle = "-.";
        fmt = fmt.replace(/-\./, "");
    }
    if (fmt.search(/ /) >= 0) {
        linestyle = "";
        fmt = fmt.replace(/ /, "");
    }

    var i;
    for (i = 0; i < fmt.length; i++) {
        var c = fmt.charAt(i);
        if (Sk.jsplotlib.lineStyles[c]) {
            if (linestyle) {
                throw new Sk.builtin.ValueError("Illegal format string \"" + fmt +
                    "\"; two linestyle symbols");
            }
            linestyle = c;
        } else if (Sk.jsplotlib.lineMarkers[c]) {
            if (marker) {
                throw new Sk.builtin.ValueError("Illegal format string \"" + fmt +
                    "\"; two marker symbols");
            }
            marker = c;
        } else if (Sk.jsplotlib.colors[c]) {
            if (color) {
                throw new Sk.builtin.ValueError("Illegal format string \"" + fmt +
                    "\"; two color symbols");
            }
            color = c;
        } else {
            throw new Sk.builtin.ValueError("Unrecognized character " + c +
                " in format string");
        }
    }

    if (!linestyle && !marker) {
        // use defaults --> rcParams['lines.linestyle']
        linestyle = "-";
    }
    if (!linestyle) {
        linestyle = " ";
    }
    if (!marker) {
        marker = "";
    }

    return {
        "linestyle": linestyle,
        "marker": marker,
        "color": color
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
Sk.jsplotlib.to_rgb = function (fmt) {
    if (!fmt) {
        return null;
    }

    var color = null;

    if (typeof fmt == "string") {
        let fmt_lower = fmt.toLowerCase();

        if (Sk.jsplotlib.colors[fmt_lower]) {
            return Sk.jsplotlib.hex2color(Sk.jsplotlib.cnames[Sk.jsplotlib.colors[fmt_lower]]);
        }

        // is inside cnames array?
        if (Sk.jsplotlib.cnames[fmt_lower]) {
            return Sk.jsplotlib.hex2color(Sk.jsplotlib.cnames[fmt_lower]);
        }

        if (fmt_lower.indexOf("#") === 0) {
            return Sk.jsplotlib.hex2color(fmt_lower);
        }

        // is it simple grey shade?
        var fl = parseFloat(fmt_lower);
        if (isNaN(fl)) {
            throw new Sk.builtin.ValueError("cannot convert argument to rgb sequence");
        }

        if (fl < 0 || fl > 1) {
            throw new Sk.builtin.ValueError("gray (string) must be in range 0-1");
        }

        return [fl, fl, fl];
    }

    // check if its a color tuple [r,g,b, [a]] with values from [0-1]
    if (Array.isArray(fmt)) {
        if (fmt.length > 4 || fmt.length < 3) {
            throw new Sk.builtin.ValueError("sequence length is " + fmt.length +
                "; must be 3 or 4");
        }

        color = fmt.slice(0, 3);
        var i;

        for (i = 0; i < 3; i++) {
            var fl_rgb = parseFloat(fmt);

            if (fl_rgb < 0 || fl_rgb > 1) {
                throw new Sk.builtin.ValueError(
                    "number in rbg sequence outside 0-1 range");
            }
        }
    }

    return color;
};

/**
 Take a hex string *s* and return the corresponding rgb 3-tuple
 Example: #efefef -> (0.93725, 0.93725, 0.93725)
 **/
Sk.jsplotlib.hex2color = function (s) {
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
        throw new Sk.builtin.ValueError("invalid hex color string \"" + s + "\"");
    }
};

/**
 Expects and rgb tuple with values [0,1]
 **/
Sk.jsplotlib.rgb2hex = function (rgb) {
    if (!rgb) {
        return null;
    }

    if (rgb.length && rgb.length >= 3) {
        var i;
        // some hacky code to rebuild string format :(
        var hex_str = "#";
        for (i = 0; i < 3; i++) {
            var val = Math.round(rgb[i] * 255).toString(16);
            hex_str += val.length == 2 ? val : "0" + val;
        }

        return hex_str;
    }
};
