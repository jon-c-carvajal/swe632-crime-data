var multiMode = false;
var selectedNodes = {};

$(document).keydown(function(event) {
    if (!multiMode && event.which == "17") {
        multiMode = true;
    }
});

$(document).keyup(function() {
    multiMode = false;
    console.log(selectedNodes); //Do things
    if (Object.keys(selectedNodes).length == 1) {
        console.log("Single Element Selected");
        var node = selectedNodes[Object.keys(selectedNodes)[0]];
        singleSelectState(node["html"], node["state"]);

        //Can someone explain why we set selectedNodes to {} here? -- Jordan
        selectedNodes = {};
    } else if (Object.keys(selectedNodes).length > 1) {
        console.log("Multi Select deactivated, comparing selected elements");
        //CALL COMPARISON FUNCTION HERE

        console.log(Object.keys(selectedNodes));
        numNodes = Object.keys(selectedNodes).length;
        var nodes = [];
        for (var i = 0; i < numNodes; i++) {
            nodes[i] = selectedNodes[Object.keys(selectedNodes)[i]];
        }
        console.log(nodes)
        console.log("in keyup")
        multiSelectState(nodes, numNodes);

    }
    //Else do nothing
});

var api_key = "yAJchpcn7oDJXIWQQQxNvRAnqwne6Stw3ounmUCW";

var mapSvg = d3.select("#map").select("svg");

var estimates;

var baseWidth = 1920;
var baseHeight = 1080;

var width = $(window).width(),
    height = $(window).height(),
    active = d3.select(null);

mapSvg.attr("width", width);
mapSvg.attr("height", height);

var projection = d3.geoAlbersUsa()
    .scale(1500 * Math.min((width / baseWidth), (height / baseHeight)))
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

mapSvg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = mapSvg.append("g")
    .style("stroke-width", "1.5px");

g.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", "feature")
    .on("click", clicked)
    .on("mouseover", hoveredIn)
    .on("mouseout", hoveredOut);

g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "mesh")
    .attr("d", path);

$('#selection-close').click(function(e) {
    reset();
});

$('#selection-modal').click(function(e) {
    reset();
});

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function hoveredIn(d) {
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div.html(stateMap[d.id]["name"])
        .style("top", ($(this).offset().top) + "px")
        .style("left", ($(this).offset().left + 28) + "px");
}

function hoveredOut(d) {
    div.transition()
        .duration(500)
        .style("opacity", 0);
}

function clicked(d) {
    if (multiMode) {
        if (selectedNodes[d.id]) {
            delete selectedNodes[d.id];
            d3.select(this).classed("active", false);
        } else {
            selectedNodes[d.id] = { "html": this, "state": d };
            d3.select(this).classed("active", true);
        }
    } else {
        singleSelectState(this, d);
    }
}

function showModal() {
    $('#selection-modal-dialog').animate({ right: '0%' });
    $('#selection-modal').css('pointer-events', 'all');
}

function hideModal() {
    $('#selection-modal-dialog').animate({ right: '-50%' });
    $('#selection-modal').css('pointer-events', 'none');
}

function reset() {
    hideModal();
    $('#state-header').text("");
    active.classed("active", false);
    active = d3.select(null);

    for (var key in selectedNodes) {
        d3.select(selectedNodes[key]["html"]).classed("active", false);
    }
    selectedNodes = {};

    g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
}

function singleSelectState(html, d) {
    if (active.node() === html) return reset();

    // var chartSvg1 = d3.select("#state-content1").select("svg");
    // var chartSvg2 = d3.select("#state-content2").select("svg");

    // chartSvg1.attr("width", 500).attr("height", 500);
    // chartSvg2.attr("width", 500).attr("height", 800);

    var stateName = stateMap[d.id]["name"];
    var stateAbbr = stateMap[d.id]["abbr"];
    $('#state-header').text(stateName);
    var estimateUrl = "http://127.0.0.1:7777/https://api.usa.gov/crime/fbi/sapi/api/estimates/states/" + stateMap[d.id]["abbr"] + "/1990/2018?api_key=" + api_key;

    $.ajax({
        url: estimateUrl,
        type: 'GET',
        headers: {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        success: function(result) {
            crimeEstimatesPlot(result, stateMap[d.id]);
        }
    });


    active.classed("active", false);
    active = d3.select(html).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .5 / Math.max(dx / width, dy / height),
        translate = [(width / 2 - scale * x) - width / 4, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    showModal();
}

function crimeEstimatesPlot(result, stateMapInfo) {

    //TODO do we want to move the clear to somewhere else?
    //This clears the chart before drawing a new line
    d3.select("#state-content1").selectAll("svg > *").remove();

    estimates = reorderData(result);

    //putting in line chart
    var margin = { top: 20, right: 20, bottom: 30, left: 85 },
        width = 850 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;



    //not in d3.v3
    //var parseTime = d3.timeParse("%d-%b-%y");
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var lineChartSvg = d3.select("#state-content1").select("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g").attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //create title
    lineChartSvg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        //.style("text-decoration", "underline")  
        .text("Violent Crime Estimates of " + stateMapInfo["name"]);

	//I'm sure theres a better way of doing this
	var hmax = []
    
	hmax[0] = d3.max(estimates, function(d) { return d.aggravated_assault; });
	//hmax[4] = d3.max(estimates, function(d) { return d.arson; });
	//hmax[1] = d3.max(estimates, function(d) { return d.burglary; });
	hmax[1] = d3.max(estimates, function(d) { return d.homicide; });
	//hmax[2] = d3.max(estimates, function(d) { return d.larceny; });
	//hmax[3] = d3.max(estimates, function(d) { return d.motor_vehicle_theft; });
	//hmax[5] = d3.max(estimates, function(d) { return d.property_crime; });
	hmax[2] = d3.max(estimates, function(d) { return d.rape_legacy + d.rape_revised; });
	hmax[3] = d3.max(estimates, function(d) { return d.robbery; });
	
	var dmax = 0;
	for (var i = 0; i < 4; i++) {
		if (hmax[i] > dmax) {
			dmax = hmax[i];
		}
	}
	
    y.domain([0, 1.3*dmax]);
	x.domain(d3.extent(estimates, function(d) { return d.year; }));
	
	
	console.log(estimates);
	//this is for all violent crime
    // var valueline = d3.svg.line()
        // .x(function(d) { return x(d.year); })
        // .y(function(d) { return y(d.violent_crime); });
	// lineChartSvg.append("path")
        // .data([estimates])
        // .attr("class", "line")
        // .attr("d", valueline)
        // .attr("fill", "none")
        // .attr("stroke", "red")
        // .attr("stroke-width", "3px");
	
	var aaLine  = d3.line()
        .x(function(d) { return x(d.year); })
		.y(function(d) { return y(d.aggravated_assault); });
		
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", aaLine)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", "3px");
	
	populateDots(lineChartSvg, estimates, "year", "aggravated_assault", x, y);
	/* var arsonLine  = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.arson); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", arsonLine)
        .attr("fill", "none")
        .attr("stroke", "purple")
        .attr("stroke-width", "3px"); */
	
	/* var burglaryLine  = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.burglary); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", burglaryLine)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", "3px"); */
	
	var homicideLine  = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.homicide); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", homicideLine)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", "3px");
	
	populateDots(lineChartSvg, estimates, "year", "homicide", x, y);
	/* var larcenyLine  = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.larceny); });
	lineChartSvg.append("path")
	.data([estimates])
	.attr("class", "line")
	.attr("d", larcenyLine)
	.attr("fill", "none")
	.attr("stroke", "green")
	.attr("stroke-width", "3px"); */
		
	/* var mvtLine  = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.motor_vehicle_theft); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", mvtLine)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "3px"); */
		
	/* var propertyCrimeLine  = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.property_crime); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", propertyCrimeLine)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", "3px"); */
	
	var rapeLine  = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.rape_legacy + d.rape_revised); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", rapeLine)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", "3px");
	//populateDots(lineChartSvg, estimates, "year", "rape_revised", x, y);

	var robberyLine  = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.robbery); });
	lineChartSvg.append("path")
        .data([estimates])
        .attr("class", "line")
        .attr("d", robberyLine)
        .attr("fill", "none")
        .attr("stroke", "cyan")
        .attr("stroke-width", "3px");
	
	populateDots(lineChartSvg, estimates, "year", "robbery", x, y);
	
    // Add the Axes
    var yAxis = d3.axisLeft()
        .scale(y);

    var xAxis = d3.axisBottom()
        .tickFormat(function(date) {
            return d3.timeFormat('%Y')(new Date(date, 1, 1, 1, 1, 1, 1));
        })
        .scale(x);

    lineChartSvg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    lineChartSvg.append("g")
        .attr("class", "axis y")
        .call(yAxis);

    // text label for the x axis
    lineChartSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    // text label for the y axis
    lineChartSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
		.text("Count");

	}

function populateDots(lineChartSvg, data, x_name, y_name, x, y){
	// create a subselection for our "dots"
    // and on enter append a bunch of circles
    lineChartSvg.selectAll(".dot")
      .data(data, function(d){
		  return d;
		})
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function(d,i){
        return x(d[[x_name]]);
      })
      .attr("cy", function(d){
        return y(d[[y_name]]);
      })
      .attr("fill", function(d){
        return d3.select(this).datum().category;
	  }).on("mouseover", function(d) {		
		div.transition()		
			.duration(50)		
			.style("opacity", .9);		
		div	.html("Year : " + d[[x_name]] + "<br/> Count : " + d[[y_name]])	
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 28) + "px");	
		})					
	.on("mouseout", function(d) {		
		div.transition()		
			.duration(500)		
			.style("opacity", 0);	
	});
}

function reorderData(outOfOrder) {
    var inOrder = [];
    var minYear = d3.min(outOfOrder.results, function(d) { return d.year; });
    console.log(minYear);
    for (var i = 0; i < outOfOrder.results.length; i++) {
        var index = outOfOrder.results.findIndex(function(element) {
            return element.year == minYear + i;
        });
        inOrder[i] = outOfOrder.results[index];
    }
    return inOrder;
}

function multiSelectState(nodes, numNodes) {
    //Populate modal with svg

    console.log("in multiSelectState")
    showModal();

    var d = [];
    var stateAbbrs = [];
    var title = "Comparison of ";
    for (var i = 0; i < numNodes; i++) {
        d[i] = nodes[i]["state"];
        title = title + stateMap[d[i].id]["name"];
        stateAbbrs[i] = stateMap[d[i].id]["abbr"]; //used for making html
        if (i < numNodes - 1) {
            title = title + " and "
        }
    }
    $('#state-header').text(title);


    //Done with setup, get data
    var results = [];
    var read = 0;
    multiSelectDataRetriever(d, numNodes, results, read);

}

//this is a really dumb function, but the only way I could get it to read all the
//data was to call this function sequentially from the success of one to the next
function multiSelectDataRetriever(d, numNodes, results, read) {
    var estimateUrl = "http://127.0.0.1:7777/https://api.usa.gov/crime/fbi/sapi/api/estimates/states/" +
        stateMap[d[read].id]["abbr"] + "/1990/2018?api_key=" + api_key;
    //console.log(estimateUrl);
    $.ajax({
        url: estimateUrl,
        type: 'GET',
        headers: {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        success: function(result) {
            console.log(result);
            results[read] = result;
            read = read + 1;
            if (read < numNodes) {
                multiSelectDataRetriever(d, numNodes, results, read);
            } else {
                multiSelectChart(d, numNodes, results, read);
            }
        }
    });
}

function multiSelectChart(nodes, numNodes, results, read) {
    //need to get both sets of data in correct order
    for (var i = 0; i < numNodes; i++) {
        results[i] = reorderData(results[i]);
    }
    //console.log(results);

    console.log(results[0]);

    d3.select("#state-content1").selectAll("svg > *").remove();

    //putting in line chart
    var margin = { top: 20, right: 20, bottom: 30, left: 70 },
        width = 850 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var lineChartSvg = d3.select("#state-content1").select("svg")
	.attr("width", "100%")
	.attr("height", "100%")
        .append("g").attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //create title
    var title = "Violent Crime Estimates of "
    for (var i = 0; i < numNodes; i++) {
        title = title + stateMap[nodes[i].id]["name"];
        if (i < numNodes - 1) {
            title = title + " and "
        }
    }
    lineChartSvg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        //.style("text-decoration", "underline")  
        .text(title);

    dmax = 0;
    for (var i = 0; i < numNodes; i++) {
        loopmax = d3.max(results[i], function(d) { return d.violent_crime; });
        if (loopmax > dmax) {
            dmax = loopmax;
        }
    }
    y.domain([0, dmax * 1.3]);

    var valueline = [];
    for (var i = 0; i < numNodes; i++) {
        valueline[i] = d3.line()
            .x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.violent_crime); })
			.curve(d3.curveCardinal);
    }

    //works because all our data should have the same years
    x.domain(d3.extent(results[0], function(d) { return d.year; }));

    for (var i = 0; i < numNodes; i++) {
        lineChartSvg.append("path")
            .data([results[i]])
            .attr("class", "line")
            .attr("d", valueline[i])
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", "3px");
    }

    //axes
    var yAxis = d3.axisLeft()
        .scale(y);

    var xAxis = d3.axisBottom()
        .scale(x);

    lineChartSvg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    lineChartSvg.append("g")
        .attr("class", "axis y")
		.call(yAxis);
		
		    // text label for the x axis
    lineChartSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Date");

    // text label for the y axis
    lineChartSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
		.attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
		.text("Count");


		for (var i = 0; i < numNodes; i++) {
		// create a subselection for our "dots"
    // and on enter append a bunch of circles
    lineChartSvg.selectAll(".dot")
      .data(results[i], function(d){
		  return d;
		})
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("cx", function(d,i){
        return x(d.year);
      })
      .attr("cy", function(d){
        return y(d.violent_crime);
      })
      .attr("fill", function(d){
        return d3.select(this).datum().category;
	  }).on("mouseover", function(d) {		
		div.transition()		
			.duration(50)		
			.style("opacity", .9);		
		div	.html("Year : " + d.year + "<br/> Count : " + d.violent_crime)	
			.style("left", (d3.event.pageX) + "px")		
			.style("top", (d3.event.pageY - 28) + "px");	
		})					
	.on("mouseout", function(d) {		
		div.transition()		
			.duration(500)		
			.style("opacity", 0);	
	});
}
	
}