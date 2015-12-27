var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    gridSize: 1,
    model: graph
});

var uml = joint.shapes.uml;



/**
var request = $.ajax({
  url: "scripts/sampleclasses.json",
  type: "GET",
  dataType: "json"
});
*/




//the helper function provided by neo4j documents
function idIndex(a,id) {
    for (var i=0;i<a.length;i++) {
        if (a[i].id == id) return i;}
    return null;
}

function searchDatabase(searchCriteria) {

    

    $("#showingpackage").html("Showing package " + searchCriteria);
    //console.log("searching for: " + searchCriteria);

    // The query
    var query= {"statements":[{"statement":"MATCH (javaPackage:JavaPackage { name:'" + searchCriteria + "' })-[CONTAINS_CLASS]->(javaClass:JavaClass)  RETURN javaClass;",
    "resultDataContents":["graph","row"]}]};

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
              
              var classes = [];
              var largestHeight = 0;

              //$.each(data.classes, function(index, element) {
              $.each(data.results[0].data, function(index, element) {

                    //console.log(element.name);
                    
                    element.row[0].publicMethods = transformToMultiline(element.row[0].publicMethods, 250);
                    //console.log("publicMethods=" + element.row[0].publicMethods); 

                    element.row[0].privateInstanceVariables = transformToMultiline(element.row[0].privateInstanceVariables, 250);
                    //console.log("privateInstanceVariables=" + element.row[0].privateInstanceVariables);

                    var calculatedWidth = calcMaxWidthForClass(element.row[0]);
                    var calculatedHeight = calcMaxHeightForClass(element.row[0]);
                    if(calculatedHeight > largestHeight) {
                        largestHeight = calculatedHeight;
                    }

                    var newClass
                        = new uml.Class({
                            size: { width: calculatedWidth, height: calculatedHeight },
                            name : element.row[0].name,
                            attributes : element.row[0].privateInstanceVariables,
                            methods : element.row[0].publicMethods, 
                            fullyQualifiedName : element.row[0].fullyQualifiedName

            /**
                            name:  element.className,
                            attributes : element.privateInstanceVariables,
                            methods: element.publicMethods

                            ,
                            attrs: {
                                '.uml-class-name-rect': {
                                    fill: '#ff8450',
                                    stroke: '#fff',
                                    'stroke-width': 0.5
                                },
                                '.uml-class-attrs-rect, .uml-class-methods-rect': {
                                    fill: '#fe976a',
                                    stroke: '#fff',
                                    'stroke-width': 0.5
                                },
                                '.uml-class-methods-text': {
                                    'ref-y': 0.5,
                                    'y-alignment': 'middle'
                                }
                            }
            */

                        });

                        classes.push(newClass);

                });

                graph.resetCells(classes);

                /**
                var relations = [
                    new uml.Generalization({ source: { id: classes.man.id }, target: { id: classes.person.id }}),
                    new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id }}),
                    new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id }}),
                    new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id }}),
                    new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id }})
                ];

                _.each(relations, function(r) { graph.addCell(r); });
                */

                // This causes diagrams to be spaced out
                // still need to figure out how to auto-size each uml.Class
                /**
                var res = joint.layout.DirectedGraph.layout(graph, {
                    nodeSep: 50,
                    edgeSep: 80,
                    rankDir: "TB"
                });
                */

                joint.layout.GridLayout.layout(graph, {
                  columns: 3,
                  columnWidth: 320,
                  rowHeight: largestHeight
                });

                paper.fitToContent();

        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

// quickly copied above search to prototype
// ONLY difference is query so must refactor!
function searchWithinClasses(searchCriteria) {

    //console.log("searching for: " + searchCriteria);

    // The query
    var query= {"statements":[{"statement":"MATCH (j:JavaClass) WHERE ANY(fullyQualifiedName IN j.fullyQualifiedName WHERE fullyQualifiedName  =~ '(?i).*" + searchCriteria + ".*') OR ANY(method IN j.publicMethods WHERE method  =~ '(?i).*" + searchCriteria + ".*') OR ANY(var IN j.privateInstanceVariables WHERE var  =~ '(?i).*" + searchCriteria + ".*') RETURN DISTINCT j;",
    "resultDataContents":["graph","row"]}]};

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
              
              $("#showingpackage").html("Showing " + data.results[0].data.length + " classes matching " + searchCriteria);

              var classes = [];
              var largestHeight = 0;

              //$.each(data.classes, function(index, element) {
              $.each(data.results[0].data, function(index, element) {

                    //console.log(element.name);
                    
                    element.row[0].publicMethods = transformToMultiline(element.row[0].publicMethods, 250);
                    //console.log("publicMethods=" + element.row[0].publicMethods); 

                    element.row[0].privateInstanceVariables = transformToMultiline(element.row[0].privateInstanceVariables, 250);
                    //console.log("privateInstanceVariables=" + element.row[0].privateInstanceVariables);

                    var calculatedWidth = calcMaxWidthForClass(element.row[0]);
                    var calculatedHeight = calcMaxHeightForClass(element.row[0]);
                    if(calculatedHeight > largestHeight) {
                        largestHeight = calculatedHeight;
                    }

                    var newClass
                        = new uml.Class({
                            size: { width: calculatedWidth, height: calculatedHeight },
                            name : element.row[0].name,
                            attributes : element.row[0].privateInstanceVariables,
                            methods : element.row[0].publicMethods, 
                            fullyQualifiedName : element.row[0].fullyQualifiedName

            /**
                            name:  element.className,
                            attributes : element.privateInstanceVariables,
                            methods: element.publicMethods

                            ,
                            attrs: {
                                '.uml-class-name-rect': {
                                    fill: '#ff8450',
                                    stroke: '#fff',
                                    'stroke-width': 0.5
                                },
                                '.uml-class-attrs-rect, .uml-class-methods-rect': {
                                    fill: '#fe976a',
                                    stroke: '#fff',
                                    'stroke-width': 0.5
                                },
                                '.uml-class-methods-text': {
                                    'ref-y': 0.5,
                                    'y-alignment': 'middle'
                                }
                            }
            */

                        });

                        classes.push(newClass);

                });

                graph.resetCells(classes);

                /**
                var relations = [
                    new uml.Generalization({ source: { id: classes.man.id }, target: { id: classes.person.id }}),
                    new uml.Generalization({ source: { id: classes.woman.id }, target: { id: classes.person.id }}),
                    new uml.Implementation({ source: { id: classes.person.id }, target: { id: classes.mammal.id }}),
                    new uml.Aggregation({ source: { id: classes.person.id }, target: { id: classes.address.id }}),
                    new uml.Composition({ source: { id: classes.person.id }, target: { id: classes.bloodgroup.id }})
                ];

                _.each(relations, function(r) { graph.addCell(r); });
                */

                // This causes diagrams to be spaced out
                // still need to figure out how to auto-size each uml.Class
                /**
                var res = joint.layout.DirectedGraph.layout(graph, {
                    nodeSep: 50,
                    edgeSep: 80,
                    rankDir: "TB"
                });
                */

                joint.layout.GridLayout.layout(graph, {
                  columns: 3,
                  columnWidth: 320,
                  rowHeight: largestHeight
                });

                paper.fitToContent();

        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}






// Given an array of Strings, transform it nito a new array of Strings 
// where the length of any one array element does not exceed the width limit
function transformToMultiline(stringArray, widthLimit) {

    //console.log(stringArray);
    if(typeof stringArray == 'undefined') {
        //console.log("stringArray is undefined");
        return [];
    }

    stringArray = stringArray.map(function(orig) {
        var transformed = "+ " + joint.util.breakText(orig, { width: widthLimit } );
        //console.log(transformed);
        return transformed;
    });

    return stringArray;
}

function calcMaxWidthForClass(classData) {
    var widthLimit = 300;
    var minWidth = 100;
    var pixelWidth = 8;
    var calculatedWidth = 0;

    // find the longest element to determine width
    var maxWidth = classData.name.length;
    $.each(classData.privateInstanceVariables, function(index, element) {
        if(maxWidth < element.length) {
            maxWidth = element.length;
        }
    });

    $.each(classData.publicMethods, function(index, element) {
        if(maxWidth < element.length) {
            maxWidth = element.length;
        }
    });

    calculatedWidth = maxWidth * pixelWidth;

    if(calculatedWidth < minWidth) {
        return minWidth;
    } else if(calculatedWidth < widthLimit) {
        return calculatedWidth;
    } else {
        return widthLimit;
    }
}

function calcMaxHeightForClass(classData) {
    var lineCount = 1;

    $.each(classData.privateInstanceVariables, function(index, element) {
        lineCount = lineCount + element.split(/\r\n|\r|\n/).length;
    });

    $.each(classData.publicMethods, function(index, element) {
        lineCount = lineCount + element.split(/\r\n|\r|\n/).length;
    });

    var pixelHeight = 25;
    return lineCount * pixelHeight;
}

joint.layout.GridLayout = {

    layout: function(graph, opt) {

    opt = opt || {};

    var elements = graph.getElements();

    // number of columns
    var columns = opt.columns || 1;

    // shift the element horizontally by a given amount
    var dx = opt.dx || 0;

    // shift the element vertically by a given amount
    var dy = opt.dy || 0;

    // width of a column
    var columnWidth = opt.columnWidth || this._maxDim(elements, 'width') + dx;

    // height of a row
    var rowHeight = opt.rowHeight ||  this._maxDim(elements, 'height') + dy;

    // position the elements in the centre of a grid cell
    var centre = _.isUndefined(opt.centre) || opt.centre !== false;

    // resize the elements to fit a grid cell & preserves ratio
    var resizeToFit = !!opt.resizeToFit;

    // iterate the elements and position them accordingly
    _.each(elements, function(element, index) {

        var cx = 0, cy = 0, elementSize = element.get('size');

        if (resizeToFit) {

        var elementWidth = columnWidth - 2*dx;
        var elementHeight = rowHeight - 2*dy;

        var calcElHeight = elementSize.height * (elementSize.width ? elementWidth/elementSize.width : 1);
        var calcElWidth = elementSize.width * (elementSize.height ? elementHeight/elementSize.height : 1);

        if (calcElHeight > rowHeight) {

            elementWidth = calcElWidth;
        } else {
            elementHeight = calcElHeight;
        }

        elementSize = { width: elementWidth, height: elementHeight };


        element.set('size', elementSize);
        }

        if (centre) {
        cx = (columnWidth - elementSize.width) / 2;
        cy = (rowHeight - elementSize.height) / 2;
        }

        element.set('position', {
        x: (index % columns) * columnWidth + dx + cx,
        y: Math.floor(index / columns) * rowHeight + dy + cy
        });
    });
    },

    // find maximal dimension (width/height) in an array of the elements
    _maxDim: function(elements, dimension) {

    return _.reduce(elements, function(max, el) { return Math.max(el.get('size')[dimension], max); }, 0);
    }
};

paper.on('cell:pointerdblclick ',
    function(cellView, evt, x, y) {
        //console.log(cellView.model.attributes);
        $("#classdetails").html('Class=' + cellView.model.attributes.fullyQualifiedName);
    }
);

function searchPackages(searchCriteria) {

    // clear existing results
    $("#searchresults").html("");

    // The query
    var query= {"statements":[{"statement":"MATCH (n:JavaPackage) WHERE n.name CONTAINS '" + searchCriteria + "' RETURN n",
    "resultDataContents":["row"]}]};

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
                //console.log("package search results:");
                //console.log(data);

                $.each(data.results[0].data, function(index, element) {

                    //console.log(element.row[0]);
                    $("#searchresults").append("<a class='packagesearchlink'>" + element.row[0].name + "</a><br/>");
                });

                $(".packagesearchlink").click(function(event) {
                    event.preventDefault();
                    var text = $(event.target).text();
                    searchDatabase(text);
                });
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

$("#packagesearchbutton").click(function() {
    searchPackages($("#packagesearchinput").val());
});

// initially load the page with ..
searchPackages("");

$("#classsearchbutton").click(function() {
    searchWithinClasses($("#classsearchinput").val());
});



// use this to do something upon right click like 
// pop up a modal
// http://jointjs.com/api#joint.dia.Paper%3aevents
paper.on('cell:contextmenu ',
    function(cellView, evt, x, y) {
        evt.preventDefault();
        console.log(cellView.model.attributes);
    }
);

// on mouse wheel zoom
// http://jsfiddle.net/kumilingus/atnoopkm/
function onMouseWheel(e) {

    e.preventDefault();
    e = e.originalEvent;

    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 50;
    var offsetX = (e.offsetX || e.clientX - $(this).offset().left); // offsetX is not defined in FF
    var offsetY = (e.offsetY || e.clientY - $(this).offset().top); // offsetY is not defined in FF
    var p = offsetToLocalPoint(offsetX, offsetY);
    var newScale = V(paper.viewport).scale().sx + delta; // the current paper scale changed by delta

    if (newScale > 0.4 && newScale < 2) {
        paper.setOrigin(0, 0); // reset the previous viewport translation
        paper.scale(newScale, newScale, p.x, p.y);
    }
}

function offsetToLocalPoint(x, y) {
    var svgPoint = paper.svg.createSVGPoint();
    svgPoint.x = x;
    svgPoint.y = y;
    // Transform point into the viewport coordinate system.
    var pointTransformed = svgPoint.matrixTransform(paper.viewport.getCTM().inverse());
    return pointTransformed;
}

paper.$el.on('mousewheel DOMMouseScroll', onMouseWheel);






