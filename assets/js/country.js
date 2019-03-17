var api_key = "yAJchpcn7oDJXIWQQQxNvRAnqwne6Stw3ounmUCW";

var mapSvg = d3.select("#map").select("svg");

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
    if (active.node() === this) return reset();
    
    var stateName = stateMap[d.id]["name"];
	var stateAbbr = stateMap[d.id]["abbr"];
    $('#state-header').text(stateName);
	var chartSvg = d3.select("#state-content").select("svg");
	
	//-------- JLM add a "chart" to modal --------------
	//TODO - why is the svg element stuck at the size it is? 
	//			in inspect element, it has it as 300x150, regardless of what I set it to below. any ideas?
	chartSvg.append("svg")
		.attr("width", 300)
		.attr("height", 300);
	
	var jsonCircles = [
		{ "x_axis": 50, "y_axis": 50, "radius": 20, "color" : "green" },
		{ "x_axis": 75, "y_axis": 75, "radius": 20, "color" : "purple"},
		{ "x_axis": 100, "y_axis": 100, "radius": 20, "color" : "red"},
		{ "x_axis": 125, "y_axis": 125, "radius": 20, "color" : "black"},
		{ "x_axis": 150, "y_axis": 150, "radius": 20, "color" : "blue"},
		{ "x_axis": 150, "y_axis": 50, "radius": 20, "color" : "green" },
		{ "x_axis": 175, "y_axis": 75, "radius": 20, "color" : "purple"},
		{ "x_axis": 200, "y_axis": 100, "radius": 20, "color" : "red"},
		{ "x_axis": 225, "y_axis": 125, "radius": 20, "color" : "black"},
		{ "x_axis": 250, "y_axis": 150, "radius": 20, "color" : "blue"},
		{ "x_axis": 250, "y_axis": 50, "radius": 20, "color" : "green" },
		{ "x_axis": 275, "y_axis": 75, "radius": 20, "color" : "purple"},
		{ "x_axis": 300, "y_axis": 100, "radius": 20, "color" : "red"},
		{ "x_axis": 325, "y_axis": 125, "radius": 20, "color" : "black"},
		{ "x_axis": 350, "y_axis": 150, "radius": 20, "color" : "blue"}];

	var circles = chartSvg.selectAll("circle")
                          .data(jsonCircles)
                          .enter()
                          .append("circle");

	var circleAttributes = circles
                       .attr("cx", function (d) { return d.x_axis; })
                       .attr("cy", function (d) { return d.y_axis; })
                       .attr("r", function (d) { return d.radius; })
                       .style("fill", function(d) { return d.color; });
	//-------- End JLM add a "chart" to modal --------------

    var estimateUrl = "https://api.usa.gov/crime/fbi/sapi/api/estimates/states/" + stateMap[d.id]["abbr"] + "/1990/2018?api_key=" + api_key;

    $.ajax({url: estimateUrl,
        type: 'GET',
        headers: {
            "Content-Type": "application/json",
            "cache-control": "no-cache",
        },
        success: function(result){
            //do things with data
      }});


    active.classed("active", false);
    active = d3.select(this).classed("active", true);

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

   $('#selection-modal-dialog').animate({right:'0%'});
   $('#selection-modal').css('pointer-events', 'all');
}

function reset() {
    $('#selection-modal-dialog').animate({right: '-50%'});
    $('#selection-modal').css('pointer-events', 'none');
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
}