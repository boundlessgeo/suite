/*global require, module, __dirname */
var fs = require('fs');
var path = require('path');
var url = require('url');

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

String.prototype.startsWith = function(s) {
  return this.indexOf(s) == 0;
};

String.prototype.endsWith = function(s) {
  return this.substr(-s.length) == s;
};

var config = {
  proxy: {
    host: 'horizon.boundlessgeo.com',
    port: '80'
  }
};

var sources = {
  js: ['app/**/*.js', '!app/**/*.spec.js', '!app/loader.js'],
  less: 'app/**/*.less',
  test: 'app/**/*.spec.js',
  tpl: 'app/**/*.tpl.html'
};

var deps = {
  js: [
    '/vendor/openlayers/ol.js',
    'jquery/dist/jquery.min.js',
    'jquery-ui/ui/core.js',
    'jquery-ui/ui/widget.js',
    'jquery-ui/ui/mouse.js',
    'jquery-ui/ui/sortable.js',
    'js-yaml/dist/js-yaml.js',
    'zeroclipboard/dist/ZeroClipboard.js',
    'codemirror/lib/codemirror.js',
    'codemirror/mode/yaml/yaml.js',
    'codemirror/addon/hint/show-hint.js',
    'codemirror/addon/selection/active-line.js',
    'spectrum/spectrum.js',
    'angular/angular.js',
    'angular-resource/angular-resource.js',
    'angular-bootstrap/ui-bootstrap.js',
    'angular-bootstrap/ui-bootstrap-tpls.js',
    'angular-animate/angular-animate.js',
    'angular-sanitize/angular-sanitize.js',
    'angular-grid/build/ng-grid.js',
    'angular-ui-router/release/angular-ui-router.js',
    'angular-ui-select/dist/select.js',
    'angular-ui-codemirror/ui-codemirror.js',
    'angular-ui-sortable/sortable.js',
    'ng-clip/src/ngClip.js'
  ],

  less: [
    'bootstrap/less/bootstrap.less'
  ],

  css: [
    'angular-grid/ng-grid.css',
    'angular-ui-select/dist/select.min.css',
    'codemirror/lib/codemirror.css',
    'codemirror/addon/hint/show-hint.css',
    'font-awesome/css/font-awesome.css',
    'icomoon/style.css',
    'open-sans-fontface/open-sans.css',
    'spectrum/spectrum.css'
  ],

  font: [
    'font-awesome/fonts/*',
    'icomoon/fonts/*',
    'open-sans-fontface/fonts/**/*',
  ]
};

var prefixDeps = function(deps) {
  return deps.map(function(dep) {
    return dep.indexOf('/') == 0 ? dep.substring(1) : 'bower_components/'+dep;
  });
};

var codeMirrorDeps = function() {
  return deps.js.filter(function(dep) {
    return dep.startsWith('codemirror');
  });
};

var olDeps = function() {
  return deps.js.filter(function(dep) {
    return dep.endsWith('ol.js');
  });
};

var standaloneDeps = function() {
  return deps.js.diff(codeMirrorDeps().concat(olDeps()));
};

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    connect: {
      server: {
        options: {
          port: 8000,
          base: [
            path.join(__dirname, 'build'),
            path.join(__dirname, 'app'),
            __dirname
          ],
          livereload: true,
          middleware: function(connect, options) {
            var middlewares = [];

            // proxy
            middlewares.push(
              require('grunt-connect-proxy/lib/utils').proxyRequest);

            // debug script loader
            middlewares.push(function(req, res, next) {
              var parts = url.parse(req.url);
              if (parts.pathname.endsWith('/geoserver.min.js')) {
                var template = path.join(__dirname, 'app', 'loader.js');
                fs.readFile(template, 'utf8', function(err, string) {
                  if (err) {
                    return next(err);
                  }
                  var scripts = grunt.file
                      .expand(prefixDeps(standaloneDeps())
                        .concat(sources.js))
                      .map(function(script) {
                        return '/' + script.split(path.sep).join('/');
                      });
                  res.setHeader('content-type', 'application/javascript');
                  var body = 
                    string.replace('{{{ paths }}}', JSON.stringify(scripts));
                  res.end(body, 'utf8');
                });
              } 
              else {
                next();
              }
            });

            // static files.
            options.base.forEach(function(base) {
              middlewares.push(connect.static(base));
            });

            // directory browsable
            var directory = 
              options.directory || options.base[options.base.length - 1];
            middlewares.push(connect.directory(directory));

            return middlewares;
          }
        },
        proxies: [{
          context: '/geoserver/',
          host: config.proxy.host,
          port: config.proxy.port
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      js: sources.js,
      test: sources.tests
    },
    less: {
      build: {
        options: {
          paths: ['build/css']
        },
        cleancss: true,
        files: {
          'build/geoserver.css': [sources.less]
        }
      }
    },
    copy: {
      index: {
        expand: true,
        cwd: 'app/',
        src: 'index.html',
        dest: 'build/'
      },
      assets: {
        files: [{
          expand: true,
          cwd: 'bower_components',
          src: deps.css.concat(deps.font),
          dest: 'build/assets'
        }, {
          expand: true,
          cwd: 'app',
          src: 'images/**/*',
          dest: 'build/'
        }]
      },
      ol: {
        files: [{
          expand: true,
          flatten: true,
          src: prefixDeps(olDeps()),
          dest: 'build/'
        }]
      }
    },
    ngmin: {
      dist: {
        src: sources.js,
        dest: 'build/geoserver.js'
      }
    },
    html2js: {
      all: {
        options: {
          base: 'app',
          module: 'gsApp.templates',
          fileFooterString: 
            'angular.module("gsApp").requires.push("gsApp.templates");',
          rename: function(name) {
            return '/' + name;
          }
        },
        src: sources.tpl,
        dest: 'build/templates.js'
      }
    },
    concat: {
      codemirror: {
        src: prefixDeps(codeMirrorDeps()),
        dest: 'build/codemirror.js'
      },
      debug: {
        src: ['build/geoserver.js', 'build/templates.js'],
        dest: 'build/geoserver.debug.js'
      }
    },
    uglify: {
      codemirror: {
        files: {
          'build/codemirror.min.js': ['build/codemirror.js']
        }
      },
      dist: {
         options: {
          mangle: false
         },
         files: {
            'build/geoserver.min.js': prefixDeps(standaloneDeps())
                .concat('build/geoserver.js', 'build/templates.js')
         }
       }
    },
    watch: {
      index: {
        files: ['app/index.html'],
        tasks: ['copy'],
        options: {
          livereload: true
        }
      },
      less: {
        files: sources.less,
        tasks: ['less'],
        options: {
          livereload: true
        }
      },
      js: {
        files: sources.js,
        //tasks: ['jshint:src', 'karma:dev:run'],
        tasks: ['jshint:js'],
        options: {
          livereload: true
        }
      },
      tpl: {
        files: sources.tpl,
        tasks: ['html2js:all']
      },
      test: {
        files: sources.test,
        //tasks: ['jshint:spec', 'karma:dev:run']
      }
    },
    replace: {
      index: {
         src: ['build/index.html'],
         overwrite: true,
         replacements: [{
          from: /base href=".*"/g,
          to: 'base href="/geoserver/app/"'
         }]
       }
    },
    clean: {
      build: {
        src: 'build/'
      }
    }
  });

  // plugins
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-text-replace');

  // tasks
  grunt.registerTask('build', [
    'copy', 'less', 'ngmin', 'html2js', 'concat', 'uglify']);
  grunt.registerTask('start', [
    'less', 'configureProxies:server','connect', 'watch']);
  grunt.registerTask('dist', ['replace']);
};
