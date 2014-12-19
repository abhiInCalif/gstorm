var constants = {
  width: 1000,
  height: 700,
  charge: -800,
  linkDistance: 160,
  fontSize: 14,
  nodeRadius: 10,
  hubRadius: 60,
  textXOffset: 25,
  hubTextXOffset: 20,
  textYOffset: 10,
  zoomOutMax: 0.5,
  zoomInMax: 8,
};

var chartZoom = 1, chartPan = 1;

var toJSON = function(graph_string) {
  var data = graph_string.replace(/&quot;/g, "\"");
  data = data.replace(/&amp;/g, "");
  data = data.replace(/amp;/g, "");
  data = data.replace(/\#39;/g, "'");
  data = data.replace(/\&/g, "");
  data = data.replace(/\n/g, " ");
  data = JSON.parse(data);
  
  return data;
}

var GStorm = function(data) {
  var nodes = data.ideas;
  var links = data.links;
  var edgeSource = null;
  var width = $("#chart").width();
  var height = $(document).height();
  var svg;
  var force;
  var drag;
  var link;
  var text;
  var node;
  
  
  var renderDiagram = function() {
    var rect;

    
    force = d3.layout.force()
        .size([width, height])
        .charge(constants.charge)
        .linkDistance(constants.linkDistance)
        .on("tick", tick);

    drag = force.drag()
        .on("dragstart", dragstart)
        .on('drag', dragged);

    svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .call(d3.behavior.zoom().scaleExtent([constants.zoomOutMax, constants.zoomInMax])
        .on("zoom", zoom)).on("dblclick.zoom", null).append("g");
  
    svg.attr("transform", "translate(" + chartPan + ")scale(" + chartZoom + ")");

    rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");
  
    link = svg.selectAll(".link");
    node = svg.selectAll(".node");

    force
        .nodes(nodes)
        .links(links)
        .start();

    link = link.data(links)
        .enter().append("line")
        .attr("class", "link");

    node = node.data(nodes)
        .enter().append("circle")
        .attr("class", function(d) {
          if (d.isNode == false) {
            return "node circle_alt";
          } else {
            return "node circle";
          }
        })
        .attr("r", function(d) {
          if (d.isNode == false) {
            return constants.hubRadius;
          } else {
            return constants.nodeRadius;
          }
        })
        .on('dblclick', clickHandler)
        .on("mouseover", mouseover)
        .call(drag);

    text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .text(function(d) { return d.name; });
  };

  var tick = function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      
    text.attr("x", function(d) { 
        if (d.isNode == false) {
          return d.x - 7 * d.name.length / 2;
        } else {
          return d.x + constants.textXOffset; 
        }
      })
      .attr("font-size", function(d) {
        if (d.isNode == false) {
          return constants.fontSize;
        } else {
          return constants.fontSize;
        }
      })
      .attr("y", function(d) { 
        return d.y + constants.fontSize / 2 - 2; 
      });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  };

  var dragstart = function(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("fixed", d.fixed = true);
  };

  var mouseover = function(d) {
    $("#idea_name").empty();
    $("#idea_desc").empty();
    $("#idea_name").text(d.name);
    $("#idea_desc").text(d.description);
  
  };
  
  var alreadyLinked = function(link) {
    for (var i = 0; i < links.length; i++) {
      if (links[i].source == link.source && links[i].target == link.target) {
        return true;
      }
    }
    
    return false;
  };
  
  var clickHandler = function(d) {
    // basic concept is that a click on a node implies edge creation
    // clicking on the next node then implies the creation of an edge.    
    if (edgeSource != null) {
      var newLink = {"source": edgeSource.index, "target": d.index};
      if(!alreadyLinked(link)) {
        links.push(newLink);
        // appropriately add the link here
        $("#chart").empty();
        renderDiagram();
        // renderDiagram();
        saveContent();
      }
      
      edgeSource = null;
    } else {
      // this is the first of the two clicks
      edgeSource = d;
    }
  };
  
  var zoom = function() {
    chartPan = d3.event.translate;
    chartZoom = d3.event.scale;
    svg.attr("transform", "translate(" + chartPan + ")scale(" + chartZoom + ")");
  };
  
  var dragged = function(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    saveContent();
  };
  
  var addNode = function(name, desc, hubOrNode) {
    name = name.replace(/\"/g, "'");
    desc = desc.replace(/\"/g, "'");
    
    var idea;
    if (hubOrNode == "Node") {
      idea =   {
        "name": name,
        "date": "November 30th",
        "description": desc,
        "tags": ["Jumbo", "Airplane", "lala"],
        "x": Math.random() * 500,
        "y": Math.random() * 500,
        "index": nodes.length,
        "isNode": true,
      };
    } else {
      idea =   {
        "name": name,
        "date": "November 30th",
        "description": desc,
        "tags": ["Jumbo", "Airplane", "lala"],
        "x": Math.random() * 500,
        "y": Math.random() * 500,
        "index": nodes.length,
        "isNode": false,
      };
    }
    
  
    nodes.push(idea);
  
    // update the nodes appropriately here
    $("#chart").empty();
    renderDiagram();
  
    // fire save event
    saveContent();
  };
  
  // save content will also ensure that the data is synced across people accessing the same webpage.
  var saveContent = function() {
    // save the ideas and links as a string
    var indexOnlyLinks = [];
    for (var i = 0; i < links.length; i++) {
      indexOnlyLinks.push({"source": links[i].source.index, "target": links[i].target.index});
    }
    var json = { "ideas": nodes,
                 "links": indexOnlyLinks };
    
    // submit the string across the channel.
    fireGraphChange(json); // ensures that things are tracked across pages.
    
    var jsonString = JSON.stringify(json);
    $.post("/edit/", {"id": id, "graph_string": jsonString}, function(data) {
      // on success do nothing
    }).error(function() {
      throw "Error while saving content";
    });
  };
  
  return {
    render: function() {
      renderDiagram();
    },
    
    addIdea: function(name, desc, hubOrNode) {
      addNode(name, desc, hubOrNode);
    },
    
    save: function() {
      saveContent();
    }
  };
};