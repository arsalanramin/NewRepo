(function (controllers){ 

    var routerController = require("./routerController")

    controllers.init = function (app) { 
        routerController.init(app);
    }; 

    console.log("index.js execution");

})(module.exports);