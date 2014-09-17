(function(viz, d3, undefined){

// functions available
viz.Table = Table

function Table()
{
	var id, classed, keys, parse = function(d){return d.value || d}	
	var ele = function(selection){

		selection.each(function(d, i) {
			var _classed = (typeof(classed) === "function" ? classed(d,i) : classed)
			var _heads = (!keys) ? d3.keys(d[0]) : keys.map(function(dd){return dd.head || dd.key || dd})
			var _data = keys || _heads
			var node = d3.select(this)
			
			//console.log(_keys)
			//console.log(_classed)
			var table = node.append("table")
							.attr('id',id)
			
			if (_classed) table.classed(_classed,true)
				
			table.append('thead')
				.append('tr')
				.selectAll('th')
				.data(_heads)
				.enter()
					.append('th')
					.html(function(dd){return dd})
			
			table.append('tbody')
				.selectAll('tr')
				.data(d)
				.enter()
					.append('tr')
						.selectAll('td')
						.data(function(dd){return _data.map(function(v){return {data:dd, parse:v.parse || parse, key:v.key || v, value:dd[v.key || v]}})})
						.enter()
							.append('td')
								.html(function(dd){return dd.parse(dd)})
			
			
		 })
	
	}
	
	ele.id = function(value){
		
		if (!arguments.length) return id;
		id = value
		return ele
	}
	
	ele.setClass = function(value){
		
		if (!arguments.length) return classed;
		classed = value
		return ele
	}
	
	ele.keys = function(value){
		if (!arguments.length) return keys;
		keys = value
		return ele
	}
	
	return ele
}
	
  
})(window.viz = window.viz || {}, d3)