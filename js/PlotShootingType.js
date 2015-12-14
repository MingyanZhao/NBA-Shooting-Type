var shootingTypefilter
var resultDimension;
var playerDimension;
var typeDimension;
var distanceDimension;
var distanceFilter;
var resultfilter;
var typefiler;
var playerfilter;
var filtered;
var typeWidth = 900;
var typeHeight = 300;
var typeBarsStartx = 50;
var selectedPlayer;
var selectedType;

var jump5 = "jump in 5feet";
var jump5to10 = "jump 5ft-10ft"
var jump11to15 = "jump 11ft-15ft"
var jump15to22 = "jump 15ft-22ft"
var jump21to25 = "jump 21ft-25ft"
var jumpover25 = "jump >25ft"


function clearShootingType()
{
	shootingTypeDiv.selectAll("p").remove();
	shootingTypeDiv.select(".shootingType").remove();
}

function ShootingType(d)
{
	//clearShootingChart();
	//console.log("there")
	var d = arguments[0];
	var array = new Array();
	for (var i=1; i < d.length; i++)
	{
		Array.prototype.push.apply(array , d[i]);
	}
	
	shootingTypefilter = crossfilter(array);

	typeDimension = shootingTypefilter.dimension(function(d) {
		//console.log(d.type); 
		if(d.type == "") return "other"; 
		else return d.type; });
	
	playerDimension = shootingTypefilter.dimension(function(d) {
		//console.log(d.type); 
		if(d.type == "") return "other"; 
		else return d.player; });

	resultDimension = shootingTypefilter.dimension(function(d) {
		if(d.type == "") return "other"; 
		else return d.result; });

		
	distanceDimension = shootingTypefilter.dimension(function(d){
		var t = Math.sqrt(Math.pow(d.x - 25, 2) + Math.pow(d.y - 5.5, 2))

		return t;
	})
		
	typeDimension.filterAll();	
	playerDimension.filterAll();
	resultDimension.filterAll();
	distanceDimension.filterAll();
	result = "NULL";
	type = "NULL";
	player = "NULL";
	
	shootingTypeFilter(result, type, player);
}

function shootingTypeFilter(result, type, player)
{
	selectedPlayer = player;
	selectedType = type;
	
	typeDimension.filterAll();	
	playerDimension.filterAll();
	resultDimension.filterAll();
	
	resultfilter = resultDimension.filterFunction(function(d) { 
		if(result == "NULL") return true;
		if(d == result) return true;
		else return false;
	})

	typefiler = typeDimension.filterFunction(function(d) { 
		if(type == "NULL") return true;
		if(d == type) return true;
		else return false;
	})

	playerfilter = playerDimension.filterFunction(function(d) { 
		 //console.log(d);
		if(player == "NULL") return true;
		if(d == player) return true;
		else return false;
	})
	

//console.log(filtered)
	filtered = typeDimension.top(Infinity);
	addShootingPoints(filtered);
	
	drawBars(filtered);
}

function clearTypeBars()
{
	shootingTypeDiv.selectAll("svg").remove();
}

function drawBars(data)
{
	clearTypeBars();

	var types = [];
	var typeForDomain = [];
	var tmptype;
	var distance = "";
	
	data.forEach(function(d){
		if(d.result == "") return;
		//types[d.type] = new Object();
		if(d.type == "" || d.type == "3pt" || d.type == "layup") return;
		
		if(d.type == "jump"){
			distance = Math.sqrt(Math.pow(d.x - 25, 2) + Math.pow(d.y - 5.5, 2))
			if(distance >0 && distance <= 5) tmptype = "jump in 5feet";
			else if(distance > 6 && distance < 10) tmptype = "jump 5ft-10ft"
			else if(distance >= 11 && distance < 15) tmptype = "jump 11ft-15ft"
			else if(distance >= 16 && distance < 20) tmptype = "jump 15ft-22ft"
			else if(distance >= 21 && distance < 25) tmptype = "jump 21ft-25ft"
			else if(distance >= 25) tmptype = "jump >25ft"
		}
		else tmptype = d.type;
		
		if(types[tmptype] == null){
			types[tmptype] = {}
			types[tmptype].player = [];
			if(d.type == "jump") types[tmptype].distance = tmptype;
			else types[tmptype].distance = "";
			
			if(d.result == "made"){
				types[tmptype].made = 1;
				types[tmptype].miss = 0;
				
			} 
			else if (d.result == "missed")
			{
				types[tmptype].miss = 1;
				types[tmptype].made = 0;
			}
		}
		else{
			var i = types[tmptype].player.length;
			types[tmptype].player[i] = d.player;
			if(d.result == "made") types[tmptype].made++;
			else if (d.result == "missed") types[tmptype].miss++;
		}
	})
	
	var index = 0;
	for (var i in types) {
		//console.log('Key is: ' + i + '. Value is: ' + types[i]);

		typeForDomain[index] = i;
		index++;
	} 
	
    var margin = {top: 20, right: 250, bottom: 150, left: 50};
    var width = typeWidth - margin.left - margin.right;
    var height = typeHeight - margin.top - margin.bottom;
		
	var x = d3.scale.ordinal()

    var y = d3.scale.linear()
  
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
		

    var yAxis = d3.svg.axis()
        .scale(y)
		.orient("left")
		.ticks(0);

	
	/*
	x.domain(d3.range(typeForDomain.length))
		.rangeRoundBands([0, width],0.05);
	*/
	x.domain(typeForDomain)
		.rangeRoundBands([0, width], 0.08);	

	y.domain(d3.extent(typeForDomain, function (d) {    
		return types[d].made;
    }))
	.range([0, height])

	y.domain(d3.extent(typeForDomain, function (d) {    
		return types[d].made;
    }))
	.range([0, height])
	
	
	var typeMadeSvg = TypeMadeDiv.append("svg")
					.attr("width", typeWidth)
					.attr("height", typeHeight)

	typeMadeSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + typeBarsStartx + "," + height + ")")
        .call(xAxis)
	  .selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(90)")
			.style("text-anchor", "start");

	typeMadeSvg.append("g")
        .attr("class", "y axis")
		.attr("transform", "translate(" + typeBarsStartx + "," + 0 + ")")
        .call(yAxis)
		/*
 		.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 2)
        .attr("x", 100) //0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("type");
		*/
		
	typeMadeSvg.selectAll("rect")
			.data(typeForDomain)
			.enter()
				.append("rect")
				.attr("width", x.rangeBand())
				.attr("height", function(d,i) {if(y(types[d].made) < 0) console.log("  1  " + i) ;return y(types[d].made)})
				.attr("transform", function (d, i) {return "translate(" +(x(d) + typeBarsStartx) +"," + (height - y(types[d].made)) + ")"})
				.attr("fill", "green")

				
	y.domain(d3.extent(typeForDomain, function (d) {    
		return types[d].miss;
    }))
	.range([0, height])
	var typeMissSvg = TypeMadeDiv.append("svg")
					.attr("width", typeWidth)
					.attr("height", typeHeight)
				
	typeMissSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" +typeBarsStartx + "," + height + ")")
        .call(xAxis)
		  .selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(90)")
			.style("text-anchor", "start");

	typeMissSvg.append("g")
        .attr("class", "y axis")
		.attr("transform", "translate(" + typeBarsStartx + "," + 0 + ")")
        .call(yAxis)
		/*
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("type");
		*/

		
	typeMissSvg.selectAll("rect")
			.data(typeForDomain)
			.enter()
				.append("rect")
				.attr("width", x.rangeBand())
				.attr("height", function(d,i) {if(y(types[d].miss) < 0) console.log(" 2  " + types[d].miss); return y(types[d].miss)})
				.attr("transform", function (d, i) {return "translate(" + (x(d) + typeBarsStartx) +"," + (height - y(types[d].miss)) + ")"})
				.attr("fill", "red")			
	
	var yAccuracyScale = d3.scale.linear()
					.domain([0,1])
					.range([0, height])
	var typeAccuracySvg = TypeAccuracyDiv.append("svg")
					.attr("width", typeWidth)
					.attr("height", typeHeight)
				
	typeAccuracySvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(50," + height + ")")
        .call(xAxis)
		  .selectAll("text")
			.attr("y", 0)
			.attr("x", 9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(90)")
			.style("text-anchor", "start");

	typeAccuracySvg.append("g")
        .attr("class", "y axis")
		.attr("transform", "translate(" + typeBarsStartx + "," + 0 + ")")
        .call(yAxis)
		/*
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("type");
		*/
		
	typeAccuracySvg.selectAll("rect")
			.data(typeForDomain)
			.enter()
				.append("rect")
				.attr("width", x.rangeBand())
				.attr("height", function(d,i) {
						if(yAccuracyScale(types[d].made / (types[d].made + types[d].miss)) < 0) console.log(" 3  ")
						return yAccuracyScale(types[d].made / (types[d].made + types[d].miss));
					})
				.attr("transform", function (d, i) {return "translate(" + (x(d) + typeBarsStartx)+
					"," + (height - yAccuracyScale(types[d].made / (types[d].made + types[d].miss))) + ")"})
				.attr("fill", "#6699ff")			
			
		
		shootingTypeDiv.selectAll("rect")
						.on("click", function(s, i){
							selectedType = s;
							var t = types[s];
	
							if(typeSelectSwitch == false) return;
							else{
								typeDimension.filterAll();
								distanceDimension.filterAll();
								typefiler = typeDimension.filterFunction(function(d, i) { 
									if(d == "jump" 
										&& (selectedType == jump5
										|| selectedType == jump5to10
										|| selectedType == jump11to15
										|| selectedType == jump15to22
										|| selectedType == jump21to25
										|| selectedType == jumpover25))
									{
										console.log("jump   " + selectedType);
										return true;
									}																						
									else if(d == selectedType) return true;
									else if(selectedType == "NULL") return false;
									else
									{
										if(d == "jump" && t.distance != "") {
											
											console.log(selectedType);
											console.log(t.distance);
											console.log(d);
											console.log(t);
										}
										return false;
									}											
								})
								filtered = typeDimension.top(Infinity);
								
								switch(selectedType)
								{
									case jump5:
										filtered = distanceDimension.filter([0,5]).top(Infinity);
										break;
									case jump5to10:
										filtered = distanceDimension.filter([5,10]).top(Infinity);
										break;
									case jump11to15:
										filtered = distanceDimension.filter([11,15]).top(Infinity);
										break;
									case jump15to22:
										console.log("15 to 22" + selectedType);
										filtered = distanceDimension.filter([15,22]).top(Infinity);
										break;
									case jump21to25:
										filtered = distanceDimension.filter([21,25]).top(Infinity);
										break;
									case jumpover25:
										filtered = distanceDimension.filter([26,100]).top(Infinity);
										
										break;
									default:
										break;
								}
								
								console.log(filtered);
								addShootingPoints(filtered);	
							}

						})
			
			
}

function test()
{
	console.log("test");
}

function drawShootingType(d)
{
	console.log("shootingtype");
	dispatch.on("change.drawShootingType", function(d) {

			ShootingType(d);
	 });
}