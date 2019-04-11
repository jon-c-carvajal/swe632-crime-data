var multiMode = false;
var selectedNodes = {};

$(".state-content").click(function(d){
    $(".state-content").not(this).not(".hidden").hide(150);
    var content = $(this);
    if(content.hasClass("expanded")){
        content.removeClass("expanded");
        $(".state-content").not(this).not(".hidden").show(100);
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
    $(".state-content").removeClass('expanded');
    $('#selection-modal-dialog').animate({ right: '-50%' }, function (){
        $('#state-header').text("");
        $(".state-content").removeClass('hidden');
        $(".state-content").show(250);
        $(".state-content svg").empty();
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

    $("#state-content2").addClass("hidden").hide();
    $("#state-content4").addClass("hidden").hide();
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
        obj["rape"] = obj["rape_revised"] + obj["rape_legacy"];
		obj["aggravated_assaultpc"] = obj["aggravated_assault"] / obj["population"];
		obj["arsonpc"] = obj["arson"] / obj["population"];
		obj["burglarypc"] = obj["burglary"] / obj["population"];
		obj["homicidepc"] = obj["homicide"] / obj["population"];
		obj["larcenypc"] = obj["larceny"] / obj["population"];
		obj["motor_vehicle_theftpc"] = obj["motor_vehicle_theft"] / obj["population"];
		obj["property_crimepc"] = obj["property_crime"] / obj["population"];
		obj["rapepc"] = obj["rape"] / obj["population"];
		obj["robberypc"] = obj["robbery"] / obj["population"];
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
	
	//Jon, use the last variable to get other years, 0 is first year, 1 is second year, etc
	//37 is just a random year where there are enough rape_revised to be visible, see below TODO
	results = singleYearData(results, numNodes, 37);
	console.log(results);

	var groupKey = "state_abbr"; //hardcoding is bad
	var violent_keys = ["aggravated_assault", "homicide", "rape", "robbery"];
	var violentpc_keys = ["aggravated_assaultpc", "homicidepc", "rapepc", "robberypc"];
	var nonviolent_keys = ["arson", "burglary", "larceny", "motor_vehicle_theft", "property_crime"];
	var nonviolentpc_keys = ["arsonpc", "burglarypc", "larcenypc", "motor_vehicle_theftpc", "property_crimepc"];
	//console.log(groupKey);

	var violent_color = d3.scaleOrdinal()
    .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	var violentpc_color = d3.scaleOrdinal()
    .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	var nonviolent_color = d3.scaleOrdinal()
    .range(["#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	var nonviolentpc_color = d3.scaleOrdinal()
    .range(["#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	
	//can reuse these on all charts
	var margin = ({top: 10, right: 10, bottom: 20, left: 40});
	var height = 550;
	var width = 850;
	
	var violent_y = d3.scaleLinear()
    .domain([0, d3.max(results, d => d3.max(violent_keys, key => d[key]))]).nice()
    .rangeRound([height - margin.bottom, margin.top]);
	
	var violent_x0 = d3.scaleBand()
    .domain(results.map(d => d[groupKey]))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1);
	
	violent_x1 = d3.scaleBand()
    .domain(violent_keys)
    .rangeRound([0, violent_x0.bandwidth()])
    .padding(0.05);
	
	violent_legend = svg => {
		const g = svg
		  .attr("transform", `translate(${width},0)`)
		  .attr("text-anchor", "end")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll("g")
		.data(violent_color.domain().slice().reverse())
		.join("g")
		  .attr("transform", (d, i) => `translate(0,${i * 20})`);

		g.append("rect")
		  .attr("x", -19)
		  .attr("width", 19)
		  .attr("height", 19)
		  .attr("fill", violent_color);

		g.append("text")
		  .attr("x", -24)
		  .attr("y", 9.5)
		  .attr("dy", "0.35em")
		  .text(d => d);
	};
	
	violent_xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(violent_x0).tickSizeOuter(0))
		.call(g => g.select(".domain").remove());
		
	violent_yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(violent_y).ticks(null, "s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Number of Crimes"));
	
	//actually make svg
	const violent_barsvg = d3.select("#state-content1").select("svg")
		.attr("width", "100%").attr("height", "100%");
	
	violent_barsvg.append("g")
	.selectAll("g")
	.data(results)
	.join("g")
		.attr("transform", d => `translate(${violent_x0(d[groupKey])},0)`)
	.selectAll("rect")
	.data(d => violent_keys.map(key => ({key, value: d[key]})))
	.join("rect")
		.attr("x", d => violent_x1(d.key))
		.attr("y", d => violent_y(d.value))
		.attr("width", violent_x1.bandwidth())
		.attr("height", d => violent_y(0) - violent_y(d.value))
		.attr("fill", d => violent_color(d.key));

	violent_barsvg.append("g")
		.call(violent_xAxis);

	violent_barsvg.append("g")
		.call(violent_yAxis);

	violent_barsvg.append("g")
		.call(violent_legend);
	
	
	
	
	//do all the same for violent per capita
	var violentpc_y = d3.scaleLinear()
    .domain([0, d3.max(results, d => d3.max(violentpc_keys, key => d[key]))]).nice()
    .rangeRound([height - margin.bottom, margin.top]);
	
	var violentpc_x0 = d3.scaleBand()
    .domain(results.map(d => d[groupKey]))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1);
	
	violentpc_x1 = d3.scaleBand()
    .domain(violentpc_keys)
    .rangeRound([0, violentpc_x0.bandwidth()])
    .padding(0.05);
	
	violentpc_legend = svg => {
		const g = svg
		  .attr("transform", `translate(${width},0)`)
		  .attr("text-anchor", "end")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll("g")
		.data(violentpc_color.domain().slice().reverse())
		.join("g")
		  .attr("transform", (d, i) => `translate(0,${i * 20})`);

		g.append("rect")
		  .attr("x", -19)
		  .attr("width", 19)
		  .attr("height", 19)
		  .attr("fill", violentpc_color);

		g.append("text")
		  .attr("x", -24)
		  .attr("y", 9.5)
		  .attr("dy", "0.35em")
		  .text(d => d);
	};
	
	violentpc_xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(violentpc_x0).tickSizeOuter(0))
		.call(g => g.select(".domain").remove());
		
	violentpc_yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(violentpc_y).ticks(null, "s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Number of Crimes"));
	
	//actually make svg
	const violentpc_barsvg = d3.select("#state-content2").select("svg")
		.attr("width", "100%").attr("height", "100%");
	
	violentpc_barsvg.append("g")
	.selectAll("g")
	.data(results)
	.join("g")
		.attr("transform", d => `translate(${violentpc_x0(d[groupKey])},0)`)
	.selectAll("rect")
	.data(d => violentpc_keys.map(key => ({key, value: d[key]})))
	.join("rect")
		.attr("x", d => violentpc_x1(d.key))
		.attr("y", d => violentpc_y(d.value))
		.attr("width", violentpc_x1.bandwidth())
		.attr("height", d => violentpc_y(0) - violentpc_y(d.value))
		.attr("fill", d => violentpc_color(d.key));

	violentpc_barsvg.append("g")
		.call(violentpc_xAxis);

	violentpc_barsvg.append("g")
		.call(violentpc_yAxis);

	violentpc_barsvg.append("g")
		.call(violentpc_legend);
		
		
		
		
		
	//do all the same for nonviolent chart
	//TODO functionalize this somehow?
	
	var nonviolent_y = d3.scaleLinear()
    .domain([0, d3.max(results, d => d3.max(nonviolent_keys, key => d[key]))]).nice()
    .rangeRound([height - margin.bottom, margin.top]);
	
	var nonviolent_x0 = d3.scaleBand()
    .domain(results.map(d => d[groupKey]))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1);
	
	nonviolent_x1 = d3.scaleBand()
    .domain(nonviolent_keys)
    .rangeRound([0, nonviolent_x0.bandwidth()])
    .padding(0.05);
	
	nonviolent_legend = svg => {
		const g = svg
		  .attr("transform", `translate(${width},0)`)
		  .attr("text-anchor", "end")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll("g")
		.data(nonviolent_color.domain().slice().reverse())
		.join("g")
		  .attr("transform", (d, i) => `translate(0,${i * 20})`);

		g.append("rect")
		  .attr("x", -19)
		  .attr("width", 19)
		  .attr("height", 19)
		  .attr("fill", nonviolent_color);

		g.append("text")
		  .attr("x", -24)
		  .attr("y", 9.5)
		  .attr("dy", "0.35em")
		  .text(d => d);
	};
	
	nonviolent_xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(nonviolent_x0).tickSizeOuter(0))
		.call(g => g.select(".domain").remove());
		
	nonviolent_yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(nonviolent_y).ticks(null, "s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Number of Crimes"));
	
	//actually make svg
	const nonviolent_barsvg = d3.select("#state-content3").select("svg")
		.attr("width", "100%").attr("height", "100%");
	
	nonviolent_barsvg.append("g")
	.selectAll("g")
	.data(results)
	.join("g")
		.attr("transform", d => `translate(${nonviolent_x0(d[groupKey])},0)`)
	.selectAll("rect")
	.data(d => nonviolent_keys.map(key => ({key, value: d[key]})))
	.join("rect")
		.attr("x", d => nonviolent_x1(d.key))
		.attr("y", d => nonviolent_y(d.value))
		.attr("width", nonviolent_x1.bandwidth())
		.attr("height", d => nonviolent_y(0) - nonviolent_y(d.value))
		.attr("fill", d => nonviolent_color(d.key));

	nonviolent_barsvg.append("g")
		.call(nonviolent_xAxis);

	nonviolent_barsvg.append("g")
		.call(nonviolent_yAxis);

	nonviolent_barsvg.append("g")
		.call(nonviolent_legend);
		
		
	
	
	
	var nonviolentpc_y = d3.scaleLinear()
    .domain([0, d3.max(results, d => d3.max(nonviolentpc_keys, key => d[key]))]).nice()
    .rangeRound([height - margin.bottom, margin.top]);
	
	var nonviolentpc_x0 = d3.scaleBand()
    .domain(results.map(d => d[groupKey]))
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1);
	
	nonviolentpc_x1 = d3.scaleBand()
    .domain(nonviolentpc_keys)
    .rangeRound([0, nonviolentpc_x0.bandwidth()])
    .padding(0.05);
	
	nonviolentpc_legend = svg => {
		const g = svg
		  .attr("transform", `translate(${width},0)`)
		  .attr("text-anchor", "end")
		  .attr("font-family", "sans-serif")
		  .attr("font-size", 10)
		.selectAll("g")
		.data(nonviolentpc_color.domain().slice().reverse())
		.join("g")
		  .attr("transform", (d, i) => `translate(0,${i * 20})`);

		g.append("rect")
		  .attr("x", -19)
		  .attr("width", 19)
		  .attr("height", 19)
		  .attr("fill", nonviolentpc_color);

		g.append("text")
		  .attr("x", -24)
		  .attr("y", 9.5)
		  .attr("dy", "0.35em")
		  .text(d => d);
	};
	
	nonviolentpc_xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(nonviolentpc_x0).tickSizeOuter(0))
		.call(g => g.select(".domain").remove());
		
	nonviolentpc_yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(nonviolentpc_y).ticks(null, "s"))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Number of Crimes"));
	
	//actually make svg
	const nonviolentpc_barsvg = d3.select("#state-content4").select("svg")
		.attr("width", "100%").attr("height", "100%");
	
	nonviolentpc_barsvg.append("g")
	.selectAll("g")
	.data(results)
	.join("g")
		.attr("transform", d => `translate(${nonviolentpc_x0(d[groupKey])},0)`)
	.selectAll("rect")
	.data(d => nonviolentpc_keys.map(key => ({key, value: d[key]})))
	.join("rect")
		.attr("x", d => nonviolentpc_x1(d.key))
		.attr("y", d => nonviolentpc_y(d.value))
		.attr("width", nonviolentpc_x1.bandwidth())
		.attr("height", d => nonviolentpc_y(0) - nonviolentpc_y(d.value))
		.attr("fill", d => nonviolentpc_color(d.key));

	nonviolentpc_barsvg.append("g")
		.call(nonviolentpc_xAxis);

	nonviolentpc_barsvg.append("g")
		.call(nonviolentpc_yAxis);

	nonviolentpc_barsvg.append("g")
		.call(nonviolentpc_legend);
}

//pos = 0 is earliest year, 1 is next year, etc
function singleYearData(data, numNodes, pos) {
	var results = [];
	for (var i = 0; i < numNodes; i++) {
		results[i] = data[i][pos];
	}
	return results;
}