var width =  960;
var height = 500;
var r = 5;

var zoom = d3.zoom();

var svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .call(zoom.on("zoom", function() {
    svg.attr("transform", d3.event.transform); 
    d3.selectAll("circle").transition().duration(500).attr("r", r/d3.event.transform.k);
  }))
  .on("dblclick.zoom", function(){
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  });

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
    drawMap(us, attendee, vendor, zipCodeList, vendorCodeList);
  });
});
});

var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

function drawMap(us, attendee, vendor, zipCodeList, vendorCodeList) {
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

    let mapData = [];
    for(let d of attendee ) {
      let temp = {label: "attendee", value: d}
      mapData.push(temp);
    }
    for(let d of vendor ) {
      let temp = {label: "vendor", value: d}
      mapData.push(temp);
    }

   
    var circles = svg
    .selectAll("circle")
    .data(mapData).enter()
    .append("circle")
    .attr("class", function(d) {return d.label})
    .attr("cx", function(d) {

      return projection([d.value.Longitude, d.value.Latitude])[0];
    })
    .attr("cy", function(d) {
      return projection([d.value.Longitude, d.value.Latitude])[1];
    })
    .attr("r", function(d) {if(d.label == "attendee") {return 4} else {return 4}});
    //.style("fill", fillFunction);

  svg.append("g").call(brush);
}

function highlight() {
  if (d3.event.selection === null) return;

  let [[x0, y0], [x1, y1]] = d3.event.selection;

  //vendorCircles =d3.selectAll("vendor_cricle");
  //vendorCircles.classed("selected", (d) => true);

  circles = d3.selectAll("circle");
  //circles_temp = d3.selectAll("circle");
  //console.log(circles_temp);
  console.log(circles);

  circles.classed(
    "selected",
    d =>
      x0 <= projection([d.value.Longitude, d.value.Latitude])[0] &&
      projection([d.value.Longitude, d.value.Latitude])[0] <= x1 &&
      y0 <= projection([d.value.Longitude, d.value.Latitude])[1] &&
      projection([d.value.Longitude, d.value.Latitude])[1] <= y1
  );
}

function brushend() {
  console.log("end");
}