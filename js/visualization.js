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
var table = d3.select("#table").append("table").classed("Attendee Information", true);
table.append("thead");
table.append("tbody");
var path = d3.geoPath().projection(projection);
var selected = [];
var filtData = [];
var filtDataZips = [];
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
    function(d) {
      var bool = x0 <= projection([d.Longitude, d.Latitude])[0] &&
      projection([d.Longitude, d.Latitude])[0] <= x1 &&
      y0 <= projection([d.Longitude, d.Latitude])[1] &&
      projection([d.Longitude, d.Latitude])[1] <= y1
      if (bool) {
        selected.push(d);
      }
      return bool;
    }
    );


}

  function chart(selector, data) {
    selected = [];
    console.log("Charted");

    let tableHeaders = data.keys();
    table.select("thead")
        .selectAll("th")
        .data(tableHeaders)
        .enter().append("th")
        .text(function(d) {
            return d;
          });
    table.select("tbody")
       .selectAll("tr").data(data)
       .enter().append("tr")
       .selectAll("td")
       .data(function(d){
         return [d[0].Zip,d[0].City,d[0].State,d[0].Country, d[0].Count];})
         .enter().append("td")
        .text(function(d){
       	 return d;
      });
}

function brushend() {
  filtData = [];
  filtDataZips = [];

  console.log("Zips" + filtDataZips);
  selected.forEach(function(row) {
    var filtDataRow = [];
    if (!(filtDataZips.includes(row.Zip))) {
      filtDataRow.push(row);
      filtDataZips.push(row.Zip);
      filtDataRow[0].Count = 1;
      filtData.push(filtDataRow);
    } else {
      filtData.forEach(function(row2) {
          if (row.Zip == row2.Zip) {
            filtDataRow = row2;
          }
        });
        filtDataRow.Count += 1;
    }
  });

  console.log("Tot");
  console.log(filtData);

  d3.select("#table").select("#tbody").selectAll("#tr").remove();

  chart("#table", filtData);

  console.log("end");
}
