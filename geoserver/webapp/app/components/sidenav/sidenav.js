/* 
 * (c) 2014 Boundless, http://boundlessgeo.com
 * License: BSD
 */
/*global $, window*/
angular.module('gsApp.sidenav', [
  'gsApp.workspaces.home',
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
.controller('SideNavCtrl', ['$scope', '$rootScope', 'GeoServer', 'AppEvent',
  '$state', '$log', '$timeout', '$window', 'AppSession', '$location', '_',
  'workspacesListModel',
  function($scope, $rootScope, GeoServer, AppEvent, $state, $log,
    $timeout, $window, AppSession, $location, _, workspacesListModel) {

    $scope.toggleWkspc = {}; // workspaces in wide sidenav
    $scope.toggleWkspc2 = {}; // workspaces in collapse sidenav

    GeoServer.serverInfo.get().then(function(serverInfo) {
      $scope.serverInfo = serverInfo;

      if ($scope.serverInfo.status == 200) { $scope.status = 'ok'; }
      else {
        $scope.status = 'not running';
        if ($rootScope.alerts) {
          $rootScope.alerts.push({
            type: 'danger',
            message: 'Server is not running.',
            fadeout: true
          });
        }
      }
    });

    // Hug partial menu to sidebar bottom if height's enough
    $scope.onWindowResize = function() {
      var windowHeight = $window.innerHeight - 160;
      if (windowHeight < 300) {
        $scope.sideStyle = {'position': 'relative'};
        $scope.sideBottom = {'position': 'relative'};
      } else {
        $scope.sideStyle = {'position': 'absolute'};
        $scope.sideBottom = {'top': (windowHeight-30) + 'px'};
      }
      $scope.numWorkspaces = Math.floor((windowHeight - 230) / 30);
    };
    $scope.onWindowResize();
    var timer = null;
    $(window).resize(function() { // angular $window checked too often
      if (timer===null) {
        timer = $timeout(function() {
          $scope.onWindowResize();
          timer = null;
        }, 700);
      }
    });

    // open any open workspace folders on refresh
    function checkPath () {
      $scope.alreadyOpen_ws = null;
      var loc = $location.path();
      var index = loc.indexOf('workspace/');
      if (index > -1) {
        var workspaceSubstr = loc.substring(index+10);
        var lastindex = workspaceSubstr.indexOf('/');
        if (lastindex > -1) {
          $scope.alreadyOpen_ws = workspaceSubstr.substring(0, lastindex);
          if ($scope.workspaces) { // only open if workspaces already fetched
            reopenWorkspaceFolder();
          }
        }
      }
    }

    function reopenWorkspaceFolder () {
      if ($scope.alreadyOpen_ws !== null) { // reopen sidenav ws folder
        $scope.closeOthers($scope.alreadyOpen_ws);
      }
    }

    $scope.openWorkspaces = function() {
      $scope.workspaces = workspacesListModel.getWorkspaces();
      if (!$scope.workspaces) {
        workspacesListModel.fetchWorkspaces().then(
        function() {
          $scope.workspaces = workspacesListModel.getWorkspaces();
          $rootScope.$broadcast(AppEvent.WorkspacesFetched,
            $scope.workspaces);
        });
      }
      reopenWorkspaceFolder();
    };

    $scope.onResize = function() {
      $rootScope.$broadcast(AppEvent.SidenavResized);
    };

    // re-open when sidebar toggled
    $scope.openWorkspace = function () {
      // find the open workspace and re-open
      var ws = $scope.workspaces;
      var open_ws, ws_inview, ws_notinview;

      if ($scope.toggleSide) {
        ws_inview = $scope.toggleWkspc2;
        ws_notinview = $scope.toggleWkspc;
      } else {
        ws_inview = $scope.toggleWkspc;
        ws_notinview = $scope.toggleWkspc2;
      }

      for (var t=0; t < ws.length; t++) {
        if (ws_inview[ws[t].name]) {
          open_ws = ws[t].name;
        }
        ws_notinview[ws[t].name] = false;
      }
      ws_notinview[open_ws] = true;
    };

    $scope.closeAll = function () {
      if (!$scope.workspaces) {
        return;
      }
      var ws = $scope.workspaces;
      for (var t=0; t < ws.length; t++) {
        $scope.toggleWkspc[ws[t].name] = false;
      }
    };

    $scope.closeOthers = function(workspacename) {
      $scope.closeAll();
      if (workspacename) {
        $scope.toggleWkspc[workspacename] = true;
      }
    };

    $scope.onWorkspaceClick = function(workspace) {
      if (! $scope.toggleWkspc[workspace.name]) { // open it
        $scope.closeOthers(workspace.name);
        var params = {workspace: workspace.name};
        var state = 'workspace';
        $state.go(state, params);
      } else {
        $scope.toggleWkspc[workspace.name] =
          ! $scope.toggleWkspc[workspace.name]; // close it
      }
    };

    $scope.onWorkspaceTabClick = function(workspace, detail) {
      var params = {workspace: workspace.name};
      var state = 'workspace';
      if (detail) {
        state += '.' + detail;
      }
      $state.go(state, params);
    };

    // When collapsed
    $scope.onWorkspaceClick2 = function(workspace, detail) {
      if (! $scope.toggleWkspc2[workspace.name]) { // open it
        $scope.closeOthers2(workspace.name);
        var params = {workspace: workspace.name};
        var state = 'workspace';
        if (detail) {
          state += '.' + detail;
        }
        $state.go(state, params);
      } else {
        $scope.toggleWkspc2[workspace.name] =
          ! $scope.toggleWkspc2[workspace.name]; // close it
      }
    };

    $scope.closeOthers2 = function(workspacename) {
      var workspaces = $scope.workspaces;
      for (var t=0; t < workspaces.length; t++) {
        $scope.toggleWkspc2[workspaces[t].name] = false;
      }
      if (workspacename) {
        $scope.toggleWkspc2[workspacename] = true;
      }
    };

    $scope.newWorkspace = function() {
      $state.go('workspaces.new');
    };

    $rootScope.$on(AppEvent.Login, function(e, login) {
        $scope.openWorkspaces();
      });

    $rootScope.$on(AppEvent.WorkspacesFetched,
      function(scope, workspaces) {
        $scope.workspaces = workspaces;
        checkPath();
      });

    $rootScope.$on(AppEvent.WorkspaceSelected,
      function(scope, workspaceName) {
        $scope.closeOthers(workspaceName);
      });

    $rootScope.$on(AppEvent.WorkspaceNameChanged,
      function(scope, names) {
        $scope.workspaces.forEach(function(workspace) {
          if (workspace.name ===  names.original) {
            workspace.name = names.new;
            return;
          }
        });
      });

    $rootScope.$on(AppEvent.WorkspaceDeleted,
      function(scope, deletedSpaceName) {
        for (var p=0; p < $scope.workspaces.length; p++) {
          if ($scope.workspaces[p].name === deletedSpaceName) {
            $scope.workspaces.splice(p,1);
          }
        }
      });

    $rootScope.$on(AppEvent.ToggleSidenav,
      function(scope) {
        if (!$scope.toggleSide) {
          $scope.toggleSide = true;
          $timeout(function() {
            $scope.onResize();
          },450);
        }
      });

    $rootScope.$on(AppEvent.ServerError,
      function(scope, error) {
        $scope.alerts.push({
          type: 'danger',
          message: 'Server not responding ' + error.status + ': ' +
           error.data,
          fadeout: true
        });
      });
  }]);
