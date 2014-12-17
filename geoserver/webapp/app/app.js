/* 
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp', [
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngClipboard',
  'ngLodash',
  'ui.router',
  'ui.bootstrap',
  'gsApp.core',
  'gsApp.topnav',
  'gsApp.sidenav',
  'gsApp.login',
  'gsApp.home',
  'gsApp.layers',
  'gsApp.workspaces',
  'gsApp.maps'
])
.controller('AppCtrl', ['$scope', '$state', 'AppEvent', 'AppSession', '$window',
    '$rootScope',
    function($scope, $state, AppEvent, AppSession, $window, $rootScope) {
      $scope.session = AppSession;

      var height = $window.innerHeight - 65;
      $scope.pageHeight = {'height': height};

      // handle an un-authorized event and forward to the login page
      $scope.$on(AppEvent.Unauthorized, function(e) {
        //TODO: figure out if session expired, etc...
        $state.go('login');
      });
      $scope.$on(AppEvent.Login, function(e, login) {
        // forward to previous state, or home
        $state.go('home');

        // update global session state
        AppSession.update(login.session, login.user);
      });
      $scope.$on(AppEvent.Logout, function(e) {
        AppSession.clear();
        $state.go('login');
      });

      // track app state changes
      $scope.state = {};
      $scope.$on('$stateChangeSuccess',
        function(e, to, toParams, from, fromParams) {
          var tabTitle = 'Composer';

          switch(to.url)
          {
            case '/':
              if (toParams.workspace) {
                tabTitle += ' | Workspace: ' + toParams.workspace;
              }
              break;
            case '/compose':
              tabTitle += ' | Editing Map: ' + toParams.workspace + ' >' +
              toParams.name;
              break;
            case '/layers':
              tabTitle += ' | All Layers';
              break;
            case '/list':
              tabTitle += ' | All Project Workspaces';
              break;
            case '/maps':
              tabTitle += ' | All Maps';
              break;
            case '/style':
              tabTitle += ' | Editing Layer: ' + toParams.name;
              break;
          }

          $rootScope.header = tabTitle;
          $scope.state.curr = {name: to, params: toParams};
          $scope.state.prev = {name: from, params: fromParams};
        });
    }])
.factory('_', ['lodash',
    function(lodash) {
      return lodash;
    }])
.run(['$rootScope', 'GeoServer', 'AppSession',
    function($rootScope, GeoServer, AppSession) {
      GeoServer.session().then(function(result) {
        if (result.success) {
          AppSession.update(result.data.id, result.data.user);
        }
        else {
          AppSession.clear();
        }
      });
    }])
.constant('baseUrl', 'http://localhost:8000');
