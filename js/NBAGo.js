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
		buildTreeMap(srartIndex,stopIndex);

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
	d3.select(".mydiv").remove();
}

function buildTreeMap(start, end)
{
	clearTreeMap();

	var currentTeamPoints = [];
	var currentTeamPointsObj = {};

	var xscale = d3.scale.linear()
			.domain([0, coordinateX])
			.range([0, courtimgwidth]);

	var yscale = d3.scale.linear()
			.domain([0, coordinateY])
			.range([0, courtimgwidth]);

	var shotgroup;

	var q = queue(1);
	var curDate;
	var filename;

	for(i = start; i <= end; i++)
	{
		curDate = changeFormat(gamesOfSelectedTeam[i].Date);
		filename = "datasets/2009-2010.regular_season/" + curDate + "." + teamAbbreviation[gamesOfSelectedTeam[i].Visitor]
				+ teamAbbreviation[gamesOfSelectedTeam[i].Home] + ".csv";
		q.defer(d3.csv,filename);
	}
	q.await(createPieVis);
}



function createPieVis(err) {
	if (err) return;
	var d = new Array();
//		console.log(arguments)
	for (var i=1; i<arguments.length; i++)
	{
		Array.prototype.push.apply(d , arguments[i]);
		// d = arguments[i];
	}
//		console.log(d);
	var currentTeamPoints = [];
	d.forEach(function(d) {
		if(d.team == currentTeam) {
			if(d.result == "made") {
				d.num = +d.num;
				d.points = +d.points;
				if(!currentTeamPoints[d.player] ) {
					currentTeamPoints[d.player] = 0;
				}
				if(d.num){
					currentTeamPoints[d.player] = +currentTeamPoints[d.player] + d.num;
				}
				else if(d.points) {
					currentTeamPoints[d.player] = +currentTeamPoints[d.player] + d.points;
				}
			}
		}
	});
	console.log(currentTeamPoints)
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
	var data = [];
	var i = 0;
	for (var player in currentTeamPoints) {
		data.push(new Object());
		data[i].name = player;
		data[i].value = currentTeamPoints[player];
		i++;
	}
	console.log(data)
	buildPie(data);
	var accuracy = [];
	for (var i=1; i<arguments.length; i++)
	{
		accuracy[i - 1] = {date: i, made: 0, missed: 0};
		arguments[i].forEach(function(d) {
//				console.log(d)
			if(d.team == currentTeam) {
//					if(!accuracy[i].made ) {
//						accuracy[i].made = 0;
//					}
//
//					if(!accuracy[i].missed ) {
//						accuracy[i].missed = 0;
//					}
				if(d.result == "made") {
					accuracy[i - 1].made += 1;
				}
				if(d.result == "missed") {
					accuracy[i - 1].missed += 1;
				}
			}
		});
		// d = arguments[i];
	}
	//console.log(accuracy)
	buildLineChart(accuracy);
}


