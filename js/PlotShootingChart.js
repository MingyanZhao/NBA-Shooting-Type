var xcount;
var shootsvg
var shc_xscale;
var shc_yscale;

function clearShootingChart()
{
	shootingChartDiv.selectAll("p").remove();
	shootingChartDiv.select(".shootingchart").remove();
}

function shootingChart(d)
{
	clearShootingChart();
	//console.log("there")
	console.log(d);
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
	addShootingPoints(d);
}

function addShootingPoints(arguments)
{
	 //if(err) return;
	 console.log(arguments);
	 var d = new Array();
	 
	 for (var i=1; i<arguments.length; i++)
	 {
		 Array.prototype.push.apply(d , arguments[i]);
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
	/*
	shootingChartDiv.selectAll("p")
					.data(d)
					.enter()
					.append("p")
						.text(function(d, i) {return "this  No. " + i + "  " + d.team + " and " + d.team ;})
	*/

}

function drawshootchart(d)
{
	dispatch.on("change.drawshootchart", function(d) {
//				console.log("drawshootchart");
//				console.log(gamesOfSelectedTeam);
//				console.log(gamesOfSelectedTeam[srartIndex]);
//				console.log(gamesOfSelectedTeam[stopIndex]);
			shootingChart(d);

	 });
}