var xscale = d3.scale.ordinal()
var yscale = d3.scale.linear()
var brush = d3.svg.brush().x(xscale)
		.on("brush", brushmove)
		.on("brushend", brushend);


var curDate
var filename

//brush.extent([0.4, 0.6]);

function resetBrush() {
  brush
	.clear()
	.event(d3.select(".brush"));
}

function brushmove() {
	var brushy = d3.scale.linear().domain(xscale.range()).range(xscale.domain());
	b = brush.extent();
	var curGameStart = (brush.empty()) ? 1 : Math.ceil(brushy(b[0])),
		curGameEnd = (brush.empty()) ? 1 : Math.ceil(brushy(b[1]));
	
	// Snap to rect edge
	d3.select("g.brush")
	.call((brush.empty()) ? brush.clear() : brush.extent([brushy.invert(curGameStart), brushy.invert(curGameEnd)]));

	// Fade all years in the histogram not within the brush
	d3.selectAll(".PointsGotbar").style("opacity", function(d, i) {
	  return i >= curGameStart && i <= curGameEnd || brush.empty() ? "1" : ".4";
	});

	d3.selectAll(".PointsLossbar").style("opacity", function(d, i) {
	  return i >= curGameStart && i <= curGameEnd || brush.empty() ? "1" : ".4";
	});
	
	dispatch.change(curGameStart, curGameEnd);
}

function brushend() {
	var brushy = d3.scale.linear().domain(xscale.range()).range(xscale.domain());
	var curGameStart = (brush.empty()) ? 0 : Math.ceil(brushy(b[0])),
	  curGameEnd = (brush.empty()) ? 0 : Math.floor(brushy(b[1]));
	//console.log(curGameStart + " to " + curGameEnd);
	
	d3.selectAll(".PointsGotbar").style("opacity", function(d, i) {
	  return i >= curGameStart && i <= curGameEnd || brush.empty() ? "1" : ".4";
	});
	d3.selectAll(".PointsLossbar").style("opacity", function(d, i) {
	  return i >= curGameStart && i <= curGameEnd || brush.empty() ? "1" : ".4";
	});
	
	global_startGameIndex = curGameStart;
	global_endGameIndex = curGameEnd;
	//selectedGamesDim = transitCrossfilter.dimension(function(d){ if(d.filename)return d.filename;});
	
	gameBarChartSvg
			.transition()
			.duration(500)
			.attr("width", gameBarChartWidth)
			.attr("height", 50)	
	
	yscale.range([0, gameBarChartBaseLine / 2])
	
	gameBarChartSvg.selectAll("rect")
			.transition()
			.duration(500)
			.attr("fill", "#cc0000")
			.attr("height", 50)
			.attr("y", 0)
	
	var q = queue(1);
	for(i = curGameStart; i <= curGameEnd; i++)
	{
		curDate = changeFormat(gamesOfSelectedTeam[i].Date);
		filename = "datasets/2009-2010.regular_season/" + curDate + "." + teamAbbreviation[gamesOfSelectedTeam[i].Visitor]
					+ teamAbbreviation[gamesOfSelectedTeam[i].Home] + ".csv";
		q.defer(d3.csv,filename);
	}
	q.await(updateVis);
}

function updateVis()
{
	//console.log(arguments);
	var d = arguments;
	dispatch.change(d);
}

function clearBarChartSvg()
{
//		console.log("clear");
	gameBarChartSvg.selectAll("rect").remove();
	gameBarChartSvg.selectAll("g").remove();
	
}
				  
function drawBarChart(select, games)
{

	clearBarChartSvg();
	
	var xpositions = new Array;
	var minPnt = 120;
	var maxPnt = 80;
		console.log(select);
	games.forEach(function (d, i){ 
		d.PTSHome = +d.PTSHome;
		d.PTSVisitor = +d.PTSVisitor;

		xpositions[i] = i + teamAbbreviation[d.Home] + teamAbbreviation[d.Visitor];
		
		if(teamAbbreviation[d.Home]  == select){
			
			if(d.PTSHome < minPnt) minPnt = d.PTSHome;
			else if (d.PTSHome > maxPnt) maxPnt = d.PTSHome;
		}
		else{
			if(d.PTSVisitor < minPnt) minPnt = d.PTSVisitor;
			else if (d.PTSVisitor > maxPnt) maxPnt = d.PTSVisitor;
		}
	})
			
	var bargroups = gameBarChartSvg.selectAll("g")
					.data(games)
					.enter()
					.append("g")
					.attr("class", "resuseableGroups")
	
	xscale.domain(d3.range(xpositions.length))
			.rangeRoundBands([0, gameBarChartWidth], 0.1);


	yscale.domain([0, maxPnt])
				.range([0, gameBarChartBaseLine])

	bargroups.append("rect")
				.attr("class", "PointsGotbar")
				.attr("x", function(d,i) {;return xscale(i);})
				.attr("height", function(d,i) {
					if(teamAbbreviation[d.Home]  == select) return yscale(d.PTSHome);
					else return yscale(d.PTSVisitor);
				})
				.attr("width", xscale.rangeBand())
				.attr("y", function(d,i) {
					if(teamAbbreviation[d.Home]  == select) return gameBarChartBaseLine - yscale(d.PTSHome);
					else return gameBarChartBaseLine - yscale(d.PTSVisitor);
				})
				.attr("fill", "red")
				
	bargroups.append("rect")
				.attr("class", "PointsLossbar")
				.attr("x", function(d,i) {return xscale(i);})
				.attr("height", function(d,i) {
					if(teamAbbreviation[d.Home]  == select) return yscale(d.PTSVisitor);
					else return yscale(d.PTSHome);
				})
				.attr("width", xscale.rangeBand())
				.attr("y", gameBarChartBaseLine)
				.attr("fill", "green")

		var brushgroup = gameBarChartSvg.append("g")
				  .attr("class", "brush")
				  .call(brush);	
	
		//brushgroup.selectAll(".resize").append("path")
			//.attr("transform", "translate(0," +  height / 2 + ")")
			//.attr("d", arc);

		brushgroup.selectAll("rect")
			.attr("height", gameBarChartHeight);
}