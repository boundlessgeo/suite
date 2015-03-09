/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
/* globals $ */
angular.module('gsApp.styleditor.display', [])
.directive('styleEditorDisplay', ['$log', '$rootScope', 'AppEvent',
    function($log, $rootScope, AppEvent) {
      return {
        restrict: 'EA',
        scope: {
          editor: '=',
        },
        template:
        '<li class="dropdown dropdown-toggle">'+
          '<i class="icon-screen"></i>'+
          '<span>Display</span>'+
          '<ul class="dropdown-menu display-menu">'+
            '<li class="dropdown-submenu">'+
              'BgColor'+
              '<ul class="dropdown-menu">'+
                '<li class="bg-submenu">'+
                  '<small>(Screen only)</small></li>'+
                '<li ng-repeat="(b,c) in bgcolors"'+
                  'ng-class="{active: b == bgcolor}">'+
                  '<a href ng-click="chooseBgcolor(b)">{{b}}</a>'+
                '</li>'+
              '</ul>'+
            '</li>'+
            '<li class="dropdown-submenu">'+
              'Font'+
              '<ul class="dropdown-menu">'+
                '<li ng-repeat="(f,v) in fonts"'+
                  'ng-class="{active: f == font}">'+
                  '<a href ng-click="chooseFont(f)">{{f}}</a>'+
                '</li>'+
              '</ul>'+
            '</li>'+
            '<li class="dropdown-submenu">'+
              'Font Size'+
              '<ul class="dropdown-menu">'+
                '<li ng-repeat="s in sizes"'+
                  'ng-class="{active: $index == size}">'+
                  '<a href ng-click="chooseSize($index)">'+
                    '{{s[0]}}</a>'+
                '</li>'+
              '</ul>'+
            '</li>'+
            '<li class="dropdown-submenu">'+
              'Map Controls'+
              '<ul class="dropdown-menu">'+
                '<li ng-repeat="(mc,v) in mapcontrols">'+
                  '<a href ng-click="chooseControl(v)">'+
                    '{{mc}}</a>'+
                '</li>'+
              '</ul>'+
            '</li>'+
          '</ul>'+
        '</li>',
        replace: true,
        controller: function($scope, $element) {

          /* BgColor */

          $scope.bgcolors = {
            'black': 'black',
            'ltblue': 'cornflowerblue',
            'gray': '#333333',
            'ltgray': '#cccccc',
            'white': 'white',
            'sand': 'peru'
          };
          // Set default as white
          $scope.bgcolor = Object.keys($scope.bgcolors)[4];

          $scope.chooseBgcolor = function(color) {
            $scope.bgcolor = $scope.bgcolors[color];
            $rootScope.$broadcast(AppEvent.MapBackground, $scope.bgcolor);
          };

          /* Font */

          $scope.fonts = {
            'Monospace': 'monospace',
            'Sans Serif': 'sans-serif',
            'Serif': 'serif',
            'Inconsolata': 'Inconsolata',
            'Source Code Pro': 'Source Code Pro'
          };
          // Set default as Inconsolata
          $scope.font = Object.keys($scope.fonts)[3];

          $scope.chooseFont = function(font) {
            var css = $scope.fonts[font];
            $scope.font = css;

            // hack!
            $('.CodeMirror').css('font-family', css);
          };

          /* Font Size */

          $scope.sizes = [
            ['Small', '10px'],
            ['Smaller', '12px'],
            ['Normal', '14px'],
            ['Larger', '16px'],
            ['Large', '18px']
          ];

          $scope.size = 2;
          $scope.chooseSize = function(i) {
            $scope.size = i;

            // hack!
            $('.CodeMirror').css('font-size', $scope.sizes[i][1]);
          };

          /* Map Controls */

          $scope.mapcontrols = {
            'Toggle All': 'all',
            'Toggle LonLat': 'lonlat',
            'Toggle Bounds': 'bounds',
            'Toggle Extent': 'extent',
            'Toggle Scale': 'scale',
            'Toggle Zoom': 'zoom',
            'Toggle Zoom Level': 'zoomlevel',
          };

          $scope.chooseControl = function(ctrl) {
            $rootScope.$broadcast(AppEvent.MapControls, ctrl);
          };
        }
      };
    }]);
