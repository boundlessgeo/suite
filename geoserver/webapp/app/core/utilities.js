/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
/**
 * Module for reusable utitlies.
 */
 // http://goo.gl/huaMt1
angular.module('gsApp.core.utilities', [])
.directive('httpPrefix', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, controller) {
      function ensureHttpPrefix(value) {
        // Need to add prefix if we don't have http:// prefix already
        if (value && !/^(https?):\/\//i.test(value) &&
            'http://'.indexOf(value) === -1) {
          controller.$setViewValue('http://' + value);
          controller.$render();
          return 'http://' + value;
        } else {
          return value;
        }
      }
      controller.$formatters.push(ensureHttpPrefix);
      controller.$parsers.splice(0, 0, ensureHttpPrefix);
    }
  };
})
.directive('popoverHtmlUnsafePopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@',
    content: '@',
    placement: '@',
    animation: '&',
    isOpen: '&' },
    templateUrl: '/core/modals/popover-html-unsafe.tpl.html',
  };
})
.directive('popoverHtmlUnsafe', [ '$tooltip', function ($tooltip) {
  return $tooltip('popoverHtmlUnsafe', 'popover', 'click');
}])
/*
 * Filter below partitions data into columns
 */
.filter('partition', function() {
  var cache = {};
  var filter = function(arr, size) {
    if (!arr) { return; }
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
      newArr.push(arr.slice(i, i+size));
    }
    var arrString = JSON.stringify(arr);
    var fromCache = cache[arrString+size];
    if (JSON.stringify(fromCache) === JSON.stringify(newArr)) {
      return fromCache;
    }
    cache[arrString+size] = newArr;
    return newArr;
  };
  return filter;
})
/*
 * Filter below trims a long line
 * Adapted from http://goo.gl/GHr4ZN
 */
.filter('truncate', function () {
  return function (value, byword, max, tailEnd, tail) {
    if (!value) {
      return '';
    }
    max = parseInt(max, 10);
    if (!max) {
      return value;
    }
    if (value.length <= max) {
      return value;
    }
    var newValue = value.substr(0, max);
    if (byword) {
      var lastspace = newValue.lastIndexOf(' ');
      if (lastspace != -1) {
        newValue = newValue.substr(0, lastspace);
      }
    }
    if (tailEnd) { // include tail end of string
      var lastSlash = value.lastIndexOf('/');
      if (lastSlash != -1) {
        tail = value.substring(lastSlash);
      }
    }
    if (!tail) {
      tail = '';
    }
    return newValue + ' … ' + tail;
  };
})
.directive('popPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/popover/popover.html'
  };
})
.directive('pop', function($tooltip, $timeout) {
  var tooltip = $tooltip('pop', 'pop', 'event');
  var compile = angular.copy(tooltip.compile);
  tooltip.compile = function (element, attrs) {
    var parentCompile = compile(element, attrs);
    return function(scope, element, attrs ) {
      var first = true;
      attrs.$observe('popShow', function (val) {
        if (JSON.parse(!first || val || false)) {
          $timeout(function () {
            element.triggerHandler('event');
          });
        }
        first = false;
      });
      parentCompile(scope, element, attrs);
    };
  };
  return tooltip;
})
.filter('bytesize', function() {
  return function(bytes) {
    if (bytes == null || bytes == 0) {
      return '0 Byte';
    }
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
  };
})
.filter('firstCaps', function() {
  return function(str) {
    if (str == null) {
      return null;
    }
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
})
.directive('focusInit', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $timeout(function() {
        element[0].focus();
      }, 100);
    }
  };
})
/*
 * Map vs. Editor Resizer bar in composer view
 * Requires function onUpdatePanels() be defined in scope to broadcast
 * update map event.
 */
.directive('resizer', function($document, $window) {
  return function($scope, $element, $attrs) {
    var screenWidth, sideWidth, panelsWidth, rightMin = 0, leftMin = 0;

    $element.on('mousedown', function(event) {
      event.preventDefault();
      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
      sideWidth = angular.element('#sidebar-wrapper').width();
      screenWidth = $window.innerWidth;
      panelsWidth = screenWidth - sideWidth;
      if ($attrs.rightMin) {
        rightMin = screenWidth - parseInt($attrs.rightMin);
      }
      if ($attrs.leftMin) {
        leftMin = parseInt($attrs.leftMin);
      }
      $element.addClass('active');
    });

    function mousemove(event) {
      event.preventDefault();
      var xPos = event.pageX;

      if (xPos < leftMin) {
        xPos = leftMin;
      }
      if (xPos > rightMin) {
        xPos = rightMin;
      }
      var mapWidth = xPos - sideWidth;
      var editorWidth = screenWidth - xPos;

      angular.element('#mapPanel').css({
        width: 100 * mapWidth/panelsWidth + '%'
      });
      angular.element('#editingPanel').css({
        width: 100 * editorWidth/panelsWidth + '%'
      });
    }
    function mouseup() {
      $element.removeClass('active');
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
      $scope.onUpdatePanels();
    }
  };
})
.directive('checkLayer', function(GeoServer) {
    return function($scope, $element, $attrs) {
      $scope.setName = function(layer) {
        $scope.originalName = layer;
      };

      $scope.checkName = function(layer) {
        $scope.layerNameCheck = '';

        //Check to see if the incoming layerName has a space in it; this is
        //invalid XML.
        if (layer.indexOf(' ') > -1) {
          $scope.layerNameSpaceError = true;
        }
        else {
          $scope.layerNameSpaceError = false;
        }

        if ($scope.originalName != layer) {
          //Check to see if the incoming layerName already exists for this
          //  workspace. If it does, show the error, if not, keep going.
          GeoServer.layer.get($scope.workspace, layer).then(
            function(result) {
              if (result.success) {
                $scope.layerNameCheck = result.data;
              } else {
                $scope.alerts = [{
                  type: 'warning',
                  message: 'Layer name cannot be checked.',
                  fadeout: true
                }];
              }

              if ($scope.layerNameCheck.name) {
                $scope.layerNameError = true;
              }
              else {
                $scope.layerNameError = false;
              }
            });
        }
      };
    };
});
