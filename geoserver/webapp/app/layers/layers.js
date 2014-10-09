angular.module('gsApp.layers', [
  'gsApp.workspaces.workspace.data',
  'ngGrid',
  'ui.select',
  'gsApp.layers.style'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('layers', {
          url: '/layers',
          templateUrl: '/layers/layers.tpl.html',
          controller: 'LayersCtrl'
        })
        .state('layer', {
          abstract: true,
          url: '/layers/:workspace/:name',
          templateUrl: '/layers/detail/layer.tpl.html'
        });
    }])
.directive('getType', function() {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: { geometry: '@geometry' },
    template:
      '<div ng-switch on="geometry">' +
        '<div ng-switch-when="Point">' +
          '<img ng-src="images/layer-point.png"' +
            'alt="Layer Type: Point"' +
            'title="Layer Type: Point" /></div>' +
        '<div ng-switch-when="MultiPoint">' +
          '<img ng-src="images/layer-point.png"' +
            'alt="Layer Type: MultiPoint"' +
            'title="Layer Type: MultiPoint"/></div>' +
        '<div ng-switch-when="LineString">' +
          '<img  ng-src="images/layer-line.png"' +
            'alt="Layer Type: LineString"' +
            'title="Layer Type: LineString"/></div>' +
        '<div ng-switch-when="MultiLineString">' +
          '<img  ng-src="images/layer-line.png"' +
            'alt="Layer Type: MultiLineString"' +
            'title="Layer Type: MultiLineString" /></div>' +
        '<div ng-switch-when="Polygon">' +
          '<img  ng-src="images/layer-polygon.png"' +
            'alt="Layer Type: Polygon"' +
            'title="Layer Type: Polygon" /></div>' +
        '<div ng-switch-when="MultiPolygon">' +
          '<img  ng-src="images/layer-polygon.png"' +
            'alt="Layer Type: MultiPolygon"' +
            'title="Layer Type: MultiPolygon" /></div>' +
        '<div ng-switch-default class="grid">' +
          '<img ng-src="images/layer-raster.png" alt="Layer Type: Raster"' +
            'title="Layer Type: Raster" /></div>' +
      '</div>'
  };
})
.controller('LayersCtrl', ['$scope', 'GeoServer', '$state',
    '$log', '$modal', '$window',
    function($scope, GeoServer, $state, $log, $modal, $window) {
      $scope.title = 'All Layers';
      $scope.thumbnail = '';

      //TODO: Grab the thumbnail if it exists.
      //$scope.thumbnail = GeoServer.map.thumbnail.get(workspace, map,
        //layer.name, 250, 250);

      $scope.onStyleEdit = function(layer) {
        $state.go('layer.style', {
          workspace: layer.workspace,
          name: layer.name
        });
      };
      $scope.$on('ngGridEventEndCellEdit', function(evt){
        var target = evt.targetScope;
        var field = target.col.field;
        var layer = target.row.entity;
        var ws;

        var patch = {};
        patch[field] = layer[field];

        //TODO: report error
        GeoServer.layer
          .update({ workspace: layer.workspace, name: layer.name}, patch);
      });

      $scope.workspace = {};
      $scope.workspaces = [];
      $scope.map = {};
      $scope.maps = [];

      $scope.addLayer = function(ws) {
        var modalInstance = $modal.open({
          templateUrl: '/layers/addnewlayer-modal.tpl.html',
          controller: ['$scope', '$window', '$modalInstance',
            function($scope, $window, $modalInstance) {
              $scope.datastores = GeoServer.datastores.get('ws');
              $scope.ws = ws;

              // Get all of the data stores
              GeoServer.datastores.get(ws).then(
                function(result) {
                  if (result.success) {
                    $scope.datastores = result.data;
                  } else {
                    $scope.alerts = [{
                      type: 'warning',
                      message: 'Workspace could not be loaded.',
                      fadeout: true
                    }];
                  }
                });

              $scope.ok = function() {
                $window.alert('TODO: add the new layer.');
                //GeoServer.layers.put({workspace: $scope.ws},
                  //$scope.form.layer);
                $modalInstance.dismiss('cancel');
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };
            }],
          size: 'lg'
        });
      };

      $scope.addSelectedLayerToMap = function(ws, map, gridSelections) {
        $window.alert('TODO: Add the selected layers: ' + gridSelections +
          ' to the workspace: ' + ws + ' and map: ' + map);

        GeoServer.map.layers.put(ws, map, gridSelections);
        $scope.map.saved = true;
      };

      $scope.deleteLayer = function(layer) {
        var modalInstance = $modal.open({
          templateUrl: '/layers/deletelayer-modal.tpl.html',
          controller: ['$scope', '$window', '$modalInstance',
            function($scope, $window, $modalInstance) {
              $scope.layer = layer.name;

              $scope.ok = function() {
                $window.alert('TODO: remove the layer "' + layer.name + '".');
                //GeoServer.layer.remove(layer.name);
                $modalInstance.dismiss('cancel');
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };
            }],
          size: 'med'
        });
      };

      $scope.addDataSource = function() {
        var modalInstance = $modal.open({
          templateUrl: '/workspaces/detail/modals/addnew-modal.tpl.html',
          controller: 'AddNewModalCtrl',
          size: 'lg',
          resolve: {
            workspace: function() {
              return $scope.workspace;
            },
            geoserver: function() {
              return GeoServer;
            }
          }
        });
      };

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25,
        currentPage: 1
      };
      $scope.filterOptions = {
          filterText: '',
          useExternalFilter: true
        };
      $scope.gridSelections = [];
      $scope.gridOptions = {
        data: 'layerData',
        enableCellSelection: false,
        enableRowSelection: true,
        enableCellEdit: false,
        checkboxHeaderTemplate:
          '<input class="ngSelectionHeader" type="checkbox"' +
            'ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
        int: function() {
          $log('done');
        },
        sortInfo: {fields: ['name'], directions: ['asc']},
        showSelectionCheckbox: true,
        selectWithCheckboxOnly: false,
        selectedItems: $scope.gridSelections,
        multiSelect: true,
        columnDefs: [
          {field: '',
            displayName: '',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="deleteLayer(row.entity)">' +
                  '<img ng-src="images/delete.png" alt="Remove Layer"' +
                    'title="Remove Layer" />' +
                '</a>' +
              '</div>',
            width: '2%'
          },
          {field: 'name', displayName: 'Layer', width: '20%'},
          {field: 'title',
            displayName: 'Title',
            enableCellEdit: true,
            cellTemplate:
              '<div class="grid-text-padding"' +
                'alt="{{row.entity.description}}"' +
                'title="{{row.entity.description}}">' +
                '{{row.entity.title}}' +
              '</div>',
            width: '20%'
          },
          {field: 'geometry',
            displayName: 'Type',
            cellClass: 'text-center',
            cellTemplate:
              '<div get-type ' +
                'geometry="{{row.entity.geometry}}">' +
              '</div>',
            width: '5%'
          },
          {field: 'srs',
            displayName: 'SRS',
            cellClass: 'text-center',
            cellTemplate:
              '<div class="grid-text-padding">' +
                '{{row.entity.proj.srs}}' +
              '</div>',
            width: '7%'
          },
          {field: 'settings',
            displayName: 'Settings',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/settings.png"' +
                    'alt="Edit Layer Settings" title="Edit Layer Settings" />' +
                '</a>' +
              '</div>',
            width: '10%'
          },
          {field: 'style',
            displayName: 'Styles',
            cellClass: 'text-center',
            sortable: false,
            /*
            cellTemplate:
              '<li class="list-unstyled dropdown">' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
                  '<div class="grid-text">Edit</div>' +
                  '<img ng-src="images/edit.png" alt="Edit Style"' +
                    'title="Edit Style" />' +
                '</a>' +
                '<ul id="style-dropdown" class="dropdown-menu">' +
                  '<li><a ng-click="onStyleEdit(row.entity)">Style 1</a></li>' +
                  '<li><a ng-click="onStyleEdit(row.entity)">Style 2</a></li>' +
                  '<li>' +
                    '<a class="add-new-style" ng-click="#">' +
                      'Add New Style' +
                    '</a>' +
                  '</li>' +
                '</ul>' +
              '</li>',
            */
            cellTemplate:
              '<div class="grid-text-padding" ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">Edit</a>' +
              '</div>',
            width: '7%'
          },
          {field: 'download',
            displayName: 'Download',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<li class="list-unstyled dropdown">' +
                '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
                  '<img ng-src="images/download.png" alt="Download Layer"' +
                    'title="Download Layer" />' +
                '</a>' +
                '<ul id="download-dropdown" class="dropdown-menu">' +
                  '<li><a href="#">Shapefile</a></li>' +
                  '<li><a href="#">GeoJSON</a></li>' +
                  '<li><a href="#">KML</a></li>' +
                '</ul>' +
              '</li>',
            width: '7%'
          },
          {field: 'modified',
            displayName: 'Last Edited',
            cellTemplate:
              '<div class="grid-text-padding">' +
                '{{row.entity.modified}}' +
              '</div>',
            width: '*'
          }
        ],
        enablePaging: true,
        enableColumnResize: false,
        showFooter: true,
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions
      };

      $scope.refreshLayers = function(ws) {
        GeoServer.layers.get({
          workspace: ws.name,
          page: $scope.pagingOptions.currentPage-1,
          pagesize: $scope.pagingOptions.pageSize
        }).$promise.then(function(result) {
          $scope.layerData = result.layers;
          $scope.totalServerItems = result.total;
        });
      };

      $scope.refreshMaps = function(ws) {
        GeoServer.maps.get(ws).then(
        function(result) {
          if (result.success) {
            var maps = result.data;
            $scope.maps = maps;
          } else {
            $scope.alerts = [{
              type: 'warning',
              message: 'Failed to get map list.',
              fadeout: true
            }];
          }
        });
      };

      $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal != null) {
          var ws = $scope.workspace.selected;
          if (ws != null) {
            $scope.refreshLayers(ws);
          }
        }
      }, true);

      $scope.$watch('workspace.selected', function(newVal) {
        if (newVal != null) {
          $scope.refreshLayers(newVal);
          $scope.refreshMaps(newVal.name);
        }
      });

      $scope.$watch('maps.selected', function(){
        $scope.map.saved = false;
      });

      GeoServer.workspaces.get().then(
        function(result) {
          if (result.success) {
            var workspaces = result.data;
            workspaces.filter(function(ws) {
              return ws.default == true;
            }).forEach(function(ws) {
              $scope.workspace.selected = ws;
            });
            $scope.workspaces = workspaces;
          } else {
            // TODO move alerts to top of header nav
            $scope.alerts = [{
              type: 'warning',
              message: 'Failed to get workspace list.',
              fadeout: true
            }];
          }
        });
    }]);
