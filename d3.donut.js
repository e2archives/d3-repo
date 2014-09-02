(function(viz,d3,undefined){

viz.Donut = Donut

var lookup = 
{
	svg: '_svg'
}

function Donut(options) {
  Donut.DEFAULTS = {
    parent: 'body',
	sort: null,
	width: 300,
	height: 180,
    labels: ["label1", "label2", "label3", "label4"],
    colors: ["#98abc5", "#7b6888",  "#a05d56", "#ff8c00"],
	banner: ""

  }
	
  this.options = $.extend({}, Donut.DEFAULTS, options)
  this.init()
  
}

Donut.prototype.get = function(attribute) { if (!lookup[attribute]) return null; return this.options[lookup[attribute]] }

Donut.prototype.init = function() {

	this.options._svg = d3.select(this.options.parent)
						.append("svg:svg")
						.attr('id',this.options.id || "")
						.attr('class','donut')
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
		.text(this.options.title)
		
	g.append('text')
		.attr('class','donut_banner')
		.attr('y', 15)
		//.attr("dominant-baseline", "bottom")
		.style('text-anchor','middle')
		.text(this.options.banner)
  
	this.options._g = g
  
	this.options._pie = d3.layout.pie()
						.sort(this.options.sort)
						.value(function(d) {
							return d.value;
						});
  
	this.options._color = d3.scale.ordinal()
								.domain(this.options.labels)
								.range(this.options.colors);

	var radius = 0.5 * Math.min(this.options.width, this.options.height) - 20;
	
								
	if (this.options.data && this.options.total > 0) this.update(this.options.data)
}

Donut.prototype.update = function(options) {
	this.options = $.extend({}, this.options, options)
	var data = this.options.data
	var g = this.options._g;
	var pie = this.options._pie;
	var key = function(d){ return d.data.label; };
	var radius = 0.5 * Math.min(this.options.width, this.options.height) - 20;
	var dr = 	this.options.width/2 - radius
	var total = this.options.total

	var maxminTotal = this.options.maxminTotal
	this.options.totalScale = d3.scale.linear()
								.domain([maxminTotal.min,maxminTotal.max])
								.range([0,radius*0.3])

	if (total <= 0) return
	var drr = this.options.totalScale(total)
	//console.log(total)
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
	var piedata = pie(data)
	//console.log(piedata)
	
	g.select('.donut_banner').text(this.options.banner)
	
	
	/* ------- PIE SLICES -------*/
	var slice = g.select(".donut_slices")
		.selectAll("path.donut_slices")
		.data(piedata, key);

	slice.enter()
		.insert("path")
		.attr('class','donut_slices')
		.style("fill", function(d) { return color(d.data.label); })
		.append('title')
		.attr('class','tooltip')
		.text(function(d) { return d.data.label_func(d)})

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
		
	slice.selectAll('title.tooltip').data(piedata, key)
		.text(function(d) {
			//console.log(d.data.label_func(d))
			return d.data.label_func(d)
		})

	slice.exit()
		.remove();
		

	/* ------- TEXT LABELS -------*/

	var text = g.select(".donut_labels")
		.selectAll(".foreignObject")
		.data(piedata, key);

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
			return d.data.label;
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
				return d.data.value <= 0 ? 0:1;
			};
		})


	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = g.select(".donut_lines").selectAll("polyline")
		.data(pie(data), key);
	
	polyline.enter()
		.append("polyline")
		.attr("fill","none")
		.style("stroke", function(d) { return color(d.data.label); })
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
				return d.data.value <= 0 ? 0:1;
			};
		})
	
	polyline.exit()
		.remove();
}

})(window.viz = window.viz || {}, d3)