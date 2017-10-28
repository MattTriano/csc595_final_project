// Useful reading
// On accessing nested data: https://bost.ocks.org/mike/nest/

// Setting height and width (should match the CSS)
var w = 1100;
var h = 580;
var active = d3.select(null);

var ctry_color;

// Initializing a default key, and (temporarily, until I figure out a smart
// way to handle time series data) year.
var current_key = 'All_Causes';
var current_year = '2000';

var svg = d3.select('#choropleth').append('svg')
			.attr('preserveAspectRatio', 'xMidYMid')
			.attr('viewBox', '0 0 ' + w + ' ' + h);

var tooltip = d3.select("#choropleth")
  .append("div")
  .attr("class", "tooltip hidden");

// Setting the map projection
var projection = d3.geoNaturalEarth()
					.scale(1);

// Setting a path object and applying our projection
var path = d3.geoPath()
				.projection(projection);

// Innitializing a grouping on the SVG 
var map_features = svg.append('g')
	.attr('class', 'features.id');

var color_fill = d3.scaleQuantize()
	// .domain([1,2000])
	.range(['#feedde','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#8c2d04']);
	// .unknown();

// Initializing an object to store data broken down by country
var data_by_country = d3.map();

// Initializing a variable to hold CSV and geojson data
var map_data;
var geojson_data;

d3.select('#select-key').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  currentKey = d3.select(this).property('value');
  update_map_colors();
});

var color_class = d3.scaleQuantize()
					.domain([1,1700])
					.range(d3.range(7).map(function(i) {
						return 'q' + i + '-7'; 
					}));

d3.json("countries_geo.json", function(geojson) {
	console.log(geojson);

	var map_scale =  map_scaler(geojson);
	geojson_data = geojson;
	console.log(map_scale);

	projection.scale(map_scale.scale)
				.center(map_scale.center)
				.translate([w/2, h/2]);

	d3.csv("WHO_mortality_data/mort_by_cause_per_capita_allages_btsx.csv", function(data) {

		map_data = data;

		data_by_country = d3.nest()
				.key( function(d) { return d.iso3; } )
				.key( function(d) { return d.causename; } )
				.rollup( function(d) { return d[0]; })
				.map(data);
		console.log(data_by_country);

		

		map_features.selectAll('path')
		  			  .data(geojson.features)
		  			.enter().append('path')
		  			  .attr('d', path)
		  			  // .attr('fill', function(d) { 
		  			  // 	ctry_color = (get_value_of_datum(data_by_country['$'.concat(d.id)])); 
		  			  // 	if (typeof ctry_color != 'undefined') {
		  			  // 		return color_fill(ctry_color);
		  			  // 	} else {
		  			  // 		return '#808080';  // Returns grey if the color is undefined (ie no data)
		  			  // 	};
		  			  // })
		  			  .on("click", clicked)
		  			  .on('mousemove', show_tooltip)
		  			  .on('mouseout', hide_tooltip);

		update_map_colors();
	});
});

function update_map_colors() {
	color_fill.domain([
			d3.min(geojson_data.features, function(d) { 
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); }),
			d3.max(geojson_data.features, function(d) { 
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); })
		]);
	map_features.selectAll('path')
				.attr('fill', function(d) { 
					ctry_color = (get_value_of_datum(data_by_country['$'.concat(d.id)])); 
					if (typeof ctry_color != 'undefined') {
						return color_fill(ctry_color);
					} else {
						return '#808080';  // Returns grey if the color is undefined (ie no data)
					};
				})
}

function clicked(d) {
	if (active.node() === this) return reset();
	active.classed("active", false);
	active = d3.select(this).classed("active", true);

	var bounds = path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = .9 / Math.max(dx / w, dy / h),
			translate = [w / 2 - scale * x, h / 2 - scale * y];

			map_features.transition()
			 	.duration(750)
			 	.style("stroke-width", 1.5 / scale + "px")
			 	.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function reset() {
	active.classed("active", false);
	active = d3.select(null);

	map_features.transition()
		.duration(750)
		.style("stroke-width", "1.5px")
		.attr("transform", "");
}

function show_tooltip(f) {
  var id = f.id;   // Get the ID of the feature.
  var d = data_by_country['$'.concat(id)]; // Use the ID to get the data entry
  var mouse = d3.mouse(d3.select('#choropleth').node()).map(
  	function(d) { return parseInt(d); 
  });
  console.log(f);
  var ctry_name = get_country_name(f)
  var left = Math.min( w - 4 * ctry_name.length, mouse[0] + 5);
  var top = mouse[1] + 25;
  // Show the tooltip (unhide it) and set the name of the data entry.
  tooltip.classed('hidden', false)
  	.attr("style", "left:" + left + "px; top:" + top + "px")
    .html(ctry_name);
}

function hide_tooltip() {
  tooltip.classed('hidden', true);
}

// function doZoom() {
//   mapFeatures.attr("transform",
//     "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")")
//     // Keep the stroke width proportional. The initial stroke width
//     // (0.5) must match the one set in the CSS.
//     .style("stroke-width", 0.5 / d3.event.scale + "px");
// }


function get_country_name(f) {
	// console.log(f);
	// console.log(f.properties.name)
	// this_ctry_name = f && f['$'.concat(current_key)].country_name;
	this_ctry_name = f.properties.name;
	if (typeof this_ctry_name != 'undefined') {
		return this_ctry_name;
	} else {
		return 'Data Not Available';
	}
	// return d && d['$'.concat(current_key)].country_name;
}

// this redundent '&&' pattern prevents missing values from throwing errors
// when data produces an 'undefined' result (eg. Palestine isn't in this dataset
// but it is on the map, so it throws an error if we try to select deaths in
// Palestine in year 2000, for example)
function get_value_of_datum(d) {
	// console.log(d);
	return d && d['$'.concat(current_key)][current_year];
}

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
