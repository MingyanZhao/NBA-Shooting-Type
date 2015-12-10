var containerDiv = d3.select("body")
						.attr("class", "container")
						.append("div")	

var leftDiv= containerDiv
						.append("div")
						.attr("class", "col-md-1")

var mainDiv = containerDiv
						.append("div")
						.attr("class", "col-md-10" )
var rightDiv = containerDiv
						.append("div")								
						.attr("class", "col-md-1")

var downDiv = containerDiv.append("div")

						
var shootingChartDiv = d3.select("body")
						.append("div")
						.attr("class", "col-md-10 col-md-offset-3 shootchart")

var treeMapDiv = d3.select("body")
		.append("div")
		.attr("class", "col-md-10 col-md-offset-3")

var transitCrossfilter = crossfilter();
		
var courtimgwidth = 500
var courtimgheight = 472
var coordinateX = 50;
var coordinateY = 47.2;

var mapWidth = 960;
var mapHeight = 500;


var teamLogoWidth = 40;
var teamLogoRaduis = teamLogoWidth / 2;
var teamLogoHeight = teamLogoWidth;

var usaMapSvg = mainDiv.append("svg")
	.attr("width", mapWidth)
	.attr("height", mapHeight)
		
		
var tip = d3.tip()

var projection = d3.geo.albersUsa()
		//.scale(1000)
		.translate([mapWidth / 2, mapHeight / 2]);

var path = d3.geo.path()
		.projection(projection);
		
var teamAbbreviation = new Array();
var accuracyByTeam_Home = new Array();
var accuracyByTeam_Away = new Array();
var gamesOfSelectedTeam = new Array();

var gameBarChartWidth = 1100;
var gameBarChartHeight = 300;
var gameBarChartBaseLine = 150;

var selectedGamesData = [];

var gameBarChartSvg = downDiv
	.attr("class", "col-md-12" )
	.append("svg")
	.attr("width", gameBarChartWidth)
	.attr("height", gameBarChartHeight)	

var dispatch = d3.dispatch("start", "chooseTeam", "change");

var selectedGamesDim;

dispatch.on("start.startpage", startPage);
dispatch.on("chooseTeam", chooseTeam);
dispatch.on("change.drawshootchart", drawshootchart);
dispatch.on("change.drawtreemap", drawtreemap);
dispatch.on("change.slopChart", slopChart);
dispatch.on("change.otherChart", otherChart);
dispatch.start();
//startPage();
//shootingChart();

var transitCrossfilter = crossfilter();

function chooseTeam(selectedteam, season, startdate, enddate)
{
	currentTeam = selectedteam;
	var date;
	
	
	d3.csv("datasets/2009-2010.regular_season/result20092010.csv", function(err, d){
		gamesOfSelectedTeam = [];
		d.forEach(function(d, i)
		{
			var curDate = changeFormat(d.Date);
			if(selectedteam == teamAbbreviation[d.Home] || selectedteam == teamAbbreviation[d.Visitor])
			{
				if(true == checkDateInterval(startdate, enddate, curDate))
				{
					gamesOfSelectedTeam[gamesOfSelectedTeam.length] = d;
				}
				else 
				{
					return;
				}
			}
		})
		drawBarChart(selectedteam, gamesOfSelectedTeam);
	})
	return;
}

function changeFormat(date)
{
	//console.log(date);
	var mon;
	switch(date.substring(4,7))
	{
	case  "Oct":
		mon = "10";
		break;
	case  "Nov":
		mon = "11";
		break;
	case "Dec":
		mon = "12";
		break;
	case "Jan":
		mon = "01";
		break;
	case "Feb":
		mon = "02";
		break;
	case "Mar":
		mon = "03";
		break;
	case "Apr":
		mon = "04";
		break;
	}
	
	var day = date.length == 14 ? ("0" +date.charAt(8)) : date.substring(8,10);
	var year = date.length == 14 ? date.substring(10,14) : date.substring(11,15);
	//console.log(year+mon+day); 
	return year+mon+day;
	
}

var t = 10;

function checkDateInterval(startdate, enddate, checkingDate)
{
	var startYear = parseInt(startdate.substring(0,4));
	var startMon = parseInt(startdate.substring(4,6));
	var startDay = parseInt(startdate.substring(6,8));		
	var endYear = parseInt(enddate.substring(0,4));
	var endMon = parseInt(enddate.substring(4,6));
	var endDay = parseInt(enddate.substring(6,8));		
	var checkYear = parseInt(checkingDate.substring(0,4));
	var checkMon = parseInt(checkingDate.substring(4,6));
	var checkDay = parseInt(checkingDate.substring(6,8));
	
	if(checkYear < startYear) return false;
	else if(checkYear == startYear)
	{
		if(checkMon < startMon) return false;
		else if(checkMon == startMon)
		{
			if(checkDay < startDay) return false;
		}
	}		
	
	if(checkYear > endYear) return false;
	else if(checkYear == endYear)
	{
		if(checkMon > endMon) return false;
		else if(checkMon == endMon)
		{
			if(checkDay > endDay) return false;
		}
	}
	return true;
}

function drawtreemap()
{
	dispatch.on("change.drawtreemap", function(srartIndex, stopIndex) {
		//console.log("drawtreemap");
		//console.log(gamesOfSelectedTeam);
		//console.log(gamesOfSelectedTeam[srartIndex]);
		//console.log(gamesOfSelectedTeam[stopIndex]);
		//buildTreeMap(srartIndex,stopIndex);

	});
}

function slopChart()
{
	dispatch.on("change.slopChart", function(srartIndex, stopIndex) {
//				console.log("slopChart");
//				console.log(gamesOfSelectedTeam);
//				console.log(gamesOfSelectedTeam[srartIndex]);
//				console.log(gamesOfSelectedTeam[stopIndex]);

	 });
}


function otherChart()
{
	dispatch.on("change.otherChart", function(srartIndex, stopIndex) {
//				console.log("otherChart");
//				console.log(gamesOfSelectedTeam);
//				console.log(gamesOfSelectedTeam[srartIndex]);
//				console.log(gamesOfSelectedTeam[stopIndex]);

	 });
}



function clearTreeMap()
{
	treeMapDiv.select(".treemap").remove();
}

function buildTreeMap(start, end)
{
	clearTreeMap();

	var currentTeamPoints = [];
	var currentTeamPointsObj = {};

	var treemapSvg = treeMapDiv.append("svg")
			.attr("width", courtimgwidth)
			.attr("height", courtimgheight)
			.attr("class", "treemap")


	var xscale = d3.scale.linear()
			.domain([0, coordinateX])
			.range([0, courtimgwidth]);

	var yscale = d3.scale.linear()
			.domain([0, coordinateY])
			.range([0, courtimgwidth]);

	var shotgroup;

	var q = queue();

	for(i = start; i <= end; i++)
	{
		var curDate = changeFormat(gamesOfSelectedTeam[i].Date);
		//console.log(curDate)
		//console.log(teamAbbreviation)
		
		d3.csv("datasets/2009-2010.regular_season/" + curDate + "." + teamAbbreviation[gamesOfSelectedTeam[i].Visitor]
				+ teamAbbreviation[gamesOfSelectedTeam[i].Home] + ".csv", function(err, d) {
			if(err) console.log(err);

			d.forEach(function(d) {
				d.x = +d.x;
				d.y = +d.y;

				if(d.team == currentTeam) {
					if(d.result == "made") {

						d.num = +d.num;
						d.points = +d.points;

						if(!currentTeamPoints[d.player] ) {
							currentTeamPoints[d.player] = 0;
						}
						if(!currentTeamPointsObj.hasOwnProperty(d.player)) {
							currentTeamPointsObj[d.player] = 0;
						}
						if(d.num){
							 currentTeamPoints[d.player] = +currentTeamPoints[d.player] + d.num;
							 currentTeamPointsObj[d.player]=  +currentTeamPoints[d.player] + d.num;
						 }
						else if(d.points) {
							currentTeamPoints[d.player] = +currentTeamPoints[d.player] + d.points;
							currentTeamPointsObj[d.player] = +currentTeamPoints[d.player] + d.points;
						}
					}
				}
			});
			//console.log(currentTeamPoints)
			//console.log(currentTeamPointsObj)

			var pointsLength = Object.keys(currentTeamPoints).length;
			var totalPoints = 0;
			var index = 0;
			var dataArray = new Array();
			for (var i in currentTeamPoints) {
				totalPoints += currentTeamPoints[i];
				dataArray[index++] = +currentTeamPoints[i];
			}

			var root = {};
			root.name = "Data";
			root.children = [];

			var i = 0;
			for (var player in currentTeamPoints) {
				root.children[i] = new Object();
				root.children[i].name = player;
				root.children[i].value = currentTeamPoints[player];

				i++;
			}

			var treemap = d3.layout.treemap()
					.size([500, 500])

			var nodes = treemap.nodes(root);
			var links = treemap.links(nodes);

			//console.log(root)
			//console.log(dataArray)
			//console.log(nodes)
			//console.log(links)

			var treemapTrailGroup =	treemapSvg.selectAll("g")
					.data(dataArray)
					.enter()
					.append("g")

			color = d3.scale.category20c();
			treemapTrailGroup
					.append("rect")
					.attr("width",  function(d,i) { return nodes[i + 1].dx})
					.attr("height", function(d,i) { return nodes[i + 1].dy})
					.attr("transform", function (d, i) {return "translate(" + (nodes[i + 1].x) +"," + (nodes[i + 1].y) + ")"})
					.style("fill", function(d, i) { console.log(d); return color(nodes[i + 1].name);})
					.style("stroke", "black")
					.style("stroke-width", "2px")

			treemapTrailGroup.append("text")
					.attr("x", function(d,i) { return nodes[i + 1].x })
					.attr("y", function(d,i) { return nodes[i + 1].y + 30})
					.attr("width", function(d,i) { return nodes[i + 1].dx / 2})
					.text(function(d, i) {
						return nodes[i + 1].name + '(' + nodes[i + 1].value + ')';
					});

			// two functions that may work to have word wrap... work in progress
			function fontSize(d,i) {
				var size = d.dx/5;
				var words = nodes[i + 1].name.split(' ');
				var word = words[0];
				var width = nodes[i + 1].dx;
				var height = nodes[i + 1].dy;
				var length = 0;
				d3.select(this).style("font-size", size + "px").text(word);
				while(((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > 12))
				{
					size--;
					d3.select(this).style("font-size", size + "px");
					this.firstChild.data = word;
				}
			}

			function wordWrap(d, i){
				var words = nodes[i + 1].name.split(' ');
				var line = new Array();
				var length = 0;
				var text = "";
				var width = nodes[i + 1].dx;
				var height = nodes[i + 1].dy;
				var word;
				do {
					word = words.shift();
					line.push(word);
					if (words.length)
						this.firstChild.data = line.join(' ') + " " + words[0];
					else
						this.firstChild.data = line.join(' ');
					length = this.getBBox().width;
					if (length < width && words.length) {
						;
					}
					else {
						text = line.join(' ');
						this.firstChild.data = text;
						if (this.getBBox().width > width) {
							text = d3.select(this).select(function() {return this.lastChild;}).text();
							text = text + "...";
							d3.select(this).select(function() {return this.lastChild;}).text(text);
							d3.select(this).classed("wordwrapped", true);
							break;
						}
						else
							;

						if (text != '') {
							d3.select(this).append("svg:tspan")
									.attr("x", 0)
									.attr("dx", "0.15em")
									.attr("dy", "0.9em")
									.text(text);
						}
						else
							;

						if(this.getBBox().height > height && words.length) {
							text = d3.select(this).select(function() {return this.lastChild;}).text();
							text = text + "...";
							d3.select(this).select(function() {return this.lastChild;}).text(text);
							d3.select(this).classed("wordwrapped", true);

							break;
						}
						else
							;

						line = new Array();
					}
				} while (words.length);
				this.firstChild.data = '';
			}
		})
	}
}