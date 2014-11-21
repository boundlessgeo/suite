/* 
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.workspaces.list', [
  'ngGrid',
  'gsApp.core.utilities',
  'ngAnimate'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('workspaces.list', {
          url: '/list',
          templateUrl: '/workspaces/list.tpl.html',
          controller: 'WorkspacesListCtrl'
        });
    }])
.controller('WorkspacesListCtrl', ['$scope', 'GeoServer', '$state', '$log',
  '$rootScope', 'AppEvent', '_', 'workspacesListModel', '$timeout',
    function($scope, GeoServer, $state, $log, $rootScope, AppEvent, _,
      workspacesListModel, $timeout) {
      $scope.title = 'All Project Workspaces';

      $scope.onWorkspaceClick = function(workspace) {
        var params = {workspace: workspace.name};
        var state = 'workspace';
        $state.go(state, params);
        $rootScope.$broadcast(AppEvent.WorkspaceSelected,
          workspace.name);
      };

      $scope.defaultDesc = 'If a project workspace is not specified ' +
        'in a GeoServer request, the DEFAULT is used.';
      $scope.showDefaultDesc = false;

      $scope.workspaces = workspacesListModel.getWorkspaces();
      if (!$scope.workspaces) {
        workspacesListModel.fetchWorkspaces().then(
          function(result) {
            $scope.workspaces = workspacesListModel.getWorkspaces();
            $rootScope.$broadcast(AppEvent.WorkspacesFetched,
              $scope.workspaces);
          });
      }

      $scope.onWorkspaceInfo = function(workspace) {
        $scope.selected = workspace;
        GeoServer.workspace.get(workspace.name).then(
          function(result) {
            if (result.success) {
              $scope.selected.workspaceInfo = result.data;
              $scope.selected.showInfo = true;
              $timeout(function() {
                $scope.selected.showInfo = false;
              }, 4000);
            } else {
              $scope.alerts = [{
                type: 'warning',
                message: 'Could not get workspace ' + workspace.name + '.',
                fadeout: true
              }];
            }
          });
      };

      $scope.go = function(route, workspace) {
        $state.go(route, {workspace: workspace.name});
      };

    }])
.service('workspacesListModel', function(GeoServer, _, $rootScope) {
  var _this = this;
  this.workspaces = null;

  this.getWorkspaces = function() {
    return this.workspaces;
  };

  this.setWorkspaces= function(workspaces) {
    this.workspaces = workspaces;
  };

  this.addWorkspace = function(workspace) {
    this.workspaces.push(workspace);
  };

  this.removeWorkspace = function(workspace) {
    _.remove(_this.workspaces, function(_workspace) {
      return _workspace.name === workspace.name;
    });
  };

  this.fetchWorkspaces = function() {
    return GeoServer.workspaces.get(true).then(
      function(result) {
        if (result.success) {
          var workspaces = _.map(result.data,
            function(ws) {
              if (ws.modified) {  // convert time strings to Dates
                return _.assign(ws, {'modified': {
                  'timestamp': new Date(ws.modified.timestamp),
                  'pretty': ws.modified.pretty
                }});
              } else {
                return ws;
              }
            });
            // sort by timestamp
          workspaces = _.sortBy(workspaces, function(ws) {
            if (ws.modified) {
              return ws.modified.timestamp;
            }
          });
          _this.setWorkspaces(workspaces.reverse());
        } else {
          // special case, check for 401 Unauthorized, if so be quiet
          if (result.status != 401) {
            $rootScope.alerts = [{
              type: 'warning',
              message: 'Could not get workspaces.',
              fadeout: true
            }];
          }
        }
      });
  };
});
