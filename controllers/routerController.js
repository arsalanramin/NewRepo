(function (routeController) { 

    var authorData = require('./../data/authors.json');

    function fetchAuthor(id) {
        for (var i = 0; i < authorData.length; i++) {
            if (authorData[i].id == id) { 
                return authorData[i];
            };
        };
    };

    routeController.init = function (app) {

        console.log("routerController.js execution - prior to app.gets");

        app.get('/searchdata', function (req, res) {

            console.log("routerController.js execution - searchdata");

            res.json({
                searchData: authorData
            });
        });

        app.get('/details/:id', function (req, res) {
            var author = fetchAuthor(req.params.id);

            console.log("routerController.js execution - details by ID");

            res.json({
                details: {
                    id: author.id,
                    title: author.title,
                    message: author.message
                }
            });
        });
    };
})(module.exports);