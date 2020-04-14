//this file sets up zooming functionality for the map

var sliderVertical = d3
.sliderLeft()
.min(1)
.max(10)
.height(150)
.ticks(5)
.tickFormat(d3.format('.02'))
.default(1)
.on('onchange', val => {
  d3.select('p#value-vertical').text(d3.format('.02')(val));
  //console.log(d3.select('p#value-vertical').text());
  zoom = this.val;
  projection.attr("scale", width*val);
  //console.log(zoom)
});

var gVertical = d3
.select('div#slider-vertical')
.append('svg')
.attr('width', 100)
.attr('height', 400)
.append('g')
.attr('transform', 'translate(60,30)');

gVertical.call(sliderVertical);

d3.select('p#value-vertical').text(d3.format('.2%')(sliderVertical.value()));
console.log(sliderVertical.value());

console.log(zoom)



d3.select("#scale").on("input", function () {
    val = this.value;
    update(this.value);
  });
  
  // Initial starting radius of the circle 
  //update(width);
  
  // update the elements
  function update(scale) {
    // adjust the text on the range slider
    d3.select("#scale-value").text(scale);
    d3.select("#scale").property("value", scale);
    //console.log(val*width);
  }




  d3.select("#map-zoomer").on("input", function() {
    val = this.value;
    update(this.value);
    console.log(this.value)
  });
  
  // Initial starting radius of the circle 
  update(1);
  
  // update the elements
  function update(scale) {
    // adjust the text on the range slider
    d3.select("#scale-value").text(scale);
    d3.select("#map-zoomer").property("value", scale);
    //console.log(val);
  
  }
  
  console.log(d3.select("#map-zoomer").node().value); 
  