var width =  960;
var height = 500;
var active = d3.select(null);


//svg.call(zoom)

var zoom = d3.zoom().on("zoom", function() {
  svg.attr("transform", d3.event.transform); 
  console.log(d3.event.transform)
});

var svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().on("zoom", function() {
    svg.attr("transform", d3.event.transform); 
    console.log(d3.event.transform)
  }))
  .on("dblclick.zoom", function(){
    svg.attr("transform", d3.event.transform); 
  })
  .append("g");


var projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(width);

var path = d3.geoPath().projection(projection);


d3.json("us.json", function(us) {
  console.log(us);
  //Error
  d3.csv("data/Attendee Information Ver 2.csv", function(attendee) {
    d3.csv("data/Vendor Information Ver 2.csv", function(vendor) { 

    var zipCodeList = [];  
    attendee.forEach(function(row) {
          var zipCodePair = [];
          zipCodePair.push(parseFloat(Object.values(row)[1]));
          zipCodePair.push(parseFloat(Object.values(row)[2]));
          zipCodeList.push(zipCodePair);
    });

    var vendorCodeList = [];
    vendor.forEach(function(row) {
          var zipCodePair = [];
          zipCodePair.push(parseFloat(Object.values(row)[2]));
          zipCodePair.push(parseFloat(Object.values(row)[3]));
          vendorCodeList.push(zipCodePair);
    });
    console.log(zipCodeList);
    console.log(vendorCodeList);
    drawMap(us, attendee, zipCodeList, vendorCodeList);
  });
});
});


var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

function drawMap(us, attendee, zipCodeList, vendorCodeList) {
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
