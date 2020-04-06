// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  console.log("Hello, world!");
  //Based off of this gist
  //https://bl.ocks.org/d3indepth/60f490c6abd7be53d4aa39818e11d273

  var geojson = {}

  var context = d3.select('#content canvas')
    .node()
    .getContext('2d');

  var projection = d3.geoEquirectangular()
    .scale(5000) //This zooms it in - not sure the significance of this value I just guessed and checked
    .rotate([70, -40]); // this is equal to the center point I believe - Lon/Lat of Boston

  var geoGenerator = d3.geoPath()
    .projection(projection)
    .pointRadius(4)
    .context(context);

  function update() {
    context.clearRect(0, 0, 800, 600);

    context.lineWidth = 0.5;
    context.strokeStyle = '#333';

    context.beginPath();
    geoGenerator({ type: 'FeatureCollection', features: geojson.features })
    context.stroke();
  }

  // REQUEST DATA
  // Need to find a way to merge multiple geojson 
  // https://github.com/mapbox/geojson-merge
  d3.json('zip/ma_massachusetts_zip_codes_geo.min.json', function (err, json) {
    geojson = json;
    window.setInterval(update, 50);
    update(json);
  })
})());