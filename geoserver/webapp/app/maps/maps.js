angular.module('gsApp.maps', [
  'ngGrid',
  'ui.select',
  'ngSanitize',
  'gsApp.alertpanel',
  'gsApp.projfield',
  'gsApp.core.utilities',
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
    '$modal', '$window', '$stateParams',
    function($scope, GeoServer, $state, $log, $rootScope, $modal, $window,
      $stateParams) {
      $scope.title = 'All Maps';
      $scope.workspace = $stateParams.workspace;

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
              $scope.extents = [{name: 'Autocalc'}, {name: 'Custom'}];
              $scope.workspace = ws;
              $scope.mapInfo = {
                'abstract': ''
              };
              $scope.selectedLayers = [];
              $scope.newMap = {};
              $scope.map = {};
              $scope.title = 'New Map';
              $scope.step = 1;
              
              $scope.crsTooltip =
              '<h5>Add a projection in EPSG</h5>' +
              '<p>Coordinate Reference System (CRS) info is available at ' +
                '<a href="http://prj2epsg.org/search" target="_blank">' +
                  'http://prj2epsg.org' +
                '</a>' +
              '</p>';

              $scope.layers = [];
              $scope.layerSelections = [];
              $scope.totalServerItems = [];

              $scope.pagingOptions = {
                pageSizes: [25, 50, 100],
                pageSize: 25,
                currentPage: 1
              };

              $scope.createMap = function(layerSelections) {
                $scope.mapInfo.layers = [];
                for (var i=0; i< layerSelections.length; i++) {
                  $scope.mapInfo.layers.push({
                    'name': layerSelections[i].name,
                    'workspace': $scope.workspace
                  });
                }

                GeoServer.map.create($scope.workspace, $scope.mapInfo).then(
                  function(result) {
                    if (result.success) {
                      $rootScope.alerts = [{
                        type: 'success',
                        message: 'Map ' + result.data.name + ' created  with ' +
                          result.data.layers.length + ' layer(s).',
                        fadeout: true
                      }];
                      $scope.maps.push(result.data);
                    } else {
                      $rootScope.alerts = [{
                        type: 'danger',
                        message: 'Could not create map.',
                        fadeout: true
                      }];
                    }
                  });
              }; // end createMap

              $scope.createNewLayers = function() {
                $state.go('workspace.data.import.file', {
                  workspace: $scope.workspace,
                  maps: [$scope.mapInfo]
                });
              };

              $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
              };

              $scope.clearError = function() {
                $scope.mapNameError = false;
              };

              $scope.checkName = function(mapName) {
                $scope.mapNameCheck = GeoServer.map.get($scope.workspace,
                  mapName);

                //Check to see if the incoming mapName already exists for this
                //  workspace. If it does, show the error, if not, keep going.
                GeoServer.map.get($scope.workspace, mapName).then(
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

              $scope.loadLayers = function() {
                GeoServer.layers.get(
                  $scope.workspace,
                  $scope.pagingOptions.currentPage-1,
                  $scope.pagingOptions.pageSize
                ).then(function(result) {
                  if (result.success) {
                    $scope.layers = result.data.layers;
                    $scope.totalServerItems = result.data.total;
                  } else {
                    $rootScope.alerts = [{
                      type: 'danger',
                      message: 'Layers for workspace ' + $scope.workspace.name +
                        ' could not be loaded.',
                      fadeout: true
                    }];
                  }
                });
              };
              $scope.loadLayers();

              $scope.setMap = function(map) {
                $scope.selectedMap = map;
              };

              $scope.mapsToCreate = [$scope.mapInfo];
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

        GeoServer.map.update(map.workspace, map.name, {title: patch[field]});
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
        selectWithCheckboxOnly: true,
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
        footerTemplate: '/components/grid/ngGrid.custom.footer.tpl.html',
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions,
        filterOptions: {
          filterText: '',
          useExternalFilter: true
        }
      };

      $scope.workspace = {};
      $scope.workspaces = [];

      $scope.setPage = function (page) {
        $scope.pagingOptions.currentPage = page;
      };

      $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal != null) {
          var ws = $scope.workspace.selected;
          if (ws != null) {
            $scope.refreshLayers(ws);
          }
        }
      }, true);

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
            $scope.alerts = [{
              type: 'warning',
              message: 'Workspace update failed.',
              fadeout: true
            }];
          }
        });

    }]);

