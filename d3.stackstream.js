(function(viz,d3,undefined){

viz.Stackstream = Stackstream

function Stackstream(options) {
  Stackstream.DEFAULTS = {
    parent: 'body',
	width: 300,
	height: 180,
    colors: ["#98abc5", "#7b6888",  "#a05d56", "#ff8c00"],
  }
	
  this.options = $.extend({}, Stackstream.DEFAULTS, options)
  this.init()
  
}

viz.api = viz.api || {}

viz.api.genLayer = function(data, subfields)
{
	//console.log(data)
	var layers = []
	for (var n=0,lenn=subfields.length; n<lenn; n++) 
	{
		var subfield = subfields[n]
		var obj = {name:subfield, values:[]}
		for (var i=0,len=data.length; i<len; i++) 
		{
			obj.values.push({x:i, y:data[i][subfield], date:data[i]['Date'], year:data[i]['Year'] || parseInt(data[i]['Date'].split('/')[0]) })
		}
		layers.push(obj)
	}
	//console.log(layers)
	return layers
		
}

function getMaxValue(array)
{
	var max = 0, res
	array.forEach(function(v){ if (max < Math.abs(v.y+v.y0)) {res = v; max = Math.abs(v.y+v.y0)} })

	return res
}

Stackstream.prototype.init = function() {

	var data = this.options.data
	var streakcolors = this.options.colors
	var layers = this.options.layers
	var dir = this.options.dir || 1
	
	this.options._svg = d3.select(this.options.parent)
						.append("svg:svg")
						.attr('id',this.options.id || "")
						.attr('class','stackstream')
						.attr('width',this.options.width)
						.attr('height',this.options.height)
						//.attr('mask',"url(#Mask)")
						
	var node1 = this.options._svg.append('g')
	
	if (dir > 0) node1.attr('transform','translate(0,'+this.options.height+')')

	var stack = d3.layout.stack()
				.offset('zero')
				//.offset("silhouette")
				.values(function(d) { return d.values; })
							
	var stacked = stack(layers)
	
	var x = d3.scale.ordinal().rangeRoundBands([0, this.options.width]);
	x.domain(stacked[0].values.map(function(d) { return d.x; }))

	var y = d3.scale.linear().range([0, this.options.height])
	y.domain([0, d3.max(stacked[stacked.length - 1].values, function(d) { return d.y0 + d.y; })]);

	var z = d3.scale.ordinal().range(streakcolors)

	var barwidth = x.rangeBand()

	var area = d3.svg.area()
		.interpolate("basis") 
		.x(function(d) { return  x(d.x); })
		.y0(function(d) { return y(d.y0); })
		.y1(function(d) { return y(d.y0 + d.y); });
				
		stacked = stacked.map(function(v,i){ v.values = v.values.map(function(vv,ii){ vv.color = z(i); return vv; }); return v;})
		//console.log(stacked)

	
		// Add a group for each column.
		var valgroup = node1.selectAll("g.valgroup")
		.data(stacked)
		.enter().append("svg:g")
		.attr("class", "valgroup")
		.style("fill", function(d, i) { return z(i); })
		.style("opacity", 0.7)
		//.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); })
		
		
		// Add a rect for each date.
		var rect = valgroup.selectAll("rect")
					.data(function(d,i){return d.values;})
					.enter()
					.append("g")
		
		//rect.append("title")
			//.text(function(d,i){return "["+pgp.lookup_index[d.cat]+"]\n"+formatThousands(d.value)+" ("+d.percent.toFixed(0)+"%)"} )
		var hh = this.options.height
		var bars = rect.append("svg:rect")
			//.attr("id",function(d){return "stackedbar_"+d.subzone+"_"+d.cat})
			.attr("class", function(d) { return "stackbar stackbar_year_"+d.year; })
			.attr("x", function(d,i) { return x(d.x); })
			.attr("y", function(d) { return 0 })
			.attr("year", function(d) { return d.year })
			.attr("color", function(d) { return d.color })
			.attr("height", 0)
			.attr("width", function(d,i){ return barwidth-1})
			.attr("fill", function(d){ return d.color})
			.on("mouseenter", this.options.mouseenter)
			.on("mouseleave", this.options.mouseleave)
			.on("click", this.options.click)
			
			/*
		bars.transition().delay(function(d,i){return i*5})
					.duration(1800)
					.ease('elastic')
					.attr("height", function(d) { return y(d.y); })
					.attr("y", function(d) { return -y(d.y0) - y(d.y); })*/
		this.options._bars = bars
	/*
	var browser = node1.selectAll(".stackstream_node")
			  .data(stacked)
			.enter().append("g")
			  .attr("class", "stackstream_node");
	  
		browser.append("path")
			  .attr("class", function(d){return "stackstream_area area_"+d.name})
			  .attr("d", function(d) { return area(d.values); })
			  .style("fill", function(d,i) { return z(i); });
	
		browser.append("text")
			  .datum(function(d) { return {name: d.name, value: getMaxValue(d.values)}; })
			  .attr("transform", function(d) { return "translate(" + x(d.value.x) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
			  .attr("dy", ".35em")
			  .attr("text-anchor","middle")
			  .attr('class',"stackstream_label")
			  .text(function(d) { return d.name; });
	*/
	this.options._y = y
	this.options._x = x
}

Stackstream.prototype.hide = function() {
	var dir = this.options.dir || 1
	var y = this.options._y
	var x = this.options._x
	this.options._bars.transition().delay(function(d,i){return i*5})
					.duration(300)
					//.ease('elastic')
					.attr("y", function(d) { return 0 })
					.attr("height", 0)

}

Stackstream.prototype.show = function() {
	var dir = this.options.dir || 1
	var y = this.options._y
	var x = this.options._x
	var hh = this.options.height
	this.options._svg.transition().style('opacity',1).style('visibility','visible')
	
	if (dir >= 0)
	{
		this.options._bars.transition().delay(function(d,i){return i*5})
					.duration(1800)
					.ease('elastic')
					.attr("height", function(d) { return y(d.y); })
					.attr("y", function(d) { return (-y(d.y0) - y(d.y)); })
	}			
	else
	{
		this.options._bars.transition().delay(function(d,i){return i*5})
					.duration(1800)
					.ease('elastic')
					.attr("height", function(d) { return y(d.y); })
					.attr("y", function(d) { return y(d.y0) })

	}
}

})(window.viz = window.viz || {}, d3)