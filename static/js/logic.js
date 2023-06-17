function createMap(earthquakes, centerLatitude, centerLongitude) {
  // Create the tile layer that will be the background of our map.
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


  // Create a baseMaps object to hold the streetmap layer.
  let baseMaps = {
    "Street Map": streetmap
  };

  // Create an overlayMaps object to hold the bikeStations layer.
  let overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options.
  let map = L.map("map-id", {
    center: [centerLatitude, centerLongitude],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  
  // Create a legend to display information about the map
  let legend = L.control({
    position: "bottomright"
  });
  legend.onAdd = () => {
    let div = L.DomUtil.create("div", "legend");
    limits = [ -10, 10, 30, 50, 70, 90 ]
    colors = ['lime', 'greenyellow', 'yellow', 'orange', 'orangered', 'red']
    labels = [];
    
    div.innerHTML = "<h3>Depth</h3>"
    for (var i = 0; i < limits.length; i++) {
      if (i < (limits.length - 1)) {
        text = limits[i] + "-" + limits[i+1];
      } else {
        text = limits[limits.length - 1] + "+";
      }
      labels.push("<div style=\"background-color: " + colors[i] + "\">" + text + "</div>");
    }
    div.innerHTML += "<div class=\"labels\">" + labels.join("") + "</div>";
    return div;
  }
  legend.addTo(map);
}

function createColor(eqDepth) {
  if (eqDepth < 10) {
    return 'lime';
  } else if (eqDepth < 30) {
    return 'greenyellow'
  } else if (eqDepth < 50) {
    return 'yellow';
  } else if (eqDepth < 70) {
    return 'orange';
  } else if (eqDepth < 90) {
    return 'orangered';
  } else {
    return 'red';
  }
}

function createMarkers(response) {
  // Pull the "features" property from response.
  let eqFeatures = response.features;

  // Initialize an array to hold earthquake markers.
  let eqMarkers = [];

  // Loop through the eqFeatures array.
  for (let index = 0; index < eqFeatures.length; index++) {
    let eqProperties = eqFeatures[index].properties;
    let eqLongitude = eqFeatures[index].geometry.coordinates[0];
    let eqLatitude = eqFeatures[index].geometry.coordinates[1];
    let eqDepth = eqFeatures[index].geometry.coordinates[2];

    // For each earthquake, create a marker, and bind a popup with the earthquake's origin.
    let eqMarker = L.circleMarker([eqLatitude, eqLongitude], {
      radius: eqProperties.mag * 5,
      fillColor: createColor(eqDepth),
      fillOpacity: 0.75,
      color: 'black',
      weight: 0.5
    }).bindPopup(
      "<h3>" + eqProperties.place + "<h3>" + 
      "<h3>Magnitude: " + eqProperties.mag + "</h3>" + 
      "<h3>Depth: " + eqDepth + "</h3>"
    );

    // Add the marker to the eqMarkers array.
    eqMarkers.push(eqMarker);
  }

  // Create a layer group that's made from the earthquake markers array, and pass it to the createMap function.
  createMap(
      L.layerGroup(eqMarkers), 
      (response.bbox[4] + response.bbox[1]) / 2, 
      (response.bbox[3] + response.bbox[0]) / 2
  );
}


// Perform an API call to the USGS API to get the earthquake information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
