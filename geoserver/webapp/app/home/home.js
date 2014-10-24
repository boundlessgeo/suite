angular.module('gsApp.home', [])
.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
      $stateProvider.state('home', {
        url: '/',
        templateUrl: '/home/home.tpl.html',
        controller: 'HomeCtrl'
      });
    }])
.controller('HomeCtrl', ['$scope', 'GeoServer',
    function($scope, GeoServer) {
      $scope.title = 'Home';
      GeoServer.serverInfo.get().$promise.then(function(serverInfo) {
        $scope.serverInfo = serverInfo;
        $scope.server = serverInfo.server;
        //$scope.serverInfo = serverInfo;

        if (!$scope.server) {
          $scope.server = {};
        }

        if (serverInfo.title) { $scope.server.title = serverInfo.title; }
        else { $scope.server.title = 'localhost:8000'; }
        //$scope.server.status = serverInfo.status;
        $scope.server.status = 'ok';
        
        $scope.server.url = GeoServer.baseUrl();
        $scope.catalog = serverInfo.catalog;
        $scope.services = serverInfo.services;
      });
    }]);
