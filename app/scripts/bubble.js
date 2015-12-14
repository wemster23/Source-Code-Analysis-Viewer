var diameter = 600,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("#jumbo").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

d3.json("bubble_flat.json", function(error, root) {
  if (error) throw error;

  var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root))
      .filter(function(d) { return !d.children; }))
    .enter()

    // this would make the whole shape a link
    //.append("a")
    //  .attr("xlink:href", "http://www.google.com")
    
    .append("a")
    //.attr("data-toggle", "popover")
    //.attr("data-trigger", "focus")
    .attr("title", function(d) { 
      return d.className;
     })
    .attr("data-content", function(d) { 
      return "Package Name: " + d.packageName + "<br/>Class Name: " + d.className + "<br/>Size: " + d.value;
     })
    //.attr("role", "button")
    //.attr("tabindex", "0")

    .append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.packageName); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.className.substring(0, d.r / 3); });

  node.on("click", function(d) { 
      $('a').popover( {
        'trigger':'click'
       ,'container': 'body'
       ,'placement': 'right'
       ,'white-space': 'nowrap'
       ,'html':'true'
       //,'template': 'abc'
        }); 
  });


});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
  var classes = [];

  function recurse(name, node) {
    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
    else classes.push({packageName: name, className: node.name, value: node.size});
  }

  recurse(null, root);
  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");

$(document).ready(function () {
  $('[data-toggle="popover"]').popover({
      'trigger' : 'hover'
      ,'placement': 'top'
  });
});