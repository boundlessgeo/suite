angular.module('gsApp.maps', [
  'ngGrid',
  'ui.select',
  'gsApp.maps.compose'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('maps', {
          url: '/maps',
          templateUrl: '/maps/maps.tpl.html',
          controller: 'MapsCtrl'
        })
        .state('map', {
          abstract: true,
          url: '/maps/:workspace/:name',
          templateUrl: '/maps/detail/map.tpl.html'
        });
    }])
.directive('ngBlur', function () {
  return function (scope, elem, attrs) {
    elem.bind('blur', function () {
      scope.$apply(attrs.ngBlur);
    });
  };
})
.controller('MapsCtrl', ['$scope', 'GeoServer', '$state', '$log',
    function($scope, GeoServer, $state, $log) {
      $scope.title = 'All Maps';

      $scope.workspaceChanged = function(ws) {
        GeoServer.maps.get({workspace: ws.name}).$promise
          .then(function(maps) {
            $scope.mapData = maps;
          });
      };
      $scope.onCompose = function(map) {
        $state.go('map.compose', {
          workspace: map.workspace,
          name: map.name
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
      $scope.gridOptions = {
        data: 'mapData',
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
          {field: 'name', displayName: 'Map Name', width: 250},
          {field: 'title',
            displayName: 'Title',
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
          {field: 'compose',
            displayName: 'Compose',
            cellClass: 'text-center',
            cellTemplate:
              '<div class="grid-text-padding" ng-class="col.colIndex()">' +
                '<a ng-click="onCompose(row.entity)">Compose</a>' +
              '</div>',
            width: 75
          },
          {field: 'preview',
            displayName: 'Preview',
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/preview.png" alt="Preview Map"' +
                    'title="Preview Map" />' +
                '</a>' +
              '</div>',
            width: 75
          },
          {field: 'settings',
            displayName: 'Settings',
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/settings.png"' +
                    'alt="Edit Map Settings" title="Edit Map Settings" />' +
                '</a>' +
              '</div>',
            width: 75
          },
          {field: '', displayName: '', width:725}
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
