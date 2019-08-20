
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
    
    dc.renderAll();

});
