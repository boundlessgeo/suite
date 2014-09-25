angular.module('gsApp', [
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ngClipboard',
  'ui.router',
  'ui.bootstrap',
  'gsApp.core',
  'gsApp.topnav',
  'gsApp.sidenav',
  'gsApp.login',
  'gsApp.home',
  'gsApp.layers',
  'gsApp.workspaces',
  'gsApp.maps',
  'gsApp.data'
])
.controller('AppCtrl', ['$scope', '$state', 'AppEvent', 'AppSession', '$log',
    function($scope, $state, AppEvent, AppSession, $log) {
      $scope.session = AppSession;

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
              $scope.state.curr = {name: to, params: toParams};
              $scope.state.prev = {name: from, params: fromParams};
            });
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
