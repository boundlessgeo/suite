/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.workspaces.home', [
  'gsApp.workspaces.maps',
  'gsApp.workspaces.layers',
  'gsApp.workspaces.data',
  'gsApp.workspaces.settings',
  'gsApp.alertpanel',
  'ngSanitize'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('workspace', {
          url: '/workspace/:workspace',
          templateUrl: '/workspaces/detail/workspace.tpl.html',
          controller: 'WorkspaceHomeCtrl'
        });
    }])
.controller('WorkspaceHomeCtrl', ['$scope','$state', '$stateParams', '$log',
  '$modal', 'GeoServer', 'AppEvent', '$timeout', '$location', '$rootScope',
  '_',
    function($scope, $state, $stateParams, $log, $modal, GeoServer,
      AppEvent, $timeout, $location, $rootScope, _) {

      var wsName = $stateParams.workspace;

      $scope.workspace = wsName;

      var loc = $location.path();

      function isActive(tab) {
        if (loc.indexOf(tab) > -1) {
          return true;
        }
        return false;
      }

      GeoServer.workspace.get(wsName).then(function(result) {
        $scope.title = wsName;

        $scope.tabs = [
          { heading: 'Maps',
            icon: 'icon-map',
            routeCategory: 'workspace.maps',
            route: 'workspace.maps.main',
            active: isActive('maps')},
          { heading: 'Layers',
            icon: 'icon-stack',
            routeCategory: 'workspace.layers',
            route: 'workspace.layers.main',
            active: isActive('layers')},
          { heading: 'Data',
            icon: 'fa fa-database',
            routeCategory: 'workspace.data',
            route: 'workspace.data.main',
            active: isActive('data')}
        ];

        $scope.go = function(route) {
          $state.go(route, {workspace:wsName});
        };

        // hack to deal with strange issue with tabs being selected
        // when they are destroyed
        // https://github.com/angular-ui/bootstrap/issues/2155
        var destroying = false;
        $scope.$on('$destroy', function() {
          destroying = true;
        });

        $scope.selectTab = function(t) {
          if (t.route.indexOf('maps') > -1) { $scope.currentTab = 'maps'; }
          else { $scope.currentTab = ''; }

          if (!destroying) {
            $scope.go(t.route);
          }
        };

        $scope.workspaceHome = function() {
          $scope.selectTab($scope.tabs[0]);
          $scope.tabs[0].active = true;
        };

        $scope.createMap = function() {
          $scope.selectTab($scope.tabs[0]);
          $scope.tabs[0].active = true;
          $timeout(function() {
            $rootScope.$broadcast(AppEvent.CreateNewMap);
          }, 100);
        };

        $scope.importData = function() {
          $scope.selectTab($scope.tabs[2]);
          $scope.tabs[2].active = true;
          $timeout(function() {
            $rootScope.$broadcast(AppEvent.ImportData);
          }, 100);
        };

        $scope.$on('$stateChangeSuccess',
          function(e, to, toParams, from, fromParams) {
            if(loc.indexOf('settings') > -1) {
              $scope.showSettings = $state.go('workspace.settings', {
                workspace: wsName
              });
            }

            $scope.tabs.forEach(function(tab) {
              if ($state.is(tab.routeCategory)) {
                tab.active = $state.is(tab.routeCategory);
              }
            });
            if (to.name == 'workspace') {
              $scope.go($scope.tabs[0].route);
            }
            $scope.showSettings = $state.is('workspace.settings');
          });
      });

      $rootScope.$on(AppEvent.WorkspaceTab, function(scope, tabname) {
        if (tabname) {
          var tab = _.find($scope.tabs, function(t) {
            return t.heading.toLowerCase() === tabname.toLowerCase();
          });
          if (tab) {
            $scope.selectTab(tab);
          }
        }
      });

    }]);

