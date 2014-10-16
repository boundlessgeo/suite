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
.controller('MapsCtrl', ['$scope', 'GeoServer', '$state', '$log', '$rootScope',
    '$modal', '$window',
    function($scope, GeoServer, $state, $log, $rootScope, $modal, $window) {
      $scope.title = 'All Maps';

      $scope.workspaceChanged = function(ws) {
        GeoServer.maps.get(ws.name).then(
          function(result) {
            if (result.success) {
              $scope.mapData = result.data;
            } else {
              $rootScope.alerts = [{
                type: 'warning',
                message: 'Could not retrieve maps.',
                fadeout: true
              }];
            }
          });
      };

      $scope.addMap = function(ws) {
        var modalInstance = $modal.open({
          templateUrl: '/maps/addnewmap-modal.tpl.html',
          backdrop: 'static',
          controller: ['$scope', '$window', '$modalInstance',
            function($scope, $window, $modalInstance) {
              $scope.projections = [{name: 'EPSG: 4326'}, {name: 'EPSG: 9999'}];
              $scope.extents = [{name: 'Autocalc'}, {name: 'Custom'}];
              $scope.ws = ws;

              $scope.ok = function(mapName) {
                $window.alert('TODO: add the new map: ' + mapName +
                  ' to the workspace: ' + $scope.ws + '.');
                GeoServer.maps.post(
                  {workspace: $scope.ws},
                  mapName
                );
                $modalInstance.dismiss('cancel');
                //TODO: go to layers page to add layers to the new map.
                //$state.go('/layers/layers.tpl.html');
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };

              $scope.clearError = function() {
                $scope.mapNameError = false;
              };

              $scope.checkName = function(mapName) {
                $scope.mapNameCheck = GeoServer.map.get($scope.ws, mapName);

                // Get all of the data stores
                GeoServer.map.get($scope.ws, mapName).then(
                  function(result) {
                    if (result.success) {
                      $scope.mapNameCheck = result.data;
                    } else {
                      $scope.alerts = [{
                        type: 'warning',
                        message: 'Maps could not be loaded.',
                        fadeout: true
                      }];
                    }
                    if ($scope.mapNameCheck.name) {$scope.mapNameError = true;}
                    else {$scope.mapNameError = false;}
                  });
              };
            }],
          size: 'lg'
        });
      };

      $scope.onCompose = function(map) {
        $state.go('map.compose', {
          workspace: map.workspace,
          name: map.name
        });
      };

      $scope.$on('ngGridEventEndCellEdit', function(evt){
        var target = evt.targetScope;
        var field = target.col.field;
        var map = target.row.entity;

        var patch = {};
        patch[field] = map[field];

        //TODO: report error
        GeoServer.map
          .update({ workspace: map.workspace, name: map.name}, patch);
      });

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };
      $scope.gridSelections = [];
      $scope.gridOptions = {
        data: 'mapData',
        enableCellSelection: false,
        enableRowSelection: true,
        enableCellEdit: false,
        checkboxHeaderTemplate:
          '<input class="ngSelectionHeader" type="checkbox"' +
            'ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
        sortInfo: {fields: ['name'], directions: ['asc']},
        showSelectionCheckbox: true,
        selectWithCheckboxOnly: false,
        selectedItems: $scope.gridSelections,
        multiSelect: true,
        columnDefs: [
          {field: 'name', displayName: 'Map Name', width: '20%'},
          {field: 'title',
            displayName: 'Title',
            enableCellEdit: true,
            cellTemplate:
              '<div class="grid-text-padding"' +
                'alt="{{row.entity.description}}"' +
                'title="{{row.entity.description}}">'+
                '{{row.entity.title}}' +
              '</div>',
            width: '25%'
          },
          {field: 'compose',
            displayName: 'Compose',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<div class="grid-text-padding" ng-class="col.colIndex()">' +
                '<a ng-click="onCompose(row.entity)">Compose</a>' +
              '</div>',
            width: '10%'
          },
          {field: 'preview',
            displayName: 'Preview',
            cellClass: 'text-center',
            sortable: false,
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/preview.png" alt="Preview Map"' +
                    'title="Preview Map" />' +
                '</a>' +
              '</div>',
            width: '10%'
          },
          {field: 'settings',
            displayName: 'Settings',
            sortable: false,
            cellClass: 'text-center',
            cellTemplate:
              '<div ng-class="col.colIndex()">' +
                '<a ng-click="onStyleEdit(row.entity)">' +
                  '<img ng-src="images/settings.png"' +
                    'alt="Edit Map Settings" title="Edit Map Settings" />' +
                '</a>' +
              '</div>',
            width: '10%'
          },
          {field: '', displayName: '', width: '*'},
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

      GeoServer.workspaces.get().then(
        function(result) {
          if (result.success) {
            var workspaces = result.data;
            workspaces.forEach(function(ws) {
              $scope.workspace.selected = ws;
              $scope.workspaceChanged(ws);
            });
            $scope.workspaces = workspaces;
          } else {
            // TODO move alerts to top of header nav
            $scope.alerts = [{
              type: 'warning',
              message: 'Workspace update failed.',
              fadeout: true
            }];
          }
        });

    }]);

