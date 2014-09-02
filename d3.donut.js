(function(viz,d3,undefined){

viz.Donut = Donut

var lookup = 
{
	svg: '_svg'
}

function Donut(options) {
  Donut.DEFAULTS = {
    parent: 'body',
	sort: undefined,
	width: window.innerWidth,
	height: window.innerHeight,
    labels: undefined,
    colors: undefined,
	title: undefined,
	subtitle: undefined,
	series: undefined,
	startAt: 0,
	labelParser: function (d){ return d },
	dataStruct: { value: undefined, label: undefined, color: undefined }

  }
	
  this.options = $.extend({}, Donut.DEFAULTS, options)
  this.init()
  
}

Donut.prototype.get = function(attribute) { if (!lookup[attribute]) return null; return this.options[lookup[attribute]] }

Donut.prototype.init = function() {
	// Check for data series
	if (!this.options.series) this.options.series = [this.options.data || []]

	var data = this.options.series[this.options.startAt],
		keyField = this.options.dataStruct.value,
		labelField = this.options.dataStruct.label,
		colorField = this.options.dataStruct.color,
		radius = 0.5 * Math.min(this.options.width, this.options.height) - 20;

	// set radius
	this.options._radius = radius
	
	// find global max
	this.options._total = this.options.series.map(function(d){ return d3.sum(d,function(e){ return e[keyField] || e }) })
	this.options._globalMax = d3.max(this.options._total)
	this.options._globalMin = d3.min(this.options._total)
	
	// generate scale
	this.options._totalScale = d3.scale.linear()
								.domain([this.options._globalMin,this.options._globalMax])
								.range([0,radius*0.3])
		
	// auto generate labels if not specified
	if (!this.options.labels && labelField) this.options.labels = data.map(function(d){ return d[labelField] })
	else if (!this.options.labels) this.options.labels = data.map(function(d,i){ return i })
	
	// auto generate colors if not specified
	if (this.options.colors)
	{
		this.options._color = d3.scale.ordinal()
								.range(this.options.colors)
								.domain(this.options.labels)
	}
	else if (!this.options.colors && colorField)
	{
		this.options.colors = data.map(function(d){ return d[colorField] })
		this.options._color = d3.scale.ordinal()
								.range(this.options.colors)
								.domain(this.options.labels)
	}
	else
	{
		this.options._color = ((data.length <= 10) ? d3.scale.category10() : d3.scale.category20())
								.domain(this.options.labels)
	}
		
	// insert svg into selected parent
	this.options._svg = d3.select(this.options.parent)
						.append("svg:svg")
						.attr('id',this.options.id || "")
						.attr('class','svg_donut')
						.attr('width',this.options.width)
						.attr('height',this.options.height)
						
	var g = this.options._svg.append("g")
			.attr("transform", "translate(" + (this.options.width / 2) + "," + this.options.height / 2 + ")");

	g.append("g")
		.attr("class", "donut_slices");
	g.append("g")
		.attr("class", "donut_labels");
	g.append("g")
		.attr("class", "donut_lines");

	g.append('text')
		.attr('class','donut_title')
		.attr('y', 0)
		//.attr("dominant-baseline", "top")
		.style('text-anchor','middle')
		.text(this.options.title || "")
		
	g.append('text')
		.attr('class','donut_banner')
		.attr('y', 15)
		//.attr("dominant-baseline", "bottom")
		.style('text-anchor','middle')
		.text(this.options.subtitle || "")
  
	this.options._g = g
  
	this.options._pie = d3.layout.pie()
						.sort(this.options.sort)
						.value(function(d) {
							return d[keyField] || d;
						});
  

	

	

	this.update()
}

Donut.prototype.update = function(options) {

	var radius 	= this.options._radius,
		dr 		= this.options.width/2 - radius

	var keyField 	= this.options.dataStruct.value,
		labelField 	= this.options.dataStruct.label,
		colorField 	= this.options.dataStruct.color,
		labelParser = this.options.labelParser
	// recompute if new data
	if (options && options.data)
	{
		
		this.options.series.push(options.data)
		this.options.startAt = this.options.series.length-1,
		this.options._total = this.options.series.map(function(d){ return d3.sum(d,function(e){ return e[keyField] || e }) })
		this.options._globalMax = d3.max(this.options._total)	
		this.options._globalMin = d3.min(this.options._total)
		
		this.options._totalScale = d3.scale.linear()
								.domain([this.options._globalMin,this.options._globalMax])
								.range([0,radius*0.3])
	}

	console.log(this.options._total)

	this.options = $.extend({}, this.options, options || {})
	
	var data 	= this.options.series[this.options.startAt],
	g 			= this.options._g,
	pie 		= this.options._pie,
	total 		= this.options._total[this.options.startAt],
	totalScale 	= this.options._totalScale

	
	if (total <= 0) return
	
	var drr = totalScale(total)
	
	var arc = d3.svg.arc()
		.outerRadius(radius * 0.5+drr)
		.innerRadius(radius * 0.4);

	var arcOuter = d3.svg.arc()
		.outerRadius(radius * 0.5+drr)
		.innerRadius(radius * 0.5+drr);

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.6+drr)
		.outerRadius(radius * 0.6+drr);
		
	var color =   this.options._color;

	// override startAngle and endAngle if specified
	var piedata = pie(data).map(function(d){
		d.startAngle = d.data.startAngle || d.startAngle
		d.endAngle = d.data.endAngle || d.endAngle
		return d
	})
	
	console.log(piedata)
	
	g.select('.donut_banner').text(this.options.subtitle || "")
	
	
	/* ------- PIE SLICES -------*/
	var slice = g.select(".donut_slices")
		.selectAll("path.donut_slices")
		.data(piedata);

	slice.enter()
		.insert("path")
		.attr('class','donut_slices')
		.style("fill", function(d) { return color(d.data[labelField]); })
		.selectAll('title')
			.append('title')
			.attr('class','tooltip')
			.text(function(d) { return labelParser(d.data[labelField]) })

	slice		
		.transition().duration(1200)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return arc(interpolate(t));
			};
		})
		

		

	slice.exit()
		.remove();
		

	/* ------- TEXT LABELS -------*/

	var text = g.select(".donut_labels")
		.selectAll(".foreignObject")
		.data(piedata);

	var a = text.enter()
		.append("foreignObject")
		.attr('class','foreignObject')
		.attr('height',40)
		.attr('width',dr)
		.append("xhtml:body")
		.style('background-color','rgba(0,0,0,0)')
		.append("p")
		.attr('class','svg_label')
		.text(function(d) {
			return d.data[labelField];
		});
		/*
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		});*/
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	
	text.transition().duration(1200)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1) + (midAngle(d2) < Math.PI ? 0 : -dr);
				pos[1] -= 20
				return "translate("+ pos +")";
			};
		})
		/*.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		})*/
		.styleTween("text-align", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "left":"right";
			};
		})
		.styleTween('opacity',function(d){ 
				return function(t) {
				return d.data[keyField] <= 0 ? 0:1;
			};
		})


	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = g.select(".donut_lines").selectAll("polyline")
		.data(piedata);
	
	polyline.enter()
		.append("polyline")
		.attr("fill","none")
		.style("stroke", function(d) { return color(d.data[labelField]); })
		//.style("stroke-opacity",0.5)

	polyline.transition().duration(1200)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arcOuter.centroid(d2), outerArc.centroid(d2), pos];
			};			
		})
		.styleTween('opacity',function(d){ 
				return function(t) {
				return d.data[keyField] <= 0 ? 0:1;
			};
		})
	
	polyline.exit()
		.remove();
}

})(window.viz = window.viz || {}, d3)