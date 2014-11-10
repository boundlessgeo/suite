angular.module('gsApp.topnav', [])
.directive('topNav',
  function() {
    return {
      restrict: 'EA',
      templateUrl: '/components/topnav/topnav.tpl.html'
    };
  })
.controller('TopNavCtrl', ['$scope', '$rootScope', 'GeoServer', 'AppEvent',
    function($scope, $rootScope, GeoServer, AppEvent) {
      $scope.logout = function() {
        GeoServer.logout()
          .then(function() {
            $rootScope.$broadcast(AppEvent.Logout);
          });
      };
      $scope.adminLink = GeoServer.baseUrl();
    }]);
