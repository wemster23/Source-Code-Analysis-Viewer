
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
                    $(buttonDiv).addClass('pkg-btn-group');
                    $(buttonDiv).css('display', 'none');
                    $(buttonDiv).html("<button type='button' class='btn btn-default'>Class UML</button><button type='button' class='btn btn-default'>Analyze Deps</button>");

                    $(pkgDiv).append(buttonDiv);

                    $("#listpackages").append(pkgDiv);
                });

                $(".pkg").hover(function(evt){
                    $(evt.target).find('.pkg-btn-group').show();
                }, function() {
                    $('.pkg-btn-group').hide();
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

                        // build class div containing java class name
                        var classDiv = $('<div/>');
                        $(classDiv).addClass('classDiv');
                        $(classDiv).append(element.row[0].name);
                        //$(classDiv).data('details', element.row[0]);


                        // add class hover options to class
                        var classButtonDiv = $('<div/>');
                        $(classButtonDiv).addClass('btn-group');
                        $(classButtonDiv).addClass('btn-group-xs');
                        $(classButtonDiv).addClass('class-btn-group');
                        $(classButtonDiv).css('display', 'none');
                        $(classButtonDiv).data('details', element.row[0]);
                        $(classButtonDiv).html("<button type='button' class='btn btn-default class-details-button'>Details</button><button type='button' class='btn btn-default class-source-button'>Source</button>");
                        $(classDiv).append(classButtonDiv);

                        $(packageClassesDiv).append(classDiv);
                    });

                    // show class options next class when hovering over class
                    $(".classDiv").hover(function(evt){
                        $(evt.target).find('.class-btn-group').show();
                    }, function() {
                        $('.class-btn-group').hide();
                    });

                    // when clicking the "details" button when hovering over a class, update the specific 
                    // details div with basic info about the class
                    $(".class-details-button").on('click', function (evt) {
                        evt.stopPropagation();
                        //console.log("clicked classDetailsButton");
                        var classDetails = $(evt.target).parent(".class-btn-group").data("details");
                        console.log("name: " + classDetails.name);

                        $("#specificdetails").html("");
                        var classDetailTable = $('<table/>');
                        $(classDetailTable).addClass("table");
                        $(classDetailTable).addClass("table-bordered");
                        
                        var classDetailHtml = "<tr><td>Class Name:</td><td>" + classDetails.name + "</td></tr>";
                        classDetailHtml += "<tr><td>Fully Qualified Name:</td><td>" + classDetails.fullyQualifiedName + "</td></tr>";
                        classDetailHtml += "<tr><td>Lines of code:</td><td>" + classDetails.linesOfCode + "</td></tr>";
                        // currently a bug where methods have syntax that isn't escaped and is confused as html tags
                        classDetailHtml += "<tr><td>Public methods:</td><td>";


                        if(classDetails.publicMethods === null || classDetails.publicMethods === undefined) {
                            console.log("its undefined");
                        } else {    
                            classDetailHtml += "<table class='table table-bordered'>";
                            for(var i = 0; i < classDetails.publicMethods.length; i++) {
                                classDetailHtml += "<tr><td>" + htmlEntities(classDetails.publicMethods[i]) + "</td></tr>"; 
                            }
                            classDetailHtml += "</table>";
                        }

                        classDetailHtml += "</td></tr>";
                        classDetailHtml += "<tr><td>Private Instance Variables:</td><td>";
                        
                        if(classDetails.privateInstanceVariables === null || classDetails.privateInstanceVariables === undefined) {
                            console.log("its undefined");
                        } else {    
                            classDetailHtml += "<table class='table table-bordered'>";
                            for(var i = 0; i < classDetails.privateInstanceVariables.length; i++) {
                                classDetailHtml += "<tr><td>" + htmlEntities(classDetails.privateInstanceVariables[i]) + "</td></tr>"; 
                            }
                            classDetailHtml += "</table>";
                        }
                        classDetailHtml += "</td></tr>";

                        $(classDetailTable).append(classDetailHtml);

                        $("#specificdetails").append(classDetailTable);
                    });

                    $(".class-source-button").on('click', function (evt) {
                        evt.stopPropagation();
                        //var classDetails = $(evt.target).parent(".class-btn-group").data("details");

                        $("#specificdetails").html("");
                        
                        var javaCodePre = $('<pre/>');
                        $(javaCodePre).addClass("java-code-pre");

                        $(javaCodePre).load( "../codesamples/JavaParser.java", function() {
                              
                            //hljs.configure({useBR: true});

                            $('pre').each(function(i, block) {
                              hljs.highlightBlock(block);
                            });
                        });

                        $("#specificdetails").append(javaCodePre);
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
                $("#specificdetails").append("<table class='table table-hover'><thead><tr><th>Package</th><th>#</th></tr></thead><tbody>");

                $.each(data.results[0].data, function(index, element) {

                    //console.log(element.row[0]);
                    $("#specificdetails").append("<tr><td>" + element.row[0].name + "</td><td>" + element.row[1] + "</td></tr>");
                });
                $("#specificdetails").append("</tbody></table>");
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

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}