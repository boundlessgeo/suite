angular.module('gsApp.maps.compose', [
  'ui.codemirror',
  'ui.sortable',
  'gsApp.olmap',
  'gsApp.styleditor'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('map.compose', {
        url: '/compose',
        templateUrl: '/maps/detail/compose.tpl.html',
        controller: 'MapComposeCtrl'
      });
    }])
.controller('MapComposeCtrl',
    ['$scope', '$stateParams', 'GeoServer', '$timeout', '$log',
    'olMapService',
    function($scope, $stateParams, GeoServer, $timeout, $log,
      olMapService) {
      var wsName = $stateParams.workspace;
      $scope.workspace = wsName;
      var name = $stateParams.name;

      GeoServer.map.get(wsName, name).then(function(result) {
        var map = result.data;
        $scope.map = map;
        $scope.activeLayer = map.layers.length > 0 ? map.layers[0] : null;

        $scope.layers = [angular.extend(map, {
          bbox: {
            native: map.bbox
          }
        })];
        $scope.proj = map.srs;
        $scope.center = map.bbox.center;
        $scope.visibleMapLayers = [];

        // wait for map to load
        $timeout(function() {
          $scope.olMap = olMapService.map;
          var layers = $scope.olMap.getLayers();
          layers.forEach(function(layer, i) {
            $scope.visibleMapLayers[i] = layer.getVisible();
          });
          $scope.numLayers = layers.getLength();
        }, 300);
      });

      // for checkboxes in Layers list
      $scope.toggleVisibility = function(l, index) {
        var layers = $scope.olMap.getLayers();
        var toggledLayer;
        angular.forEach(layers, function(layer, key) {
          if (layer.getProperties().name === l.name) {
            toggledLayer = layer;
            return;
          }
        });
        toggledLayer.setVisible($scope.visibleMapLayers[index] =
         !$scope.visibleMapLayers[index]);
      };

      $scope.toggle = true;
      $scope.toggleLayers = function() {
        $scope.toggle = !$scope.toggle;
      };

      $scope.selectLayer = function(layer) {
        var layerState = $scope.layerState;
        var activeLayer = $scope.activeLayer;

        if (activeLayer != null) {
          if (!(activeLayer.name in layerState)) {
            layerState[activeLayer.name] = {};
          }
          layerState[activeLayer.name].style = $scope.style;
        }
        $scope.activeLayer = layer;
      };

      $scope.refreshMap = function() {
        $scope.$broadcast('olmap-refresh');
      };

      $scope.saveStyle = function() {
        var l = $scope.activeLayer;
        GeoServer.style.put(l.workspace, l.name, $scope.style)
          .then(function(result) {
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
                  message: 'Style not saved due to errors.'
                }];
              }
              else {
                $scope.alerts = [{
                  type: 'danger',
                  message: 'Error occurred saving style: ' +
                    result.data.message,
                  details: result.data.trace
                }];
              }
            }
          });
      };

      $scope.layersReordered = function() {
        if ($scope.map != null) {
          GeoServer.map.layers.put(wsName, name, $scope.map.layers)
            .then(function(result) {
              if (result.success) {
                $scope.refreshMap();
              }
              else {
                $log.log(result);
              }
            });
        }
      };
      $scope.layerState = {};
      $scope.$watch('activeLayer', function(newVal) {
        if (newVal != null) {
          var l = newVal;
          if (l.name in $scope.layerState) {
            $scope.style = $scope.layerState[l.name].style;
          }
          else {
            GeoServer.style.get(l.workspace, l.name)
              .then(function(result) {
                $scope.style = result.data;
              });
          }
          $timeout(function() {
            $scope.editor.clearHistory();
          }, 5000);
        }
      });

    }]);
