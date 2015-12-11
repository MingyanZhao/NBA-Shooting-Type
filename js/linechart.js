function buildLineChart(data, currentTeam) {
    d3.select(".linediv").remove();

    var margin = {top: 20, right: 200, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    //var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        //.interpolate("basis")
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.accuracy);
        });

    data.forEach(function (d) {
        d.currentTeam_hitRate = d.currentTeam_made / (d.currentTeam_made + d.currentTeam_missed);
        d.currentTeam_missRate = d.currentTeam_missed / (d.currentTeam_made + d.currentTeam_missed);

        d.opponents_hitRate = d.opponents_made / (d.opponents_made + d.opponents_missed);
        d.opponents_missRate = d.opponents_missed / (d.opponents_made + d.opponents_missed);
    });

    var svg = d3.select("body")
        .append("div")
        .attr("class", "linediv")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function (key) {
        return (key !== "date" && key !== "currentTeam_made" && key !== "currentTeam_missed" && key !== "opponents_made" && key !== "opponents_missed");
    }));

    var accuracy = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {date: d.date, accuracy: +d[name]};
            })
        };
    });

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));

    y.domain([
        d3.min(accuracy, function (c) {
            return d3.min(c.values, function (v) {
                return v.accuracy;
            });
        }),
        d3.max(accuracy, function (c) {
            return d3.max(c.values, function (v) {
                return v.accuracy;
            });
        })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Hit/Miss Rate");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Game");

    var city = svg.selectAll(".city")
        .data(accuracy)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    city.append("text")
        .datum(function (d) {
            return {name: d.name, value: d.values[d.values.length - 1]};
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.accuracy) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function (d) {
            if(d.name == "currentTeam_hitRate") {
                d.name = currentTeam + " - FG%";
            }
            if(d.name == "currentTeam_missRate") {
                d.name = currentTeam + " - Missed FG%";
            }
            if(d.name == "opponents_hitRate") {
                d.name = "Opponents - FG%";
            }
            if(d.name == "opponents_missRate") {
                d.name = "Opponents - Missed FG%";
            }
            return d.name;
        });
}
