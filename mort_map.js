// Useful reading
// On accessing nested data: https://bost.ocks.org/mike/nest/

// Setting height and width (should match the CSS)
var w = 1100;
var h = 600;

var ctry_color;

// Initializing a default key, and (temporarily, until I figure out a smart
// way to handle time series data) year.
var current_key = 'All_Causes';
var current_year = '2000';

var svg = d3.select('#choropleth').append('svg')
			.attr('width', w)
			.attr('height', h);

// Setting the map projection
var projection = d3.geoNaturalEarth()
					.scale(1);

// Setting a path object and applying our projection
var path = d3.geoPath()
				.projection(projection);

var color_fill = d3.scaleQuantize()
	// .domain([1,2000])
	.range(['#feedde','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#8c2d04']);
	// .unknown();

// Initializing an object to store data broken down by country
var data_by_country = d3.map();

var color_class = d3.scaleQuantize()
					.domain([1,1700])
					.range(d3.range(7).map(function(i) {
						return 'q' + i + '-7'; 
					}));

d3.json("countries_geo.json", function(geojson) {
	console.log(geojson);

	var map_scale =  map_scaler(geojson);
	console.log(map_scale);

	projection.scale(map_scale.scale)
				.center(map_scale.center)
				.translate([w/2, h/2]);

	d3.csv("WHO_mortality_data/mort_by_cause_per_capita_allages_btsx.csv", function(data) {
		console.log(data);

		// data_by_country = d3.nest()
		// 		.key( function(d) { return d.iso3; } ).sortKeys(d3.descending)
		// 		.key( function(d) { return d.causename; } ).sortKeys(d3.descending)
		// 		.rollup( function(d) { return d[0]; })
		// 		.map(data);
		data_by_country = d3.nest()
				.key( function(d) { return d.iso3; } )
				.key( function(d) { return d.causename; } )
				.rollup( function(d) { return d[0]; })
				.map(data);
		console.log(data_by_country);
		console.log(data_by_country['$ZWE']['$All_Causes']);

		color_fill.domain([
			d3.min(geojson.features, function(d) { 
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); }),
			d3.max(geojson.features, function(d) { 
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); })
		]);

		svg.append('g')
			 .attr('class', 'features.id')
		  .selectAll('path')
		  	.data(geojson.features)
		  .enter().append('path')
		  	.attr('d', path)
		  	.attr('fill', function(d) { 
		  		console.log(parseInt((data_by_country['$'.concat(d.id)] && 
		  					data_by_country['$'.concat(d.id)]['$All_Causes']['2000']), 10)); // this seems like a hack.
		  		// this redundent '&&' pattern prevents missing values from throwing errors
		  		// when data produces an 'undefined' result (eg. Palestine isn't in this dataset
		  		// but it is on the map, so it throws an error if we try to select deaths in
		  		// Palestine in year 2000, for example)
		  		console.log(d.id);
		  		ctry_color = (get_value_of_datum(data_by_country['$'.concat(d.id)])); 
		  		console.log(ctry_color);
		  		if (typeof ctry_color != 'undefined') {
		  			console.log(color_fill(ctry_color));
		  			return color_fill(ctry_color);
		  		} else {
		  			return '#808080';
		  		};
		  		// return color_fill(parseInt((data_by_country['$'.concat(d.id)] && 
		  					// data_by_country['$'.concat(d.id)]['$All_Causes']['2000']), 10)); 
		  	});
		  	
	});

});

function get_value_of_datum(d) {
	// console.log(d);
	return d && d['$'.concat(current_key)][current_year];
}

// w/o rollup:  key: "ZWE", values: array(1), 0: <data>
// w/ rollup:  key: "ZWE", values: <data>

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
