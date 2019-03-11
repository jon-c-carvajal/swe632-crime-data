import React, { Component } from 'react';
import SideModal from '../modal/SideModal';
import './App.css';
import * as d3 from 'd3';
import stateMap from './stateMap.json'
import us from './us.json'
import * as topojson from 'topojson'

class App extends Component {

  redraw() {
    var svg = d3.select("#map").select("svg");

    var width = svg._parents[0].clientWidth,
      height = svg._parents[0].clientHeight,
      active = d3.select(null);

    var projection = d3.geoAlbers()
      .scale(2000)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath()
      .projection(projection);

    svg.append("rect")
      .attr("class", "background")
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

    var par = this;

    function clicked(d) {
      if (active.node() === this) return reset();
      active.classed("active", false);
      active = d3.select(this).classed("active", true);
      par.modal.show();
      var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

      g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");
    }
  }

  componentDidMount() {
    this.redraw();
  }

  componentDidUpdate() {
    this.redraw();
  }

  render() {
    return (
      <div className="App" id="map">
        <svg></svg>
        <SideModal container={this} ref="modal"/>
      </div>
    );
  }
}

export default App;
