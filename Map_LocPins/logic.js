/*                             */
/* Initialize the maps objects */
/*                             */

// Configurations => API keys, etc
var apiKey = "pk.eyJ1IjoiZ2wwYmUzNjB0cm90dGVyIiwiYSI6ImNqeXZ2cDZzbjBlbmozbHBleDZoMncwbGEifQ.WP92mvLKR1EwD6VELELF3Q";

// Make the initial map 41.6032° N, 73.0877° W
var mymap = L.map('mapid').setView([41.6573, -72.6566], 12);

// var csvDataPts = "/MAP_boilerplate/db/ConnecticutAccidentalDeath.csv";

// Initial Layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id: 'mapbox.streets',
    accessToken: apiKey
}).addTo(mymap);


// Grab the data from the Earthquake Data Provider using d3 JSON
d3.csv('ConnecticutAccidentalDeath.csv')
.then(
    function(data) {
        console.log('Successfully fetched the data from the ConnecticutAccidentalDeath csv:', data);
        
        var death_data = data.map(function (d) {
            return {
                ID: d.ID,
                Age: d.Age,
                DC: d.DeathCity,
                DCLat: d.DCLat,
                DCLong: d.DCLong,
                RC: d.ResidenceCity,
                // RCLat: d.RCLati,
                // RCLong: d.RCLong,
                COD: d.COD
            }
        })
        console.log('Transform:', death_data);
            // console.log('eq_data_compact:', eq_data_compact);
        // Create CircleMarker points layer
        
        // forEach L.circleMarker(death_data,L.latLng(death_data.DCLat,death_data.DCLong),radius=10, color='#0000FF',fillColor='CC2EFA',
        //     fillOpacity=0.5).addTo(mymap);
        // var marker = L.marker([51.5, -0.09]).addTo(mymap);

        var markers = L.markerClusterGroup();

        // Loop through data
        for (var i = 0; i < death_data.length; i++) {

            // Set the data location property to a variable
            // {
            //     'type': 'Point',
            //     'coordinates': [death_data[i].DCLat, death_data[i].DCLong]
            // }

            // Check to see if there is a Lat/Long coordinate

            try {
                var location = {
                    'type': 'Point',
                    'coordinates': [+death_data[i].DCLat, +death_data[i].DCLong]
                }
    
                // Check for location property
                if (location) {
                    // console.log('location:', location);
    
                    // Add a new marker to the cluster group and bind a pop-up
                    markers.addLayer(L.marker([location.coordinates[0], location.coordinates[1]])
                    .bindPopup(
                        'Age: ' + death_data[i].Age + '</br>' +'COD:' + death_data[i].COD + '</br>' + 'City of residence: ' + death_data[i].RC
                        + '</br>' + 'City at death: ' + death_data[i].DC)
                        );
                }
            }
            catch {
                console.log('Error with data:', death_data[i]);
            }

        }

        // Add our marker cluster layer to the map
        mymap.addLayer(markers);
        }
    )


// Render the map

// // Render the map