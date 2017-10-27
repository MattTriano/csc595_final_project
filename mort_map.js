// Setting height and width (should match the CSS)
var w = 1100;
var h = 600;

var svg = d3.select('#choropleth').append('svg')
			.attr('width', w)
			.attr('height', h);

// Setting the map projection
var projection = d3.geoNaturalEarth()
					.scale(1);

// Setting a path object and applying our projection
var path = d3.geoPath()
				.projection(projection);

d3.json("countries_geo.json", function(geojson) {
	console.log(geojson);

	var map_scale =  map_scaler(geojson);
	console.log(map_scale);

	projection.scale(map_scale.scale)
				.center(map_scale.center)
				.translate([w/2, h/2]);

	svg.append('g')
		 .attr('class', 'features')
	  .selectAll('path')
	  	.data(geojson.features)
	  .enter().append('path')
	  	.attr('d', path);

});

// This function takes a geojson object and determines appropriate
// scale and center coordinates based on the extents of the geojson
// paths (ie the country boundaries) and the size of the SVG frame.
// Returns: an object containing the 'scale' and 'center' 
function map_scaler(geojson) {
	var path_bounds = path.bounds(geojson),
						scale = 1/ Math.max(
							(path_bounds[1][0] - path_bounds[0][0]) / w,
							(path_bounds[1][1] - path_bounds[0][1]) / h
						);
	var feature_bounds = d3.geoBounds(geojson),
							center = [
								(feature_bounds[1][0] + feature_bounds[0][0]) / 2,
								(feature_bounds[1][1] + feature_bounds[0][1]) / 2
							];
	return {
		'scale' : scale,
		'center': center
	};

}
