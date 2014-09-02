(function(viz,d3,undefined){


var data = {
"Group1": {
"1989":"ABC",
"2001":"EFC"
},
"Group2":{
"1989":"ABC",
"2001":"EFC"
},
"Group3":{
"1989":"ABC",
"2001":"EFC"
}}

function forceCharge(node,i)
{
	if (node.label == 'iDA') return -250
	else if (node.group == "YEAR") return -220
	else return -20
}


function linkDistance(link,i)
{
	if (link.source.label == 'iDA' || link.target.label == 'iDA') return 120
	else if (link.source.group == link.target.group) return 100
	else return 30
}

function parseSeq()
{
	var seq = []
	for (var grp in data)
	{
		seq.push({label:grp, src:"iDA", year:-1})
		
		for (var year in data[grp])
		{

			seq.push({label:data[grp][year], src:grp, year:parseInt(year), group:grp})
		}
	}
	
	seq = seq.sort(function(a,b){ return (a.year - b.year) })
	return seq
}

function parseYearSeq()
{
	var seq = [], years = {}
	
	for (var grp in data)
	{
		for (var year in data[grp])
		{
			years[parseInt(year)] = parseInt(year)
		}
	}

	var years_array = []
	for (var y in years) years_array.push(parseInt(y))
	//console.log(years)
	//console.log(years_array)
	years_array.sort(function(a,b){ return (a - b) })
	
	for (var i=0,len=years_array.length; i<len; i++)
	{
		var src = "iDA"
		if (i>0) src = years_array[i-1]
		
		seq.push({label:years_array[i], src:src, weight:10, year:years_array[i], group:"YEAR"})
	}
	//console.log(seq)
	
	for (var grp in data)
	{
		for (var year in data[grp])
		{
			seq.push({label:data[grp][year], weight:1, src:parseInt(year), year:parseInt(year), group:grp})
		}
	}
	
	seq.sort(function(a,b){ 
		var res =  a.year - b.year
		if (res == 0) 
		{
			if (a.group == "YEAR") return -1
			else if (b.group == "YEAR") return 1
			
		}
		return res
		})
	return seq
}

function animateGraph()
{
	var graph = this
	var seq = parseYearSeq(), count = 0, len = seq.length
	console.log(seq)
	var reset = window.setInterval(insert2Graph,1000)
	
	function insert2Graph()
	{
		var obj = seq[count]
		graph.insertNodeTo(obj)
		count++
		if (count >= len) window.clearInterval(reset)
	}
}




var lookup = 
{
	svg: '_svg'
}

function TreeGraph(options) {
  TreeGraph.DEFAULTS = {
    parent: 'body',
	sort: null,
	width: 960,
	height: 500,
	r: 20,
	linkDistance: linkDistance,
	charge: forceCharge
  }
	
  this.options = $.extend({}, TreeGraph.DEFAULTS, options)
  this.init()
  
}

TreeGraph.prototype.init = function() {

	var width = this.options.width, height = this.options.height
	var svg = d3.select(this.options.parent)
						.append("svg:svg")
						.attr('id',this.options.id || "")
						.attr('class','TreeGraph')
						.attr('width',width)
						.attr('height',height)
						
	var fill = d3.scale.category20();

	
	var force = d3.layout.force()
		.size([width, height])
		.nodes([{label:"iDA"}]) // initialize with a single node
		.linkDistance(this.options.linkDistance)
		.charge(this.options.charge)
		.gravity(0.01)
		.friction(0.6)
		.on("tick", tick);

	svg.append("rect")
		.attr("width", width)
		.attr("height", height)

	
	this.svg = svg
	this.force = force
	this.nodes = force.nodes()
	this.links = force.links()
	this.glink = svg.append('g')				
	this.gnode = svg.append('g')



	
	function tick() {
	  svg.selectAll(".link")
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

	  svg.selectAll(".gnode")
		.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'})
		//.attr("cx", function(d) { return d.x; })
		//.attr("cy", function(d) { return d.y; });
	  
	  //svg.selectAll(".label")
		//.attr('text',function(d){console.log(d.label); return d.label})
	}
	

	this.restart();	

}


TreeGraph.prototype.start = animateGraph


TreeGraph.prototype.getNode = function(label)
{
	var nodes = this.nodes
	var res = 0
	nodes.forEach(function(node){ if (node.label == label) { res = node.index; return false} })
	return this.nodes[res]
}

TreeGraph.prototype.insertNodeTo = function(nodeInfo, suppress)
{
	var nn = $.extend({},{}, nodeInfo)

	var target = this.getNode(nodeInfo.src)
	//console.log(target)
	nn.x = this.options.width/2 + 2*(0.5-Math.random())*20
	nn.y = this.options.height/2 + 2*(0.5-Math.random())*20

	this.nodes.push(nn);
	this.links.push({source: nn, target: target});
	//console.log(this.links)
	//console.log(this.links)
	if (!suppress) this.restart()
}

TreeGraph.prototype.restart = function() {

	this.force.links(this.links)

	var glink = this.glink.selectAll(".glink").data(this.links);
	var lg = glink.enter()
	.insert("g", ".glink")
	.attr("class", "glink")
	
	lg.insert("line", ".link")
	  .attr("class", "link")

	var gnode = this.gnode.selectAll(".gnode").data(this.nodes);

	//console.log(this.nodes)
	var g = 
	this.gnode.selectAll(".gnode")
		.data(this.nodes)
		.enter()
		.append("g", ".gnode")
		.attr("class", "gnode")
		.call(this.force.drag);

	var r = this.options.r
	g.append("circle", ".node")
	  .attr("class", function(d){return d.group+" node"})
	  .attr("r", function(d){ if (d.group=="YEAR") return r*1.5; else if (d.label=="iDA") return r*2; return r*0.5 })

	g.append("text",".label")
		  .attr("class", "label")
		  //.attr("dx", -this.options.r/2)
		  .attr("dy", ".35em")
		  .attr('fill','#333')
		  .style('text-anchor',function(d){if (d.group=="YEAR") return 'middle'; else if (d.label=="iDA") return 'middle'; return "start" })
		  .style('font-size','8px')
		  .text(function(d) { return d.label })
	  


		  
	this.force.start();
}


viz.TreeGraph = TreeGraph

})(window.viz = window.viz || {}, d3)