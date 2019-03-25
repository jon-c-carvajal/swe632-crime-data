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
                console.log(result)
                

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

function multiSelectState(){
    //Populate modal with svg
    $('#state-header').text("State Comparison");
    showModal();
}
