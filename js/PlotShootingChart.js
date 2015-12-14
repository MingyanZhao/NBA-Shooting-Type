var xcount;
var shootsvg
var shc_xscale;
var shc_yscale;

function clearShootingChart()
{
	shootingChartDiv.selectAll("p").remove();
	shootingChartDiv.select(".shootingchart").remove();
}

function clearShootingDots()
{
	shootingChartDiv.selectAll("g").remove();
}

function shootingChart(d)
{

	clearShootingChart();
	shootsvg = shootingChartDiv.append("svg")	
					.attr("width", courtimgwidth)
					.attr("height", courtimgheight - 100)
					.attr("class", "shootingchart")
			
	shc_xscale = d3.scale.linear()
					.domain([0, coordinateX])
					.range([0, courtimgwidth]);
					
	shc_yscale = d3.scale.linear()
					.domain([0, coordinateY])
					.range([0, courtimgwidth]);	
	addShootingPoints(d);
}

function addShootingPoints(arguments)
{
	 //if(err) return;
	//console.log(arguments);
	clearShootingDots();	
	var d = new Array();
	
	if(arguments[0] == null)
	{
		for (var i=1; i<arguments.length; i++)
		{
			Array.prototype.push.apply(d , arguments[i]);
		}
	}
	else
	{
		d = arguments;
	}
	var curDate;
	var shotgroup;
			
	var new_coordinates = [];
	var temp_coordinates = {};
	
	
	d.forEach(function(d) {
		d.x = +d.x;
		d.y = +d.y;
		if (temp_coordinates[d.x+','+d.y] == null) {
			temp_coordinates[d.x+','+d.y] = {'total': 1};
			if (d.result == 'made') {
				temp_coordinates[d.x+','+d.y].made = 1;
				temp_coordinates[d.x+','+d.y].missed = 0;
			} else {
				temp_coordinates[d.x+','+d.y].made = 0;
				temp_coordinates[d.x+','+d.y].missed = 1;
			}
		} else {
			temp_coordinates[d.x+','+d.y].total++;
			if (d.result == 'made') temp_coordinates[d.x+','+d.y].made++;
			else temp_coordinates[d.x+','+d.y].missed++;
		}
	});

			var k = Object.keys(temp_coordinates);
			var MAX_SHOT = 0;
			k.forEach(function(d){
				if (d.split(',')[0] != 0 && d.split(',')[1] != 0)
					if(d.split(',')[0] < 23 || d.split(',')[0] >27 || d.split(',')[1] < 4 || d.split(',')[1] > 8)
						if (temp_coordinates[d].total > MAX_SHOT)MAX_SHOT = temp_coordinates[d].total;
				new_coordinates.push({'x': d.split(',')[0], 'y': d.split(',')[1], 'details': temp_coordinates[d]});
			})
			console.log(MAX_SHOT);
			console.log(temp_coordinates);
			
			shotgroup = shootsvg.selectAll("g")
					.data(new_coordinates) // It was displaying d originally, but we display the processed data now.
					.enter()
					.append("g")
						
			shotgroup.append("circle")		
						.attr("transform", function (d, i){ return "translate(" + (courtimgwidth - shc_xscale(d.x)) + "," + (shc_yscale(d.y) - 5.25) + ")"; })
						.attr("r", function(d){
							return (d.details.total/MAX_SHOT > 1)? 7 : 7*d.details.total/MAX_SHOT + 4;
						})
						.attr("fill", function(d){
							return "red"
							//if(d.details.made > d.details.missed) return "green";
							//else return "red";
						})
						.attr("opacity", function(d){
							return d.details.made/d.details.total;							
							//if(d.details.made > d.details.missed) return (d.details.made-d.details.missed)/d.details.total;
							//else return (d.details.missed-d.details.made)/d.details.total;
						})
}

function drawshootchart(d)
{
	dispatch.on("change.drawshootchart", function(d) {
			shootingChart(d);
	 });
}