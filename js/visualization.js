var width =  960;
var height = 500;
var r = 5;
var strokeWidth = 2;


//make table for displaying data highlighted on map
var table = d3.select("#table").append("table").classed("Attendee Information", true);
table.append("thead");
table.append("tbody");
var table2 = d3.select("#table2").append("table").classed("Vendor Information", true);
table2.append("thead");
table2.append("tbody");
var selected = [];
var filtDataAtt = [];
var filtDataVen = [];
var filtDataZipsAtt = [];
var filtDataZipsVen = [];
var tableHeaderValues = ["Attendee Count", "Favorite Activity",
"Likelihood To Purchase At Store","Raise Awareness","Rate Experience","Reference","Age Range", "Zip Code", "City", "State"]
var tableHeaderValVen = ["Vendor Count", "List of Vendors in Area", "Zip Code", "City", "State"]
//incorporate zoom function
var zoom = d3.zoom()

var svg = d3
  .select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .call(zoom.on("zoom", function() {
    svg.attr("transform", d3.event.transform);
    d3.selectAll("circle").transition().duration(500).attr("r", r/d3.event.transform.k).style("stroke-width", strokeWidth/d3.event.transform.k);
  }))
  .on("dblclick.zoom", function(){
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  });

var projection = d3
  .geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(width);

var path = d3.geoPath().projection(projection);

//read dataset to display datapoints on map
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
//make brush function
var brush = d3
  .brush()
  .on("start brush", highlight)
  .on("end", brushend);

//draws the map and all the data points
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

   //displays datapoints as circles

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

//function that allows brushing to highlight datapoints
function highlight() {
  if (d3.event.selection === null) return;

  let [[x0, y0], [x1, y1]] = d3.event.selection;

  //vendorCircles =d3.selectAll("vendor_cricle");
  //vendorCircles.classed("selected", (d) => true);

  circles = d3.selectAll("circle");
  //circles_temp = d3.selectAll("circle");
  //console.log(circles_temp);
  selected = [];
  circles.classed(
    "selected", function(d) {
    //d =>
      var bool = x0 <= projection([d.value.Longitude, d.value.Latitude])[0] &&
      projection([d.value.Longitude, d.value.Latitude])[0] <= x1 &&
      y0 <= projection([d.value.Longitude, d.value.Latitude])[1] &&
      projection([d.value.Longitude, d.value.Latitude])[1] <= y1
      if (bool) {
        selected.push(d);
      }
      return bool;
    }
  );
}

//sets up table formatting, bool value represents if it is a vendor or attendee table
function chart(selector, data, bool) {


    if (bool) {

    console.log("Charted Att");
    table.select("thead")
        .selectAll("th")
        .data(tableHeaderValues)
        .enter().append("th")
        .text(function(d){
          return d;
        });

    table.select("tbody").selectAll("tr").remove();

    table.select("tbody")
       .selectAll("tr").data(data)
       .enter().append("tr")
       .selectAll("td")
       .data(function(d){
         d[0].value.Zip = "" + d[0].value.Zip;
         if (d[0].value.Zip.length == 4) {
           d[0].value.Zip = "0" + d[0].value.Zip;
         }
         avgFavAct = convertvalues(d[0].value.Favorite_Activity_Array, 'Favorite_Activity');
         console.log(avgFavAct);
         avgLikelihood = convertvalues(d[0].value.Likelihood_To_Purchase_At_Store_Array, "Likelihood_To_Purchase_At_Store");
         console.log(avgLikelihood);
         mostPopularRef = convertvalues(d[0].value.Reference_Array, "Reference");
         console.log(mostPopularRef);
         mostCommonAgeRange = convertvalues(d[0].value.Age_Range_Array, "Age_Range");
         console.log(mostCommonAgeRange);
         avgAware = convertvalues(d[0].value.Raise_Awareness_Array, "Raise_Awareness");
         console.log(avgAware);
         avgExper = convertvalues(d[0].value.Rate_Experience_Array, "Rate_Experience");
         console.log(avgExper);
         return [d[0].Count, avgFavAct, avgLikelihood,
         avgAware, avgExper, mostPopularRef, mostCommonAgeRange, d[0].value.Zip
         ,d[0].value.City,d[0].value.State];})
         .enter().append("td")
        .text(function(d){
         return d;
      });
    } else {

      console.log("Charted Ven");
      table2.select("thead")
          .selectAll("th")
          .data(tableHeaderValVen)
          .enter().append("th")
          .text(function(d){
            return d;
          });

      table2.select("tbody").selectAll("tr").remove();

      table2.select("tbody")
           .selectAll("tr").data(data)
           .enter().append("tr")
           .selectAll("td")
           .data(function(d){
              d[0].value.Zip = "" + d[0].value.Zip;
              if (d[0].value.Zip.length == 4) {
                 d[0].value.Zip = "0" + d[0].value.Zip;
              }
              return [d[0].Count, d[0].value.Vendor_Names, d[0].value.Zip,
              d[0].value.City, d[0].value.State];
            })
            .enter().append("td")
            .text(function(d){
              return d;
            });
    }
}

//ends brushing
function brushend() {
  filtDataAtt = [];
  filtDataVen = [];
  filtDataZipsAtt = [];
  filtDataZipsVen = [];
//  ["Participant Count", "Favorite_Activity",
//  "Likelihood_To_Purchase_At_Store","Raise_Awareness","Rate_Experience","Reference","Age_Range", "Zip Code", "City", "State"]

  console.log("Zips" + filtDataZipsAtt);
  selected.forEach(function(row) {
    var filtDataRow = [];
    if (row.label == "attendee") {
      if (!(filtDataZipsAtt.includes(row.value.Zip))) {
        filtDataRow.push(row);
        filtDataZipsAtt.push(row.value.Zip);
        filtDataRow[0].Count = 0;
        filtDataRow[0].value.Favorite_Activity_Array = []
        filtDataRow[0].value.Likelihood_To_Purchase_At_Store_Array = []
        filtDataRow[0].value.Age_Range_Array = []
        filtDataRow[0].value.Reference_Array = []
        filtDataRow[0].value.Raise_Awareness_Array = []
        filtDataRow[0].value.Rate_Experience_Array = []
        filtDataAtt.push(filtDataRow);
      }
    } else {
        filtDataRow.push(row);
        filtDataZipsVen.push(row.value.Zip);
        filtDataRow[0].Count = 0;
        filtDataRow[0].value.Vendor_Names = []
        filtDataVen.push(filtDataRow);
      }
  });

  selected.forEach(function(row) {
    filtDataAtt.forEach(function(row2) {
      if ((row.value.Zip == row2[0].value.Zip) && (row.label == "attendee")) {
        row2[0].Count += 1;
        row2[0].value.Favorite_Activity_Array.push(row.value.Favorite_Activity);
        row2[0].value.Likelihood_To_Purchase_At_Store_Array.push(row.value.Favorite_Activity);
        row2[0].value.Reference_Array.push(row.value.Reference);
        row2[0].value.Age_Range_Array.push(row.value.Age_Range);
        row2[0].value.Raise_Awareness_Array.push(row.value.Raise_Awareness);
        row2[0].value.Rate_Experience_Array.push(row.value.Rate_Experience);
      }
    });
  });

  selected.forEach(function(row) {
    filtDataVen.forEach(function(row2) {
      if (row.value.Zip == row2[0].value.Zip) {
        row2[0].Count += 1;
        row2[0].value.Vendor_Names.push(row.value.Vendor);
      }
  });
});


  chart("#table", filtDataAtt, true);
  chart("#table2", filtDataVen, false);

  console.log("end");
}

function convertvalues(drow, dlabel) {
  console.log(drow);
  var temp = 0;
  drow.forEach(function(a) {
    temp+=a;
  });
  temp = Math.round(temp/drow.length);

  if (dlabel == 'Favorite_Activity') {
    if(temp == 1)
      return "Interaction with local Vendors";
    else if(temp == 2)
      return "New England Village";
    else if(temp ==3)
      return "Family Fun Zone";
    else if(temp ==4)
      return "Chef Demos";
    else if(temp ==5)
      return "Seafood Throwdown";
    else
      return "Other";
  }
  else if (dlabel == "Reference") {
    if(temp == 1)
      return "Eventbrite";
    else if(temp == 2)
      return "Instagram";
    else if(temp ==3)
      return "Facebook";
    else if(temp ==4)
      return "Walked By";
    else if(temp ==5)
      return "Beer Fest";
    else if (temp == 6)
      return "Friend";
    else if (temp ==7)
      return "Other";
    else if (temp ==8)
      return "Google";
    else if (temp ==9)
      return "Meetup.com"
    else if (temp ==10)
      return "Local News"
  }
  else if (dlabel == "Age_Range") {
    if(temp == 1)
      return "Under 18";
    else if(temp == 2)
      return "19-25";
    else if(temp ==3)
      return "26-35";
    else if(temp ==4)
      return "36-50";
    else if(temp ==5)
      return "51-64";
    else
      return "65+";
  }
  else
    return temp;
}

var legend = svg
  .append("g")
  .attr("class", "legend")
  .attr("width", 140)
  .attr("height", 200)
  .selectAll("g")
  .data([
    {'color': 'orange', 'label': 'Attendees'},
    {'color': 'blue', 'label': 'Vendors'},
    {'color': 'red', 'label': 'Selected Points'}
  ])
  .enter()
  .append("g")
  .attr("transform", function(d, i) {
    return "translate(0," + i * 20 + ")";
  });
legend
  .append("rect")
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d) {
    return d.color
  });
  legend
  .append("text")
  .attr("x", 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .text(function(d) { return d.label });
