function drawTeamLogos()
{
	d3.csv("datasets/usamap/arenaCoordinates.csv", function(err, d){
		var coordinates = [];

		d.forEach(function(d, i)
		{
			d.longtitude = +d.longtitude;
			d.latitude = +d.latitude;
			coordinates[i] = new Array();
			coordinates[i] = projection([d.longtitude,d.latitude])
			teamAbbreviation[d.Team] = d.T;
		})		
	
		tip.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<img src=\"img/" + d.T +".svg\" height=\"100\"></img>" 
			+ "<p><strong>"+ d.Team +"</strong> <span style='color:red'></p>"
			+ "<p><strong>Offensive Rating:</strong> <span style='color:red'>" + d.ORtg + "</span></p>"
			+ "<p><strong>Deffensive Rating:</strong> <span style='color:red'>" + d.DRtg + "</span></p>"
			+ "<p><strong>Pace:</strong> <span style='color:red'>" + d.Pace + "</span></p>";
		})

		usaMapSvg.call(tip);
	
		var teamLogoGroup = usaMapSvg.selectAll("g")
				.data(d)
				.enter()
					.append("g")
		

		var defs = teamLogoGroup.append("defs")
		
		
		var catpattern = defs.append("pattern")
                    .attr("id", function(d,i){return d.T;})
                    .attr("height", 1)
                    .attr("width", 1)
                    .attr("x", "0")
                    .attr("y", "0")
		
		catpattern.append("image")
						.attr("id", function(d){ return "logoid_" + d.T})
						.attr("xlink:href",function(d,i){return "img/" +  d.T + ".svg"} )
						.attr("x", 0)
						.attr("y", 0)
						.attr("width",teamLogoWidth)
						.attr("height", teamLogoHeight)	
						.attr("opacity", 0)
						.transition()
							.duration(800)
							.attr("opacity", 1)
									
		circles = teamLogoGroup.append("circle")
				.attr("cx", function (d, i){var co = coordinates[i];return co[0];})
				.attr("cy", function (d, i){var co = coordinates[i];return co[1];})
				.attr("r", teamLogoRaduis)
				.attr("fill", function (d,i){return "url(#"+d.T + ")"})
				.on('mouseover', function(d, i){
					d3.select(this)
								.attr("fill", function (d,i){return "url(#"+d.T + ")"})
								.transition()
								.duration(200)
								.attr("r", teamLogoRaduis * 3)
								.transition()
								.duration(50)
								.attr("r", teamLogoRaduis * 2.8)
								
					teamLogoGroup.select("#logoid_" + d.T)
								.transition()
								.duration(200)
								.attr("width",teamLogoWidth * 3)
								.attr("height", teamLogoHeight * 3)	
								.transition()
								.duration(50)
								.attr("width",teamLogoWidth * 2.8)
								.attr("height", teamLogoHeight * 2.8)
							
				})
				.on('mouseout', function(d, i){
					d3.select(this).transition()
								.duration(200)
								.attr("r", teamLogoRaduis)
								
					teamLogoGroup.select("#logoid_" + d.T)
								.transition()
								.duration(200)
								.attr("width",teamLogoWidth)
								.attr("height", teamLogoHeight)	
			
				})
				.on('click', function(d, i){
					
					usaMapSvg.transition()
								.duration(500)
								//.attr("width", mapWidth / 2)
								.attr("height", 0)
					/*
					usaMapSvg.selectAll()
						.transition()
						.duration(500)
						.attr("oppacity", 0);
					mapLand.transition()
						.duration(500)
						.attr("oppacity", 0);
					
					mapPath.transition()
						.duration(500)
						.attr("oppacity", 0);
					*/
					dispatch.chooseTeam(d.T, "2009-2010", "20091027", "20100414");
				})
		})		
		return true;
}