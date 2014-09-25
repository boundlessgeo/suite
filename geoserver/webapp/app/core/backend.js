/*global $:false */
/**
 * Module for backend api service.
 */
angular.module('gsApp.core.backend',[])
.factory('GeoServer', ['$http', '$resource', '$q', '$log',
    function($http, $resource, $q, $log) {
      var gsRoot = '/geoserver';
      var apiRoot = gsRoot + '/app/backend';

      /*
       * simple wrapper around $http to set up defer/promise, etc...
       */
      var http = function(config) {
        var d = $q.defer();
        $http(config)
          .success(function(data, status, headers, config) {
            d.resolve({
              success: status == 200,
              status: status,
              data: data
            });
          })
          .error(function(data, status, headers, config) {
            d.reject({status: status, data: data});
          });
        return d.promise;
      };

      return {
        baseUrl: function() {
          return gsRoot;
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

        workspaces: $resource(apiRoot+'/workspaces', {}, {
          get: {
            method: 'GET',
            responseType: 'json',
            isArray: true
          }
        }),

        // Stubbing in for now
        datastores: {
          get: function() {
            return {
              'datastores': [{
                'workspace': 'i_am_a_stub',
                'store': 'med_shp',
                'type': 'shp',
                'source':  '72.45.34.23/mnt/vol2/dataset1/ne/',
                'description':
                'directory of spatial files (shp)',
                'srs': 'EPSG:4326'
              }]
            };
          }
        },

        layers: $resource(apiRoot+'/layers/:workspace', {workspace:'default'}, {
          get: {
            method: 'GET',
            responseType: 'json',
            isArray: true
          }
        }),

        layer: $resource(apiRoot+'/layers/:workspace/:name', {}, {
          get: {
            method: 'GET',
            responseType: 'json'
          }
        }),

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

        maps: $resource(apiRoot+'/maps/:workspace', {workspace:'default'}, {
          get: {
            method: 'GET',
            responseType: 'json',
            isArray: true
          }
        }),

        map: {
          get: function(workspace, name) {
            return http({
              method: 'GET',
              url: apiRoot+'/maps/'+workspace+'/'+name
            });
          },

          layers: {
            put: function(workspace, map, layers) {
              return http({
                method: 'PUT',
                url: apiRoot+'/maps/'+workspace+'/'+map+'/layers',
                data: JSON.stringify(layers)
              });
            }
          },

          thumbnail: {
            get: function(workspace, name, layers, width, height) {
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
        }
      };
    }]);
