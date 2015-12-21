// temp alchemy fix for panning blowing up when sourcing 
// dataSource from a json object rather than an external json 
// file
// https://github.com/GraphAlchemist/Alchemy/issues/543
Alchemy.prototype.begin = function(userConf) {
    var conf;
    conf = this.setConf(userConf);
    Alchemy.prototype.instances.push(this);
    switch (typeof this.conf.dataSource) {
      case 'string':
        d3.json(this.a.conf.dataSource, this.a.startGraph);
        break;
      case 'object':
        this.a.startGraph(this.a.conf.dataSource);
    }
    this.plugins.init();
    return this;
};

function searchDatabase(searchCriteria) {

    var graphJsonNodes = [];

    // MATCH (startPackage:JavaPackage)-[r:DEPENDS_ON_PACKAGE]->(endPackage:JavaPackage) RETURN startPackage,r,endPackage; 
    // The query
    var query= {"statements":[{"statement":"MATCH (p:JavaPackage) RETURN p; ",
    "resultDataContents":["graph", "row"]}]};

    // jQuery ajax call - http://stackoverflow.com/questions/29440613/return-the-graph-structure-of-a-neo4j-cypher-query-using-jquery
    var request = $.ajax({
        type: "POST",
        url: "http://localhost:7474/db/data/transaction/commit",
        accepts: { json: "application/json" },
        dataType: "json",
        contentType:"application/json",
        data: JSON.stringify(query),
        //now pass a callback to success to do something with the data
        success: function (data) {
                //console.log(data);
                //console.log(JSON.stringify(data));

                $.each(data.results[0].data, function(index, element) {
                    //console.log(element.graph.nodes[0].id);
                    graphJsonNodes.push(
                      {
                        "id": element.graph.nodes[0].id,
                        "caption": element.graph.nodes[0].properties.name
                      }
                    );
                 });

                var graphJson = {

                  nodes: graphJsonNodes, 
                  edges: []
                };

                // also get relationships and then render the graph
                getRelationships(graphJson);
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

function getRelationships(graphJson) {

    // MATCH (startPackage:JavaPackage)-[r:DEPENDS_ON_PACKAGE]->(endPackage:JavaPackage) RETURN startPackage,r,endPackage; 
    // The query
    var query= {"statements":[{"statement":"MATCH (startPackage:JavaPackage)-[r:DEPENDS_ON_PACKAGE]->(endPackage:JavaPackage) RETURN r;",
    "resultDataContents":["graph"]}]};

    // jQuery ajax call - http://stackoverflow.com/questions/29440613/return-the-graph-structure-of-a-neo4j-cypher-query-using-jquery
    var request = $.ajax({
        type: "POST",
        url: "http://localhost:7474/db/data/transaction/commit",
        accepts: { json: "application/json" },
        dataType: "json",
        contentType:"application/json",
        data: JSON.stringify(query),
        //now pass a callback to success to do something with the data
        success: function (data) {
                //console.log(data);
                //console.log(JSON.stringify(data));
                //console.log("ajaxed relationship data");

                $.each(data.results[0].data, function(index, element) {
                    
                    graphJson.edges.push(
                      {
                        "source": element.graph.relationships[0].startNode,
                        "target": element.graph.relationships[0].endNode
                        //,"caption": element.graph.relationships[0].type
                      }
                    );
                 });

                var config = {
                  dataSource: graphJson, 
                  nodeCaptionsOnByDefault: true, 
                  initialScale: 0.7, 
                  directedEdges: true, 
                  edgeArrowSize: 2, 
                  nodeStyle: {
                  "all": {
                      "radius": 5,
                      "captionSize": 4
                    }
                  }, 
                  edgeStyle: {
                    "all": {
                      "width": function(d) {
                        return 2; 
                      }
                    }
                  },  
                  graphHeight: function() { return 700; }, 
                  nodeMouseOver: function(node) {
                    $("#selectednodedetails").html(node._properties.caption + " has " + node.outDegree() + " relationships");
                    return node.outDegree();
                  }
                };

                alchemy = new Alchemy(config);

                $("#packagedepstats").html("Showing " + graphJson.nodes.length + " package nodes with " + graphJson.edges.length + " relationships");
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

// 



searchDatabase();

