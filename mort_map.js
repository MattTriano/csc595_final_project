// Useful reading
// On accessing nested data: https://bost.ocks.org/mike/nest/
// On making a legend: https://bl.ocks.org/mbostock/4573883

// Setting height and width (should match the CSS)
var w = 1100;
var h = 580;
var active = d3.select(null);

var ctry_color;

// Initializing a default key, and (temporarily, until I figure out a smart
// way to handle time series data) year.
var current_key = 'All_Causes';
var current_year = '2000';

var year_data = {
	2000: {
		year: '2000',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2001: {
		year: '2001',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2002: {
		year: '2002',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2003: {
		year: '2003',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2004: {
		year: '2004',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2005: {
		year: '2005',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2006: {
		year: '2006',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2007: {
		year: '2007',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2008: {
		year: '2008',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2009: {
		year: '2009',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2010: {
		year: '2010',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2011: {
		year: '2011',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2012: {
		year: '2012',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2013: {
		year: '2013',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2014: {
		year: '2014',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	2015: {
		year: '2015',
		all_cause_datum: -1,
		key_cause_datum: -1
	}
}

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

// Initializing an object to store data broken down by country
var data_by_country = d3.map();

// Initializing a variable to hold CSV (mort_data) and geojson data
var mort_data;
var geojson_data;

d3.select('#select_key').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  current_key = d3.select(this).property('value');
  update_map_colors();
});

var color_class = d3.scaleQuantize()
					.domain([1,1700])
					.range(d3.range(7).map(function(i) {
						return 'q' + i + '-7'; 
					}));

// Code to prepare the legend
var format_value = d3.format('.0f');
var legend_scale = d3.scaleLinear();
var legend_x_axis = d3.axisBottom(legend_scale)
		.tickSize(13)
		.tickFormat( function(d) { return format_value(d); });

var legend_svg = d3.select('#legend')
					.append('svg')
					  .attr('width', '100%')
					  .attr('height', '50');

var g = legend_svg.append('g')
					.attr('transform', 'translate(' + 20 + ',' + 20 + ')');

g.selectAll('rect')
	.data(color_fill.range()
					.map(function(d) { 
						return color_fill.invertExtent(d); 
					}))
	.enter()
	.append('rect');

g.append('text')
	.attr('class', 'legend_text')
	.attr('fill', '#000')
	.attr('font-weight', 'bold')
	.attr('text-anchor', 'start')
	.attr('y', -6)

// This listens to a window-resizing event and resizes the legend on event 
window.onresize = update_legend;

// default: h: 145, w: 550 
var graph2_svg = d3.select('#supplemental_graphs')
					.append('svg')
					.attr('width', '50%')
					.attr('height', '25%')
					.attr('preserveAspectRatio', 'xMinYMin');
					// .attr('transform', 'translate(' + Math.min(w,h)/2 + ' '+ Math.min(w,h)/2 + ')');

function update_legend() {
	var legend_w = d3.select('#choropleth').node()
					   .getBoundingClientRect().width - 50;
	// This sets evenly sized domain-spans to map the data to a color 
	var legend_domain = color_fill.range().map( function(d) {
		var color_range = color_fill.invertExtent(d);
		return color_range[1];
	});
	// This sets the lower end of the domain to the lowest observed value
	legend_domain.unshift(color_fill.domain()[0]);

	// This sets the domain and range for the legend bin widths
	legend_scale.domain(color_fill.domain())
				.range([0, legend_w]);

	// This sets positions and widths for the rectangles in the legend
	g.selectAll('rect')
		.data(color_fill.range().map( function(d) {
			return color_fill.invertExtent(d);
		}))
		.attr("height", 8)
		.attr('x', function(d) { return legend_scale(d[0]); })
		.attr('width', function(d) { 
			return legend_scale(d[1]) - legend_scale(d[0]); 
		})
		.attr('fill', function(d, i) {
			return color_fill.range()[i];
		});

	var dropdown_keys = d3.select('#select_key').node();
	var selected_key = dropdown_keys.options[dropdown_keys.selectedIndex];
	g.selectAll('text.legend_text').text(selected_key.text);
	legend_x_axis.tickValues(legend_domain);
	g.call(legend_x_axis);
}


d3.json("countries_geo.json", function(geojson) {
	console.log(geojson);

	var map_scale =  map_scaler(geojson);
	geojson_data = geojson;
	console.log(map_scale);

	projection.scale(map_scale.scale)
				.center(map_scale.center)
				.translate([w/2, h/2]);

	d3.csv("WHO_mortality_data/mort_by_cause_per_capita_allages_btsx.csv", function(data) {

		data_by_country = d3.nest()
				.key( function(d) { return d.iso3; } )
				.key( function(d) { return d.causename; } )
				.rollup( function(d) { return d[0]; })
				.map(data);
		console.log(data_by_country);

		mort_data = data_by_country;

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
				});
	update_legend();
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
	get_year_data_for_cause(d);
	console.log(d);
	console.log(graph2_svg);
	mort_line_plot(d, year_data, graph2_svg);
	d3.select('#supplemental_graphs').classed("hidden", false);
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
  // console.log(f);
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
	if (typeof this_ctry_name !== 'undefined') {
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
function get_value_of_datum(d, yr=current_year) {
	// console.log(d);
	return d && d['$'.concat(current_key)][yr];
}

function get_value_of_year_datum(f, yr, ck=current_key) {
	// console.log(d);
	return mort_data['$'.concat(f)] && mort_data['$'.concat(f)]['$'.concat(ck)][yr];
}

// This functiion updates the year_data object for the current cause
// f: 	a geojson features object, used to get a location id
function get_year_data_for_cause(f) {
	this_ctry_id = f.id;
	if (typeof mort_data['$'.concat(f.id)] !== 'undefined') {
		for (yr in year_data) {
			year_data[yr].key_cause_datum = +get_value_of_year_datum(this_ctry_id, yr);
			year_data[yr].all_cause_datum = +get_value_of_year_datum(this_ctry_id, yr, 'All_Causes');
		}
	} else {
		for (yr in year_data) {
			year_data[yr].key_cause_datum = -1;
			year_data[yr].all_cause_datum = -1;
		}
	}
}

function mort_line_plot(f, data, graph_svg) {
	line_scale_x = d3.scaleLinear()
					 .domain([2000, 2015])
					 .range([0, get_svg_width()/2]);
	// console.log(graph_svg._groups[0][0].width.animVal.valueInSpecifiedUnits * w/100);
	// console.log(d3.select(svg).node()._groups[0][0].width.animVal.value);
	console.log(get_svg_width()/2);
	line_scale_y = d3.scaleLinear()
					   .domain([0, d3.max(year_data, function(d) {
					   		return d.all_cause_datum; 
					   	})])
					   .range([0, get_svg_width()*0.25/2]);
	console.log(get_svg_width()*0.25/2);
	var all_cause_line = d3.line()
				.x( function(d) { return line_scale_x(d.year); })
				.y( function(d) { return line_scale_y(d.all_cause_datum);});
	var key_cause_line = d3.line()
				.x( function(d) { return line_scale_x(d.year); })
				.y( function(d) { return line_scale_y(d.key_cause_datum);});
	console.log(all_cause_line);
	graph_svg.append('text').text('hi');
	graph_svg.append('path')
				.datum(data)
				.attr('class', 'line')
				.attr('d', all_cause_line);
	graph_svg.append('key_cause_line')
				.datum(data)
				.attr('class', 'line')
				.attr('d', key_cause_line);
				console.log(year_data);
	graph_svg.append('circle').attr('cx',30).attr('cy',30).attr('r',20);

}

function get_svg_width() {
	return d3.select(svg).node()._groups[0][0].width.animVal.value;
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
