var svg = d3.select("#map").select("svg");

var baseWidth = 1920;
var baseHeight = 1080;

var width = $(window).width(),
    height = $(window).height(),
    active = d3.select(null);

    svg.attr("width", width)
    svg.attr("height", height);

var projection = d3.geo.albersUsa()
    .scale(1500 * Math.min((width / baseWidth), (height / baseHeight)))
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g")
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
    
    var stateName = stateMap[d.id];
    console.log(stateName);
    $('#state-header').text(stateName);

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