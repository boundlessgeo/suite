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
    '$timeout', '$modal', '$location', '$interval', 'GeoServer',
    function($scope, $state, AppEvent, AppSession, $window, $timeout,
      $modal, $location, $interval, GeoServer) {
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
      $scope.$on(AppEvent.SessionTimeout, function(e) {
        if (!$scope.timeoutModal && $location.path() != '/login') {
          $scope.modalInstance = $modal.open({
            templateUrl: '/core/modals/timeout.tpl.html',
            scope: $scope,
            controller: ['$scope', '$modalInstance', '$state', '$document',
              function($scope, $modalInstance, $state, $document) {
                $scope.countdown = 120;
                $scope.timeoutModal = true;

                $interval(function(){
                  $scope.countdown--;

                  if ($scope.countdown == 0) {
                    $scope.modalInstance.dismiss('cancel');
                    AppSession.clear();
                    $state.go('login');
                  }
                }, 1000);

                $scope.cancel = function() {
                  $scope.sessionTracker();
                  $scope.timeoutModal = false;
                  $modalInstance.dismiss('cancel');
                };
              }],
            backdrop: 'static',
            size: 'md'
          });
        }
      });

      // track app state changes
      $scope.state = {};
      $scope.sessionTracker = function() {
        if($location.path() != '/login') {
          if (angular.isUndefined($scope.sessionWarning)) {
            GeoServer.session().then(function(result) {
              if (result.success) {
                $scope.sessionWarning = (result.data.timeout - 120) * 1000 ;
                $scope.setSession();
              }
              else {
                $scope.sessionTracker();
              }
            });
          }
          else {
            $scope.setSession();
          }
        }
      };

      $scope.setSession = function() {
        //Cancel any previous timeouts and set up a new one.
        if ($scope.timeout) { $timeout.cancel($scope.timeout); }

        if($location.path() != '/login') {
          AppSession.update(AppSession.id, AppSession.user);
          $scope.timeout = $timeout(function(){},
            $scope.sessionWarning).then(function() {
            $scope.$broadcast(AppEvent.SessionTimeout);
          });
        }
        else {
          if ($scope.modalInstance) {
            $scope.timeoutModal = false;
            $scope.modalInstance.dismiss('cancel');
          }
        }
      };

      $scope.$on('$stateChangeSuccess',
        function(e, to, toParams, from, fromParams) {
          $scope.sessionTracker();
          $scope.state.curr = {name: to, params: toParams};
          $scope.state.prev = {name: from, params: fromParams};
        });
    }])
.factory('_', ['lodash',
    function(lodash) {
      return lodash;
    }])
.run(['GeoServer', 'AppSession',
    function(GeoServer, AppSession) {
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
