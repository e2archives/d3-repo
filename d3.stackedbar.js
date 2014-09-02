(function(viz, d3, undefined){

var formatThousands = d3.format("0,000");
viz.StackedBar = StackedBar	


function StackedBar(options) {
  StackedBar.DEFAULTS = {
    name: 'StackedBar',
    elemName: '.StackedBar',
    svg: '',
	color: '',
	width: 200,
	height: 200,
	data: [
		[ 1,  5871, 8916, 2868],
		[ 2, 10048, 2060, 6171],
		[ 3, 16145, 8090, 8045],
		[ 4,   990,  940, 6907],
		[ 5,   450,  430, 5000]
	],
	domain: ["layer1","layer2","layer3"],
	range: ["#bae4bc","#7bccc4","#43a2ca","#0868ac"],
	click: function(d){}
    //domain: ["65-70", "70-75", "75-80", "80+"],
    //range: ["#98abc5", "#7b6888",  "#a05d56", "#ff8c00"]
  }
	
  this.options = $.extend({}, StackedBar.DEFAULTS, options)

  this.init()
}

StackedBar.prototype.init = function() {
	var w = this.options.width, h = this.options.height
	var click = this.options.click
	var field = this.options.field
	var rangeindex = this.options.rangeindex
	this.options.svg = d3.select('#'+this.options.elemName)
						.append("svg") 
						.attr('width', w)
						.attr('height', h)
						.append("svg:g")
						.attr("transform", "translate(0,"+(h)+")");
  
	var svg = this.options.svg
	
	if ($('#selected-gradient').length <= 0)
	{
		svg.append("linearGradient")
		  .attr("id", "selected-gradient")
		  .attr("gradientUnits", "objectBoundingBox")
		  .attr("x1", 0).attr("y1", 0)
		  .attr("x2", 1).attr("y2", 0)
		.selectAll("stop")
		  .data([
			{offset: "0%", color: "rgb(255,100,100)"},
			{offset: "50%", color: "rgb(255,150,150)"},
			{offset: "100%", color: "rgb(255,100,100)"}
		  ])
		.enter().append("stop")
		  .attr("offset", function(d) { return d.offset; })
		  .attr("stop-color", function(d) { return d.color; });
	}

	var x = d3.scale.ordinal().rangeRoundBands([0, w]);
	var y = d3.scale.linear().range([0, h])
	var z = d3.scale.ordinal().range(this.options.range)
	var barwidth = x.rangeBand()

	var barwidths = this.options.barwidths
	var xIntervals = [0], xWidths = [], step = 0, dist = []
	if (barwidths)
	{
		x = d3.scale.linear().range([0, w]).domain([0,d3.sum(barwidths)])
		for (var i=0,len=barwidths.length; i<len; i++)
		{
			var ww =  parseInt(x(barwidths[i]))
			step +=	ww
			xWidths.push(ww)
			xIntervals.push(step)
			dist.push({interval:xIntervals[xIntervals.length-2], width:ww, name:rangeindex[i]})
		}
		viz.subzoneDist = dist
		//console.log(xIntervals)
	}
	
	var domain = this.options.domain

	// 4 columns: ID,c1,c2,c3
	var matrix = this.options.data

	var remapped =this.options.domain.map(function(dat,i){
		return matrix.map(function(d,ii){
			return {x: ii, y: d[i+1], subzone:rangeindex[ii], cat:domain[i], color:z(i), value:d[i+1], barwidths:barwidths, field:field, percent:100*d[i+1]/barwidths[ii] };
		})
	});


	var stacked = d3.layout.stack().offset("expand")(remapped)
	//console.log(matrix)

	x.domain(stacked[0].map(function(d) { return d.x; }))
	y.domain([0, d3.max(stacked[stacked.length - 1], function(d) { return d.y0 + d.y; })]);

	// Add a group for each column.
	var valgroup = svg.selectAll("g.valgroup")
	.data(stacked)
	.enter().append("svg:g")
	.attr("class", "valgroup")
	.style("fill", function(d, i) { return z(i); })
	.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); })

	// Add a rect for each date.
	var rect = valgroup.selectAll("rect")
	.data(function(d){return d;})
	.enter()
	.append("g")
	
	rect.append("title")
		.text(function(d,i){return "["+viz.lookup_index[d.cat]+"]\n"+formatThousands(d.value)+" ("+d.percent.toFixed(0)+"%)"} )
	
	rect.append("svg:rect")
		.attr("id",function(d){return "stackedbar_"+d.subzone+"_"+d.cat})
		.attr("class", "selectable")
		.attr("x", function(d,i) { if (barwidths) return xIntervals[i]; else return x(d.x); })
		.attr("y", function(d) { return -y(d.y0) - y(d.y); })
		.attr("height", function(d) { return y(d.y); })
		.attr("width", function(d,i){ if (barwidths) return xWidths[i]; else return barwidth})
		.attr("cat",function(d,i){return d.cat} )
		.attr("subzone",function(d,i){return d.subzone} )
		.on("click", click)
	
}



StackedBar.prototype.update = function(data) {

};

	

})(window.viz = window.viz || {}, d3)