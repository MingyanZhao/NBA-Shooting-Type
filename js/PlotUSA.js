function startPage(){
	d3.json("datasets/usamap/usamap.json", function(error, us) {
		mapLand = usaMapSvg.insert("path", ".graticule")
		  .datum(topojson.feature(us, us.objects.land))
		  .attr("class", "land")
		  .attr("d", path);
		mapPath = usaMapSvg.insert("path", ".graticule")
		  .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		  .attr("class", "state-boundary")
		  .attr("d", path);
	})
	d3.timer(drawTeamLogos, 500);
}