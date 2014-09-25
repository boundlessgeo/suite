angular.module('gsApp.sidenav', [
  'gsApp.workspaces.workspace',
  'ui.bootstrap',
  'gsApp.olmap'
])
.directive('sidenav', function() {
    return {
      restrict: 'EA',
      templateUrl: '/components/sidenav/sidenav.tpl.html',
      controller: 'SideNavCtrl',
      replace: true
    };
  })
.controller('SideNavCtrl', ['$scope', '$rootScope', 'GeoServer',
  'AppEvent','$state', '$log', 'olMapService', '$timeout',
  function($scope, $rootScope, GeoServer, AppEvent, $state, $log,
    olMapService, $timeout) {

    GeoServer.workspaces.get().$promise.then(function(workspaces) {
      workspaces.filter(function(ws) {
        return ws['default'];
      });

      $scope.workspaces = workspaces;
    });

    // Update map 550 ms after sidebar is resized
    var mapsizeTimer = null;
    $scope.updateMapSize = function() {
      if (mapsizeTimer === null) {
        mapsizeTimer = $timeout(function() {
          olMapService.updateMapSize();
          mapsizeTimer = null;
        }, 450);
      }
    };

    $scope.onWorkspaceClick = function(workspace, detail) {
      if (detail) {
        $state.go('workspace.home.' + detail, {
          workspace: workspace.name
        });
      } else {
        $state.go('workspace.home', {
          workspace: workspace.name
        });
      }
    };
  }]);

