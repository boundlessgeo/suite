/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.maps.compose', [
  'ui.codemirror',
  'ui.sortable',
  'gsApp.olmap',
  'gsApp.styleditor',
  'gsApp.featureinfopanel',
  'gsApp.styleditor.shortcuts',
  'gsApp.workspaces.maps.layerremove'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('map.compose', {
        url: '/compose',
        templateUrl: '/maps/detail/compose.tpl.html',
        controller: 'MapComposeCtrl',
        params: { workspace: {}, name: {}, hiddenLayers: {} }
      });
    }])
.controller('MapComposeCtrl',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$compile',
    '$log', 'AppEvent', 'GeoServer', '$modal', '_', '$window', '$document',
    function($scope, $rootScope, $state, $stateParams, $timeout, $compile,
      $log, AppEvent, GeoServer, $modal, _, $window, $document) {

      $rootScope.fullScreen = false;
      $scope.fullscreenDirection = 'Maximize';

      var wsName = $stateParams.workspace;
      $scope.workspace = wsName;
      var name = $stateParams.name;
      var hiddenLayers = $stateParams.hiddenLayers;
      if (hiddenLayers && typeof hiddenLayers === 'string') {
        hiddenLayers = hiddenLayers.split(',');
      }
      $rootScope.$broadcast(AppEvent.ToggleSidenav);

      GeoServer.map.get(wsName, name).then(function(result) {
        var map = result.data;

        //hack, get the detailed version of the layers
        GeoServer.map.layers.get(wsName, map.name).then(
          function(result) {
          if (result.success) {
            map.layers = result.data;
            $scope.activeLayer = map.layers.length > 0 ? map.layers[0] : null;

            // map options, extend map obj and add visible flag to layers
            $scope.map = map;
            $scope.mapOpts = angular.extend(map, {
              layers: map.layers.map(function(l) {
                l.visible = true;
                if (hiddenLayers) { // reinstate visibility
                  var found = _.contains(hiddenLayers, l.name);
                  if (found) {
                    l.visible = false;
                  }
                }
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
              },
              featureInfo: function(features) {
                $scope.$broadcast('featureinfo', features);
              }
            });
          } else {
            $rootScope.alerts = [{
              type: 'danger',
              message: 'Could not load ' + name + ': ' +
                result.data.message,
              fadeout: true
            }];
          }
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
        var modalInstance = $modal.open({
          templateUrl: '/workspaces/detail/modals/map.layerremove.tpl.html',
          controller: 'MapRemoveLayerCtrl',
          size: 'md',
          resolve: {
            map: function() {
              return $scope.map;
            },
            layer: function() {
              return layer;
            }
          }
        }).result.then(function(response) {
          if (response==='remove') {
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
          }
        });
      };

      $scope.refreshMap = function() {
        $scope.$broadcast('olmap-refresh');
      };

      $scope.saveStyle = function() {
        var l = $scope.activeLayer;
        GeoServer.style.put(l.workspace, l.name, $scope.style, $scope.map)
          .then(function(result) {
            if (result.success == true) {
              $scope.markers = null;
              $rootScope.alerts = [{
                type: 'success',
                message: 'Style saved.',
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
        if ($scope.mapOpts) {
          $scope.mapOpts.activeLayer = newVal;
        }
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

      // Save checkbox state as url parameters
      $scope.getHiddenLayers = function() {
        var hiddenLayers = _.remove($scope.map.layers,
          function(lyr) { return lyr.visible===false; });
        hiddenLayers = _.map(hiddenLayers,
          function(layer) { return layer.name; });
        return hiddenLayers.join();
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
        }).result.then(function(response, args) {
          if (response==='import') {
            $scope.map.hiddenLayers = $scope.getHiddenLayers();
            var mapInfo = $scope.map;
            $timeout(function() {
              $rootScope.$broadcast(AppEvent.ImportData, {
                mapInfo: mapInfo,
                workspace: $scope.workspace
              });
            }, 250);
            // go to this state to initiate listener for broadcast above!
            $state.go('workspace.data.import', {
              workspace: $scope.workspace
            });
          } else if (response==='added') {
            $scope.refreshMap();
          }
        });
      };

      $scope.editMapSettings = function(map) {
        var modalInstance = $modal.open({
          templateUrl: '/workspaces/detail/modals/map.settings.tpl.html',
          controller: 'EditMapSettingsCtrl',
          backdrop: 'static',
          size: 'md',
          resolve: {
            workspace: function() {
              return $scope.workspace;
            },
            map: function() {
              return map;
            }
          }
        });
      };

      $scope.showShortcuts = function() {
        var modalInstance = $modal.open({
          templateUrl: '/components/styleditor/tools/shortcuts.tpl.html',
          controller: 'ShortcutsCtrl',
          backdrop: 'false',
          size: 'md'
        });
      };

      $rootScope.$on(AppEvent.MapBackground, function(scope, color) {
        $scope.mapBackground = {'background': color};
      });

      $scope.fullscreenMode = function() {
        if ($rootScope.fullScreen) {
          $rootScope.fullScreen = false;
          $scope.fullscreenDirection = 'Maximize';
        }
        else {
          $rootScope.fullScreen = true;
          $scope.fullscreenDirection = 'Minimize';
        }
      };
    }]);
