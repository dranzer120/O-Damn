console.log("ssss")

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

    });

    console.log(data[0].parsed_date)
})
