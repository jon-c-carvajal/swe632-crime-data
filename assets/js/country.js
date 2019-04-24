var multiMode = false;
var selectedNodes = {};

$(".state-content-screen").click(function(d){
	var content = $(this).parent();
	$(".state-content").not(content).not(".hidden").hide(150);
	
    if(!content.hasClass("expanded")){
        content.addClass("expanded");
    }
});


$(".close-content").click(function(d){
	var content = $(this).parent();
	$(".state-content").not(content).not(".hidden").hide(150);
	
	if(content.hasClass("expanded")){
        content.removeClass("expanded");
        $(".state-content").not(content).not(".hidden").show(100);
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
	$("#state-content5").addClass("hidden").hide();
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
            crimeEstimatesPlot(result, d, stateMap[d.id]);
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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function titleCase(str) {
	var splitStr = str.toLowerCase().replaceAll('_', ' ').split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	}
	// Directly return the joined string
	return splitStr.join(' '); 
 }

function reorderData(outOfOrder, d) {
	console.log("JLM");
	console.log(outOfOrder);
	var state_id = d.id
	console.log(state_id);
	
	//Making a big assumption here. Since we only have last years data, we are using it and
	// assuming it tracks with population of that state over time
	var mostRecentNumberUnauthorizedImmigrants = stateMap[state_id].estimated_illegal_immigrants;
	console.log(mostRecentNumberUnauthorizedImmigrants);
	
    var inOrder = outOfOrder.results.sort(function (a, b){
        if (a["year"] > b["year"]) return 1;
        if (b["year"] > a["year"]) return -1;
        return 0;
      });
	
	//38 is our current latest year
	var mostRecentPopulation = inOrder[inOrder.length-1].population;
	var mostRecentPercentageOfPopUnauthorized = 100 * mostRecentNumberUnauthorizedImmigrants/mostRecentPopulation;
	console.log(mostRecentPercentageOfPopUnauthorized);
	
	//showing crime values per 1,000 persons in state to get larger numbers
	perCapitaNumber = 1000;
	
    inOrder.forEach(function(obj){
        obj["rape"] = obj["rape_revised"] | obj["rape_legacy"];
		obj["aggravated_assaultpc"] = obj["aggravated_assault"] / obj["population"] * perCapitaNumber;
		obj["arsonpc"] = obj["arson"] / obj["population"] * perCapitaNumber;
		obj["burglarypc"] = obj["burglary"] / obj["population"] * perCapitaNumber;
		obj["homicidepc"] = obj["homicide"] / obj["population"] * perCapitaNumber;
		obj["larcenypc"] = obj["larceny"] / obj["population"] * perCapitaNumber;
		obj["motor_vehicle_theftpc"] = obj["motor_vehicle_theft"] / obj["population"] * perCapitaNumber;
		obj["property_crimepc"] = obj["property_crime"] / obj["population"] * perCapitaNumber;
		obj["rapepc"] = obj["rape"] / obj["population"] * perCapitaNumber;
		obj["robberypc"] = obj["robbery"] / obj["population"] * perCapitaNumber;
		obj["percentUnauthorizedImmigrant"] = mostRecentPercentageOfPopUnauthorized;
    });
    return inOrder;
}

function multiSelectState(nodes, numNodes) {

	// hide crime vs gun crime
	$("#state-content6").addClass("hidden").hide();

    //Populate modal with svg
    console.log("in multiSelectState")

    var d = [];
    var stateAbbrs = [];
    var title = "Comparison of ";
    for (var i = 0; i < numNodes; i++) {
		if(i == numNodes - 1){
			title = title + " and "
		}
        d[i] = nodes[i]["state"];
        title = title + stateMap[d[i].id]["name"];
        stateAbbrs[i] = stateMap[d[i].id]["abbr"]; //used for making html
        if (i < numNodes - 1 && numNodes > 2) {
            title = title + ", "
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
        results[i] = reorderData(results[i], nodes[i]);
    }
	
	//Jon, use the last variable to get other years, 0 is first year, 1 is second year, etc
	//38 is most recent year
	results = singleYearData(results, numNodes, results.length - 1);
	console.log(results);
	
	var groupKey = "state_abbr"; //hardcoding is bad
	var violent_keys = ["aggravated_assault", "homicide", "rape", "robbery"];
	var violentpc_keys = ["aggravated_assaultpc", "homicidepc", "rapepc", "robberypc"];
	var violentpii_keys = ["aggravated_assaultpii", "homicidepii", "rapepii", "robberypii"];
	var nonviolent_keys = ["arson", "burglary", "larceny", "motor_vehicle_theft", "property_crime"];
	var nonviolentpc_keys = ["arsonpc", "burglarypc", "larcenypc", "motor_vehicle_theftpc", "property_crimepc"];

	var violent_color = function(){
		return d3.scaleOrdinal().range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	}
	var nonviolent_color = function() {
		return d3.scaleOrdinal().range(["#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	} 
	
	createMultiChart("#state-content1", violent_keys, violent_color(), results);
	createMultiChart("#state-content2", violentpc_keys, violent_color(), results);
	createMultiChart("#state-content3", nonviolent_keys, nonviolent_color(), results);
	createMultiChart("#state-content4", nonviolentpc_keys, nonviolent_color(), results);
	createImmigrationChart("#state-content5", results);
}

//pos = 0 is earliest year, 1 is next year, etc
function singleYearData(data, numNodes, pos) {
	console.log(data);
	var results = [];
	for (var i = 0; i < numNodes; i++) {
		results[i] = data[i][pos];
	}
	return results;
}

// Yang 04/14/2019 reorder and add gun data
function reorderData_add_gunData(outOfOrder) {
	console.log("Yang");
	console.log(outOfOrder);
	var state_id = outOfOrder.results[0].state_id;
	console.log(state_id);
	
	// [todo] Add gun control data here. gun control data is not available ATM.
	// For now (temporarily), sample manual data will be added
	
	var mostRecentNumberUnauthorizedImmigrants = stateMap[state_id].estimated_illegal_immigrants;
	// console.log(mostRecentNumberUnauthorizedImmigrants);
	
    var inOrder = outOfOrder.results.sort(function (a, b){
        if (a["year"] > b["year"]) return 1;
        if (b["year"] > a["year"]) return -1;
        return 0;
      });
	
	//38 is our current latest year
	var mostRecentPopulation = inOrder[inOrder.length-1].population;
	console.log(inOrder[inOrder.length-1].population);
	var mostRecentPercentageOfPopUnauthorized = 100 * mostRecentNumberUnauthorizedImmigrants/mostRecentPopulation;
	console.log(mostRecentPercentageOfPopUnauthorized);
	
	// create gun_death dataset state_id, state_abbr, year, gun_death_count
	// these are made-up numbers
	var gun_death_list = [
		{ state_id: 0, state_abbr: 'xx', year: 1979, gun_count: 987 },
		{ state_id: 0, state_abbr: 'xx', year: 1980, gun_count: 922 },
		{ state_id: 0, state_abbr: 'xx', year: 1981, gun_count: 901 },
		{ state_id: 0, state_abbr: 'xx', year: 1982, gun_count: 855 },
		{ state_id: 0, state_abbr: 'xx', year: 1983, gun_count: 812 },
		{ state_id: 0, state_abbr: 'xx', year: 1984, gun_count: 789 },
		{ state_id: 0, state_abbr: 'xx', year: 1985, gun_count: 767 },
		{ state_id: 0, state_abbr: 'xx', year: 1986, gun_count: 833 },
		{ state_id: 0, state_abbr: 'xx', year: 1987, gun_count: 942 },
		{ state_id: 0, state_abbr: 'xx', year: 1988, gun_count: 1011 },
		{ state_id: 0, state_abbr: 'xx', year: 1989, gun_count: 1187 },
		{ state_id: 0, state_abbr: 'xx', year: 1990, gun_count: 1389 },
		{ state_id: 0, state_abbr: 'xx', year: 1991, gun_count: 1587 },
		{ state_id: 0, state_abbr: 'xx', year: 1992, gun_count: 1611 },
		{ state_id: 0, state_abbr: 'xx', year: 1993, gun_count: 1654 },
		{ state_id: 0, state_abbr: 'xx', year: 1994, gun_count: 1421 },
		{ state_id: 0, state_abbr: 'xx', year: 1995, gun_count: 1202 },
		{ state_id: 0, state_abbr: 'xx', year: 1996, gun_count: 1111 },
		{ state_id: 0, state_abbr: 'xx', year: 1997, gun_count: 1022 },
		{ state_id: 0, state_abbr: 'xx', year: 1998, gun_count: 913 },
		{ state_id: 0, state_abbr: 'xx', year: 1999, gun_count: 888 },
		{ state_id: 0, state_abbr: 'xx', year: 2000, gun_count: 722 },
		{ state_id: 0, state_abbr: 'xx', year: 2001, gun_count: 745 },
		{ state_id: 0, state_abbr: 'xx', year: 2002, gun_count: 776 },
		{ state_id: 0, state_abbr: 'xx', year: 2003, gun_count: 799 },
		{ state_id: 0, state_abbr: 'xx', year: 2004, gun_count: 765 },
		{ state_id: 0, state_abbr: 'xx', year: 2005, gun_count: 720 },
		{ state_id: 0, state_abbr: 'xx', year: 2006, gun_count: 733 },
		{ state_id: 0, state_abbr: 'xx', year: 2007, gun_count: 777 },
		{ state_id: 0, state_abbr: 'xx', year: 2008, gun_count: 801 },
		{ state_id: 0, state_abbr: 'xx', year: 2009, gun_count: 814 },
		{ state_id: 0, state_abbr: 'xx', year: 2010, gun_count: 855 },
		{ state_id: 0, state_abbr: 'xx', year: 2011, gun_count: 888 },
		{ state_id: 0, state_abbr: 'xx', year: 2012, gun_count: 912 },
		{ state_id: 0, state_abbr: 'xx', year: 2013, gun_count: 934 },
		{ state_id: 0, state_abbr: 'xx', year: 2014, gun_count: 987 },
		{ state_id: 0, state_abbr: 'xx', year: 2015, gun_count: 999 },
		{ state_id: 0, state_abbr: 'xx', year: 2016, gun_count: 1049 },
		{ state_id: 0, state_abbr: 'xx', year: 2017, gun_count: 1089 }
	];
	
	//showing crime values per 1,000 persons in state to get larger numbers
	perCapitaNumber = 1000;
	
    inOrder.forEach(function(obj){
        obj["rape"] = obj["rape_revised"] | obj["rape_legacy"];
		obj["aggravated_assaultpc"] = obj["aggravated_assault"] / obj["population"] * perCapitaNumber;
		obj["arsonpc"] = obj["arson"] / obj["population"] * perCapitaNumber;
		obj["burglarypc"] = obj["burglary"] / obj["population"] * perCapitaNumber;
		obj["homicidepc"] = obj["homicide"] / obj["population"] * perCapitaNumber;
		obj["larcenypc"] = obj["larceny"] / obj["population"] * perCapitaNumber;
		obj["motor_vehicle_theftpc"] = obj["motor_vehicle_theft"] / obj["population"] * perCapitaNumber;
		obj["property_crimepc"] = obj["property_crime"] / obj["population"] * perCapitaNumber;
		obj["rapepc"] = obj["rape"] / obj["population"] * perCapitaNumber;
		obj["robberypc"] = obj["robbery"] / obj["population"] * perCapitaNumber;
		obj["percentUnauthorizedImmigrant"] = mostRecentPercentageOfPopUnauthorized;

		// match with state and year
		// state_abbr: "VA"		state_id: 51		violent_crime: 15642		year: 1979

		// [todo] multiply 30 to just show the nunbers in the middle of chart
		var _gun_count = gun_death_list.find(x => x.year === obj["year"]).gun_count * 30;
		obj["gun_death"] = _gun_count; 

    });
    return inOrder;
}