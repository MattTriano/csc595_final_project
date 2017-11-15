// Useful reading
// On accessing nested data: https://bost.ocks.org/mike/nest/
// On making a legend: https://bl.ocks.org/mbostock/4573883
// Lukas Vonlanthen's d3 map tutorial:  http://data-map-d3.readthedocs.io/en/latest/index.html

// Setting height and width (should match the CSS)
var w = 1100;
var h = 580;
var active = d3.select(null);

var ctry_color;

// Initializing a default key and default year
var current_key = 'All_Causes';
var current_year = '2000';
var current_colorscale = 'by_all_year';

// This prepares a Mustache parser for the table of top causes of mortality
var template = d3.select('#template').html();
Mustache.parse(template);

// This was a hacky way of making data accessible for the line graph
var year_data = [
	{
		year: '2000',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2001',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2002',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2003',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2004',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2005',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2006',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2007',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2008',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2009',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2010',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2011',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2012',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2013',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2014',
		all_cause_datum: -1,
		key_cause_datum: -1
	},
	{
		year: '2015',
		all_cause_datum: -1,
		key_cause_datum: -1
	}
]					

var svg = d3.select('#choropleth').append('svg')
		.attr('preserveAspectRatio', 'xMidYMid')
		.attr('viewBox', '0 0 ' + w + ' ' + h);

// Initializes a tooltip
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

// This prepares a scaler that determines what color to use for a choropleth path
var color_fill = d3.scaleQuantize()
	.range(['#feedde','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#8c2d04']);

// Initializing an object to store data broken down by country
var data_by_country = d3.map();
var data_by_cause = d3.map();

// Initializing a variable to hold CSV (mort_data) and geojson data
var mort_data;
var geojson_data;

d3.select('#select_key').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  current_key = d3.select(this).property('value');
  update_map_colors();
});

d3.select('#select_year').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  current_year = d3.select(this).property('value');
  update_map_colors();
});

d3.select('#year_slct').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  current_year = d3.select(this).property('value');
  d3.select('#year_label').text(current_year);
  update_map_colors();
});

d3.select('#select_colorstyle').on('change', function(a) {
  // Change the current key and call the function to update the colors.
  current_colorscale = d3.select(this).property('value');
  update_map_colors();
});

// Code to prepare the legend
var format_value = d3.format('.0f');
var legend_scale = d3.scaleLinear();
var legend_x_axis = d3.axisBottom(legend_scale)
		.tickSize(12)
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

// Now for that actual 


d3.json("countries_geo.json", function(geojson) {
	var map_scale =  map_scaler(geojson);
	geojson_data = geojson;

	projection.scale(map_scale.scale)
				.center(map_scale.center)
				.translate([w/2, h/2]);

	d3.csv("WHO_mortality_data/mort_by_cause_per_capita_allages_btsx_avg.csv", function(data) {

		data_by_country = d3.nest()
				.key( function(d) { return d.iso3; })
				.key( function(d) { return d.causename; })
				.rollup( function(d) { return d[0]; })
				.map(data);
		console.log(data_by_country); // this is the core data structure I use

		data_by_cause = d3.nest()
				.key( function(d) { return d.causename; })
				.key( function(d) { return d.iso3; })
				.rollup( function(d) { return data_by_cause_typesetter(d[0]); })
				.map(data);
		console.log(data_by_cause);

		mort_data = data_by_country;

		map_features.selectAll('path')
		  			  .data(geojson.features)
		  			.enter().append('path')
		  			  .attr('d', path)
		  			  .on("click", clicked)
		  			  .on('mousemove', show_tooltip)
		  			  .on('mouseout', hide_tooltip);

		update_map_colors();
	});
});

// This function assists loading the data_by_cause data structure
// by setting datatypes for the values
function data_by_cause_typesetter(d_cause) {
	var f=[];
	var minmax = [];
	var yr;
	for (i = 2000; i <= 2016; i++){
		yr = String(i);
		f[yr] = parseFloat(d_cause[yr]);
		if (f[yr] > 0) {
			minmax.push(f[yr]);
		} 
	}
	f['max'] = Math.max.apply(null, minmax);
	f['min'] = Math.min.apply(null, minmax);
	f.avg_death_rate = parseFloat(d_cause.avg_death_rate);
	f.country_name = d_cause.country_name;
	f.iso3 = d_cause.iso3;
	return f;	
}

// This updates the colors of the map
function update_map_colors() {
	if (current_colorscale === 'by_sel_year'){
		color_fill.domain([
			d3.min(geojson_data.features, function(d) {
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); }),
			d3.max(geojson_data.features, function(d) { 
				return +(get_value_of_datum(data_by_country['$'.concat(d.id)])); })
		]);
	} else {
		color_fill.domain([
			d3.min(geojson_data.features, function(d) { 
				return +(get_max_min(d.id).min); }),
			d3.max(geojson_data.features, function(d) { 
				return +(get_max_min(d.id).max); })
			]);
	};
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

function get_max_min(d_id, ck=current_key) {
	var tmp = data_by_cause['$'.concat(ck)] && data_by_cause['$'.concat(ck)]['$'.concat(d_id)];
	if (typeof tmp != 'undefined'){
		return tmp;
	} else {
		return {
			'max' : 0,
			'min': 0
		};
	}
	return data_by_cause['$'.concat(ck)] && data_by_cause['$'.concat(ck)]['$'.concat(d_id)];
}

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
	g.selectAll('text.legend_text').text(selected_key.text + ' [deaths per 100k pop. in ' + current_year +']');
	legend_x_axis.tickValues(legend_domain);
	g.call(legend_x_axis);
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
	mort_line_plot(d, year_data, graph1_svg);
	
	
	show_top_causes(d.id);
	d3.select('#initial').classed("hidden", true);
	d3.select('#chart_titles').classed("hidden", false);
	d3.select('#supplemental_graphs').classed("hidden", false);
	d3.select('#sup_graph1').classed("hidden", false);
	d3.select('#sg1_legend').classed("hidden", false);
	d3.select('#data_table').classed("hidden", false);
}

var graph2_svg = d3.select('#data_table')
					.append('svg')
					.attr('width', '100%')
					.attr('height', '200');

function show_top_causes(f, top_n=5) {
	var sorted_data = get_sorted_ctry_data(f);
	var sorted_slice = sorted_data.slice(0,top_n);
	var sorted_clean = [];
	console.log(sorted_slice);
	for (i=0; i<top_n; i++) {
		sorted_slice[i].key = sorted_slice[i].key.replaceAll('_', ' ');
		sorted_slice[i].value = format_value(sorted_slice[i].value);
	}
	var detailsHtml = Mustache.render(template, sorted_slice);
	d3.select('#data_table').html(detailsHtml);

}

String.prototype.replaceAll = function(old, new_char) {
    var this_string = this;
    return this_string.split(old).join(new_char);
};

// 
function tabulate_top_causes(d_slice, graph_svg) {
	var table = graph_svg.append('foreignObject')
						 .attr('width', graph_svg.width)
						 .attr('height', graph_svg.height)
						 .append("xhtml:table");
	var header = [
				{ 	head: 'Cause',
					cl: 'cause', 
					html: function(d) {return d[0]; }
				},
				{ 	head: 'Avg. Death Rate (per 100k pop)', 
					cl: 'center', 
					html: function(d) { return d[1]; }
				}
				];
	table.append('table')
	table.append('thead').append('tr')
		 .selectAll('th')
		   .data(header).enter()
		   .append('th')
		   .attr('class', function(d) { return d.cl; })
		   .style('width',graph_svg.width/2)
		   .text(function(d) { return d.head; });
}

function reset() {
	active.classed("active", false);
	active = d3.select(null);

	map_features.transition()
		.duration(750)
		.style("stroke-width", "1.5px")
		.attr("transform", "");
}

// This takes a country's geojson feature object
function show_tooltip(f) {
	var id = f.id;   // country id (iso3 code)
	var d = data_by_country['$'.concat(id)]; 
	// mouse contains a list containing the x and y pixel locations
	// of the cursor, to use in positioning the tooltip
	var mouse = d3.mouse(d3.select('#choropleth').node()).map(
		function(d) { return parseInt(d); });
	var ctry_name = get_country_name(f); 
	var left = Math.min( w - 4 * ctry_name.length, mouse[0] + 5);
	var top = mouse[1] + 35;
	var tt_deaths = format_value(get_value_of_year_datum(id, current_year, current_key));
	tooltip.classed('hidden', false)
			.attr("style", "left:" + left + "px; top:" + top + "px")
			.html(ctry_name + '<br>' +
			'Death rate by ' + current_key.replace('_', ' ') + ': '
			+ tt_deaths);
}

function hide_tooltip() {
  tooltip.classed('hidden', true);
}

function get_country_name(f) {
	this_ctry_name = f.properties.name;
	if (typeof this_ctry_name !== 'undefined') {
		return this_ctry_name;
	} else {
		return 'Data Not Available';
	}
}

// this redundent '&&' pattern prevents missing values from throwing errors
// when data produces an 'undefined' result (eg. Palestine isn't in this dataset
// but it is on the map, so it throws an error if we try to select deaths in
// Palestine in year 2000, for example)
function get_value_of_datum(d, yr=current_year) {
	return d && d['$'.concat(current_key)][yr];
}

// f: iso3 country identifier
// yr: a year in the domain [2000, 2015]
// ck: key to get data for (default is current_key)
function get_value_of_year_datum(f, yr, ck=current_key) {
	yr = parseInt(yr);
	return mort_data['$'.concat(f)] && mort_data['$'.concat(f)]['$'.concat(ck)][yr];
}

// This takes a country iso3 id and returns a sorted array of 
// causenames and avg death rates
function get_sorted_ctry_data(f) {
	var sortable = [];	
	var local_sort = mort_data['$'.concat(f)].entries();
	for (i = 0; i < local_sort.length; i++) {
		sortable.push({key: local_sort[i].key, value: +local_sort[i].value.avg_death_rate});
	}
	local_sort = sortable.sort(function(a,b) { return b.value - a.value;});
	return local_sort;  
}

// This functiion updates the year_data object for the current cause
// f: 	a geojson features object, used to get a location id
function get_year_data_for_cause(f) {
	this_ctry_id = f.id;
	if (typeof mort_data['$'.concat(f.id)] !== 'undefined') {
		for (yd in year_data) {
			year_data[yd].key_cause_datum = +get_value_of_year_datum(this_ctry_id, year_data[yd].year);
			year_data[yd].all_cause_datum = +get_value_of_year_datum(this_ctry_id, year_data[yd].year, 'All_Causes');
		}
	} else {
		for (yr in year_data) {
			year_data[yr].key_cause_datum = -1;
			year_data[yr].all_cause_datum = -1;
		}
	}
}

var left_pad = 35;
var top_pad = 20;
var bot_pad = 30;
var right_pad = 30;
var graph1_svg = d3.select('#sup_graph1')
					.append('svg')
					.attr('width', '100%')
					.attr('height', '200');

var	parse_year = d3.timeParse("%Y");
var format_year = d3.timeFormat('%Y')
var time_scale = d3.scaleTime();
var	death_scale = d3.scaleLinear();

function mort_line_plot(f, data, graph_svg) {
	local_data = data;
	graph_svg.selectAll('*').remove();

	var frame_h = get_svg_height();
	var frame_w = get_svg_width();
	var this_w = 0.5 * frame_w;
	var this_h = 200;
	time_scale.domain([new Date(2000,0), new Date(2015,0)])
			  .range([left_pad, this_w-right_pad]);
			   
	death_scale.domain([0, 2250])
			   .range([this_h-bot_pad, right_pad]);

	var	time_axis = d3.axisBottom()
					  .scale(time_scale)
					  .ticks(16)
					  .tickFormat(format_year);
	var death_axis = d3.axisLeft()
					   .scale(death_scale)
					   .ticks(6);

	var all_cause_line = d3.line()
				.x( function(d) { return time_scale(parse_year(String(d.year))); })
				.y( function(d) { return death_scale(parseInt(d.all_cause_datum));});
	var key_cause_line = d3.line()
				.x( function(d) { return time_scale(parse_year(String(d.year))); })
				.y( function(d) { return death_scale(parseInt(d.key_cause_datum));});
	
	graph_svg.append('path')
				.datum(local_data)
				.attr('class', 'line')
				.attr('d', all_cause_line)
				.style('stroke', '#fc8d62');
	graph_svg.append('path')
				.datum(local_data)
				.attr('class', 'line')
				.attr('d', key_cause_line)
				.style('stroke', '#66c2a5');

	graph_svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (this_h - bot_pad) + ")")
		.call(time_axis)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".1em")
		.attr("transform", "rotate(-60)");
	graph_svg.append('g')
			 .attr('class', 'axis')
			 .attr('transform', 'translate ('+left_pad+',0)')
			 .call(death_axis);

	graph_svg.append('text')
			 .attr('x', this_w/2)
			 .attr('y', top_pad*4/5)
			 .attr('text-anchor', 'middle')
			 .text('Deaths from All Causes and from '+current_key+ ' for '+f.properties.name);
	var legend_labels = [{ label: 'All Causes',     color: '#fc8d62'},
						{  label: 'Selected Cause', color: '#66c2a5'}];
	var svg_legend = graph_svg.append('svg')
						.attr('width', this_w*.15)
						.attr('height', 40);

	var this_legend = svg_legend.selectAll('#sg1_legend')
								.data(legend_labels)
								.enter().append('g')
								.attr('id','sg1_legend')
								.attr('transform', function(d, i) {
									{
										return 'translate(0,' + i*15 + ')'
									}
								});
	var fant = 10;
	graph_svg.append('rect')
			 .datum(legend_labels)
			   .attr('x',this_w*0.75)
			   .attr('y',30)
			   .attr('width',10)
			   .attr('height',2)
			   .style('fill', function(d) { return d[0].color; });
	graph_svg.append('text')
			 .datum(legend_labels)
			   .attr('x',this_w*0.78)
			   .attr('y',35)
			   .text(function(d) { return d[0].label; })
			   .style('font-size',fant);
	graph_svg.append('rect')
			 .datum(legend_labels)
			   .attr('x',this_w*0.75)
			   .attr('y',45)
			   .attr('width',10)
			   .attr('height',2)
			   .style('fill', function(d) { return d[1].color; });
	graph_svg.append('text')
			 .datum(legend_labels)
			   .attr('x',this_w*0.78)
			   .attr('y',50)
			   .text(function(d) { return d[1].label; })
			   .style('font-size',fant);

	// this is just a test object to confirm an image appears
	// graph_svg.append('circle').attr('cx',30).attr('cy',30).attr('r',20);
}

// I made these functions to aid in resizing SVGs both initially and
// in response to window resizing events. I ran into some difficulties
// with this and time constraints didn't allow me to fully debug that
function get_svg_width() {
	return d3.select(svg).node()._groups[0][0].width.animVal.value;
}
function get_svg_height() {
	return d3.select(svg).node()._groups[0][0].width.animVal.value;
}


// This function takes a geojson features object and determines appropriate
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
