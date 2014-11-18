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
    '$log', '$window', '$rootScope', '$modal', '$sce', '$timeout',
    function($scope, GeoServer, $state, AppEvent, $log, $window, $rootScope,
      $modal, $sce, $timeout) {

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

      $scope.go = function(route, workspace) {
        $state.go(route, {workspace: workspace});
      };

      $scope.createMap = function(workspace) {
        $timeout(function() {
          $rootScope.$broadcast(AppEvent.CreateNewMap);
        }, 250);
        // go to this state to initiate listener for broadcast above!
        $state.go('workspace.maps.main', {workspace: workspace});
      };

      $scope.importData = function(workspace) {
        $timeout(function() {
          $rootScope.$broadcast(AppEvent.ImportData);
        }, 250);
        // go to this state to initiate listener for broadcast above!
        $state.go('workspace.data.import', {workspace: workspace});
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

      // See utilities.js pop directive - 1 popover open at a time
      var openPopoverDownload;
      $scope.closePopovers = function(popo) {
        if (openPopoverDownload || openPopoverDownload===popo) {
          openPopoverDownload.showSourcePopover = false;
          openPopoverDownload = null;
        } else {
          popo.showSourcePopover = true;
          openPopoverDownload = popo;
        }
      };

      $scope.linkDownloads = function(layer) {
        if (layer.type === 'vector') {
          var vector_baseurl = GeoServer.baseUrl() + '/' + layer.workspace +
            '/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' +
            layer.workspace + ':' + layer.name + '&outputformat=';

          var shape = vector_baseurl + 'SHAPE-ZIP';
          var geojson = vector_baseurl + 'application/json';
          var kml = vector_baseurl + 'application/vnd.google-earth.kml%2Bxml';
          var gml3 = vector_baseurl + 'application/gml%2Bxml; version=3.2';

          layer.download_urls = '';
          layer.download_urls += '<a target="_blank" href="' + shape +
            '">Shapfile</a> <br/>';
          layer.download_urls += '<a target="_blank" href="' + geojson +
            '">GeoJSON</a> <br/>';
          layer.download_urls += '<a target="_blank" href="' + kml +
            '">KML</a> <br />';
          layer.download_urls += '<a target="_blank" href="' + gml3 +
            '">GML 3.2</a>';

        } else if (layer.type === 'raster') {
          var bbox = [layer.bbox.native.west, layer.bbox.native.south,
            layer.bbox.native.east, layer.bbox.native.north];
          bbox = bbox.join();

          var baseurl =  GeoServer.baseUrl() + '/' + layer.workspace +
            '/wms?service=WMS&amp;version=1.1.0&request=GetMap&layers=' +
            layer.workspace + ':' + layer.name + '&width=600&height=600&srs=' +
            layer.proj.srs + '&bbox=' + bbox + '&format=';

          var ol2 = baseurl + 'application/openlayers';
          var geotiff = baseurl + 'image/geotiff';
          var png = baseurl + 'image/png';
          var jpeg = baseurl + 'image/jpeg';
          var kml_raster = baseurl + 'application/vnd.google-earth.kml%2Bxml';

          layer.download_urls = '';
          layer.download_urls += '<a target="_blank" href="' + ol2 +
            '">OpenLayers</a> <br />';
          layer.download_urls += '<a target="_blank" href="' + geotiff +
            '">GeoTIFF</a> <br />';
          layer.download_urls += '<a target="_blank" href="' + png +
            '">PNG</a> <br />';
          layer.download_urls += '<a target="_blank" href="' + jpeg +
            '">JPEG</a> <br />';
          layer.download_urls += '<a target="_blank" href="' + kml_raster +
            '">KML</a> <br />';
        }
        layer.urls_ready = true;
        layer.download_urls = $sce.trustAsHtml(layer.download_urls);
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
            sortable: false,
            cellTemplate:
              '<div get-type ' +
                'geometry="{{row.entity.geometry}}">' +
              '</div>',
            width: '5%'
          },
          {field: 'srs',
            displayName: 'SRS',
            cellClass: 'text-center',
            sortable: false,
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
          {field: 'download',
            displayName: 'Download',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<a popover-placement="bottom" popover-append-to-body="true"' +
              'popover-html-unsafe="{{ row.entity.download_urls }}" pop-show=' +
              '"{{ row.entity.showSourcePopover && row.entity.urls_ready }}"' +
                'ng-click="closePopovers(row.entity);' +
                  'linkDownloads(row.entity)">' +
                '<div class="fa fa-download grid-icons" ' +
                  'alt="Download Layer" title="Download Layer"></div></a>',
            width: '7%'
          },
          {field: 'modified.timestamp',
            displayName: 'Modified',
            sortable: false,
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
