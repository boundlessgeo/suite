angular.module('gsApp.data', [
  'ngGrid',
  'ui.select'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('data', {
          url: '/data',
          templateUrl: '/data/data.tpl.html',
          controller: 'AllDataCtrl'
        });
    }])
.controller('AllDataCtrl', ['$scope', 'GeoServer', '$state', '$log',
    function($scope, GeoServer, $state, $log) {
      $scope.title = 'All Data';

      /*GeoServer.alldata.get().$promise.then(function(data) {
        $scope.data = data;
      });*/
      $scope.datastores = GeoServer.datastores.get().datastores;

      $scope.$on('ngGridEventEndCellEdit', function(evt){
        var target = evt.targetScope;
        var field = target.col.field;
        var layer = target.row.entity;

        var patch = {};
        patch[field] = layer[field];

        //TODO: report error
        GeoServer.layer
          .update({ workspace: layer.workspace, name: layer.name}, patch);
      });

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };
      $scope.gridOptions = {
        data: 'datastores',
        sortInfo: {fields: ['workspace'], directions: ['asc']},
        enableCellSelection: false,
        enableRowSelection: true,
        enableCellEdit: false,
        selectWithCheckboxOnly: false,
        selectedItems: $scope.gridSelections,
        multiSelect: true,
        columnDefs: [
          {field: 'workspace',
            displayName: 'Workspace',
            cellClass: 'text-left',
            width: '15%'
          },
          {field: 'store',
            displayName: 'Store',
            cellClass: 'text-left',
            width: '15%'
          },
          {field: 'type',
            displayName: 'Data Type',
            cellClass: 'text-left',
            width: '10%'
          },
          {field: 'source',
            displayName: 'Source',
            cellClass: 'text-left',
            width: '20%'
          },
          {field: 'description',
            displayName: 'Description',
            enableCellEdit: true,
            cellClass: 'text-left',
            width: '25%'
          },
          {field: 'srs',
            displayName: 'SRS',
            width: '10%'
          },
          {field: '', displayName: '', width: '*'}
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

    }]);
