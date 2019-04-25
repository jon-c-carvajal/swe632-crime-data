
function createMultiChart(selector, violent_keys, violent_color, results) {
    //can reuse these on all charts
    var margin = ({ top: 10, right: 10, bottom: 20, left: 40 });
    var height = 550 - margin.top - margin.bottom;
    var width = 850 - margin.left - margin.right;

    var violent_y = d3.scaleLinear()
        .domain([0, d3.max(results, d => d3.max(violent_keys, key => d[key]))]).nice()
        .rangeRound([height - margin.bottom, margin.top]);

    var violent_x0 = d3.scaleBand()
        .domain(results.map(d => d["state_abbr"]))
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
            .text(d => titleCase(d).replace('pc', ''));
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
    const violent_barsvg = d3.select(selector).select("svg")
        .attr("width", "100%").attr("height", "100%");

    violent_barsvg.append("g")
        .selectAll("g")
        .data(results)
        .join("g")
        .attr("transform", d => `translate(${violent_x0(d["state_abbr"])},0)`)
        .selectAll("rect")
        .data(d => violent_keys.map(key => ({ key, value: d[key] })))
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

}

function createViolentScatterPlotResults(results) {
	console.log(results);
    var scatterResults = [];
    for (var i = 0; i < results.length * 4; i++) {
        scatterResults[i] = new Object();
        if (i % 4 == 0) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 4)].aggravated_assaultpc);
            scatterResults[i].crime_name = "Aggravated Assault Per Capita"
        } else if (i % 4 == 1) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 4)].homicidepc);
            scatterResults[i].crime_name = "Homicide Per Capita"
        } else if (i % 4 == 2) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 4)].rapepc);
            scatterResults[i].crime_name = "Rape Per Capita"
        } else if (i % 4 == 3) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 4)].robberypc);
            scatterResults[i].crime_name = "Robbery Per Capita"
        }
        scatterResults[i].state_abbr = results[Math.floor(i / 4)].state_abbr;
        scatterResults[i].percentUnauthorizedImmigrant = Number(results[Math.floor(i / 4)].percentUnauthorizedImmigrant);
		scatterResults[i].num_guns_2017pc = Number((results[Math.floor(i / 4)].num_guns_2017pc));
    }
    return scatterResults;
}

function createNonViolentScatterPlotResults(results) {
    var scatterResults = [];
    for (var i = 0; i < results.length * 5; i++) {
        scatterResults[i] = new Object();
        if (i % 5 == 0) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 5)].arsonpc);
            scatterResults[i].crime_name = "Arson Per Capita"
        } else if (i % 5 == 1) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 5)].burglarypc);
            scatterResults[i].crime_name = "Burglary Per Capita"
        } else if (i % 5 == 2) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 5)].larcenypc);
            scatterResults[i].crime_name = "Larceny Per Capita"
        } else if (i % 5 == 3) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 5)].motor_vehicle_theftpc);
            scatterResults[i].crime_name = "Motor Vehicle Theft Per Capita"
        } else if (i % 5 == 4) {
            scatterResults[i].crime_amount = Number(results[Math.floor(i / 5)].property_crimepc);
            scatterResults[i].crime_name = "Property Crime Per Capita"
        }
        scatterResults[i].state_abbr = results[Math.floor(i / 5)].state_abbr;
        scatterResults[i].percentUnauthorizedImmigrant = Number(results[Math.floor(i / 5)].percentUnauthorizedImmigrant);
		scatterResults[i].num_guns_2017pc = Number(results[Math.floor(i / 5)].num_guns_2017pc);
    }
    return scatterResults;
}

function createViolentImmigrationChart(selector, results) {
    //violent per capita compared to illegal/unauthorized immigrant scatterplot

    //can reuse these on all charts
    var margin = ({ top: 10, right: 10, bottom: 20, left: 40 });
    var height = 550 - margin.top - margin.bottom;
    var width = 850 - margin.left - margin.right;

    //reorganize data for scatter plot?
    //crime number, crime type, state?
    var scatterResults = createViolentScatterPlotResults(results);
    console.log(scatterResults);
    console.log(results);

    //setup x
    var xValue = function (d) { return d["percentUnauthorizedImmigrant"]; };
    var xScale = d3.scaleLinear().range([0, width]);
    var xMap = function (d) { return xScale(xValue(d)); };
    var xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function (d) { return d["crime_amount"]; }; //scatterResults version
    var yScale = d3.scaleLinear().range([height, 0]);
    var yMap = function (d) { return yScale(yValue(d)); };
    var yAxis = d3.axisLeft().scale(yScale);

    //setup fill color
    var cValue = function (d) { return d.state_abbr; };
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // add the graph canvas to the body of the webpage
    var scatterSvg = d3.select(selector).select("svg")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(scatterResults, xValue) - 1, d3.max(scatterResults, xValue) + 1]);
    yScale.domain([d3.min(scatterResults, yValue) - 1, d3.max(scatterResults, yValue) + 1]);

    // x-axis
    scatterSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);
    // y-axis
    scatterSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // text label for the x axis
    scatterSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Percentage of Population Unauthorized Immigrant");

    // text label for the y axis
    scatterSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Violent Crimes Per Capita");


    console.log(xMap);
    console.log(yMap);

    // draw dots
    scatterSvg.selectAll(".dot")
        .data(scatterResults) //scatterResults version
        //.data(results) //this is the version that works
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return color(cValue(d)); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["crime_name"] + " (" + d["state_abbr"] +  ")<br/> (" + (Math.round(xValue(d) * 100) / 100)  //scatterResults version
                + ", " + (Math.round(yValue(d) * 100) / 100) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // draw legend
    var legend = scatterSvg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 55)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 35)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; })
}

function createNonViolentImmigrationChart(selector, results) {
    //violent per capita compared to illegal/unauthorized immigrant scatterplot

    //can reuse these on all charts
    var margin = ({ top: 10, right: 10, bottom: 20, left: 40 });
    var height = 550 - margin.top - margin.bottom;
    var width = 850 - margin.left - margin.right;

    //reorganize data for scatter plot?
    //crime number, crime type, state?
    var scatterResults = createNonViolentScatterPlotResults(results);
    console.log(scatterResults);
    console.log(results);

    //setup x
    var xValue = function (d) { return d["percentUnauthorizedImmigrant"]; };
    var xScale = d3.scaleLinear().range([0, width]);
    var xMap = function (d) { return xScale(xValue(d)); };
    var xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function (d) { return d["crime_amount"]; }; //scatterResults version
    var yScale = d3.scaleLinear().range([height, 0]);
    var yMap = function (d) { return yScale(yValue(d)); };
    var yAxis = d3.axisLeft().scale(yScale);

    //setup fill color
    var cValue = function (d) { return d.state_abbr; };
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // add the graph canvas to the body of the webpage
    var scatterSvg = d3.select(selector).select("svg")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(scatterResults, xValue) - 1, d3.max(scatterResults, xValue) + 1]);
    yScale.domain([d3.min(scatterResults, yValue) - 1, d3.max(scatterResults, yValue) + 1]);

    // x-axis
    scatterSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);
    // y-axis
    scatterSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // text label for the x axis
    scatterSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Percentage of Population Unauthorized Immigrant");

    // text label for the y axis
    scatterSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Violent Crimes Per Capita");


    console.log(xMap);
    console.log(yMap);

    // draw dots
    scatterSvg.selectAll(".dot")
        .data(scatterResults) //scatterResults version
        //.data(results) //this is the version that works
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return color(cValue(d)); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["crime_name"] + " (" + d["state_abbr"] +  ")<br/> (" + (Math.round(xValue(d) * 100) / 100)  //scatterResults version
                + ", " + (Math.round(yValue(d) * 100) / 100) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // draw legend
    var legend = scatterSvg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 55)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 35)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; })
}


//*************** Sorry for being lazy again Jon, gun charts below


function createViolentGunChart(selector, results) {
    //violent per capita compared to illegal/unauthorized immigrant scatterplot

    //can reuse these on all charts
    var margin = ({ top: 10, right: 10, bottom: 20, left: 40 });
    var height = 550 - margin.top - margin.bottom;
    var width = 850 - margin.left - margin.right;

    //reorganize data for scatter plot?
    //crime number, crime type, state?
    var scatterResults = createViolentScatterPlotResults(results);
    console.log(scatterResults);
    console.log(results);

    //setup x
    var xValue = function (d) { return d["num_guns_2017pc"]; };
    var xScale = d3.scaleLinear().range([0, width]);
    var xMap = function (d) { return xScale(xValue(d)); };
    var xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function (d) { return d["crime_amount"]; }; //scatterResults version
    var yScale = d3.scaleLinear().range([height, 0]);
    var yMap = function (d) { return yScale(yValue(d)); };
    var yAxis = d3.axisLeft().scale(yScale);

    //setup fill color
    var cValue = function (d) { return d.state_abbr; };
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // add the graph canvas to the body of the webpage
    var scatterSvg = d3.select(selector).select("svg")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(scatterResults, xValue) - 1, d3.max(scatterResults, xValue) + 1]);
    yScale.domain([d3.min(scatterResults, yValue) - 1, d3.max(scatterResults, yValue) + 1]);

    // x-axis
    scatterSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);
    // y-axis
    scatterSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // text label for the x axis
    scatterSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Guns Per Capita");

    // text label for the y axis
    scatterSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Violent Crimes Per Capita");


    console.log(xMap);
    console.log(yMap);

    // draw dots
    scatterSvg.selectAll(".dot")
        .data(scatterResults) //scatterResults version
        //.data(results) //this is the version that works
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return color(cValue(d)); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["crime_name"] + " (" + d["state_abbr"] +  ")<br/> (" + (Math.round(xValue(d) * 100) / 100)  //scatterResults version
                + ", " + (Math.round(yValue(d) * 100) / 100) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // draw legend
    var legend = scatterSvg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 55)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 35)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; })
}

function createNonViolentGunChart(selector, results) {
    //violent per capita compared to illegal/unauthorized immigrant scatterplot

    //can reuse these on all charts
    var margin = ({ top: 10, right: 10, bottom: 20, left: 40 });
    var height = 550 - margin.top - margin.bottom;
    var width = 850 - margin.left - margin.right;

    //reorganize data for scatter plot?
    //crime number, crime type, state?
    var scatterResults = createNonViolentScatterPlotResults(results);
    console.log(scatterResults);
    console.log(results);

    //setup x
    var xValue = function (d) { return d["num_guns_2017pc"]; };
    var xScale = d3.scaleLinear().range([0, width]);
    var xMap = function (d) { return xScale(xValue(d)); };
    var xAxis = d3.axisBottom().scale(xScale);

    // setup y
    var yValue = function (d) { return d["crime_amount"]; }; //scatterResults version
    var yScale = d3.scaleLinear().range([height, 0]);
    var yMap = function (d) { return yScale(yValue(d)); };
    var yAxis = d3.axisLeft().scale(yScale);

    //setup fill color
    var cValue = function (d) { return d.state_abbr; };
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // add the graph canvas to the body of the webpage
    var scatterSvg = d3.select(selector).select("svg")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(scatterResults, xValue) - 1, d3.max(scatterResults, xValue) + 1]);
    yScale.domain([d3.min(scatterResults, yValue) - 1, d3.max(scatterResults, yValue) + 1]);

    // x-axis
    scatterSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);
    // y-axis
    scatterSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // text label for the x axis
    scatterSvg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Guns per Capita");

    // text label for the y axis
    scatterSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Violent Crimes Per Capita");


    console.log(xMap);
    console.log(yMap);

    // draw dots
    scatterSvg.selectAll(".dot")
        .data(scatterResults) //scatterResults version
        //.data(results) //this is the version that works
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return color(cValue(d)); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["crime_name"] + " (" + d["state_abbr"] +  ")<br/> (" + (Math.round(xValue(d) * 100) / 100)  //scatterResults version
                + ", " + (Math.round(yValue(d) * 100) / 100) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // draw legend
    var legend = scatterSvg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 55)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 35)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; })
}