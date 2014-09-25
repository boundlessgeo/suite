/*global document, ZeroClipboard, $ */
angular.module('gsApp.olmap', [])
.factory('MapFactory', ['GeoServer', '$log', 'olMapService',
    function(GeoServer, $log, olMapService) {
      return {
        createMap: function(layers, element, options) {
          var requestedlayersList = layers[0].layers;
          var mapLayers = [];

          for (var k=requestedlayersList.length-1; k >= 0; k--) {
            var ll = requestedlayersList[k];
            mapLayers.push(new ol.layer.Image({
              source: new ol.source.ImageWMS({
                url: GeoServer.baseUrl()+'/'+ll.workspace+'/wms',
                params: {'LAYERS': ll.name, 'VERSION': '1.1.1'},
                serverType: 'geoserver'
              }),
              name: ll.name
            }));
          }

          // determine projection from first layer
          var l = layers[0];
          var proj = new ol.proj.Projection({
            code: l.proj.srs,
            units: l.proj.unit,
            axisOrientation: l.proj.type == 'geographic' ? 'neu' : 'enu'
          });

          var scaleControl = document.createElement('div');
          scaleControl.setAttribute('class', 'ol-scale');

          var clip = new ZeroClipboard(scaleControl);
          clip.on('copy', function (event) {
            var clipboard = event.clipboardData;
            clipboard.setData('text/plain',
              $(scaleControl).text().split(' : ')[1]);
          });

          var extentControl = document.createElement('div');
          extentControl.setAttribute('class', 'ol-zoom');

          // Get bounds button
          var boundsControl = document.createElement('div');
          var boundsButton = document.createElement('button');
          boundsButton.setAttribute('onmouseover',
            'window.boundsTip(this);');
          boundsButton.setAttribute('onclick',
            'window.boundsTip(this, true);');
          boundsControl.appendChild(boundsButton);
          boundsControl.setAttribute('class',
            'bounds ol-unselectable ol-control');
          var controlOptions = {};
          ol.control.Control.call(this, {
            element: boundsControl,
            target: controlOptions.target
          });
          ol.inherits(boundsControl, ol.control.Control);

          var boundsClip = new ZeroClipboard(boundsButton);
          boundsClip.on('copy', function (event) {
            var clipboard = event.clipboardData;
            var map = olMapService.map;
            var extent = map.getView().calculateExtent(map.getSize());
            clipboard.setData('text/plain', extent.toString());
          });

          boundsClip.on('aftercopy', function(event) {
            boundsButton.onclick();
          });

          // initial extent
          var bbox = l.bbox.native;
          var extent = [bbox.west,bbox.south,bbox.east,bbox.north];
          var size = [element.width(),element.height()];

          var mapOpts = {
            view: new ol.View({
              center: l.bbox.native.center,
              projection: proj
            }),
            layers: mapLayers,
            controls: new ol.control.defaults({
              attribution: false
            }).extend([
              new ol.control.Control({element: scaleControl}),
              new ol.control.ZoomToExtent({element: extentControl,
                extent: extent }),
              new ol.control.Control({element: boundsControl})
            ])
          };
          mapOpts = angular.extend(mapOpts, options || {});

          var map = new ol.Map(mapOpts);

          map.getView().on('change:resolution', function(evt) {
            var res = evt.target.get('resolution');
            var units = map.getView().get('projection').getUnits();
            var dpi = 25.4 / 0.28;
            var mpu = ol.proj.METERS_PER_UNIT[units];
            var scale = Math.round(res * mpu * 39.37 * dpi);
            scaleControl.innerHTML =  '1 : ' + scale;
          });

          map.getView().fitExtent(extent, size);
          return map;
        }
      };
    }])
.directive('olMap', ['$timeout', 'MapFactory', 'GeoServer', '$log',
  'olMapService', '$window',
    function($timeout, MapFactory, GeoServer, $log, olMapService,
      $window) {
      return {
        restrict: 'EA',
        scope: {
          layers: '=?',
          center: '=?',
          zoom: '=?'
        },
        templateUrl: '/components/olmap/olmap.tpl.html',
        controller: function($scope, $element) {
          $scope.$watch('layers', function(newVal) {
            if (newVal == null) {
              return;
            }
            var map = MapFactory.createMap($scope.layers, $element);
            olMapService.updateMap(map);
            map.setTarget($element[0]);

            var view = map.getView();

            if ($scope.center) {
              view.setCenter($scope.center);
            }
            if ($scope.zoom) {
              view.setZoom($scope.zoom);
            }

            $scope.map = map;
          });

          // tooltip for bounds button
          // OL Tooltips not possible:
          // https://github.com/zeroclipboard/zeroclipboard/issues/369
          var boundsTipTimer = null;
          var tip = document.createElement('span');
          tip.setAttribute('class', 'b-tooltip');
          tip.innerHTML = ' Copy bounds ';

          var copiedTip = document.createElement('span');
          copiedTip.setAttribute('class', 'b-tooltip');
          copiedTip.innerHTML = ' Bounds copied to clipboard ';
          var currentTip;

          $window.boundsTip = function(el, copied) {
            var tipType = copied? copiedTip : tip;
            if (copied) {
              el.parentNode.removeChild(currentTip);
              boundsTipTimer = null;
            }
            if (boundsTipTimer === null) {
              el.parentNode.appendChild(tipType);
              currentTip = tipType;
              boundsTipTimer = $timeout(function() {
                if (tipType.parentNode == el.parentNode) {
                  el.parentNode.removeChild(tipType);
                }
                boundsTipTimer = null;
              }, 900);
            }
          };

          $scope.$on('olmap-refresh', function() {
            $scope.map.getLayers().getArray().forEach(function(l) {
              var source = l.getSource();
              if (source instanceof ol.source.ImageWMS) {
                source.updateParams({update:Math.random()});
              }
            });
          });
        }
      };
    }])
.service('olMapService', [function() {
    var map;
    this.updateMap = function(map) {
      this.map = map;
    };
    this.updateMapSize = function() {
      this.map.updateSize();
    };
    return {
      map: map,
      updateMap: this.updateMap,
      updateMapSize: this.updateMapSize
    };
  }]);
