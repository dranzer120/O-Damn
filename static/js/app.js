
var MaleOrFemaleChart = dc.pieChart('#male-female-chart');
var RaceChart = dc.pieChart('#race-chart');
var DrugChart = dc.barChart('#bar-chart');
var WeekChart = dc.rowChart('#week-chart');

d3.csv("/static/data/ConnecticutAccidentalDeath.csv").then(function (data) {
    console.log(data)

    var dateFormatSpecifier = '%m/%d/%Y';
    var dateFormat = d3.timeFormat(dateFormatSpecifier);
    var dateFormatParser = d3.timeParse(dateFormatSpecifier);
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {
        d.parsed_date = dateFormatParser(d.Date);
        d.month = d3.timeMonth(d.parsed_date); // pre-calculate month for better performance
        d.age = +d.Age;
        d.count = +d.CountOfDrugs;
    });


    var ndx = crossfilter(data);
    var all = ndx.groupAll();
    
    //returning Full year
    var yearlyDimension = ndx.dimension(function (d) {
        return d3.timeYear(d.parsed_date).getFullYear();
    });

    
    //Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return d.parsed_date;
    });

    //Dimension by month
    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
    console.log(data[0].parsed_date)

    //Create Gender Dimension
    var MaleOrFemale = ndx.dimension(function (d) {
        return d.Sex;
    });

    //Produce counts records in the dimension
    var MaleOrFemaleGroup = MaleOrFemale.group();

    //Create Race Dimension
    var race = ndx.dimension(function (d){
        return d.Race
    })

    var raceGroup = race.group();

    //Counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.parsed_date.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();

    //Create Dimension drugs
    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
        return d.count;
    });


    MaleOrFemaleChart
    .width(320)
    .height(320)
    .radius(120)
    .dimension(MaleOrFemale)
    .group(MaleOrFemaleGroup)
    .label(function (d) {
        if (MaleOrFemaleChart.hasFilter() && !MaleOrFemaleChart.hasFilter(d.key)) {
            return d.key + '(0%)';
        }
        var label = d.key;
        if (all.value()) {
            label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
        }
        return label;
    })

    RaceChart
    .width(320)
    .height(320)
    .radius(120)
    .dimension(race)
    .group(raceGroup)

    WeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(280)
        .height(280)
        .margins({top: 20, left: 30, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(6);

    DrugChart
        .width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(400)
        .margins({top: 30, right: 50, bottom: 50, left: 50})
        .dimension(moveMonths)
        .group(monthlyMoveGroup)
        .centerBar(false)
        .gap(1)
        .x(d3.scaleTime().domain([new Date(2012, 1, 1), new Date(2018, 12, 31)]))
        .round(d3.timeMonth.round)
        .xUnits(d3.timeMonths)
        .xAxisLabel('Years')
        .yAxisLabel('# of Drugs')

    // DrugChart.xAxis().tickFormat(
    //     function(v){
    //         console.log(v)
    //         return v.getMonth() + 1;
    //     }
    //)



    // map 

    // Configurations => API keys, etc
var apiKey = "pk.eyJ1IjoiZ2wwYmUzNjB0cm90dGVyIiwiYSI6ImNqeXZ2cDZzbjBlbmozbHBleDZoMncwbGEifQ.WP92mvLKR1EwD6VELELF3Q";

    var map = L.map("map");
    
    var drawMap = function(){
        map.setView([41.6573, -72.6566], 12);
        // Initial Layer
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 20,
            id: 'mapbox.streets',
            accessToken: apiKey
        }).addTo(map);

        // Grab the data from the Earthquake Data Provider using d3 JSON
// d3.csv('/static/data/ConnecticutAccidentalDeath.csv')
// .then(
//     function(data) {
//         console.log('Successfully fetched the data from the ConnecticutAccidentalDeath csv:', data);
        
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
        map.addLayer(markers);
        }

        // draw map
        drawMap();


        //update map if any chart gets filtered

        dcCharts = [ MaleOrFemaleChart, RaceChart, DrugChart, WeekChart];
        dcCharts.forEach(function(dcChart){
            dcChart.on("filtered", function(chart, filter){
                map.eachLayer(function(layer){
                    map.removeLayer(layer)
                });

                // draw map
                drawMap();
            });
        });
    



    dc.renderAll();

});



