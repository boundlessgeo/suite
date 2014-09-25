angular.module('gsApp.layers', [
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
.directive('ngBlur', function () {
  return function (scope, elem, attrs) {
    elem.bind('blur', function () {
      scope.$apply(attrs.ngBlur);
    });
  };
})
.directive('getType', function() {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    scope: { type: '@type', geometry: '@geometry' },
    template:
      '<div ng-switch on="type">' +
        '<div ng-switch-when="vector">' +
          '<div ng-switch on="geometry">' +
            '<div ng-switch-when="Point">' +
              '<img ng-src="images/layer-point.png"' +
                'alt="Layer Type: Point" title="Layer Type: Point" /></div>' +
            '<div ng-switch-when="MultiPoint">' +
              '<img ng-src="images/layer-point.png"' +
                'alt="Layer Type: MultiPoint" title="Layer Type: MultiPoint"' +
                '/></div>' +
            '<div ng-switch-when="LineString">' +
              '<img  ng-src="images/layer-line.png"' +
                'alt="Layer Type: LineString" title="Layer Type: LineString"' +
                '/></div>' +
            '<div ng-switch-when="MultiLineString">' +
              '<img  ng-src="images/layer-line.png"' +
                'alt="Layer Type: MultiLineString"' +
                'title="Layer Type: MultiLineString" /></div>' +
            '<div ng-switch-when="Polygon">' +
              '<img  ng-src="images/layer-polygon.png"' +
                'alt="Layer Type: Polygon" title="Layer Type: Polygon" />' +
                '</div>' +
            '<div ng-switch-when="MultiPolygon">' +
              '<img  ng-src="images/layer-polygon.png"' +
                'alt="Layer Type: MultiPolygon"' +
                'title="Layer Type: MultiPolygon" /></div>' +
            '<div ng-switch-default class="grid">' +
              '<img ng-src="images/layer-vector.png"' +
                'alt="Layer Type: Vector" title="Layer Type: Vector" />' +
                '</div>' +
          '</div>' +
        '</div>' +
        '<div ng-switch-default class="grid">' +
          '<img ng-src="images/layer-raster.png" alt="Layer Type: Raster"' +
            'title="Layer Type: Raster" /></div>' +
      '</div>'
  };
})
.controller('LayersCtrl', ['$scope', 'GeoServer', '$state', '$log',
    function($scope, GeoServer, $state, $log) {
      $scope.title = 'All Layers';
      
      $scope.onStyleEdit = function(layer) {
        $state.go('layer.style', {
          workspace: layer.workspace,
          name: layer.name
        });
      };
      $scope.updateEntity = function(column, row, cellValue) {
        //console.log(row.entity);
        //console.log(column.field);
        row.entity[column.field] = cellValue;

        //TODO: add code for saving to the server here.
        //row.entity.$update();
      };
      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };
      $scope.gridSelections = [];
      $scope.gridOptions = {
        data: 'layerData',
        enableCellSelection: true,
        enableRowSelection: false,
        enableCellEdit: true,
        checkboxHeaderTemplate:
          '<input class="ngSelectionHeader" type="checkbox"' +
            'ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
        showSelectionCheckbox: true,
        selectWithCheckboxOnly: true,
        selectedItems: $scope.gridSelections,
        multiSelect: true,
        columnDefs: [
          {field: 'name', displayName: 'Layername', width: 250},
          {field: 'title',
            displayName: 'Title',
            enableCellEdit: true,
            cellTemplate:
              '<div class="grid-text-padding"' +
                'alt="{{row.entity.description}}"' +
                'title="{{row.entity.description}}"' +
                'ng-input="COL_FIELD"' +
                'ng-change="updateEntity(COL_FIELD, row.entity, cellValue)"' +
                'ng-model="cellValue">' +
                '{{row.entity.title}}' +
              '</div>',
            width: 250
          },
          {field: 'type',
            displayName: 'Type',
            cellClass: 'text-center',
            cellTemplate:
              '<div get-type ' +
                'type="{{row.entity.type}}"' +
                'geometry="{{row.entity.geometry}}">' +
              '</div>',
            width: 50},
          {field: 'srs',
            displayName: 'SRS',
            cellClass: 'text-center',
            cellTemplate:
              '<div class="grid-text-padding">' +
                '{{row.entity.proj.srs}}' +
              '</div>',
            width: 150
          },
          {field: 'settings',
            displayName: 'Settings',
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/settings.png"' +
                    'alt="Edit Layer Settings" title="Edit Layer Settings" />' +
                '</a>' +
              '</div>',
            width: 75
          },
          {field: 'style',
            displayName: 'Styles',
            cellClass: 'text-center',
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
            width: 75
          },
          {field: 'download',
            displayName: 'Download',
            cellClass: 'text-center',
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
            width: 75
          },
          {field: 'preview',
            displayName: 'Preview',
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/preview.png" alt="Preview Layer"' +
                    'title="Preview Layer" />' +
                '</a>' +
              '</div>',
            width: 75
          },
          {field: 'lastEdited',
            displayName: 'Last Edited',
            cellTemplate: '<div ng-class="col.colIndex()"></div>',
            width: 100
          },
          {field: '',
            displayName: '',
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onDeleteStyle(row.entity)">' +
                  '<img ng-src="images/delete.png" alt="Remove Layer"' +
                    'title="Remove Layer" />' +
                '</a>' +
              '</div>',
            width: 30
          },
          {field: '', displayName: '', width: 30}
        ],
        enablePaging: true,
        enableColumnResize: false,
        showFooter: true,
        pagingOptions: $scope.pagingOptions,
        filterOptions: {
          filterText: '',
          useExternalFilter: true
        }
      };

      $scope.workspace = {};
      $scope.workspaces = [];

      $scope.workspaceChanged = function(ws) {
        GeoServer.layers.get({workspace: ws.name}).$promise
          .then(function(layers) {
            $scope.layerData = layers;
          });
      };

      GeoServer.workspaces.get().$promise.then(function(workspaces) {
        workspaces.filter(function(ws) {
          return ws['default'];
        }).forEach(function(ws) {
          $scope.workspace.selected = ws;
          $scope.workspaceChanged(ws);
        });

        $scope.workspaces = workspaces;
      });
    }]);
