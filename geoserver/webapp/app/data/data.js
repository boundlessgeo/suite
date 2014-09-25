angular.module('gsApp.data', [
  'ngGrid'
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
          {field: 'workspace', displayName: 'Workspace'},
          {field: 'store', displayName: 'Store'},
          {field: 'type', displayName: 'Data Type'},
          {field: 'source', displayName: 'Source', width: '30%'},
          {field: 'description', displayName: 'Description', width: '20%'},
          {field: 'srs', displayName: 'SRS'}
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
