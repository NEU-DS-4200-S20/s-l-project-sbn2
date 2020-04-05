// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
var width = 960;
var height = 500;

var svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var svg2 = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(width);

  var path = d3.geoPath().projection(projection);

d3.json("us.json", function(us) {
  //Error
  d3.csv("data/Attendee Information - 2019.csv", function(Attendee) {
  	drawMap(us, Attendee);
  });
});

var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

