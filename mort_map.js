// Setting height and width (should match the CSS)
var w = 900;
var h = 500;

var svg = d3.select('#choropleth').append('svg')
			.attr('width', w)
			.attr('height', h);

// Setting the map projection
var projection = d3.geoNaturalEarth()
					.scale(175);

// Setting a path object and applying our projection
var path = d3.geoPath()
				.projection(projection);

d3.json("countries_geo.json", function(json) {
	console.log(json);
	svg.append('g')
		 .attr('class', 'features')
	  .selectAll('path')
	  	.data(json.features)
	  .enter().append('path')
	  	.attr('d', path);

});

