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
  d3.csv("data/Attendee Information Ver 2.csv", function(attendee) {
    console.log(attendee);

    var zipCodeList = [];  
    attendee.forEach(function(row) {
          var zipCodePair = [];
          zipCodePair.push(parseFloat(Object.values(row)[1]));
          zipCodePair.push(parseFloat(Object.values(row)[2]));
          zipCodeList.push(zipCodePair);
    });

    console.log(zipCodeList);
    drawMap(us, attendee, zipCodeList);
  });
});

var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

function drawMap(us, attendee, zipCodeList) {
  var mapGroup = svg.append("g").attr("class", "mapGroup");


  mapGroup
    .append("g")
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

    var circles = svg
    .selectAll("circle")
    .data(attendee).enter()
    .append("circle")
    .attr("class", "attendee")
    .attr("cx", function(d) {

      return projection([d.Longitude, d.Latitude])[0];
    })
    .attr("cy", function(d) {
      return projection([d.Longitude, d.Latitude])[1];
    })
    .attr("r", 4);

  svg.append("g").call(brush);
}

function highlight() {
  if (d3.event.selection === null) return;

  let [[x0, y0], [x1, y1]] = d3.event.selection;

  circles = d3.selectAll("circle");

  circles.classed(
    "selected",
    d =>
      x0 <= projection([d.Longitude, d.Latitude])[0] &&
      projection([d.Longitude, d.Latitude])[0] <= x1 &&
      y0 <= projection([d.Longitude, d.Latitude])[1] &&
      projection([d.Longitude, d.Latitude])[1] <= y1
  );
}

function brushend() {
  console.log("end");
}
