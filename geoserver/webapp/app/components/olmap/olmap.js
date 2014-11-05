/*global window, document, ZeroClipboard, XMLHttpRequest, Uint8Array, $ */
angular.module('gsApp.olmap', [])
.factory('MapFactory',
    ['GeoServer', 'AppEvent', '$timeout', '$rootScope', '$log',
    function(GeoServer, AppEvent, $timeout, $rootScope, $log) {
      function OLMap(mapOpts, element, options) {
        var self = this;
        this.mapOpts = mapOpts;
        var progress = mapOpts.progress || function() {};
        var error = mapOpts.error || function() {};

        var layerNames  = this.visibleLayerNames().reverse().join(',');
        var mapLayer = new ol.layer.Image({
          source: new ol.source.ImageWMS({
            url: GeoServer.baseUrl()+'/'+mapOpts.workspace+'/wms',
            params: {'LAYERS': layerNames, 'VERSION': '1.1.1',
                'EXCEPTIONS': 'application/json'},
            serverType: 'geoserver',
            imageLoadFunction: function(image, src) {
              progress('start');
              var img = image.getImage();
              if (typeof window.btoa == 'function') {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', src, true);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function(e) {
                  if (this.status == 200) {
                    var uInt8Array = new Uint8Array(this.response);
                    var i = uInt8Array.length;
                    var binaryString = new Array(i);
                    while (i--) {
                      binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = binaryString.join('');
                    var type = xhr.getResponseHeader('content-type');
                    if (type.indexOf('image') === 0) {
                      img.src = 'data:' + type + ';base64,' + window.btoa(data);
                    } else {
                      error($.parseJSON(data));
                    }
                  } else {
                    error(this.statusText);
                  }
                  progress('end');
                };
                xhr.send();
              } else {
                img.onload = function() {
                  progress('end');
                };
                img.onerror = function() {
                  progress('end');
                  error();
                };
                img.src = src;
              }
            }
          })
        });

        // determine projection from first layer
        var p = mapOpts.proj;
        proj4.defs(p.srs, p.wkt);
        var proj = ol.proj.get(p.srs);

        // initial extent
        var bbox = mapOpts.bbox;
        var extent = [bbox.west,bbox.south,bbox.east,bbox.north];
        var size = [element.width(),element.height()];

        // scale control
        var scaleControl = $('<div>')
          .addClass('ol-scale')
          .prop('title', 'Copy scale denominator')
          [0];
        new ZeroClipboard(scaleControl).on('copy', function(event) {
          var clipboard = event.clipboardData;
          clipboard.setData('text/plain',
            $(scaleControl).text().split(' : ')[1]);
        });

        // zoom to extent control
        var extentControl = $('<div>').addClass('ol-zoom')[0];

        // copy bounds control

        // tooltip for bounds button
        // OL Tooltips not possible:
        // https://github.com/zeroclipboard/zeroclipboard/issues/369
        var boundsTipTimer = null;
        var tip = $('<span>').addClass('b-tooltip').html('Copy bounds')[0];
        var copiedTip = $('<span>').addClass('b-tooltip')
          .html('Bounds copied to clipboard ')[0];
        var currentTip;

        var boundsTip = function(el, copied) {
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

        var boundsButton = $('<button>')
          .mouseover(function(e) {
            boundsTip(this);
          })
          .click(function(e) {
            boundsTip(this, true);
          });

        var boundsControl = $('<div>')
          .addClass('bounds ol-unselectable ol-control')
          .append(boundsButton)[0];

        ol.control.Control.call(this, {
          element: boundsControl
        });
        ol.inherits(boundsControl, ol.control.Control);

        new ZeroClipboard(boundsButton)
          .on('copy', function(event) {
            var clipboard = event.clipboardData;
            var extent = self.olMap.getView().calculateExtent(map.getSize());
            clipboard.setData('text/plain', extent.toString());
          })
          .on('aftercopy', function(event) {
            $(boundsButton).click();
          });

        var ZoomLevelControl = function() {
          ol.control.Control.call(this, {
            element: $('<div>')
              .addClass('zoomlevel')
              .prop('title', 'Current zoom level')
              [0]
          });
        };
        ol.inherits(ZoomLevelControl, ol.control.Control);
        ZoomLevelControl.prototype.setMap = function(map) {
          map.on('postrender', function() {
            $(this.element).html('Z' + map.getView().getZoom());
          }, this);
          ol.control.Control.prototype.setMap.call(this, map);
        };

        var map = new ol.Map(angular.extend({
          target: element[0],
          view: new ol.View({
            center: bbox.center,
            projection: proj
          }),
          layers: [mapLayer],
          controls: new ol.control.defaults({
            attribution: false
          }).extend([
            new ol.control.Control({element: scaleControl}),
            new ol.control.ZoomToExtent({
              element: extentControl,
              extent: extent
            }),
            new ol.control.Control({element: boundsControl}),
            new ZoomLevelControl()
          ])
        }, options || {}));

        map.getView().on('change:resolution', function(evt) {
          var res = evt.target.getResolution();
          var units = map.getView().getProjection().getUnits();
          var dpi = 25.4 / 0.28;
          var mpu = ol.proj.METERS_PER_UNIT[units];
          var scale = Math.round(res * mpu * 39.37 * dpi);
          scaleControl.innerHTML =  '1 : ' + scale;
        });

        map.getView().fitExtent(extent, size);
        this.olMap = map;

        // Update map 550 ms after sidebar is resized
        var mapsizeTimer = null;
        $rootScope.$on(AppEvent.SidenavResized, function() {
          if (mapsizeTimer === null) {
            mapsizeTimer = $timeout(function() {
              self.olMap.updateSize();
              mapsizeTimer = null;
            }, 450);
          }
        });

        if (mapOpts.featureInfo) {
          map.on('click', function(evt) {
            var view = map.getView();
            var gfi = mapLayer.getSource().getGetFeatureInfoUrl(
                evt.coordinate,
                view.getResolution(), view.getProjection(),
                {'INFO_FORMAT': 'application/json'});
            $.ajax(gfi).then(function(response) {
              if (response && response.features) {
                mapOpts.featureInfo(JSON.parse(response));
              }
            });
          });
        }

      }

      OLMap.prototype.getNumLayers = function() {
        return this.mapOpts.layers.length;
      };

      OLMap.prototype.visibleLayerNames = function() {
        return this.mapOpts.layers.filter(function(l) {
          return l.visible == true;
        }).map(function(l) {
          return l.name;
        });
      };

      OLMap.prototype.update = function() {
        var layerNames = this.visibleLayerNames().reverse().join(',');
        var layer = this.olMap.getLayers().item(0);
        layer.getSource().updateParams({ LAYERS: layerNames });
      };

      OLMap.prototype.refresh = function() {
        this.olMap.getLayers().getArray().forEach(function(l) {
            var source = l.getSource();
            if (source instanceof ol.source.ImageWMS) {
              source.updateParams({update:Math.random()});
            }
          });
      };

      return {
        createMap: function(mapOpts, element, options) {
          return new OLMap(mapOpts, element, options);
        }
      };
    }])
.directive('olMap', ['$timeout', 'MapFactory', 'GeoServer', '$log', '$window',
    function($timeout, MapFactory, GeoServer, $log, $window) {
      return {
        restrict: 'EA',
        scope: {
          mapOpts: '=?'
        },
        templateUrl: '/components/olmap/olmap.tpl.html',
        controller: function($scope, $element) {

          $scope.$watch('mapOpts', function(newVal) {
            if (newVal == null) {
              return;
            }

            $scope.map = MapFactory.createMap($scope.mapOpts, $element);
          });

          $scope.$watch('mapOpts.layers', function(newVal) {
            if (newVal == null) {
              return;
            }

            $scope.map.update();
          }, true);

          $scope.$watch('mapOpts.bounds', function(newVal) {
            // TODO: Andreas, zoom the map the specified bounds, but it might 
            // be in a different projection than the map
          });
          $scope.$on('olmap-refresh', function() {
            $scope.map.refresh();
          });
        }
      };
    }]);
