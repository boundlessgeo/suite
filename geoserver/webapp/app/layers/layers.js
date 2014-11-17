angular.module('gsApp.layers', [
  'ngGrid',
  'ui.select',
  'ngSanitize',
  'gsApp.alertpanel',
  'gsApp.core.utilities',
  'gsApp.workspaces.data',
  'gsApp.layers.style',
  'gsApp.errorPanel',
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
.controller('LayersCtrl', ['$scope', 'GeoServer', '$state', 'AppEvent',
    '$log','$window', '$rootScope', '$modal',
    function($scope, GeoServer, $state, $log, $window, $rootScope,
      AppEvent, $modal) {
      $scope.title = 'All Layers';
      $scope.thumbnail = '';
      $scope.dropdownBoxSelected = '';

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
        var patch = {};
        patch[field] = layer[field];

        GeoServer.layer.update(layer.workspace, layer.name,
          { title: patch[field] });
      });

      $scope.workspace = {};
      $scope.workspaces = [];

      $scope.addLayer = function(ws) {
        var modalInstance = $modal.open({
          templateUrl: '/layers/addnewlayer-modal.tpl.html',
          backdrop: 'static',
          controller: 'AllLayersNewLayerCtrl',
          size: 'lg',
          resolve: {
            ws: function() {
              return ws;
            }
          }
        });
      };

      $scope.addSelectedLayerToMap = function(ws, map, layerSelections) {
        var layers = [];
        for (var i=0; i< layerSelections.length; i++) {
          layers.push({
            'name': layerSelections[i].name,
            'workspace': ws
          });
        }

        GeoServer.layer.update(ws, map, layers)
          .then(function(result) {
            if (result.success) {
              $rootScope.alerts = [{
                type: 'success',
                message: 'Map ' + result.data.name + ' updated  with ' +
                  result.data.layers.length + ' layer(s).',
                fadeout: true
              }];
              $scope.maps.push(result.data);
            } else {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Could not add layers to map.',
                fadeout: true
              }];
            }
            //$window.location.reload();
          });
      };

      $scope.deleteLayer = function(layer) {
        var modalInstance = $modal.open({
          templateUrl: '/layers/deletelayer-modal.tpl.html',
          controller: ['$scope', '$window', '$modalInstance',
            function($scope, $window, $modalInstance) {
              $scope.layer = layer.name;

              $scope.ok = function() {
                //$window.alert('TODO: remove the layer "' + layer.name + '"' +
                  //'from the workspace: ' + layer.workspace + '.');
                GeoServer.layer.delete(layer.workspace, layer.name);
                $modalInstance.dismiss('cancel');
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };
            }],
          backdrop: 'static',
          size: 'med'
        });
      };

      $scope.editLayerSettings = function(layer) {
        var modalInstance = $modal.open({
          templateUrl: '/workspaces/detail/modals/layer.settings.tpl.html',
          controller: 'EditLayerSettingsCtrl',
          backdrop: 'static',
          size: 'md',
          resolve: {
            workspace: function() {
              return $scope.workspace;
            },
            layer: function() {
              return layer;
            }
          }
        });
      };

      $scope.addDataSource = function() {
        $state.go('workspaces.data.import', { workspace: $scope.workspace });
      };

      $scope.pagingOptions = {
        pageSizes: [15, 50, 100],
        pageSize: 15,
        currentPage: 1
      };
      $scope.filterOptions = {
        filterText: ''
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
        selectWithCheckboxOnly: true,
        selectedItems: $scope.gridSelections,
        multiSelect: true,
        columnDefs: [
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
                '<a ng-click="editLayerSettings(row.entity)">' +
                  '<i class="fa fa-gear grid-icons" ' +
                    'alt="Edit Layer Settings" ' +
                    'title="Edit Layer Settings"></i>' +
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
          /*{field: 'download',
            displayName: 'Download',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<a popover-placement="bottom" popover-html-unsafe="' +
                '<a href=\'#\'>Shapefile</a><br />' +
                '<a href=\'#\'>GeoJSON</a><br />' +
                '<a href=\'#\'>KML</a>"' +
                'popover-append-to-body="true">' +
                '<div class="fa fa-download grid-icons" ' +
                  'alt="Download Layer" title="Download Layer"></div>' +
              '</a>',
            width: '7%'
          },*/
          {field: 'modified.timestamp',
            displayName: 'Modified',
            cellTemplate:
              '<div class="grid-text-padding">' +
                '{{row.entity.modified.timestamp.substring(0, ' +
                'row.entity.modified.timestamp.lastIndexOf("-"))' +
                '.replace("T", " ")}}' +
              '</div>',
            width: '12%'},
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
            width: '*'
          }
        ],
        enablePaging: true,
        enableColumnResize: false,
        showFooter: true,
        footerTemplate: '/components/grid/footer.tpl.html',
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
      };

      $scope.$watch('gridOptions.ngGrid.config.sortInfo', function() {
        $scope.refreshLayers();
      }, true);

      $scope.refreshLayers = function() {
        $scope.sort = '';
        $scope.ws = $scope.workspace.selected;
        if ($scope.gridOptions.sortInfo.directions == 'asc') {
          $scope.sort = $scope.gridOptions.sortInfo.fields+':asc';
        }
        else {
          $scope.sort = $scope.gridOptions.sortInfo.fields+':desc';
        }

        if ($scope.ws) {
          GeoServer.layers.get(
            $scope.ws.name,
            $scope.pagingOptions.currentPage-1,
            $scope.pagingOptions.pageSize,
            $scope.sort,
            $scope.filterOptions.filterText
          ).then(function(result) {
            if (result.success) {
              $scope.layerData = result.data.layers;
              $scope.totalServerItems = result.data.total;
              $scope.itemsPerPage = $scope.pagingOptions.pageSize;

              if ($scope.filterOptions.filterText.length > 0) {
                $scope.totalItems =
                  $scope.gridOptions.ngGrid.filteredRows.length;
              }
              else {
                $scope.totalItems = $scope.totalServerItems;
              }
            } else {
              $rootScope.alerts = [{
                type: 'warning',
                message: 'Layers for workspace ' + $scope.ws.name +
                  ' could not be loaded.',
                fadeout: true
              }];
            }
          });
        }
      };

      $scope.refreshMaps = function(ws) {
        GeoServer.maps.get(ws).then(
        function(result) {
          if (result.success) {
            var maps = result.data.maps;
            $scope.maps = maps;
          } else {
            $rootScope.alerts = [{
              type: 'warning',
              message: 'Failed to get map list.',
              fadeout: true
            }];
          }
        });
      };

      $scope.updatePaging = function () {
        $scope.refreshLayers();
      };

      $scope.setPage = function (page) {
        $scope.pagingOptions.currentPage = page;
      };

      $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal != null) {
          if ($scope.workspace.selected) {
            $scope.refreshLayers();

            /*throw {
              message: 'Big time error.',
              cause: 'Network error: no packets sent.',
              trace: [
                {name: 'Error 1', error: 'HTTP request could not be sent.'},
                {name: 'Error 2', error: 'HTTP request could not be...'},
                {name: 'Error 3', error: 'This is critical error #3.'},
                {name: 'Error 4', error: 'Error #4.'},
                {name: 'Error 5', error: 'You know...error #5.'}
              ]
            };*/
          }
        }
      }, true);

      $scope.$watch('workspace.selected', function(newVal) {
        if (newVal != null) {
          $scope.refreshLayers();
          $scope.refreshMaps(newVal.name);
          $scope.$broadcast(AppEvent.WorkspaceSelected, newVal.name);
        }
      });

      $scope.mapChanged = function(map) {
        $scope.mapTitle = map;
        $scope.map.saved = false;
      };

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
            $scope.alerts = [{
              type: 'warning',
              message: 'Failed to get workspace list.',
              fadeout: true
            }];
          }
        });
    }])
.controller('AllLayersNewLayerCtrl', ['$scope', 'GeoServer', '$modalInstance',
  '$window', 'ws', '$rootScope',
    function($scope, GeoServer, $modalInstance, $window, ws, $rootScope) {

      $scope.datastores = GeoServer.datastores.get('ws');
      $scope.types = [
        {name: 'line'},
        {name: 'multi-line'},
        {name: 'multi-point'},
        {name: 'multi-polygon'},
        {name: 'point'},
        {name: 'polygon'},
        {name: 'raster'}
      ];
      $scope.extents = [{name: 'Autocalc'}, {name: 'Custom'}];
      $scope.crsTooltip =
      '<h5>Add a projection in EPSG</h5>' +
      '<p>Coordinate Reference System (CRS) info is available at ' +
        '<a href="http://prj2epsg.org/search" target="_blank">' +
          'http://prj2epsg.org' +
        '</a>' +
      '</p>';
      $scope.ws = ws;
      $scope.mapInfo = {
        'abstract': ''
      };
      $scope.layerInfo = {
        'abstract': ''
      };

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

      $scope.createLayer = function(layer, data, proj, types,
        extents) {
        $scope.layerInfo.layers = [];
        $scope.layerInfo.layers.push({
          'name': layer.name,
          'workspace': $scope.ws,
          'datastore': data,
          'title': layer.title,
          'crs': proj,
          'type': types,
          'extentType': extents,
          'extent': layer.extent
        });
        GeoServer.layer.create($scope.ws, $scope.layerInfo).then(
          function(result) {
            if (result.success) {
              $rootScope.alerts = [{
                type: 'success',
                message: 'Layer ' + result.data.name + ' created.',
                fadeout: true
              }];
              $scope.layers.push(result.data);
            } else {
              $modalInstance.dismiss('cancel');
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Could not create layer.',
                fadeout: true
              }];
            }
            $modalInstance.dismiss('cancel');
            //$window.location.reload();
          });
      }; // end createLayer

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.checkName = function(layerName) {
        $scope.layerNameCheck = GeoServer.layer.get($scope.ws,
          layerName);

        //Check to see if the incoming layerName already exists for this
        //  workspace. If it does, show the error, if not, keep going.
        GeoServer.layer.get($scope.ws, layerName).then(
          function(result) {
            if (result.success) {
              $scope.layerNameCheck = result.data;
            } else {
              $scope.alerts = [{
                type: 'warning',
                message: 'Layers could not be loaded.',
                fadeout: true
              }];
            }

            if ($scope.layerNameCheck.name) {
              $scope.layerNameError = true;
            }
            else {
              $scope.layerNameError = false;
            }
          });
      };

      //TODO: Grab the thumbnail if it exists.
      //      Is this even required here as the user is creating the
      //      layer for the first time and thus there won't be a
      //      thumbnail of this layer yet?
      /*if ($scope.layerForm.Layer.name) {
        $scope.thumbnail = GeoServer.map.thumbnail.get($scope.ws,
          $scope.layer.name, 400, 200);

        GeoServer.map.thumbnail.get($scope.ws,
          $scope.layerForm.Layer.name, 400, 200).then(function(result) {
            if (result.success) {
              $scope.thumbnail = result;
            } else {
              $scope.alerts = [{
                type: 'warning',
                message: 'Thumbnail could not be loaded.',
                fadeout: true
              }];
            }

            if ($scope.thumbnail) {
              $scope.thumbnail = result;
            }
            else {
              $scope.thumbnail = '';
            }
          });
      }*/
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
});
