
function displayPackageListing() {

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

                    var pkgDiv = $('<div/>');
                    $(pkgDiv).addClass('pkg');
                    //$(pkgDiv).text(element.row[0]);

                    var pkgExpandSpan = $('<span/>');
                    $(pkgExpandSpan).addClass('glyphicon');
                    $(pkgExpandSpan).addClass('glyphicon-plus-sign');
                    $(pkgDiv).append(pkgExpandSpan);
                    
                    $(pkgDiv).append(element.row[0]);
                    $(pkgDiv).data('packageName', element.row[0]);

                    var buttonDiv = $('<div/>');
                    $(buttonDiv).addClass('btn-group');
                    $(buttonDiv).addClass('btn-group-xs');
                    $(buttonDiv).css('display', 'none');
                    $(buttonDiv).html("<button type='button' class='btn btn-default'>Class UML</button><button type='button' class='btn btn-default'>Analyze Deps</button>");

                    $(pkgDiv).append(buttonDiv);

                    $("#listpackages").append(pkgDiv);
                });

                $(".pkg").hover(function(evt){
                    $(evt.target).find('.btn-group').show();
                }, function() {
                    $('.btn-group').hide();
                });

                // when clicking on a package name, show display all classes in that package
                $(".pkg").click(function (evt) {
                    //evt.preventDefault();
                    var packageName = $(event.target).data('packageName');
                    console.log("clicked pkg val=" + packageName);
                    //showClassesInPackage(packageName);
                    showClassesInPackage(event.target);

                    $(this).children('.packageClasses').toggle();

                    $(this).children('.glyphicon')
                           .toggleClass('glyphicon-minus-sign')
                           .toggleClass('glyphicon-plus-sign');

                    //displayPackageOnGraph(text);
                    //$("#search").slideUp(200);
                });


        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

function showClassesInPackage(targetElement) {

   var packageName = $(targetElement).data('packageName');

    //console.log(targetElement);
    //console.log($(targetElement).data('packageName'));
    if($(targetElement).find('div.packageClasses').length != 0) {
        //console.log("already retrieved classes");
        return;
    }

    // The query
    var query= {"statements":[{"statement":"MATCH (p:JavaPackage)-[CONTAINS_CLASS]->(j:JavaClass) WHERE p.name = '" + packageName + "' RETURN j;",
    "resultDataContents":["graph","row"]}]};

    var request = $.ajax({
        type: "POST",
        url: "http://localhost:7474/db/data/transaction/commit",
        accepts: { json: "application/json" },
        dataType: "json",
        contentType:"application/json",
        data: JSON.stringify(query),
        //now pass a callback to success to do something with the data
        success: function (data) {

                if(data.results[0].data.length > 0) {

                    var packageClassesDiv = document.createElement("div");
                    $(packageClassesDiv).addClass("packageClasses");
                    $(targetElement).append(packageClassesDiv);

                    $.each(data.results[0].data, function(index, element) {

                        //console.log("Class name: " + element.row[0].name);
                       
                        $(packageClassesDiv).append(element.row[0].name + "<br/>");
                    });

                    $(packageClassesDiv).on('click', function (event) {
                        event.stopPropagation();
                        console.log(event);  // TODO: Pass name of pkg and class thru and set on details pop up
                        updateClassDetails();
                        $("#classdetails").css({'top':event.pageY - 20,'left':event.pageX - 100}).fadeIn('slow');
                    });
                }

        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}


// listing of packages sorted by those that have the most incoming package dependencies
function displayMostDepPackages() {

    // The query
    var query= {"statements":[{"statement":"MATCH (n:JavaPackage)-[r:DEPENDS_ON_PACKAGE]->(p:JavaPackage) RETURN p, count(r) as rel_count ORDER BY rel_count desc;",
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
                $("#listpackagedepcount").append("<table class='table table-hover'><thead><tr><th>Package</th><th>#</th></tr></thead><tbody>");

                $.each(data.results[0].data, function(index, element) {

                    //console.log(element.row[0]);
                    $("#listpackagedepcount").append("<tr><td>" + element.row[0].name + "</td><td>" + element.row[1] + "</td></tr>");
                });
                $("#listpackagedepcount").append("</tbody></table>");
        }
    });

    request.done(function(data) {

    });

    request.fail(function(jqXHR, textStatus) {
      alert( "Request failed: " + textStatus );
    });
}

displayPackageListing();
displayMostDepPackages();

// when mouse leaves modal, hide it
$("#classdetails").mouseleave(function(){
  $("#classdetails").fadeOut('slow');
});

function updateClassDetails() {
    $("#classdetails").html("");
    //$("#classdetails").append("<h4>" + node.name + "</h4><br/>");
    //$("#classdetails").append(node.fullyQualifiedName + "<br/><br>");
    $("#classdetails").append("(Links below do not yet function)<br/>");
    $("#classdetails").append("<a href='#'>View Source Code</a><br/>");
    $("#classdetails").append("<a href='#'>View Class In Package</a><br/>");
    $("#classdetails").append("<a href='#'>View Package Dependency Graph For Class's Package</a><br/>");
    $("#classdetails").append("<a href='#'>Create Proposed Revision</a><br/>");
}