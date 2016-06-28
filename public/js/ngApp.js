(function (angular) { 

    var app = angular.module('app', ['ngRoute']);

    app.config(function ($routeProvider,$locationProvider) { 
    
        $routeProvider

        .when('/', {
            templateUrl: '/views/search.html',
            controller: "SearchController"
        })
    
        .otherwise({ redirectTo: '/' });

        $locationProvider.html5Mode(false).hashPrefix('!');

    })

    //need to add more code from website in here (7:11 - Add Search Page)

})(window.angular);