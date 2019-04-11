var violentPlotEntries = [{ "key": "aggravated_assault", "display_name": "Aggravated Assault", "color": "indianred" },
{ "key": "homicide", "display_name": "Homicide","color": "dodgerblue" },
{ "key": "rape", "display_name": "Rape","color": "khaki" },
{ "key": "robbery", "display_name": "Robbery","color": "mediumpurple" },
{ "key": "burglary", "display_name": "Burglary","color": "green" }];

var nonViolentPlotEntries = [{ "key": "larceny", "display_name": "Larceny", "color": "khaki" },
{ "key": "motor_vehicle_theft", "display_name": "Motor Vehicle Theft","color": "dodgerblue" },
{ "key": "arson", "display_name": "Arson","color": "indianred" },
{ "key": "property_crime", "display_name": "Property Crime","color": "mediumpurple" }];

function populateDots(lineChartSvg, data, display_name, x_name, y_name, x, y, color) {
    // create a subselection for our "dots"
    // and on enter append a bunch of circles
    lineChartSvg.selectAll(".dot")
        .data(data, function (d) {
            return d;
        })
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", function (d, i) {
            return x(d[[x_name]]);
        })
        .attr("cy", function (d) {
            return y(d[[y_name]]);
        })
        .attr("fill", color)
        .attr("stroke", "black")
        .on("mouseover", function (d) {
            div.transition()
                .duration(1)
                .style("opacity", .9);
            div.html(display_name + "<br/>Year : " + d[[x_name]] + "<br/> Count : " + d[[y_name]])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function drawLine(lineChartSvg, data, display_name, x_name, y_name, color, width, x, y) {
    var line = d3.line()
        .x(function (d) { return x(d[[x_name]]); })
        .y(function (d) { return y(d[[y_name]]); });

    lineChartSvg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", width + "px");

    lineChartSvg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", (width - 1) + "px");



    populateDots(lineChartSvg, estimates, display_name, x_name, y_name, x, y, color);
}

function drawLegend(lineChartSvg, plotEntries) {
    var legend3 = lineChartSvg.selectAll('.legend')
        .data(plotEntries)
        .enter().append('g')
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(620," + (i * 20 + 30) + ")"
        });

    legend3.append('rect')
        .attr("x", -1)
        .attr("y", -1)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function (d, i) { return "black" });

        legend3.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d, i) { return d["color"] });


    legend3.append('text')
        .attr("x", 20)
        .attr("y", 10)
        //.attr("dy", ".35em")
        .text(function (d, i) {
            return d["display_name"]
        })
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 15);
}

function crimeEstimatesPlot(result, stateMapInfo){
    estimates = reorderData(result);

    crimePlot("#state-content1", estimates, stateMapInfo, "Violent Crime Estimates of " + stateMapInfo["name"], violentPlotEntries);
    crimePlot("#state-content2", estimates, stateMapInfo, "Non-Violent Crime Estimates of " + stateMapInfo["name"], nonViolentPlotEntries);
}


function crimePlot(svgId, estimates, stateMapInfo, title, plotEntries) {
    //putting in line chart
    var margin = { top: 20, right: 20, bottom: 30, left: 85 },
        width = 850 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;



    //not in d3.v3
    //var parseTime = d3.timeParse("%d-%b-%y");
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var lineChartSvg = d3.select(svgId).select("svg")
        .append("g").attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //create title
    lineChartSvg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margin.top))
        .attr("text-anchor", "middle")
        .style("font-size", "28px")
        //.style("text-decoration", "underline")  
        .text(title);

    //I'm sure theres a better way of doing this
    var hmax = []

    for(var i = 0; i < plotEntries.length; i++){
        hmax[i] = d3.max(estimates, function (d) { return d[plotEntries[i]["key"]]; });
    }

    var dmax = 0;
    for (var i = 0; i < plotEntries.length; i++) {
        if (hmax[i] > dmax) {
            dmax = hmax[i];
        }
    }

    y.domain([0, 1.3 * dmax]);
    x.domain(d3.extent(estimates, function (d) { return d.year; }));

    drawLegend(lineChartSvg, plotEntries);

    for (var i = 0; i < plotEntries.length; i++) {
        drawLine(lineChartSvg, [estimates], plotEntries[i]["display_name"], "year", plotEntries[i]["key"], plotEntries[i]["color"], 3, x, y);
    }

    // Add the Axes
    var yAxis = d3.axisLeft()
        .scale(y);

    var xAxis = d3.axisBottom()
        .tickFormat(function (date) {
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