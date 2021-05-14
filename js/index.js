// TODO make map tooltip show current data point name and value
var covidData;
var covidDataAdj;
var covidDataAvg;
var covidDataAvgAdj;
var popData;
var mapData;

var dates = ["2020-11-15",
  "2020-11-08",
  "2020-11-01",
  "2020-10-25",
  "2020-10-18",
  "2020-10-11",
  "2020-10-04",
  "2020-09-27",
  "2020-09-20",
  "2020-09-13",
  "2020-09-06",
  "2020-08-30",
  "2020-08-23",
  "2020-08-16",
  "2020-08-09",
  "2020-08-02",
  "2020-07-26",
  "2020-07-19",
  "2020-07-12",
  "2020-07-05",
  "2020-06-28",
  "2020-06-21",
  "2020-06-14",
  "2020-06-07",
  "2020-05-31",
  "2020-05-24",
  "2020-05-17",
  "2020-05-10",
  "2020-05-03",
  "2020-04-26",
  "2020-04-19",
  "2020-04-12",
  "2020-04-05",
  "2020-03-29",
  "2020-03-22",
  "2020-03-15"].reverse();
var selectedDateIndex = 17;
var selectedAdj = "unadjusted";
var selectedDataset = "new cases";
var selectedState = "";

var stateCentroids = {};

var months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

var statesList = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
              "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
              "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
              "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]

var state_centers = null;

var mapSvg;
var mapWidth = 800;
var mapHeight = 600;

var mapKeySvg;
var mapKeyWidth = (1 / 3) * mapWidth;
var mapKeyHeight = 600;

var lineSvg;
var lineWidth = 800;
var lineHeight = 500;

var circleSvg;
var circleWidth = 800;
var circleHeight = 500;

function datasetRadioClick(radioInput) {
  selectedId = radioInput.id;
  var newDataset = "";
  
  if (selectedId === 'datasetRadios1') {
    newDataset = 'new cases'; 
  }else if (selectedId === 'datasetRadios2') {
    newDataset = 'total cases';
  }else if (selectedId === 'datasetRadios3') {
    newDataset = 'deaths';
  }

  if (newDataset !== selectedDataset) {
    // prompt a redraw
    selectedDataset = newDataset;
    stateMap();
  }
}

function adjustmentRadioClick(radioInput) {
  selectedId = radioInput.id;
  var newAdj = "";

  if (selectedId === 'adjustmentRadios1') {
    newAdj = 'unadjusted';
  }else if (selectedId === 'adjustmentRadios2') {
    newAdj = 'adjusted';
  }

  if (newAdj !== selectedAdj) {
    // prompt a redraw
    selectedAdj = newAdj;
    stateMap();
  }
}

$(document).ready(function () {
  const parseTime = d3.timeParse("%Y-%m-%d");
  const $valueSpan = $(".yearRangeSelectorValueSpan");
  const $value = $("#yearRangeSelector");
  $value.on("input change", () => {
    selectedDateIndex = $value.val();
    let currentDate = parseTime(dates[selectedDateIndex]);
    $valueSpan.html("Week of " + months[currentDate.getMonth()] + " " + currentDate.getDate() + ", " + currentDate.getFullYear());
    stateMap();
  });
});

$('input[name="datasetRadios"]').on("change", function() {
  datasetRadioClick(this);
})

$('input[name="adjustmentRadios"]').on("change", function() {
  adjustmentRadioClick(this);
})

document.addEventListener("DOMContentLoaded", function () {
  mapSvg = d3.select("#mapCol")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + mapWidth + " " + mapHeight)
    .style("background", "white")
    .style("width", "100%")
    .style("height", "100%")
    .classed("svg-content", true);
    
  mapKeySvg = d3.select("#mapKeyCol")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + mapKeyWidth + " " + mapKeyHeight)
    .style("background", "white")
    .style("width", "100%")
    .style("height", "100%")
    .classed("svg-content", true);

  lineSvg = d3.select("#lineChartCol")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + lineWidth + " " + lineHeight)
    .style("background", "white")
    .style("width", "100%")
    .style("height", "100%")
    .classed("svg-content", true);
  
  circleSvg = d3.select("#pieChartCol")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + circleWidth + " " + circleHeight)
    .style("background", "white")
    .style("width", "100%")
    .style("height", "100%")
    .classed("svg-content", true);

  //mapSvg.attr("width", "800").attr("height", "600");
  Promise.all([d3.json("data/stateBoundaries.json"),
               d3.csv("data/covid_weekly.csv"),
               d3.csv("data/covid_weekly.csv"),
               d3.csv("data/covid_weekly_average.csv"),
               d3.csv("data/covid_weekly_average_adjusted.csv"),
               d3.csv("data/usdaers_pop.csv")]).then(function (values) {
    mapData = values[0];
    covidData = values[1];
    covidDataAdj = values[2];
    covidDataAvg = values[3];
    covidDataAvgAdj = values[4];
    popData = values[5];

    prepData();
    stateMap();
  });

  
});

function prepData() {
  covidData.forEach(function(row) {
    row.date = new Date(row.date);
    row.name = row.name;
    row.abbr = row.abbr;
    row.deaths = +row.deaths;
    row["total cases"] = +row["total cases"];
    row["new cases"] = +row["new cases"];
  });

  popData.forEach(function(row) {
    row.name = row.name;
    row.abbr = row.abbr;
    row.pop = +row.pop;
  });

  covidDataAdj.forEach(function(row) {
    row.date = new Date(row.date);
    row.name = row.name;
    row.abbr = row.abbr;
    row.deaths = +row.deaths;
    row["total cases"] = +row["total cases"];
    row["new cases"] = +row["new cases"];

    adjFactor = 1.0;
    popData.some(function(popRow) {
      if (popRow.name === row.name) {
        adjFactor = popRow.pop / 1000;
        return true;
      } 
    });    

    row.deaths = row.deaths / adjFactor;
    row["total cases"] = row["total cases"] / adjFactor;
    row["new cases"] = row["new cases"] / adjFactor;
  });

  covidDataAvg.forEach(function(row) {
    row.date = new Date(row.date);
    row.deaths = +row.deaths;
    row["total cases"] = +row["total cases"];
    row["new cases"] = +row["new cases"];
  });

  covidDataAvgAdj.forEach(function(row) {
    row.date = new Date(row.date);
    row.deaths = +row.deaths;
    row["total cases"] = +row["total cases"];
    row["new cases"] = +row["new cases"];
  });
}

function getCurrentDataPoint(stateName, date, dataset, adjustment) {
  let timeFormatter = d3.timeFormat("%Y-%m-%d");
  var currentDataPoint;
  let corrData = adjustment === 'adjusted' ? covidDataAdj : covidData;
  if (dataset === 'deaths') {
    corrData.some(function(row) {
      if (row.name === stateName && timeFormatter(row.date) === date) {
        currentDataPoint = row.deaths;
        return true;
      }
    })
    return currentDataPoint;
  } else if (dataset === 'total cases') {
    corrData.some(function(row) {
      if (row.name === stateName && timeFormatter(row.date) === date) {
        currentDataPoint = row["total cases"];
        return true;
      }
    })
    return currentDataPoint;
  } else if (dataset === 'new cases') {
    corrData.some(function(row) {
      if (row.name === stateName && timeFormatter(row.date) === date) {
        currentDataPoint = row["new cases"];
        return true;
      }
    })
    return currentDataPoint;
  }
}

function stateMap() {
  mapSvg.selectAll("*").remove();
  d3.select("body").selectAll(".stateTooltip").remove();
  mapKeySvg.selectAll("*").remove();

  mapSvg.call(d3.zoom().on("zoom", function () {
    mapSvg.attr("transform", d3.event.transform)
  }))

  var projection = d3
    .geoMercator()
    .translate([mapWidth / 2 + 50, mapHeight / 2 + 50])
    .scale(350)
    .center([-115.675080, 45.151053]);

  var path = d3.geoPath().projection(projection);

  var stateTooltip = d3
    .selectAll("body")
    .append("div")
    .attr("class", "stateTooltip")
    .attr("font-color", "red")
    .style("opacity", 0);
  
  let g = mapSvg.append("g");
  g.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", (d) => {
      return (d.properties["NAME"])
    })
    .style("fill", "white")
    .style("stroke", "black")
    .attr("class", "countrymap")
    .on("mouseover", function (d, i) {
      d3.select(this).style("stroke", "cyan");
      d3.select(this).style("stroke-width", 2);
      stateTooltip.transition().duration(50).style("opacity", 1);
      stateTooltip
        .html('<p style="margin:0;">State: ' + d.properties["NAME"] + '</p><p style="margin:0;">' + selectedDataset.toUpperCase().charAt(0) + selectedDataset.substring(1) + ': ' + getCurrentDataPoint(d.properties["NAME"], dates[selectedDateIndex], selectedDataset, "unadjusted").toFixed(2) + ' (' + getCurrentDataPoint(d.properties["NAME"], dates[selectedDateIndex], selectedDataset, "adjusted").toFixed(2) + ' per 1000)</p>')
        .style("left", d3.event.pageX + 1 + "px")
        .style("top", d3.event.pageY - 1 + "px");
    })
    .on("mousemove", function (d, i) {
      stateTooltip
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 60 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition()
               .duration('50')
               .style('stroke', 'black')
               .style('stroke-width', '1')


      stateTooltip.transition()
               .duration('50')
               .style("opacity", 0);
    })
    .on("click", function (d, i) {
      selectedState = d.properties["NAME"];
      stateMap();
    });

  var statePaths = d3.selectAll('.countrymap').data();
  for (var pIndex = 0; pIndex < statePaths.length; pIndex++) {
    var currentPath = statePaths[pIndex];
    var stateName = currentPath.properties["NAME"];
    var currentCentroid = path.centroid(currentPath);
    stateCentroids[stateName] = {x: currentCentroid[0], y: currentCentroid[1]};
  }

  // draw circles
  let timeFormatter = d3.timeFormat("%Y-%m-%d");
  var circleSizeData = covidData.filter(d => timeFormatter(d.date) === dates[selectedDateIndex]);
  var circleColorData = covidDataAdj.filter(d => timeFormatter(d.date) === dates[selectedDateIndex]);
  var circleData = [];
  for (var rowIndex = 0; rowIndex < circleSizeData.length; rowIndex++) {
    circleData.push({name: circleSizeData[rowIndex].name, 
                       "deaths": circleSizeData[rowIndex].deaths, "deaths adjusted": circleColorData[rowIndex].deaths, 
                       "total cases": circleSizeData[rowIndex]["total cases"], "total cases adjusted": circleColorData[rowIndex]["total cases"],
                       "new cases": circleSizeData[rowIndex]["new cases"], "new cases adjusted": circleColorData[rowIndex]["new cases"]});
  }

  var circleSize = d3.scaleLinear()
    .domain([0, d3.max(circleSizeData, function(d) { return +d[selectedDataset]; })])
    .range([2, 30]);

  var circleColor = d3.scaleSequential(d3.interpolateReds)
    .domain([0, d3.max(circleColorData, function(d) { return +d[selectedDataset]; })])
  
  g.selectAll('circle')
    .data(circleData)
    .enter()
    .append("circle")
    .attr("cx", function(d) { return stateCentroids[d.name].x; })
    .attr("cy", function(d) { return stateCentroids[d.name].y; })
    .attr("r", function(d) { return circleSize(d[selectedDataset]); })
    .style("fill", function(d) { return circleColor(d[selectedDataset + " adjusted"]); })
    .attr("stroke", "#000000")
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0.5)
    .attr("id", function(d) { return "circle " + d.name; })
    .classed("mapCircle", true)
    .on("mouseover", function (d, i) {
      d3.select('#' + d.name.replace(" ", "\\ ")).style("stroke", "cyan");
      d3.select('#' + d.name.replace(" ", "\\ ")).style("stroke-width", 2);
      stateTooltip.transition().duration(50).style("opacity", 1);
      stateTooltip
        .html('<p style="margin:0;">State: ' + d.name + '</p><p style="margin:0;">' + selectedDataset.toUpperCase().charAt(0) + selectedDataset.substring(1) + ': ' + getCurrentDataPoint(d.name, dates[selectedDateIndex], selectedDataset, "unadjusted").toFixed(2) + ' (' + getCurrentDataPoint(d.name, dates[selectedDateIndex], selectedDataset, "adjusted").toFixed(2) + ' per 1000)</p>')
        .style("left", d3.event.pageX + 1 + "px")
        .style("top", d3.event.pageY - 1 + "px");
    })
    .on("mousemove", function (d, i) {
      stateTooltip
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 60 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select('#' + d.name.replace(" ", "\\ ")).transition()
               .duration('50')
               .style('stroke', 'black')
               .style('stroke-width', '1')


      stateTooltip.transition()
               .duration('50')
               .style("opacity", 0);
    })
    .on("click", function (d, i) {
      selectedState = d.name;
      stateMap();
    });
  
  var keyG = mapKeySvg.append("g");
  currentDataExtents = [0, d3.max(circleData, function(d) { return d[selectedDataset] })];
  currentDataAdjExtents = [0, d3.max(circleData, function(d) { return d[selectedDataset + " adjusted"] })];

  var mapKeySvgDefs = mapKeySvg.append("defs");
  
  var mapKeyGradient = mapKeySvgDefs.append("linearGradient")
    .attr("id", "mapKeyGradient");
  
  mapKeyGradient.append("stop")
    .attr("class", "stop-left")
    .style("stop-color", circleColor(currentDataAdjExtents[0]))
    .attr("offset", 0);
  
  mapKeyGradient.append("stop")
    .attr("class", "stop-right")
    .style("stop-color", circleColor(currentDataAdjExtents[1]))
    .attr("offset", 1);

  // draw key title
  keyG.append("text")
    .attr("x", mapKeyWidth / 2)
    .attr("y", 35)
    .attr("id", "mapKeyTitle")
    .text("Map Key");
  
  // draw size key circles
  keyG.append("circle")
    .attr("cx", 0.25 * mapKeyWidth)
    .attr("cy", 100 + 30)
    .attr("r", circleSize(currentDataExtents[0]))
    .style("fill", "#000000")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0.5)
    .attr("id", "keyCircleSizeMin")
    .classed("keyCircle", true);
  
  keyG.append("circle")
    .attr("cx", 0.5 * mapKeyWidth)
    .attr("cy", 100 + 30)
    .attr("r", circleSize((currentDataExtents[0] + currentDataExtents[1]) / 2))
    .style("fill", "#000000")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0.5)
    .attr("id", "keyCircleSizeMid")
    .classed("keyCircle", true);
  
  keyG.append("circle")
    .attr("cx", 0.75 * mapKeyWidth)
    .attr("cy", 100 + 30)
    .attr("r", circleSize(currentDataExtents[1]))
    .style("fill", "#000000")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0.5)
    .attr("id", "keyCircleSizeMax")
    .classed("keyCircle", true);
  
  // draw size key labels
  keyG.append("text")
    .attr("x", 0.5 * mapKeyWidth)
    .attr("y", 60 + 30)
    .classed("mapKeyLabel", true)
    .text(selectedDataset.toUpperCase().charAt(0) + selectedDataset.substring(1));

  keyG.append("text")
    .attr("x", 0.25 * mapKeyWidth)
    .attr("y", 150 + 30)
    .classed("mapKeyLabel", true)
    .text(currentDataExtents[0].toFixed(0));

  keyG.append("text")
    .attr("x", 0.5 * mapKeyWidth)
    .attr("y", 150 + 30)
    .classed("mapKeyLabel", true)
    .text(((currentDataExtents[0] + currentDataExtents[1]) / 2).toFixed(0));
  
  keyG.append("text")
    .attr("x", 0.75 * mapKeyWidth)
    .attr("y", 150 + 30)
    .classed("mapKeyLabel", true)
    .text(currentDataExtents[1].toFixed(0));
  
  // draw gradient
  keyG.append("rect")
    .attr("x", 0.125 * mapKeyWidth)
    .attr("y", 250 + 30)
    .attr("width", 0.75 * mapKeyWidth)
    .attr("height", 80)
    .classed("filledGrad", true)

  // draw color key labels
  keyG.append("text")
    .attr("x", 0.5 * mapKeyWidth)
    .attr("y", 250)
    .classed("mapKeyLabel", true)
    .text(selectedDataset.toUpperCase().charAt(0) + selectedDataset.substring(1) + " (per 1000)");
  
  keyG.append("text")
    .attr("x", 0.125 * mapKeyWidth)
    .attr("y", 360 + 30)
    .classed("mapKeyLabel", true)
    .text(currentDataAdjExtents[0].toFixed(3));
    
  keyG.append("text")
    .attr("x", 0.5 * mapKeyWidth)
    .attr("y", 360 + 30)
    .classed("mapKeyLabel", true)
    .text(((currentDataAdjExtents[0] + currentDataAdjExtents[1]) / 2).toFixed(3));

  keyG.append("text")
    .attr("x", 0.875 * mapKeyWidth)
    .attr("y", 360 + 30)
    .classed("mapKeyLabel", true)
    .text(currentDataAdjExtents[1].toFixed(3));

  if (selectedState !== '') {
    lineChart(selectedState, selectedDataset, selectedAdj);
    circleChart(selectedState, selectedDataset, selectedAdj);
  }
}

function lineChart(state, dataset, adjustment) {
  
  lineSvg.selectAll("*").remove();


  const parseTime = d3.timeParse("%Y-%m-%d");

  var stateCovidData = covidData.filter( d => d["name"] === state)
  var stateCovidDataAdj = covidDataAdj.filter( d => d["name"] === state)

  var stateData = [];
  if (adjustment === "adjusted") {
    stateData = stateCovidDataAdj;
  } else {
    stateData = stateCovidData;
  }

  var x = d3.scaleTime()
    .domain(d3.extent(stateData, function(d) { return d["date"]; }))
    .range([50, lineWidth-50 ]);
 
  var y = d3.scaleLinear()
    .domain([0, d3.max(adjustment === "adjusted" ? covidDataAdj : covidData, function(d) { return +d[dataset]; })])
    .range([lineHeight-50, 50]);
      

  lineSvg.append("g")
    .attr("transform", "translate(0," + (lineHeight -50) + ")")
    .attr("class", "axisGray")
    .style("font-size", 12)
    .call(d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%Y-%m-%d"))
    );

  lineSvg.append("g")
    .attr("transform", "translate("+ 50 +",0)")
    .attr("class", "axisGray")
    .style("font-size", 12)
    .call(d3.axisLeft(y)
      .tickSize(-700))
    .call(g => g.select(".domain")
      .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-dasharray", "4"))
  

  lineSvg.append("path")
    .datum(stateData)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", d3.line()
      .x(function(d) { return x(d['date']) })
      .y(function(d) { return y((d[dataset]))})
      )

  lineSvg.append("path")
    .datum(adjustment === "adjusted" ? covidDataAvgAdj : covidDataAvg)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("d", d3.line()
      .x(function(d) { return x(d['date']) })
      .y(function(d) { return y((d[dataset]))})
      )

  lineSvg.append("text")             
    .attr("transform",
            "translate(" + (lineWidth/2) + " ," + 
                           (lineHeight - 10) + ")")
    .style("text-anchor", "middle")
    .style("fill", "gray")
    .style("font-size", 20)
    .text("Date");
  
  lineSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -5)
    .attr("x",0 - ((lineHeight) / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("fill", "gray")
    .style("font-size", 20)
    .text((adjustment === "adjusted") ? ("COVID-19 " + dataset + " for " + state + " (per 1000)") : ("COVID-19 " + dataset + " for " + state));
  
  lineSvg.append('text')
    .attr('text-anchor',"middle")    
    .attr('x',lineWidth-400)
    .attr('y',lineHeight-475)
    .attr('font-family',"sans-serif")
    .attr('font-size',24)
    .text(((adjustment === "adjusted") ? ("COVID-19 " + dataset + " for " + state + " (per 1000)") : ("COVID-19 " + dataset + " for " + state)) + " vs. Date");
  
    //Legend
  lineSvg.append('text')
    .attr('text-anchor',"middle")    
    .attr('x',lineWidth/4 - 47)
    .attr('y',lineHeight - 360 - 40 - 30)
    .attr('font-family',"sans-serif")
    .attr('font-size',18)
    .text('Average across US');
  lineSvg.append('rect')
    .attr('x',lineWidth/4 -140)
    .attr('y',lineHeight - 373 - 40 - 30)
    .attr('width',6)
    .attr('height',5)
    .style("fill", '#800000');
  lineSvg.append('rect')
    .attr('x',lineWidth/4 -140 + 9)
    .attr('y',lineHeight - 373 - 40 - 30)
    .attr('width',6)
    .attr('height',5)
    .style("fill", '#800000');

  lineSvg.append('text')
    .attr('text-anchor',"left")    
    .attr('x',lineWidth/4 -125)
    .attr('y',lineHeight - 380 - 40 - 30)
    .attr('font-family',"sans-serif")
    .attr('font-size',18)
    .text(state);
  lineSvg.append('rect')
    .attr('x',lineWidth/4 -140)
    .attr('y',lineHeight - 393 - 40 - 30)
    .attr('width',15)
    .attr('height',5)
    .style("fill", '#000000');
  
  // Date vertical line
  lineSvg.append("rect")
    .attr("x", 0 + x(parseTime(dates[selectedDateIndex])))
    .attr("y", lineHeight - 400)
    .attr("width", 5)
    .attr("height", lineHeight - (lineHeight - 400) - 50)
    .style("fill", "#000000");

}

function circleChart(state, dataset, adjustment) {

  circleSvg.selectAll("*").remove();

  var stateTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "stateTooltip")
    .attr("font-color", "red")
    .style("opacity", 0);

  var r = (Math.min(circleWidth, circleHeight) / 2)-50 ;
  var stateData;
  if(adjustment=='unadjusted')
  {
    stateData=covidData;
  }
  else 
  {
    stateData=covidDataAdj;
  }
  var sum = 0;
  var specificState = 0;
  statesList.forEach(function(stateName) {
    if (stateName !== state) {
      currentStateDataPoint = getCurrentDataPoint(stateName, dates[selectedDateIndex], selectedDataset, selectedAdj);
      sum = sum + currentStateDataPoint;
    } else {
      currentStateDataPoint = getCurrentDataPoint(stateName, dates[selectedDateIndex], selectedDataset, selectedAdj);
      specificState = currentStateDataPoint;
    }
  });
  statePercent=(specificState/(specificState+sum)*100).toFixed(2);
  totalPercent=(sum/(specificState+sum)*100).toFixed(2);
  var manipulatedData={state:specificState,total:sum};
  var pieslices = d3.pie()
   .value(function(d) {return d.value;})
  var pieData = pieslices(d3.entries(manipulatedData));

  var color = d3.scaleOrdinal()
   .domain([specificState, sum])
   .range(["#FFD700", "#800000"]);
  
  circleSvg.selectAll('slices')
  .data(pieData)
  .enter()
  .append('path') 
  .attr("transform", "translate("+(circleWidth-400)+"," + (circleHeight-225) + ")")
  .attr("fill",function(d){ return(color(d.data.key)) })
  .attr("stroke", "black")
  .attr("stroke-width", 2)
  .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(r)
  )
  .on("mouseover", function (d, i) {
    d3.select(this).style("stroke", "cyan");
    d3.select(this).style("stroke-width", 2);
    stateTooltip.transition().duration(50).style("opacity", 1);
    if(d.data.key!='total')
    {
      stateTooltip
      .html('<p style="margin:0;">State: ' + state + '</p>' + '<p style="margin:0;">Percentage: ' + statePercent + '%</p>')
      .style("left", d3.event.pageX + 1 + "px")
      .style("top", d3.event.pageY - 1 + "px");
    }
    else
    {
      stateTooltip
      .html('<p style="margin:0;">Rest of the US</p>' + '<p style="margin:0;">Percentage: ' + totalPercent + '%</p>')
      .style("left", d3.event.pageX + 1 + "px")
      .style("top", d3.event.pageY - 1 + "px");
    }
    
  })
  .on("mousemove", function (d, i) {
    stateTooltip
      .style("left", d3.event.pageX + 20 + "px")
      .style("top", d3.event.pageY - 60 + "px");
  })
  .on("mouseout", function (d, i) {
    d3.select(this).transition()
             .duration('50')
             .style('stroke', 'black')
             .style('stroke-width', '1')
    stateTooltip.transition()
             .duration('50')
             .style("opacity", 0);
  });
//Legend
circleSvg.append('text')
  .attr('text-anchor',"middle")    
  .attr('x',circleWidth-80)
  .attr('y',circleHeight-360)
  .attr('font-family',"sans-serif")
  .attr('font-size',18)
  .text('Rest of US');
circleSvg.append('rect')
  .attr('x',circleWidth-140)
  .attr('y',circleHeight-373)
  .attr('width',15)
  .attr('height',15)
  .style("fill", '#800000');

circleSvg.append('text')
  .attr('text-anchor',"left")    
  .attr('x',circleWidth-125)
  .attr('y',circleHeight-380)
  .attr('font-family',"sans-serif")
  .attr('font-size',18)
  .text(state);
circleSvg.append('rect')
  .attr('x',circleWidth-140)
  .attr('y',circleHeight-393)
  .attr('width',15)
  .attr('height',15)
  .style("fill", '#FFD700');

circleSvg.append('text')
  .attr('text-anchor',"middle")    
  .attr('x',circleWidth-400)
  .attr('y',circleHeight-475)
  .attr('font-family',"sans-serif")
  .attr('font-size',24)
  .text('Percentage of ' + dataset + (adjustment === 'adjusted' ? ' (per 1000)' : '') + ': ' + state + ' vs. US');

}