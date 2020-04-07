var width = 960;
var height = 500;

var svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(width);

var path = d3.geoPath().projection(projection);

d3.json("us.json", function(us) {
  console.log(us);
  //Error
  d3.csv("data/Attendee Information - 2019.csv", function(Attendee) {
    console.log(Attendee);

    var zipCodeList = [];  
    Attendee.forEach(function(row) {
          zipCodeList.push(Object.values(row)[2]);
    });

    console.log(zipCodeList);
    drawMap(us, Attendee, zipCodeList);
  });
});

var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

function drawMap(us, Attendee, zipCodeList) {
  var mapGroup = svg.append("g").attr("class", "mapGroup");

  mapGroup
    .append("g")
    // .attr("id", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "states");

  mapGroup
    .append("path")
    .datum(
      topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      })
    )
    .attr("id", "state-borders")
    .attr("d", path);

    var lines = svg
    .selectAll("lines")
    .data(topojson.feature(Attendee, zipCodeList))
    .enter()
    .append("lines")
    .attr("class", "Attendee")
    .attr("cx", function(d) {
      return projection([d.lon, d.lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.lon, d.lat])[1];
    })
    .attr("r", 8);


  svg.append("g").call(brush);
}

function highlight() {
  if (d3.event.selection === null) return;

  let [[x0, y0], [x1, y1]] = d3.event.selection;

  circles = d3.selectAll("circle");

  circles.classed(
    "selected",
    d =>
      x0 <= projection([d.lon, d.lat])[0] &&
      projection([d.lon, d.lat])[0] <= x1 &&
      y0 <= projection([d.lon, d.lat])[1] &&
      projection([d.lon, d.lat])[1] <= y1
  );
}

function brushend() {
  console.log("end");
}
