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
.directive('initialize', ['$window', '$timeout', function($window, $timeout) {
  return {
    restrict: 'ACME',
    replace: true,
    link: function(scope, element, attrs) {
      scope.setSizes = function(tries) {
        if (isNaN(+tries)) {
          tries = attrs.maxTries || 10;
        }

        if (tries > 0) {
          $timeout(function() {
            //Turn off the outer scroll bars, we don't want a dual scrollbar
            //with the editor for large styles.
            angular.element('body').css({overflow: 'hidden'});

            //Set heights
            var offset = 12;
            var navbarHeight = angular.element('#navbar').height();
            var screenHeight = $window.innerHeight - navbarHeight * 2 + offset;
            var editingPanelHeight = angular.element('#editingPanel').height();
            var styleToolbarHeight = angular.element('#styleToolbar').height();
            var newHeight = editingPanelHeight - styleToolbarHeight;

            //Set Widths
            var screenWidth = $window.innerWidth;
            var sideWidth = angular.element('#sidebar-wrapper').width();
            var resizerWidth = angular.element('#resizer').width();
            var editingWidth = angular.element('#editingPanel').width();
            var mapWidth = screenWidth - editingWidth - resizerWidth -sideWidth;
            var editingLeft = sideWidth + mapWidth + resizerWidth;
            var resizerLeft = sideWidth + mapWidth;

            if (sideWidth) {
              angular.element('#mapPanel').css({width: mapWidth + 'px'});
              angular.element('#editingPanel').css({left: editingLeft + 'px'});
              angular.element('#resizer').css({left: resizerLeft + 'px'});

              angular.element('#mapPanel').css({height: screenHeight + 'px'});
              angular.element('#editingPanel').css({height: screenHeight+'px'});
              angular.element('#resizer').css({height: screenHeight + 'px'});
              angular.element('#editor').css({height: newHeight + 'px'});
            } else {
              //The element is not ready, so decrement the tries,
              //wait a bit, and try again:
              scope.setSizes();
            }
          }, attrs.msDelay || 100);
        } else {
          // Do we want to log or warn or throw an error here?
        }
      };

      scope.setSizes();
      $window.addEventListener('orientationchange', scope.setSizes());
      angular.element($window).bind('resize', function() {
        scope.setSizes();
      });
    }
  };
}])
.directive('resizer', function($document, $window) {
    return function($scope, $element, $attrs) {
        $element.on('mousedown', function(event) {
          event.preventDefault();
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          var xPos = event.pageX;
          var offset = 2;
          var screenWidth = $window.innerWidth;
          var resizerWidth = angular.element('#resizer').width();
          var sideWidth = angular.element('#sidebar-wrapper').width();

          if ($attrs.leftMin && xPos < $attrs.leftMin) {
            xPos = parseInt($attrs.leftMin);
          }

          if ($attrs.rightMin && xPos > (screenWidth - $attrs.rightMin)) {
            xPos = parseInt(screenWidth - $attrs.rightMin);
          }

          var mapWidth = xPos - sideWidth;

          angular.element('#resizer').css({left: xPos + 'px'});
          angular.element('#mapPanel').css({width: mapWidth + 'px'});
          angular.element('#editingPanel').css({
            left: (xPos + resizerWidth) + 'px',
            width: (screenWidth - xPos - offset)
          });
        }
        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }
      };
  })
.controller('MapComposeCtrl',
    ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$compile',
    '$log', 'AppEvent', 'GeoServer', '$modal', '_', '$window', '$document',
    function($scope, $rootScope, $state, $stateParams, $timeout, $compile,
      $log, AppEvent, GeoServer, $modal, _, $window, $document) {

      var wsName = $stateParams.workspace;
      $scope.workspace = wsName;
      var name = $stateParams.name;
      var hiddenLayers = $stateParams.hiddenLayers;
      if (hiddenLayers && typeof hiddenLayers === 'string') {
        hiddenLayers = hiddenLayers.split(',');
      }
      $rootScope.$broadcast(AppEvent.ToggleSidenav);

      $rootScope.$on('$stateChangeStart', function(event){
        if (!$rootScope.editor.isClean($rootScope.generation)){
          event.preventDefault();
          $scope.editorSave('workspace');
        }
      });

      $rootScope.$on('$stateChangeSuccess', function(event){
        //Sometimes the modal backdrop doesn't go away.
        angular.element($document[0].querySelectorAll('.modal-backdrop'))
          .css('display', 'none');

        angular.element('body').css({overflow: 'auto'});
      });

      $scope.editorSave = function(nextWindowType) {
        //Sometimes the modal backdrop doesn't appear.
        angular.element($document[0].querySelectorAll('.modal-backdrop'))
          .css('display', 'block');

        var modalInstance = $modal.open({
          templateUrl: '/maps/detail/editorsave-modal.tpl.html',
          scope: $scope,
          controller: ['$scope', '$window', '$modalInstance', '$state',
            '$document',
            function($scope, $window, $modalInstance, $state, $document) {
              //Check to see if the editor contains any syntax errors, if it
              //does then we won't show the save button on the modal dialog.
              $scope.linterIsvalid = $rootScope.editor.getStateAfter().pair;

              $scope.cancel = function() {
                //Sometimes the modal backdrop doesn't go away.
                angular.element($document[0].querySelectorAll(
                  '.modal-backdrop')).css('display', 'none');
                $modalInstance.dismiss('hide');
              };

              $scope.saveChanges = function() {
                $scope.saveStyle();
                $scope.goToNextWindow();
              };

              $scope.discardChanges = function() {
                $rootScope.alerts = [{
                  type: 'success',
                  message: 'Editor changes have been discarded.',
                  fadeout: true
                }];
                $scope.undoChanges();
                $scope.goToNextWindow();
              };

              $scope.undoChanges = function() {
                //Undo all of the changes made to the editor.
                for (var i = $rootScope.generation; i >= 0; i--) {
                  $rootScope.editor.undo();
                }

                //If you don't explicitly set the value of the editor to the
                //current value, the content reverts back to the last typed
                //entry rather than discarding all of the changes.
                $rootScope.editor.setValue($rootScope.editor.getValue());
              };

              $scope.goToNextWindow = function() {
                if($rootScope.popoverElement) {
                  $rootScope.popoverElement.remove();
                }
                $rootScope.generation = $rootScope.editor.changeGeneration();

                if (nextWindowType == 'layer') {
                  $scope.selectLayer($scope.gotoLayer);
                }
                else
                {
                  $scope.viewWorkspace($rootScope.workspace);
                }

                //Sometimes the modal backdrop doesn't go away.
                angular.element($document[0].querySelectorAll(
                  '.modal-backdrop')).css('display', 'none');
                $scope.gotoLayer = null;
                $rootScope.worksapce = null;
                $rootScope.linterError = false;
                $modalInstance.dismiss('hide');
              };
            }],
          backdrop: 'static',
          size: 'med'
        });
      };

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
        $scope.gotoLayer = layer;

        if (!$rootScope.editor.isClean($rootScope.generation)) {
          $scope.editorSave('layer');
        }
        else {
          if (activeLayer != null) {
            if (!(activeLayer.name in layerState)) {
              layerState[activeLayer.name] = {};
            }
            layerState[activeLayer.name].style = $scope.style;
          }
          $scope.activeLayer = layer;
        }
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
              $rootScope.generation = $rootScope.editor.changeGeneration();
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
            $rootScope.editor.clearHistory();

            if($rootScope.popoverElement) {
              $rootScope.popoverElement.remove();
            }

            $rootScope.editor.clearGutter('markers');
          }, 250);
        }
      });

      $scope.viewWorkspace = function(workspace) {
        $rootScope.workspace = workspace;
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

      $scope.$on(AppEvent.SidenavResized, function(scope) {
        $scope.setSizes();
      });

      $rootScope.$on(AppEvent.MapBackground, function(scope, color) {
        $scope.mapBackground = {'background': color};
      });

    }]);
