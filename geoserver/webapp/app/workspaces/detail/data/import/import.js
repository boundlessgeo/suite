/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.workspaces.data.import', [
  'ngGrid',
  'angularFileUpload',
  'ui.bootstrap',
  'gsApp.core.utilities',
  'gsApp.projfield',
  'gsApp.inlineErrors',
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('workspace.data.import.fileordb', {
        views: {
          'importfile@': {
            url: '/',
            templateUrl: '/workspaces/detail/data/import/import.file.tpl.html',
            controller: 'DataImportFileCtrl'
          },
          'importdb@': {
            url: '/',
            templateUrl:
              '/workspaces/detail/data/import/import.db.tpl.html',
            controller: 'DataImportDbCtrl'
          }
        },
        params: { workspace: {}, import: {}, connectParams: {}, format: {} }
      });
      $stateProvider.state('workspace.data.import.details', {
        views: {
          'importdetails@': {
            url: '/details',
            templateUrl:
              '/workspaces/detail/data/import/import.details.tpl.html',
            controller: 'DataImportDetailsCtrl',
          }
        },
        params: { workspace: {}, import: {}, mapInfo: {} }
      });
      $stateProvider.state('workspace.data.import.newmap', {
        views: {
          'newmap@': {
            url: '/newmap',
            templateUrl:
              '/workspaces/detail/data/import/import.newmap.tpl.html',
            controller: 'ImportNewMapCtrl'
          }
        },
        params: { workspace: {}, import: {}, mapInfo: {} }
      });
    }])
.controller('DataImportCtrl', ['$scope', '$state', '$stateParams', 'GeoServer',
  '$modal', '$modalInstance', 'workspace', 'mapInfo', 'mapInfoModel',
  '$rootScope', 'mapsListModel',
    function($scope, $state, $stateParams, GeoServer, $modal, $modalInstance,
        workspace, mapInfo, mapInfoModel, $rootScope, mapsListModel) {

      var wsName = workspace;
      $scope.mapInfo = mapInfo;
      mapInfoModel.setMapInfo(mapInfo);

      $scope.showImportFile = true;
      $scope.showImportDB = false;
      $scope.showImportDetails = false;

      $scope.close = function(newmapOrClose) {
        $state.go('workspace.data.main', {workspace: wsName});
        $modalInstance.close(newmapOrClose);
        // TODO select last imported store if any

      };

      $scope.is = function(route) {
        return $state.is('workspace.data.import'+(route!=null?'.'+route:''));
      };

      $scope.go = function(route) {
        $state.go('workspace.data.import.'+route, {
          workspace: wsName
        });
      };

      $scope.next = function(imp) {
        $scope.showImportFile = false;
        $scope.showImportDetails = true;
        $state.go('workspace.data.import.details', {
          'workspace': wsName,
          'import': imp.id
        });
      };

      $scope.db_home = false;
      $scope.back = function() {
        if (!$scope.is('fileordb') && !$scope.showImportDB) {
        // back to Add File
          $state.go('workspace.data.import.fileordb', {
            workspace: wsName,
            import: $scope.import
          });
        } else if ($scope.format) {  // back to DB connect
          if ($scope.is('fileordb')) {
            $scope.importResult = null;
            $scope.connectParams = null;
            $scope.params = null;
            $scope.db_home = true;
          } else {
            $state.go('workspace.data.import.fileordb', {
              workspace: wsName,
              import: $scope.import,
              connectParams: $scope.connectParams,
              format: $scope.format
            });
          }
        }
      };

      $scope.inFileFlow = function() {
        var test = $scope.is() || $scope.is('fileordb');
        test = test || $state.includes('workspace.data.import.details');
        return test;
      };

      $scope.title = 'Import Data to ' + wsName;
      if (mapInfoModel.getMapInfo()) {
        $scope.title += ' for ' + $scope.mapInfo.name;
      }

      GeoServer.workspace.get(wsName).then(function(result) {
        if (result.success) {
          $scope.workspace = result.data;
          $scope.go('fileordb');
        }
      });

      $scope.importResult = null;
      $scope.setImportResult = function(result) {
        $scope.importResult = result;
      };

      $scope.connectParams = null;
      $scope.setConnectionParamsAndFormat = function(params, format) {
        $scope.connectParams = params;
        $scope.format = format;
      };

      $scope.goToCreateNewMap = function(workspace, importInfo) {
        $state.go('workspace.data.import.newmap', {
          workspace: workspace,
          import: importInfo
        });
      };

      $scope.completeNewMap = function() { // New Map > Import Data
        var mapInfo = mapInfoModel.getMapInfo();
        GeoServer.map.create(wsName, mapInfo).then(
          function(result) {
            if (result.success) {
              var map = result.data;
              $rootScope.alerts = [{
                type: 'success',
                message: 'Map ' + map.name + ' created  with ' +
                  map.layers.length + ' layer(s).',
                fadeout: true
              }];
              mapsListModel.addMap(map);
              $scope.close('close');
              $state.go('map.compose', {workspace: wsName,
                name: map.name});
            } else {
              $scope.errors = result.data.cause?
                result.data.cause: result.data; // show errors in modal
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Error creating new map.',
                fadeout: true
              }];
            }
          });
      };

      $scope.addNewLayersToExistingMap = function() { // Existing Map > Import
        var mapInfo = mapInfoModel.getMapInfo();
        var layers = mapInfo.newLayers? mapInfo.newLayers : mapInfo.layers;

        GeoServer.map.layers.add(wsName, mapInfo.name, layers).then(
          function(result) {
            if (result.success) {
              $rootScope.alerts = [{
                type: 'success',
                message: layers.length + ' new layer(s) added to map ' +
                  mapInfo.name + '.',
                fadeout: true
              }];
              $scope.close('close');
              var hiddenLayers = mapInfo.hiddenLayers;
              $state.go('map.compose', {'workspace': wsName,
                'name': mapInfo.name, 'hiddenLayers': hiddenLayers});
            } else {
              $scope.errors = result.data.cause?
                result.data.cause: result.data; // show errors in modal
              $rootScope.alerts = [{
                type: 'danger',
                message: 'New layer(s) could not be added to map ' +
                  mapInfo.name + '.',
                fadeout: true
              }];
            }
          });
      };

      $scope.createNewMapwithImported = function() { // Import Data > New Map
        var mapInfo = mapInfoModel.getMapInfo();

        GeoServer.map.create(wsName, mapInfo).then(
          function(result) {
            if (result.success) {
              var map = result.data;
              $rootScope.alerts = [{
                type: 'success',
                message: 'Map ' + map.name + ' created  with ' +
                  map.layers.length + ' layer(s).',
                fadeout: true
              }];
              mapsListModel.addMap(map);
              $scope.close('close');
              $state.go('map.compose', {workspace: wsName,
                name: map.name});
            } else {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Error creating new map.',
                fadeout: true
              }];
            }
          });
      };


    }])
.controller('DataImportFileCtrl', ['$scope', '$state', '$upload', '$log',
    'GeoServer', '$stateParams', 'AppEvent',
    function($scope, $state, $upload, $log, GeoServer, $stateParams,
      AppEvent) {

      var wsName = $stateParams.workspace;

      $scope.initProgress = function() {
        $scope.progress = {percent: 0};
      };

      $scope.onFileSelect = function(files) {
        $scope.file = files[0];
        $scope.setImportResult(null);
        $scope.initProgress();
      };
      $scope.upload = function() {
        $upload.upload({
          url: GeoServer.import.url($scope.workspace.name),
          method: 'POST',
          file: $scope.file
        }).progress(function(e) {
          $scope.progress.percent = parseInt(100.0 * e.loaded / e.total);
        }).success(function(e) {
          $scope.setImportResult(e);
          $scope.$broadcast(AppEvent.StoreAdded, {workspace: $scope.workspace});
        });
      };
      $scope.initProgress();

    }])
.controller('DataImportDbCtrl', ['$scope', '$state', '$stateParams', '$log',
    'GeoServer', '_', '$sce',
    function($scope, $state, $stateParams, $log, GeoServer, _, $sce) {
      $scope.workspace = $stateParams.workspace;
      $scope.maps = $stateParams.maps;
      $scope.params = $stateParams.connectParams;
      $scope.chooseTables = false;

      $scope.geoserverDatabaseLink = GeoServer.baseUrl() +
        '/web/?wicket:bookmarkablePage=:org.geoserver.importer.web.' +
        'ImportDataPage';

      $scope.chooseFormat = function(f) {
        GeoServer.format.get(f.name).then(function(result) {
          if (result.success) {
            $scope.format = result.data;

            $scope.params = _.mapValues($scope.format.params, function(param) {
              return angular.extend(param, {
                value: param.default
              });
            });
          }
        });
      };

      $scope.connect = function() {
        $scope.connecting = true;
        var content = _.mapValues($scope.params, function(p) {
          return p.value;
        });

        $scope.setConnectionParamsAndFormat($scope.params, $scope.format);

        GeoServer.import.post($scope.workspace, content)
          .then(function(result) {
            if (result.success) {
              $scope.error = null;
              if (result.data.id) {
                $scope.setImportResult(result.data);
              } else if (result.data.store) {
                $scope.alert = result.data;
                $scope.selectStore = result.data.store;
              }
            }
            else {
              $scope.error = result.data;
            }
            $scope.connecting = false;
          });
      };

      $scope.showStore = function() {
        $scope.close($scope.selectStore);
      };

      GeoServer.formats.get().then(function(result) {
        if (result.success) {
          $scope.formats = result.data.filter(function(f) {
            return f.type == 'database';
          });
        }
      });
    }])
.controller('DataImportDetailsCtrl', ['$scope', '$state', '$stateParams',
    '$log', 'GeoServer', '$rootScope', 'AppEvent', 'mapInfoModel',
    'storesListModel',
    function($scope, $state, $stateParams, $log, GeoServer, $rootScope,
      AppEvent, mapInfoModel, storesListModel) {

      $scope.workspace = $stateParams.workspace;
      $scope.import = $stateParams.import;
      $scope.layerSelections = [];

      // if mapInfo's not defined it's import not create map workflow
      if (!mapInfoModel.getMapInfo()) {
        GeoServer.maps.get($scope.workspace).then(
          function(result) {
            if (result.success) {
              $scope.maps = result.data.maps;
            }
          });
      }

      var baseGridOpts = {
        enableCellSelection: false,
        enableRowSelection: true,
        enableCellEdit: false,
        showSelectionCheckbox: true,
        selectWithCheckboxOnly: false,
        multiSelect: true,
        selectedItems: $scope.layerSelections,
        afterSelectionChange: function(rowItem, event) {
          if (mapInfoModel.getMapInfo()) {
            mapInfoModel.setMapInfoLayers($scope.layerSelections);
          }
        }
      };

      // For importing database tables
      $scope.preimportGridOpts = angular.extend({
        data: 'preimportedLayers',
        checkboxHeaderTemplate:
          '<input class="ngSelectionHeader" type="checkbox"' +
            'ng-model="allSelected" ' +
              'ng-change="toggleSelectAll(allSelected)"/>',
        sortInfo: {fields: ['name'], directions: ['asc']},
        columnDefs: [
          {field: 'name', displayName: 'Name', width: '25%'},
          {field: 'geometry', displayName: 'Geometry',
            cellTemplate:
              '<div class="ngCellText" ng-switch ' +
                'on="row.entity.geometry==\'none\'">' +
                '<span ng-switch-when="false">{{ row.entity.geometry }}' +
                '</span>' +
                '<span ng-switch-when="true">None *</span>' +
              '</div>',
            width: '20%'},
          {
            displayName: 'Projection Needed',
            cellTemplate:
              '<div ng-switch on="!row.entity.pending">' +
                '<proj-field ng-switch-when="false" proj="row.entity.proj">' +
                '</proj-field>' +
                '<div ng-switch-when="true" class="ngCellText">' +
                ' {{ row.entity.proj.srs }}'+
                '<div>' +
              '</div>',
            width: '25%'
          },
          {
            displayName: '',
            cellTemplate:
              '<div class="ngCellText" ' +
                'ng-show="row.entity.pending && row.entity.proj != null">'+
                '<a ng-click="applyProjToAll(row.entity.proj)" ' +
                '  title="Apply projection to all pending layers">'+
                'Apply to all</a> ' +
                '<i class="fa fa-mail-forward fa-rotate-180"></i>' +
              '</div>' +
              '<div class="ngCellText" ng-show="row.entity.imported">'+
                '<i class="fa fa-check-circle"></i> Layer imported.' +
              '</div>'
          },
        ],
        checkboxCellTemplate:
          '<div class="ngSelectionCell">' +
          '<input tabindex="-1" class="ngSelectionCheckbox" ' +
          'type="checkbox" ng-checked="row.selected" ' +
          'ng-disabled="row.entity.imported" />' +
          '</div>',
        enablePaging: true,
        enableColumnResize: false,
        showFooter: false,
        totalServerItems: 'preimportedLayers.length',
        pagingOptions: {
          pageSize: 50,
          currentPage: 1
        },
      }, baseGridOpts);

      $scope.completedGridOpts = angular.extend({
        data: 'importedLayers',
        checkboxHeaderTemplate:
          '<input class="ngSelectionHeader" type="checkbox"' +
            'ng-model="allSelected" ng-init="toggleSelectAll(true);"' +
              'ng-change="toggleSelectAll(allSelected)"/>',
        sortInfo: {fields: ['name'], directions: ['asc']},
        columnDefs: [
          {field: 'name', displayName: 'Layer', width: '30%'},
          {field: 'title',
            displayName: 'Title',
            enableCellEdit: true,
            cellTemplate:
              '<div class="grid-text-padding"' +
                'alt="{{row.entity.description}}"' +
                'title="{{row.entity.description}}">' +
                '{{row.entity.title}}' +
              '</div>',
            width: '50%'
          },
          {field: 'geometry',
            displayName: 'Type',
            cellClass: 'text-center',
            cellTemplate:
              '<div get-type ' +
                'geometry="{{row.entity.geometry}}">' +
              '</div>',
            width: '20%'
          }
        ],
        enablePaging: false,
        enableColumnResize: false,
        showFooter: false,
        totalServerItems: 'importedLayers.length',
        pagingOptions: {
          pageSize: 50,
          currentPage: 1
        }
      }, baseGridOpts);

      $scope.pendingGridOpts = angular.extend({
        data: 'pendingLayers',
        enablePaging: false,
        showFooter: false,
        columnDefs: [
          {field: 'name', displayName: 'Name'},
          {
            displayName: 'Projection',
            cellTemplate:
              '<div ng-switch on="row.entity.success">' +
                '<proj-field ng-switch-when="false" proj="row.entity.proj">' +
                '</proj-field>' +
                '<div ng-switch-when="true" class="ngCellText">' +
                ' {{ row.entity.proj.srs }}'+
                '<div>' +
              '</div>',
            width: '30%'
          },
          {
            displayName: '',
            cellTemplate:
              '<div class="ngCellText" ' +
                'ng-show="!row.entity.success && row.entity.proj != null">'+
                '<a ng-click="applyProjToAll(row.entity.proj)" ' +
                '  title="Apply projection to all pending layers">'+
                'Apply to all</a> ' +
                '<i class="fa fa-mail-forward fa-rotate-180"></i>' +
              '</div>' +
              '<div class="ngCellText" ng-show="row.entity.success == true">'+
                '<i class="fa fa-check-circle"></i> Layer imported.' +
              '</div>'
          },
          {
            displayName: '',
            cellTemplate:
              '<button ng-click="reimport()"' +
                'ng-disabled="row.entity.success == true"' +
                  'class="btn btn-success btn-xs">' +
              '<i class="fa fa-refresh"></i> Re-import</button>'
          }
        ]
      }, baseGridOpts);

      GeoServer.import.get($scope.workspace, $scope.import)
        .then(function(result) {
          if (result.success) {
            var imp = result.data;
            $log.log(imp);
            $scope.import = imp;

            $scope.preimportedLayers = imp.preimport.map(function(t) {
              return t;
            });
            $scope.importedLayers = imp.imported.map(function(t) {
              t.layer.source = t.name;
              return t.layer;
            });
            $scope.pendingLayers = imp.pending.map(function(t) {
              t.success = false;
              return t;
            });
            $rootScope.$broadcast(AppEvent.StoreAdded);
          } else {
            $rootScope.alerts = [{
              type: 'danger',
              message: 'Could not import file.',
              fadeout: true
            }];
          }
        });

      $scope.applyProjToAll = function(proj) {
        $scope.import.pending.filter(function(task) {
          return task.problem == 'NO_CRS' && typeof task.proj == 'undefined';
        }).forEach(function(task) {
          task.proj = proj;
        });
      };

      $scope.importTables = function() {
        $scope.importInProgress = true;
        var toImport;
        if ($scope.layerSelections.length === $scope.preimportedLayers.length) {
          toImport = {'filter': 'ALL'};
        } else {
          toImport = {'tasks': []};
          $scope.layerSelections.forEach(function(item) {
            toImport.tasks.push({'task': item.task});
          });
        }
        GeoServer.import.update($scope.workspace,
          $scope.import.id, angular.toJson(toImport))
        .then(function(result) {
            $scope.importInProgress = false;
            if (result.success) {
              // find the imported table in the preimport list & update ui
              var imported = result.data.imported;
              var pending = result.data.pending;
              for (var q=0; q < $scope.preimportedLayers.length; q++) {
                for (var r=0; r < imported.length; r++) {
                  if ($scope.preimportedLayers[q].task === imported[r].task) {
                    $scope.preimportedLayers[q].imported = true;
                    $scope.preimportedLayers[q].pending = false;
                  }
                }
                for (var s=0; s < pending.length; s++) {
                  if ($scope.preimportedLayers[q].task === pending[s].task) {
                    $scope.preimportedLayers[q].pending = true;
                  }
                }
              }
              $rootScope.$broadcast(AppEvent.StoreAdded);
              $scope.importedLayers = result.data.imported;
              mapInfoModel.setMapInfoLayers($scope.importedLayers);
            } else {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Error importing table: ' + result.data.message,
                fadeout: true
              }];
            }
          });
      };

      $scope.reimport = function() {
        $scope.import.pending.filter(function(task) {
          return task.problem == 'NO_CRS' && task.proj != null;
        }).forEach(function(task) {
          var toImport = {'tasks': []};
          toImport.tasks.push({'task': task, 'proj': task.proj});

          GeoServer.import.update($scope.workspace, $scope.import.id,
            angular.toJson(toImport))
            .then(function(result) {
              task.success = result.success && result.data.layer != null;
              if (result.success) {
                $rootScope.$broadcast(AppEvent.StoreAdded);
                result.data.layer.source = result.data.name;
                $scope.importedLayers.push(result.data.layer);
                mapInfoModel.setMapInfoLayers($scope.importedLayers);
              }
            });
        });
      };

      $scope.cancel = function() {
        $state.go('workspace.data.main', {workspace:$scope.workspace.name});
      };

      $scope.setMap = function(map) {
        $scope.selectedMap = map;
      };

      $scope.createNewMap = function(selectedLayers) {
        var newMapInfo = {};
        newMapInfo.layers = [];
        var imported = $scope.importedLayers;
        for (var i=0; i < selectedLayers.length; i++) {
          for (var k=0; k < imported.length; k++) {
            if (selectedLayers[i].file &&
                selectedLayers[i].file===imported[k].source) {
              newMapInfo.layers.push({
                'name': imported[k].name,
                'workspace': $scope.workspace
              });
            } else if (selectedLayers[i].source &&
                selectedLayers[i].source===imported[k].source) {
              newMapInfo.layers.push({
                'name': imported[k].name,
                'workspace': $scope.workspace
              });
            }
          }
        }
        mapInfoModel.setMapInfo(newMapInfo);
        $scope.goToCreateNewMap($scope.workspace, $scope.import);
      };

      $scope.addSelectedToMap = function(selectedLayers) {
        var map = $scope.selectedMap;

        var newMapInfo = {
          'name': map.name,
          'proj': map.proj,
          'abstract': map.abstract
        };
        newMapInfo.layers = [];
        var imported = $scope.importedLayers;
        for (var i=0; i < selectedLayers.length; i++) {
          for (var k=0; k < imported.length; k++) {
            if (selectedLayers[i].file===imported[k].source) {
              newMapInfo.layers.push({
                'name': imported[k].name,
                'workspace': $scope.workspace
              });
            } else if (selectedLayers[i].source &&
              selectedLayers[i].source===imported[k].source) {
              newMapInfo.layers.push({
                'name': imported[k].name,
                'workspace': $scope.workspace
              });
            }
          }
        }
        GeoServer.map.layers.add($scope.workspace,
          newMapInfo.name, newMapInfo.layers).then(function(result) {
            if (result.success) {
              $rootScope.alerts = [{
                type: 'success',
                message: $scope.importedLayers.length +
                  ' layer(s) added to map ' + newMapInfo.name + '.',
                fadeout: true
              }];
              $scope.close('close');
              $state.go('map.compose', {workspace: map.workspace,
                name: newMapInfo.name});
            } else {
              $rootScope.alerts = [{
                type: 'danger',
                message: 'Layer(s) could not be added to map ' +
                  newMapInfo.name + '.',
                fadeout: true
              }];
            }
          });
      };
    }])
.controller('ImportNewMapCtrl', ['$scope', '$state', '$stateParams',
  '$log', 'GeoServer', '$rootScope', 'mapsListModel', 'mapInfoModel',
  'projectionModel', '_', '$timeout', 'AppEvent',
    function($scope, $state, $stateParams, $log, GeoServer, $rootScope,
      mapsListModel, mapInfoModel, projectionModel, _, $timeout, AppEvent) {

      $scope.$parent.title += ' > New Map';

      $scope.workspace = $stateParams.workspace;
      $scope.mapInfo = mapInfoModel.getMapInfo();
      $scope.import = $stateParams.import;
      $scope.selectedLayers = $scope.mapInfo.layers;

      // Proj field
      $scope.crsTooltip =
        '<h5>Add a projection in EPSG</h5>' +
        '<p>Coordinate Reference System (CRS) info is available at ' +
          '<a href="http://prj2epsg.org/search" target="_blank">' +
            'http://prj2epsg.org' +
          '</a>' +
        '</p>';
      $scope.proj = null;
      $scope.projEnabled = false;

      $scope.$watch('proj', function(newValue, oldValue) {
        if (newValue==='mercator') {
          $scope.mapInfo.proj = _.find($scope.projs, function(proj) {
            return proj.srs === 'EPSG:3857';
          });
        } else if (newValue==='latlon') {
          $scope.mapInfo.proj = _.find($scope.projs, function(proj) {
            return proj.srs === 'EPSG:4326';
          });
        } else if (newValue==='other') {
          $scope.mapInfo.proj = $scope.customproj;
        }
        mapInfoModel.setMapInfo($scope.mapInfo);
      });

      projectionModel.fetchProjections().then(function() {
        $scope.projs = projectionModel.getDefaults();
        $scope.projEnabled = true;
        $scope.proj = 'latlon';
      });

      $rootScope.$on(AppEvent.ProjSet, function(scope, proj) {
        $scope.mapInfo.proj = proj;
      });

      $scope.back = function() {
        $state.go('workspace.data.import.details', {
          workspace: $scope.workspace,
          import: $scope.import,
          mapInfo: $scope.mapInfo
        });
      };

      // Save form updates to mapInfoModel service
      var timeout = null;
      var debounceSaveUpdates = function(newVal, oldVal) {
        if (newVal != oldVal) {
          if (timeout) {
            $timeout.cancel(timeout);
          }
          timeout = $timeout(function() {
            mapInfoModel.setMapInfo($scope.mapInfo);
          }, 1000);
        }
      };
      $scope.$watch('mapInfo', debounceSaveUpdates);

    }])
.service('mapInfoModel', function(_) {
  var _this = this;
  this.mapInfo = null;

  this.setMapInfo = function(mapInfo) {
    _this.mapInfo = mapInfo;
  };

  this.setMapInfoLayers = function(layers) {
    // if it's an existing map keep new layers separate
    if (_this.mapInfo) {
      if (_this.mapInfo.created) {
        _this.mapInfo.newLayers = layers;
      } else {
        _this.mapInfo.layers = layers;
      }
    }
  };

  this.getMapInfo = function() {
    return _this.mapInfo;
  };
});

