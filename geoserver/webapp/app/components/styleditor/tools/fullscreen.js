angular.module('gsApp.styleditor.fullscreen', [])
.directive('styleEditorFullscreen', ['AppEvent',
  function(AppEvent) {
    return {
      restrict: 'EA',
      scope: {},
      template:
        '<li ng-click="toggleFullscreen()">' +
          '<i ng-if="!fullscreen" class="fa fa-expand"></i>' +
          '<i ng-if="fullscreen" class="fa fa-compress"></i>' +
          '<span>Fullscreen</span>' +
        '</li>',
      replace: true,
      controller: function($scope, $element) {
        $scope.toggleFullscreen = function() {
          $scope.$emit(AppEvent.ToggleFullscreen);
        };
      }
    };
  }]);