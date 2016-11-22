
function displayOverallCounts() {

    // The query
    
    var query= {"statements":[{"statement":"MATCH n RETURN DISTINCT count(labels(n)), labels(n);",
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
                //console.log(data);

                $.each(data.results[0].data, function(index, element) {

                    //console.log(element.row[0]);
                    if(element.row[1][0] === "JavaPackage") {
                        $("#overallcounts").append("<a href='packages.html'>Package</a> Count: " + element.row[0] + "<br/>");
                    }
                    if(element.row[1][0] === "JavaClass") {
                        $("#overallcounts").append("<a href='classes.html'>Class</a> Count: " + element.row[0] + "<br/>");
                    }
                });
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

function displayOverallLinesOfCode() {

    // The query
    
    var query= {"statements":[{"statement":"MATCH (c:JavaClass) RETURN sum(c.linesOfCode);",
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
                //console.log(data);

                $.each(data.results[0].data, function(index, element) {

                    $("#overallcounts").append("Lines of Code: " + element.row[0] + "<br/>");
                });
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

displayOverallCounts();
displayOverallLinesOfCode();
