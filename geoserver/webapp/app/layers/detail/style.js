angular.module('gsApp.layers.style', [
  'ui.codemirror',
  'gsApp.olmap',
  'gsApp.styleditor',
  'gsApp.alertpanel'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('layer.style', {
        url: '/style',
        templateUrl: '/layers/detail/style.tpl.html',
        controller: 'LayerStyleCtrl'
      });
    }])
.controller('LayerStyleCtrl', ['$scope', '$stateParams', 'GeoServer', '$log',
    function($scope, $stateParams, GeoServer, $log) {
      var wsName = $stateParams.workspace;
      var name = $stateParams.name;

      GeoServer.layer.get({ name: name, workspace: wsName }).$promise
        .then(function(layer) {
          $scope.layer = layer;
          $scope.layers = [layer];
          $scope.proj = layer.srs;
          $scope.bbox = {
            'west': layer.bbox[0],
            'south': layer.bbox[1],
            'east': layer.bbox[2],
            'north': layer.bbox[3]
          };
          $scope.center = layer.center;

          GeoServer.style.get(wsName, name).then(function(result) {
            $scope.style = result.data;
          });
        });

      $scope.refreshMap = function() {
        $scope.$broadcast('olmap-refresh');
      };
      $scope.saveStyle = function() {
        var content = $scope.editor.getValue();
        GeoServer.style.put(wsName, name, content).then(function(result) {
          if (result.success == true) {
            $scope.markers = null;
            $scope.alerts = [{
              type: 'success',
              message: 'Styled saved.',
              fadeout: true
            }];
            $scope.refreshMap();
          }
          else {
            if (result.status == 400) {
              // validation error
              $scope.markers = result.data.errors;
              $scope.alerts = [{
                type: 'danger',
                message: 'Style not saved due to error: ' + result.data.message
              }];
            }
            else {
              $scope.alerts = [{
                type: 'danger',
                message: 'Error occurred saving style: ' + result.data.message,
                details: result.data.trace
              }];
            }
          }
        });
      };
    }]);
