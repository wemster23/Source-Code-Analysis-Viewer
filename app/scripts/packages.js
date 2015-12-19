//the helper function provided by neo4j documents
function idIndex(a,id) {
    for (var i=0;i<a.length;i++) {
        if (a[i].id == id) return i;}
    return null;
}

function searchDatabase(searchCriteria) {

    // The query
    var query= {"statements":[{"statement":"MATCH (javaPackage:JavaPackage) RETURN javaPackage.name ORDER BY javaPackage.name;",
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
                    $("#listpackages").append(element.row[0] + "<br/>");
                });
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

searchDatabase();
