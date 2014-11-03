angular.module('gsApp.errorpanel', [
  'ui.bootstrap'
])
.factory('$exceptionHandler', ['$injector',
  function ($injector) {
    return function (exception, cause) {
      if (exception) {
        var rScope = $injector.get('$rootScope');

        this.errors = [{
          exception: exception.message,
          message: exception.cause,
          fadeout: true,
          allErrors: exception.trace,
          stack: exception.stack
        }];

        if (rScope) {
          rScope.errors = this.errors;
        }
      }
    };
  }])
.directive('errorPanel', ['$modal', '$interval', '$log', '$window',
    function($modal, $interval, $log, $window) {
      return {
        restrict: 'EA',
        scope: {
          errors: '=?'
        },
        templateUrl: '/components/errorpanel/errorpanel.tpl.html',
        controller: function($scope, $element, $window) {
          $scope.$watch('errors', function(newVal) {
            if (newVal != null) {
              $scope.messages = newVal.map(function(val) {
                $scope.msg = angular.extend({show:true}, val);
                $scope.exception = $scope.msg.exception;
                $scope.message = $scope.msg.message;
                $scope.fadeout = $scope.msg.fadeout;

                if ($scope.msg.allErrors) { $scope.details = true; }
                else { $scope.details = false; }

                if ($scope.fadeout == true) {
                  $interval(function() {
                    $scope.msg.show = false;
                  }, 5000, 1);
                }
                return $scope.msg;
              });
            }
          });
          $scope.close = function(i) {
            $scope.messages.splice(i, 1);
          };
          $scope.showDetails = function(message) {
            var modal = $modal.open({
              templateUrl: 'error-modal',
              size: 'lg',
              resolve: {
                message: function() {
                  return message;
                }
              },
              controller: function($scope, $modalInstance, message, $window) {
                $scope.message = message;
                $scope.fullMessage = message.message;
                $scope.message = message.message;
                $scope.allErrors = message.allErrors;
                $scope.entireMessage = message;

                $scope.copy = function() {
                  $scope.copied = true;
                  return $scope.entireMessage;
                };
                $scope.close = function() {
                  $modalInstance.close();
                };
              }
            });
          };
        }
      };
    }]);
