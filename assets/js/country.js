var multiMode = false;
var selectedNodes = {};

$(document).keydown(function (event) {
    if (!multiMode && event.which == "17"){
        multiMode = true;
    }
});

$(document).keyup(function () {
    multiMode = false;
    console.log(selectedNodes);//Do things
    if(Object.keys(selectedNodes).length == 1){
        console.log("Single Element Selected");
        var node = selectedNodes[Object.keys(selectedNodes)[0]];
        singleSelectState(node["html"], node["state"]);
        selectedNodes = {};
    } else if(Object.keys(selectedNodes).length > 1) {
        console.log("Multi Select deactivated, comparing elements");
        //CALL COMPARISON FUNCTION HERE
        multiSelectState();

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

var projection = d3.geo.albersUsa()
    .scale(1500 * Math.min((width / baseWidth), (height / baseHeight)))
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
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
    .on("click", clicked);

g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
    .attr("class", "mesh")
    .attr("d", path);

$('#selection-close').click(function (e) {
    reset();
});

$('#selection-modal').click(function (e) {
    reset();
});

function clicked(d) {
    if (multiMode) {
        if(selectedNodes[d.id]){
            delete selectedNodes[d.id];
            d3.select(this).classed("active", false);
        }else{
            selectedNodes[d.id] = {"html":this, "state":d};
            d3.select(this).classed("active", true);
        }
    } else {
        singleSelectState(this, d);
    }
}

function showModal(){
    $('#selection-modal-dialog').animate({ right: '0%' });
    $('#selection-modal').css('pointer-events', 'all');
}

function hideModal(){
    $('#selection-modal-dialog').animate({ right: '-50%' });
    $('#selection-modal').css('pointer-events', 'none');
}

function reset() {
    hideModal();
    $('#state-header').text("");
    active.classed("active", false);
    active = d3.select(null);

    for(var key in selectedNodes){
        d3.select(selectedNodes[key]["html"]).classed("active", false);
    }
    selectedNodes = {};

    g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
}

function singleSelectState(html, d){
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
            success: function (result) {
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
	var margin = {top: 20, right: 20, bottom: 30, left: 70},
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
	
	
	
	//not in d3.v3
	//var parseTime = d3.timeParse("%d-%b-%y");
	var x = d3.scale.linear().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);
	
	var lineChartSvg = d3.select("#state-content1").select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
	
	dmax = d3.max(estimates, function(d) { return d.violent_crime; });
	console.log(dmax);
	y.domain([0, dmax*1.3]);
	
	var valueline = d3.svg.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.violent_crime); });
	
	x.domain(d3.extent(estimates, function(d) { return d.year; }));
	
	lineChartSvg.append("path")
      .data([estimates])
      .attr("class", "line")
      .attr("d", valueline)
	  .attr("fill","none")
	  .attr("stroke","red")
	  .attr("stroke-width","3px");
	
	// Add the Axes
	var yAxis = d3.svg.axis()
						.orient("left")
						.scale(y);
						
	var xAxis = d3.svg.axis()
						.orient("bottom")
						.scale(x);
	
	lineChartSvg.append("g")
			.attr("class","axis x")
			.attr("transform","translate(0,"+height+")")
			.call(xAxis);
			
	lineChartSvg.append("g")
			.attr("class","axis y")
			.call(yAxis);
}

function reorderData(outOfOrder) {
	var inOrder = [];
	
	var minYear = d3.min(outOfOrder.results, function(d) { return d.year; });
	console.log(minYear);
	for(var i = 0; i < outOfOrder.results.length; i++) {
		var index = outOfOrder.results.findIndex(function(element) {
			return element.year == minYear + i;
		});
		inOrder[i] = outOfOrder.results[index];
	}
	return inOrder;
}

function multiSelectState(){
    //Populate modal with svg
    $('#state-header').text("State Comparison");
    showModal();
}
