(function (controllers){ 

    var routerController = require("./routerController")

    controllers.init = function (app) { 
        routerController.init(app);
    }; 

})(module.exports);