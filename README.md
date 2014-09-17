#d3-repo

###namespace
All D3 plugins use the namespace "viz"

###viz.Table
Generates a standard table from an array of entries.

   
    var table = viz.Table()
                  .id("tableID")
                  .setClass("table striped hovered")
                  	
    d3.select('#table')      
      .datum(data)
      .call(table)
      

You can selectively choose the columns to render by using the `key` function. The `key` function can either take in an array of fieldnames to render, or

    
    var table = viz.Table()
                  .id("genericID")
                  .setClass("table striped hovered")
                  .keys([ "col1", "col2" ]
                  
 

an array of render options: 

    var table = viz.Table()
                  .id("genericID")
                  .setClass("table striped hovered")
                  .keys([ 
                          {						          
                            key:"col1",          
                            head:"Head1",						          
                            parse:function(d){return d.value;}						        
                          },
                          {						          
                            key:"col1",          
                            head:"Head1",						          
                            parse:function(d){return d.value;}						        
                          }
                    ])
    
    
* `key` describes the column to be rendered. e.g. `key1` in `[{key1:a, key2:b, key3:c}]`

* `head` describes the table headings for each column (optional).

* `parse` describes how to render the value for each entry (optional). The argument is an object of the form `{key:a, value:b, data:c}`. HTML tags are allowed in the return `String`.









