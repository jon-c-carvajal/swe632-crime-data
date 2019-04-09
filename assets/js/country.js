var multiMode = false;
var selectedNodes = {};

var plotEntries = [{ "key": "aggravated_assault", "display_name": "Aggravated Assault", "color": "indianred" },
{ "key": "homicide", "display_name": "Homicide","color": "dodgerblue" },
{ "key": "rape", "display_name": "Rape","color": "khaki" },
{ "key": "robbery", "display_name": "Robbery","color": "mediumpurple" },];

$("#state-content1").click(function(d){
    var content = $(this);
    if(content.hasClass("expanded")){
        content.removeClass("expanded");
    }else{
        content.addClass("expanded");
    }
});

$(document).keydown(function (event) {
    if (!multiMode && event.which == "17") {
        multiMode = true;
    }
});

$(document).keyup(function () {
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
    .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
    .attr("class", "mesh")
    .attr("d", path);

$('#selection-close').click(function (e) {
    reset();
});

$('#selection-background').click(function (e) {
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
    $('#selection-modal-dialog').animate({ right: '-50%' }, function (){
        $('#state-header').text("");
        $("#state-content1 svg").empty();
    });
    $('#selection-modal').css('pointer-events', 'none');
}

function reset() {
    hideModal();
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
        success: function (result) {
            console.log(result);
            crimeEstimatesPlot(result, stateMap[d.id]);
            showModal();
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
}

function reorderData(outOfOrder) {
    var inOrder = outOfOrder.results.sort(function (a, b){
        if (a["year"] > b["year"]) return 1;
        if (b["year"] > a["year"]) return -1;
        return 0;
      });
    inOrder.forEach(function(obj){
        obj["rape"] = obj["rape_revised"] | obj["rape_legacy"];
    });
    return inOrder;
}

function multiSelectState(nodes, numNodes) {
    //Populate modal with svg
    console.log("in multiSelectState")

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
        success: function (result) {
            console.log(result);
            results[read] = result;
            read = read + 1;
            if (read < numNodes) {
                multiSelectDataRetriever(d, numNodes, results, read);
            } else {
                multiSelectChart(d, numNodes, results, read);
            }
            showModal();
        }
    });
}

function multiSelectChart(nodes, numNodes, results, read) {
    //need to get both sets of data in correct order
    for (var i = 0; i < numNodes; i++) {
        results[i] = reorderData(results[i]);
    }
	console.log(results);
	
	//Jon, use the last variable to get other years, 0 is first year, 1 is second year, etc
	//37 is just a random year where there are enough rape_revised to be visible, see below TODO
	results = singleYearData(results, numNodes, 37);
	console.log(results);

	var groupKey = "state_abbr"; //hardcoding is bad
	var keys = ["aggravated_assault", "homicide", "rape_revised", "robbery"]; //TODO - this only handles rape_revised, not all rapes
	console.log(groupKey);

	//new and improved bar chart
	var margin = ({top: 10, right: 10, bottom: 20, left: 40});
	var height = 550;
	var width = 850;
	
	var y = d3.scaleLinear()
    .domain([0, d3.max(results, d => d3.max(keys, key => d[key]))]).nice()
    .rangeRound([height - margin.bottom, margin.top]);
	
	var color = d3.scaleOrdinal()
    .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"])
	
	var x0 = d3.scaleBand()
    .domain(results.map(d => d[groupKey])) //TODO does this weird function notation work? does the hardcoding work?
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1);
	
	x1 = d3.scaleBand()
    .domain(keys)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);
	
	legend = svg => {
		const g = svg
		  .attr("transform", `translate(${width},0)`)
		  .attr("text-anchor", "end")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll("g")
		.data(color.domain().slice().reverse())
		.join("g")
		  .attr("transform", (d, i) => `translate(0,${i * 20})`);

		g.append("rect")
		  .attr("x", -19)
		  .attr("width", 19)
		  .attr("height", 19)
		  .attr("fill", color);

		g.append("text")
		  .attr("x", -24)
		  .attr("y", 9.5)
		  .attr("dy", "0.35em")
		  .text(d => d);
	};
	
	xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x0).tickSizeOuter(0))
		.call(g => g.select(".domain").remove());
		
	yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y).ticks(null, "s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Number of Crimes"));
	
	//actually make svg
	const barsvg = d3.select("#state-content1").select("svg")
		.attr("width", "100%").attr("height", "100%");
	
	barsvg.append("g")
	.selectAll("g")
	.data(results)
	.join("g")
		.attr("transform", d => `translate(${x0(d[groupKey])},0)`)
	.selectAll("rect")
	.data(d => keys.map(key => ({key, value: d[key]})))
	.join("rect")
		.attr("x", d => x1(d.key))
		.attr("y", d => y(d.value))
		.attr("width", x1.bandwidth())
		.attr("height", d => y(0) - y(d.value))
		.attr("fill", d => color(d.key));

	barsvg.append("g")
		.call(xAxis);

	barsvg.append("g")
		.call(yAxis);

	barsvg.append("g")
		.call(legend);
}

//pos = 0 is earliest year, 1 is next year, etc
function singleYearData(data, numNodes, pos) {
	var results = [];
	for (var i = 0; i < numNodes; i++) {
		results[i] = data[i][pos];
	}
	return results;
}

