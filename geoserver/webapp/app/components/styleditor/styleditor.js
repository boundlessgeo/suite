/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
/*global CodeMirror */
angular.module('gsApp.styleditor', [
  'ui.codemirror',
  'gsApp.styleditor.attributes',
  'gsApp.styleditor.color',
  'gsApp.styleditor.display',
  'gsApp.styleditor.fullscreen',
  'gsApp.styleditor.icons',
  'gsApp.styleditor.layers',
  'gsApp.styleditor.save',
  'gsApp.styleditor.undo',
  'gsApp.styleditor.ysldhinter'
])
.directive('styleEditor', ['$compile', '$sanitize', '$timeout', '$log',
    'YsldHinter', '$rootScope', '$sce', '$document',
    function($compile, $sanitize, $timeout, $log, YsldHinter,
      $rootScope, $sce, $document) {
      return {
        restrict: 'EA',
        scope: {
          layer: '=?',
          style: '=',
          markers: '=?',
          editor: '=?'
        },
        templateUrl: '/components/styleditor/styleditor.tpl.html',
        controller: function($scope, $element) {
          $scope.onCodeMirrorLoad = function(editor) {
            $rootScope.editor = editor;

            editor.on('change', function(cm, change) {
              if (change.origin == 'setValue') {
                $timeout(function() {
                  cm.clearHistory();
                }, 0);
                $rootScope.generation = cm.changeGeneration();
              }
            });
          };

          $scope.codeMirrorOpts = {
            lineWrapping : true,
            lineNumbers: true,
            styleActiveLine: true,
            mode: 'yaml',
            foldGutter: true,
            gutters: ['markers', 'CodeMirror-foldgutter'],
            extraKeys: {
              'Ctrl-Space': function(cm) {
                cm.showHint({
                  hint: function(cm, options) {
                    return YsldHinter.hints(cm, angular.extend(options, {
                      layer: $scope.layer
                    }));
                  }
                });
              },
              'Ctrl-F': function(cm) {
                var pos = cm.getCursor();
                while(pos.line > 0 && cm.isFolded(pos)) {
                  pos = {line: pos.line-1, ch:0};
                }
                cm.foldCode(pos, {
                  rangeFinder: CodeMirror.fold.indent,
                  scanUp: true
                });
              },
              // tab remapping taken from:
              //   https://gist.github.com/danieleds/326903084a196055a7c3
              'Tab': function (cm) {
                if (cm.somethingSelected()) {
                  var sel = cm.getSelection('\n');
                  var cur = cm.getCursor();

                  // Indent only if there are multiple lines selected,
                  // or if the selection spans a full line
                  if (sel.length > 0 && (sel.indexOf('\n') > -1 ||
                    sel.length === cm.getLine(cur.line).length)) {
                    cm.indentSelection('add');
                    return;
                  }
                }

                if (cm.options.indentWithTabs) {
                  cm.execCommand('insertTab');
                }
                else {
                  cm.execCommand('insertSoftTab');
                }
              },
              'Shift-Tab': function (cm) {
                cm.indentSelection('subtract');
              }
              // 'Tab': function(cm) {
              //   // replace tabs with spaces
              //   var spaces =
              //     new Array(cm.getOption('indentUnit') + 1).join(' ');
              //   cm.replaceSelection(spaces);
              // }
            },
            tabMode: 'spaces'
          };

          $scope.setPopup = function(){
            //Wait a little bit before setting the popover element. We need to
            //ensure that it exists so we can remove it later on if necessary.
            //If we don't explicitly remove it then the popover will remain on
            //the new code mirror window.
            $timeout(function() {
              $rootScope.popoverElement = angular.element(
                $document[0].querySelectorAll('.popover'));
            }, 250);
          };

          $scope.$watch('markers', function(newVal) {
            $scope.editor.clearGutter('markers');
            if (newVal != null) {
              newVal.forEach(function(mark) {

                var html = '<a class="icon-warning" ' +
                  'popover="' + $sce.trustAsHtml(mark.problem) + '" ' +
                  'popover-placement="left" ' +
                  'popover-append-to-body="true"' +
                  'title="Click to toggle the error message on/off." ' +
                  'alt="Click to toggle the error message on/off."' +
                  'ng-click="setPopup()"></a>';

                var marker = $compile(html)($scope)[0];
                $scope.editor.setGutterMarker(mark.line, 'markers', marker);
              });
            }
          });
        }
      };
    }])
.run(['$log',
    function($log) {
      CodeMirror.prototype.insertOrReplace = function(value) {
        if (this.somethingSelected()) {
          // replace the selection
          this.replaceSelection(value, 'around');
        }
        else {
          // insert
          this.replaceRange(value, this.getCursor());
        }
      };
    }]);
