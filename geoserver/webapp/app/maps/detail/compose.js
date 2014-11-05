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
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$compile',
    '$log', 'AppEvent', 'GeoServer', '$modal',
    function($scope, $rootScope, $state, $stateParams, $timeout, $compile,
      $log, AppEvent, GeoServer, $modal) {
      var wsName = $stateParams.workspace;
      $scope.workspace = wsName;
      var name = $stateParams.name;
      $rootScope.$broadcast(AppEvent.ToggleSidenav);

      GeoServer.map.get(wsName, name).then(function(result) {
        var map = result.data;

        //hack, get the detailed version of the layers
        GeoServer.map.layers.get(wsName, map.name).then(function(result) {
          map.layers = result.data;
          $scope.activeLayer = map.layers.length > 0 ? map.layers[0] : null;

          // map options, extend map obj and add visible flag to layers
          $scope.map = map;
          $scope.mapOpts = angular.extend(map, {
            layers: map.layers.map(function(l) {
              l.visible = true;
              return l;
            }),
            error: function(err) {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Map rendering error',
                details: err.exceptions[0].text
              }];
            },
            progress: function(state) {
              if (state == 'start') {
                $scope.isRendering = true;
              }
              if (state == 'end') {
                $scope.isRendering = false;
              }
              $scope.$apply();
            }
          });
        });
      });

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

      $scope.zoomToLayer = function(layer) {
        $scope.mapOpts.bounds = {
          bbox: layer.bbox,
          proj: layer.proj
        };
      };
      $scope.removeLayer = function(layer, index) {
        GeoServer.map.layers.delete(wsName, $scope.map.name, layer.name)
          .then(function(result) {
            if (result.success) {
              $scope.map.layers.splice(index, 1);
            }
            else {
              var err = result.data;
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Unable to delete layer from map: ' + err.message,
                details: err
              }];
            }
          });
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
              $rootScope.alerts = [{
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
                $rootScope.alerts = [{
                  type: 'danger',
                  message: 'Style not saved due to validation error.'
                }];
              }
              else {
                $rootScope.alerts = [{
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

      $scope.viewWorkspace = function(workspace) {
        $state.go('workspace', {workspace: workspace});
      };

      $scope.addMapLayer = function(workspace) {
        var modalInstance = $modal.open({
          templateUrl: '/workspaces/detail/modals/layer.addtomap.tpl.html',
          controller: 'AddToMapLayerCtrl',
          size: 'lg',
          resolve: {
            map: function() {
              return $scope.map;
            },
            workspace: function() {
              return $scope.workspace;
            }
          }
        });
      };

    }]);
