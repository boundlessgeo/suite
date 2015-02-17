/* 
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.workspaces.layers.settings', [])
.controller('EditLayerSettingsCtrl', ['workspace', 'layer', '$scope',
  '$rootScope', '$state', '$log', '$modalInstance', 'GeoServer', 'AppEvent',
  'layersListModel', '$sce',
    function(workspace, layer, $scope, $rootScope, $state, $log,
      $modalInstance, GeoServer, AppEvent, layersListModel, $sce) {

      $scope.workspace = workspace;
      $scope.layer = layer;

      $scope.form = {};
      $scope.form.mapSettings = {};
      var originalLayer = angular.copy($scope.layer);

      $scope.crsTooltip =
      '<h5>Add a projection in EPSG</h5>' +
      '<p>Coordinate Reference System (CRS) info is available at ' +
        '<a href="http://prj2epsg.org/search" target="_blank">' +
          'http://prj2epsg.org' +
        '</a>' +
      '</p>';

      $scope.getGeoServerLink = function() {
        var url = GeoServer.baseUrl() +'/web/?wicket:bookmarkablePage=:org.' +
          'geoserver.web.data.resource.ResourceConfigurationPage&name=' +
          layer.name + '&wsName=' + $scope.workspace;
        $scope.layer.link = url;
      };
      $scope.getGeoServerLink();

      $scope.saveChanges = function() {
        if ($scope.form.layerSettings.$dirty) {
          var patch = {};
          if (originalLayer.name !== $scope.layer.name) {
            patch.name = $scope.layer.name;
          }
          if (originalLayer.title !== $scope.layer.title) {
            patch.title = $scope.layer.title;
          }
          if (originalLayer.proj.srs !== $scope.layer.proj.srs) {
            patch.proj = $scope.layer.proj;
          }
          if (originalLayer.description !== $scope.layer.description) {
            patch.description = $scope.layer.description;
          }

          GeoServer.layer.update($scope.workspace, originalLayer.name, patch)
          .then(function(result) {
              if (result.success) {
                $scope.form.layerSettings.saved = true;
                $scope.form.layerSettings.$setPristine();
                $rootScope.$broadcast(AppEvent.MapUpdated, {
                  'original': originalLayer,
                  'new': $scope.layer
                });
                originalLayer = angular.copy($scope.layer);
              } else {
                $rootScope.alerts = [{
                  type: 'warning',
                  message: 'Layer update failed.',
                  fadeout: true
                }];
              }
            });
        }
      };

      $scope.removeLayer = function (layer) {
        GeoServer.layer.delete($scope.workspace, layer.name)
        .then(function(result) {
            if (result.success) {
              layersListModel.removeLayer(layer);
              $rootScope.$broadcast(AppEvent.LayersAllUpdated,
                layersListModel.getLayers());
              $rootScope.alerts = [{
                type: 'success',
                message: 'Layer ' + layer.name + ' successfully unpublished.',
                fadeout: true
              }];
              $modalInstance.dismiss('close');
            } else {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Layer could not be deleted.',
                fadeout: true
              }];
            }
          });
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }]);
