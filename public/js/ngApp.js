(function (angular) {

    var app = angular.module('App', ['ngRoute']);

    app.config(function ($routeProvider, $locationProvider) {

        $routeProvider

            .when('/', {
                templateUrl: '/views/search.html',
                controller: 'SearchController'
            })

            .when('/details/:id', {
                templateUrl: '/views/details.html',
                controller: 'DetailsController'
            })

            .when('/analysis/:id', {
                templateUrl: '/views/analysis.html',
                controller: 'AnalysisController'
            })

            .otherwise({ redirectTo: '/' });

        $locationProvider.html5Mode(false).hashPrefix('!');

    })
        .controller('SearchController', ['$scope', '$timeout', '$routeParams', '$location', 'DataService',

            function ($scope, $timeout, $routeParams, $location, DataService) {

                $scope.loading = true;
                $scope.error = false;

                DataService.getSearchData(function (success, data) {
                    $scope.loading = false;
                    if (!success) {
                        $scope.error = data;
                    }
                });

                $scope.searchData = function () {
                    DataService.search($scope.searchQuery, function (data) {
                        $timeout(function () {
                            $scope.searchResults = data;
                        });
                    });
                };

                $scope.changeView = function (pageName, id) {
                    id = typeof id === 'boolean' ? $routeParams.id : typeof id === 'string' ? id : '';
                    $location.path('/' + pageName + '/' + id);
                };
            }
        ])
        .controller('DetailsController', ['$scope', '$routeParams', '$location', 'DataService',

            function ($scope, $routeParams, $location, DataService) {

                $scope.loading = true;
                $scope.analyzing = false;

                DataService.getDetails($routeParams.id, function (success, data) {
                    $scope.loading = false;
                    if (success) {
                        $scope.details = data.details;
                    } else {
                        $scope.error = data;
                    }
                });

                function getAnalysisText() {
                    return $scope.details.message;
                }

                $scope.analyzeText = function () {
                    $scope.analyzing = true;
                    DataService.submitAnalysis({
                        _id: $scope.details.id,
                        title: $scope.details.title,
                        message: getAnalysisText()
                    }, function (success, data) {
                        $scope.analyzing = false;
                        if (success && data) {
                            $scope.changeView('analysis', true);
                        } else {
                            $scope.analysisError = "Error Analyzing Text";
                        }
                    });
                };


                $scope.changeView = function (pageName, id) {
                    id = typeof id === 'boolean' ? $routeParams.id : typeof id === 'string' ? id : '';
                    $location.path('/' + pageName + '/' + id);
                };

            }
        ])

        .controller('AnalysisController', ['$scope', '$timeout', '$routeParams', '$location', 'DataService',
            function ($scope, $timeout, $routeParams, $location, DataService) {

                $scope.loading = true;
                $scope.contentVisible = false;

                DataService.getData($routeParams.id, function (success,data) {
                    $scope.loading = false;
                    if (success) {
                        $scope.analysis = data;
                        $timeout(function () {
                            initCharts(data.PISummary);
                        });
                    } else {
                        $scope.error = data;
                    }
                });

                var chartOptions = {
                    segmentShowStroke: false,
                    percentageInnerCutout: 40,
                    animationSteps: 60,
                    animationEasing: 'easeInOutQuad',
                    animateRotate: true,
                    animateScale: false
                };

                var chartColours = ['#ff4000', '#ffc000', '#ff0040', '#008080','#bfff00'];

                function initCharts(data) {
                    for (var i = 0; i < data.length; i++){
                        new Chart(document.getElementById('analysis-chart-' + i)
                            .getContext("2d"))
                            .Doughnut(getChartData(data[i], i), chartOptions);
                    }
                }

                function getChartData(data, i) {
                    var num = Math.round(data.percentage * 100);

                    return [
                        {
                            value: num,
                            color: chartColours[i]
                        },
                        {
                            value: 100 - num,
                            color: 'rgba(255,255,255,0.1)'
                        }
                    ];
                }

                $scope.toggleContent = function () {
                    $scope.contentVisible = !$scope.contentVisible;
                };

                $scope.changeView = function (pageName, id) {
                    id = typeof id === 'boolean' ? $routeParams.id : typeof id === 'string' ? id : '';
                    $location.path('/' + pageName + '/' + id);
                };
            }
        ])

        .service('DataService', ['$http',

            function ($http) {
                var baseURL = "http://SocialAnalyticsEngine.mybluemix.net/";
                var searchData;

                return {
                    searchData: searchData,

                    getSearchData: function (res) {

                        $http.get(location.origin + '/searchdata')
                            .success(function (data) {
                                searchData = data.searchData;
                                res(true);
                            })
                            .error(function (err) {
                                res(false, err.error || err || 'Error fetching search data');
                            });
                    },

                    search: function (query, res) {
                        if (query.length < 2) {
                            res([]);
                            return;
                        }
                        var count = 0;
                        query = query.toLowerCase();
                        res(searchData.filter(function (value) {
                            if (count > 9) { return; }
                            value = value.title.toLowerCase();
                            if (value.indexOf(query) > -1) {
                                count++;
                                return true;
                            } else {
                                return false;
                            }
                        }));
                    },

                    getDetails: function (id, res) {
                        $http.get(location.origin + '/details/' + id)
                            .success(function (data) {
                                if (data.details) {
                                    res(true, data);
                                } else {
                                    res(false, data.error || 'Error fetching search data');
                                }
                            })
                            .error(function (err) {
                                res(false, err && data.error || err || 'Error fetching search data');
                            });
                    },

                    submitAnalysis: function (data, res) {
                        var url = baseURL + 'SocialMessage';

                        $http.post(url, data)
                            .success(function (data) {
                                res(true, data);
                            })
                            .error(function (data) {
                                res(false, data);
                            });
                    },

                    getData: function (id, res) {
                        $http.get(baseURL + 'SocialMessage?id=' + id)
                            .success(function (data) {
                                res(true, data);
                            })
                            .error(function (err) {
                                res(false, err && err.error || err || 'Error fetching search details');
                            });
                    }

                };
            }
        ])

})(window.angular);