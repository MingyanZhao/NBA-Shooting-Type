var xcount;
var shootsvg
var shc_xscale;
var shc_yscale;

function clearShootingChart()
{
	shootingChartDiv.selectAll("p").remove();
	shootingChartDiv.select(".shootingchart").remove();
}

function shootingChart(start, end)
{
	clearShootingChart();
	
	shootsvg = shootingChartDiv.append("svg")	
					.attr("width", courtimgwidth)
					.attr("height", courtimgheight)
					.attr("class", "shootingchart")
					
			
	shc_xscale = d3.scale.linear()
					.domain([0, coordinateX])
					.range([0, courtimgwidth]);
					
	shc_yscale = d3.scale.linear()
					.domain([0, coordinateY])
					.range([0, courtimgwidth]);	
	var sgames = [];
	
	var name;
	
	var xrealcount;
	
	var tasks = [];

	var q = queue(1);
	var curDate
	var filename
	
	for(i = start; i <= end; i++)
	{
		 curDate = changeFormat(gamesOfSelectedTeam[i].Date);
		 filename = "datasets/2009-2010.regular_season/" + curDate + "." + teamAbbreviation[gamesOfSelectedTeam[i].Visitor]
					+ teamAbbreviation[gamesOfSelectedTeam[i].Home] + ".csv";
		q.defer(d3.csv,filename);
	}
	q.await(addShootingPoints);
}

function addShootingPoints(err)
{
	 if(err) return;
	 
	 var d = new Array();
	 for (var i=1; i<arguments.length; i++)
	 {
		 Array.prototype.push.apply(d , arguments[i]);
		// d = arguments[i];
	}
		var curDate;
		var shotgroup;
		
			d.forEach(function(d)
			{
				d.x = +d.x;
				d.y = +d.y;
			})
			
			//console.log(d);
			shotgroup = shootsvg.selectAll("g")
					.data(d)
					.enter()
						.append("g")
						
			shotgroup.append("circle")		
						.attr("transform", function (d, i){ return "translate(" + (courtimgwidth - shc_xscale(d.x)) + "," + (shc_yscale(d.y) - 5.25) + ")"; })
						.attr("r",5)
						.attr("fill", function(d){
							if(d.result == "made") return "red";
							else if(d.result == "missed") return "green";
										})
						.attr("opacity", function (d, i){
							if(d.team == "PHX") return 1;
							else if(d.team == "LAL") return 0;
						})
}

function drawshootchart()
{
	dispatch.on("change.drawshootchart", function(srartIndex, stopIndex) {
//				console.log("drawshootchart");
//				console.log(gamesOfSelectedTeam);
//				console.log(gamesOfSelectedTeam[srartIndex]);
//				console.log(gamesOfSelectedTeam[stopIndex]);
			shootingChart(srartIndex,stopIndex);

	 });
}