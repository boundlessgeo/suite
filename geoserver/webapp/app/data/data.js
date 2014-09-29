angular.module('gsApp.data', [
  'ngGrid',
  'ui.select',
  'gsApp.layers.style'
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

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };
      $scope.gridOptions = {
        data: 'datastores',
        columnDefs: [
          {field: 'workspace',
            displayName: 'Workspace',
            cellClass: 'text-left',
            width: '10%'
          },
          {field: 'store',
            displayName: 'Store',
            cellClass: 'text-left',
            width: '10%'
          },
          {field: 'type',
            displayName: 'Data Type',
            cellClass: 'text-center',
            width: '10%'
          },
          {field: 'source',
            displayName: 'Source',
            cellClass: 'text-left',
            width: '30%'
          },
          {field: 'description',
            displayName: 'Description',
            cellClass: 'text-left',
            width: '30%'
          },
          {field: 'srs',
            displayName: 'SRS',
            cellClass: 'text-center',
            width: '10%'
          }
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
