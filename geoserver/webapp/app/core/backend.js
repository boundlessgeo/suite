/*global $:false */
/**
 * Module for backend api service.
 */
angular.module('gsApp.core.backend',[])
.factory('GeoServer', ['$http', '$resource', '$q', '$log',
  'AppEvent', '$rootScope',
    function($http, $resource, $q, $log, AppEvent, $rootScope) {
      var gsRoot = '/geoserver';
      var apiRoot = gsRoot + '/app/api';
      var importRoot = apiRoot + '/imports/';

      /*
       * simple wrapper around $http to set up defer/promise, etc...
       */
      var http = function(config) {
        var d = $q.defer();
        $http(config)
          .success(function(data, status, headers, config) {
            d.resolve({
              success: status >= 200 && status < 300,
              status: status,
              data: data
            });
          })
          .error(function(data, status, headers, config) {
            $rootScope.$broadcast(AppEvent.ServerError,
              {status: status, data: data});
            d.reject({status: status, data: data});
          });
        return d.promise;
      };

      return {
        baseUrl: function() {
          return gsRoot;
        },

        import: {
          url: function(workspace) {
            return importRoot + workspace;
          },
          get: function(workspace, id) {
            return http({
              method: 'GET',
              url: importRoot + workspace + '/' + id
            });
          },
          update: function(workspace, id, content) {
            return http({
              method: 'PUT',
              url: importRoot + workspace + '/' + id,
              data: content
            });
          }
        },

        session: function() {
          return http({
            method: 'GET',
            url: apiRoot + '/login',
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
        },

        login: function(username, password) {
          return http({
            method: 'POST',
            url: apiRoot + '/login',
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({ username: username, password: password })
          });
        },

        logout: function() {
          return http({
            method: 'GET',
            url: apiRoot + '/logout'
          });
        },

        serverInfo: $resource(apiRoot+'/serverInfo', {}, {
          get: {
            method: 'GET',
            responseType: 'json'
          }
        }),

        workspaces: {
          get: function() {
            return http({
              method: 'GET',
              url: apiRoot+'/workspaces'
            });
          }
        },

        workspace: {
          get: function(workspace) {
            return http({
              method: 'GET',
              url: apiRoot+'/workspaces/'+workspace
            });
          },
          create: function(content) {
            return http({
              method: 'POST',
              url: apiRoot+'/workspaces',
              data: content
            });
          },
          update: function(workspace, patch) {
            return http({
              method: 'PUT',
              url: apiRoot+'/workspaces/'+workspace,
              data: patch
            });
          },
          delete: function(workspace) {
            return http({
              method: 'DELETE',
              url: apiRoot+'/workspaces/'+workspace
            });
          }
        },

        datastores: {
          get: function(workspace) {
            return http({
              method: 'GET',
              url: apiRoot+'/stores/'+workspace
            });
          },

          getDetails: function(workspace, store) {
            return http({
              method: 'GET',
              url: apiRoot+'/stores/'+workspace+'/'+store
            });
          },
          update: function(workspace, store, patch) {
            return http({
              method: 'PATCH',
              url: apiRoot+'/stores/'+workspace+'/'+store,
              data: patch
            });
          },
          delete: function(workspace, store) {
            return http({
              method: 'DELETE',
              url: apiRoot+'/stores/'+workspace+'/'+store + '?recurse=true'
            });
          }
        },

        layers: {
          get: function(workspace, page, pagesize) {
            workspace = workspace? workspace : 'default';
            page = page? page : 0;
            pagesize = pagesize? pagesize : 25;
            return http({
              method: 'GET',
              url: apiRoot+'/layers/'+workspace+'?page='+page+
                '&pagesize='+pagesize
            });
          },
          getAll: function(workspace) {
            workspace = workspace? workspace : 'default';
            return http({
              method: 'GET',
              url: apiRoot+'/layers/'+workspace
            });
          },
          put: function(workspace, map, layers) {
            return http({
              method: 'PUT',
              url: apiRoot+'/maps/'+workspace+'/'+map+'/layers',
              data: JSON.stringify(layers)
            });
          }
        },

        layer: {
          get: function(workspace, layer) {
            return http({
              method: 'GET',
              url: apiRoot+'/layers/'+workspace+'/'+layer
            });
          },
          create: function(workspace, layerInfo) {
            return http({
              method: 'POST',
              url: apiRoot+'/layers/'+workspace,
              data: layerInfo
            });
          },
          update: function(workspace, layer, patch) {
            return http({
              method: 'PATCH',
              url: apiRoot+'/layers/'+workspace+'/'+layer,
              data: patch
            });
          },
          delete: function(workspace, layer) {
            return http({
              method: 'DELETE',
              url: apiRoot+'/layers/'+workspace+'/'+layer
            });
          }
        },

        style: {
          get: function(workspace, layer) {
            return http({
              method: 'GET',
              url: apiRoot+'/layers/'+workspace+'/'+layer+'/style'
            });
          },
          put: function(workspace, layer, content) {
            return http({
              method: 'PUT',
              url: apiRoot+'/layers/'+workspace+'/'+layer+'/style',
              data: content,
              headers: {
                'Content-Type': 'application/vnd.geoserver.ysld+yaml'
              }
            });
          }
        },

        maps: {
          get: function(workspace) {
            return http({
              method: 'GET',
              url: apiRoot+'/maps/'+workspace
            });
          },
          post: function(workspace, name) {
            return http({
              method: 'GET',
              url: apiRoot+'/maps/'+workspace+'/'+name
            });
          },
        },

        map: {
          get: function(workspace, name) {
            return http({
              method: 'GET',
              url: apiRoot+'/maps/'+workspace+'/'+name
            });
          },

          // requires at least one layer
          create: function(workspace, mapData) {
            return http({
              method: 'POST',
              url: apiRoot+'/maps/'+workspace,
              data: mapData
            });
          },

          update: function(workspace, name, patch) {
            return http({
              method: 'PATCH',
              url: apiRoot+'/maps/'+workspace+'/'+name,
              data: patch
            });
          },

          remove: function(workspace, name) {
            return http({
              method: 'DELETE',
              url: apiRoot+'/maps/'+workspace+'/'+name
            });
          },

          thumbnail: {
            get: function(workspace, layers, width, height) {
              var url = gsRoot + '/wms/reflect?&layers=' + layers;
              if (width) {
                url = url + '&width=' + width;
              }
              if (height) {
                url = url + '&height=' + height;
              }
              return url;
            }
          },

          // return an openlayers map URL
          // TODO - not showing getFeatureInfo information as on
          // geoserver OpenLayers template, try to copy that template
          openlayers: {
            get: function(workspace, layergroup, bbox, width, height) {
              var url = gsRoot + '/' + workspace +
               '/wms?service=WMS&version=1.1.0&request=GetMap&layers=' +
               layergroup + bbox + '&width=' + width +
               '&height=' + height +
               '&srs=EPSG:4326&format=application/openlayers';
              return url;
            }
          }
        },

        icons: {
          get: function(workspace) {
            return http({
              method: 'GET',
              url: apiRoot+'/icons/'+workspace
            });
          },
          url: function(workspace) {
            return apiRoot+'/icons/'+workspace;
          }
        },

        proj: {
          recent: function() {
            return http({
              method: 'GET',
              url: apiRoot+'/projections/recent'
            });
          },

          get: function(srs) {
            return http({
              method: 'GET',
              url: apiRoot+'/projections/' + srs
            });
          }
        }
      };
    }]);
