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

$(document).keyup(function (event) {
	if(event.which == "17"){
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
	}
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
		
    //$("#state-content2").addClass("hidden").hide();
	//$("#state-content4").addClass("hidden").hide();
	$("#state-content5").addClass("hidden").hide();
	$("#state-content7").addClass("hidden").hide();
	$("#state-content8").addClass("hidden").hide();
	$("#state-content9").addClass("hidden").hide();

	//Yang, hiding fake gun data chart for now
	$("#state-content6").addClass("hidden").hide();
	
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
	var num_guns_2018 = stateMap[state_id].num_guns_2018; //never actually used, as crime estimates currently only go to 2017
	var num_guns_2017 = stateMap[state_id].num_guns_2017;
	var num_guns_2016 = stateMap[state_id].num_guns_2016;
	var num_guns_2015 = stateMap[state_id].num_guns_2015;
	var num_guns_2014 = stateMap[state_id].num_guns_2014;
	var num_guns_2013 = stateMap[state_id].num_guns_2013;
	var num_guns_2012 = stateMap[state_id].num_guns_2012;
	var num_guns_2011 = stateMap[state_id].num_guns_2011;
	
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
		
		//used for multi state, only this year currently works
		obj["num_guns_2017"] = num_guns_2017;
		obj["num_guns_2017pc"] = num_guns_2017 / obj["population"] * perCapitaNumber;
		
		//this is trash, it actually puts all of these values in every year, and only during one year will it actually be correct. 
		// but good enough for government work, especially since only one state, KY, is currently done
		if (obj["year"] == "2017") {
			obj["numGuns"] = num_guns_2017;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2017 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2017 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2017 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2017 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2017 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2017 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2017 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2017 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2017 * perCapitaNumber;
		} else if (obj["year"] == "2016") {
			obj["numGuns"] = num_guns_2016;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2016 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2016 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2016 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2016 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2016 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2016 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2016 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2016 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2016 * perCapitaNumber;
		} else if (obj["year"] == "2015") {
			obj["numGuns"] = num_guns_2015;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2015 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2015 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2015 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2015 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2015 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2015 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2015 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2015 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2015 * perCapitaNumber;
		} else if (obj["year"] == "2014") {
			obj["numGuns"] = num_guns_2014;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2014 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2014 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2014 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2014 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2014 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2014 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2014 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2014 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2014 * perCapitaNumber;
		} else if (obj["year"] == "2013") {
			obj["numGuns"] = num_guns_2013;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2013 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2013 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2013 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2013 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2013 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2013 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2013 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2013 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2013 * perCapitaNumber;
		} else if (obj["year"] == "2012") {
			obj["numGuns"] = num_guns_2012;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2012 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2012 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2012 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2012 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2012 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2012 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2012 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2012 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2012 * perCapitaNumber;
		} else if (obj["year"] == "2011") {
			obj["numGuns"] = num_guns_2011;
			obj["aggravated_assaultpg"] = obj["aggravated_assault"] / num_guns_2011 * perCapitaNumber;
			obj["arsonpg"] = obj["arson"] / num_guns_2011 * perCapitaNumber;
			obj["burglarypg"] = obj["burglary"] / num_guns_2011 * perCapitaNumber;
			obj["homicidepg"] = obj["homicide"] / num_guns_2011 * perCapitaNumber;
			obj["larcenypg"] = obj["larceny"] / num_guns_2011 * perCapitaNumber;
			obj["motor_vehicle_theftpg"] = obj["motor_vehicle_theft"] / num_guns_2011 * perCapitaNumber;
			obj["property_crimepg"] = obj["property_crime"] / num_guns_2011 * perCapitaNumber;
			obj["rapepg"] = obj["rape"] / num_guns_2011 * perCapitaNumber;
			obj["robberypg"] = obj["robbery"] / num_guns_2011 * perCapitaNumber;
		}
    });
    return inOrder;
}

function multiSelectState(nodes, numNodes) {

	// hide crime vs gun crime
	$("#state-content6").addClass("hidden").hide();
	$("#state-content10").addClass("hidden").hide();
	$("#state-content11").addClass("hidden").hide();

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
	
	createMultiChart("#state-content1", violent_keys, violent_color(), results, "# of Violent Crimes");
	createMultiChart("#state-content2", violentpc_keys, violent_color(), results, "# of Violent Crimes per 1000 people");
	createMultiChart("#state-content3", nonviolent_keys, nonviolent_color(), results, "# of Non-Violent Crimes");
	createMultiChart("#state-content4", nonviolentpc_keys, nonviolent_color(), results, "# of Non-Violent Crimes per 1000 people");
	createViolentImmigrationChart("#state-content5", results);
	createNonViolentImmigrationChart("#state-content7", results);
	createViolentGunChart("#state-content8", results);
	createNonViolentGunChart("#state-content9", results);
}

//pos = 0 is earliest year, 1 is next year, etc
function singleYearData(data, numNodes, pos) {
	console.log(data);
	var results = {};
	for (var i = 0; i < numNodes; i++) {
        for(var j = 0; j < data[i].length; j++){
            if(!results[data[i][j].year]){
                results[data[i][j].year] = []
            }
            results[data[i][j].year].push(data[i][j]);
        }
	}
	return results;
}

function removeNonGunYears(estimates) {
	gunEstimates = [];
	i = 0;
	console.log("no");
	estimates.forEach(function (obj){
		if (parseInt(obj["year"]) > 2010) {
			console.log("yes");
			//obj = [];
			gunEstimates[i] = obj;
			i++;
		}
	});
	
	return gunEstimates;
}