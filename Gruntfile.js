module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      slatebox: {
        src: [
          'lib/client/Slatebox.js'
          , 'lib/client/Slatebox.slate.js'
          , 'lib/client/Slatebox.node.js'
          , 'lib/client/slate/Slatebox.slate.birdseye.js'
          , 'lib/client/slate/Slatebox.slate.canvas.js'
          , 'lib/client/slate/Slatebox.slate.keyboard.js'
          , 'lib/client/slate/Slatebox.slate.message.js'
          , 'lib/client/slate/Slatebox.slate.collab.js'
          , 'lib/client/slate/Slatebox.slate.multiselection.js'
          , 'lib/client/slate/Slatebox.slate.nodes.js'
          , 'lib/client/slate/Slatebox.slate.zoomSlider.js'
          , 'lib/client/node/Slatebox.node.colorpicker.js'
          , 'lib/client/node/Slatebox.node.connectors.js'
          , 'lib/client/node/Slatebox.node.context.js'
          , 'lib/client/node/Slatebox.node.editor.js'
          , 'lib/client/node/Slatebox.node.images.js'
          , 'lib/client/node/Slatebox.node.links.js'
          , 'lib/client/node/Slatebox.node.menu.js'
          , 'lib/client/node/Slatebox.node.relationships.js'
          , 'lib/client/node/Slatebox.node.resize.js'
          , 'lib/client/node/Slatebox.node.shapes.js'
          , 'lib/client/node/Slatebox.node.template.js'
          , 'lib/client/node/Slatebox.node.toolbar.js'

          , 'lib/client/raphael/raphael.js'
          , 'lib/client/raphael/raphael.fn.objects.js'
          , 'lib/client/raphael/raphael.fn.connection.js'
          , 'lib/client/raphael/raphael.el.tooltip.js'
          , 'lib/client/raphael/raphael.el.style.js'
          , 'lib/client/raphael/raphael.el.loop.js'
          , 'lib/client/raphael/raphael.button.js'

          , 'lib/client/emile/emile.js'

          , 'lib/client/notify.js'
          , 'lib/client/spinner.js'
        ]
        , dest: 'assets/slatebox-<%= pkg.version %>.js'
      }
    }
    , uglify: {
        options: {
          banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> <%= pkg.version %>\n" +
              "http://dev.slatebox.com\n" +
              "(c) 2009-2013 Tim Heckel, Slatebox LLC\n" +
              "Slatebox.js may be freely distributed under the MIT license.\n\n" +

              "Raphael 2.1.0 - JavaScript Vector Library\n" +
              "Copyright ? 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)\n" +
              "Copyright ? 2008-2012 Sencha Labs (http://sencha.com)\n" +
              "Licensed under the MIT (http://raphaeljs.com/license.html) license.\n\n" +

              "Eve 0.3.4 - JavaScript Events Library\n" +
              "Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)\n" +
              "Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.\n\n" +

              "emile.js (c) 2009 Thomas Fuchs\n" +
              "Licensed under the terms of the MIT license. */\n\n\n"
        },
        build: {
          src: 'assets/slatebox-<%= pkg.version %>.js',
          dest: 'assets/slatebox-<%= pkg.version %>.min.js'
        }
    }
    , compress: {
      main: {
        options: {
          mode: 'gzip'
        }
        , files: [{src: 'assets/slatebox-<%= pkg.version %>.min.js', dest: 'assets/gzipped/slatebox.min.js.gz'}]
      }
    }
    , rename: {
        moveThis: {
            src: 'assets/gzipped/slatebox.min.js.gz'
            , dest: 'assets/gzipped/slatebox.min.js'
        }
    }
    , copy: {
        main: {
            files: [
              { src: 'assets/slatebox-<%= pkg.version %>.js', dest: '/home/tim/Projects/slateboxdocs/client/lib/slatebox-<%= pkg.version %>.js' }
            ]
        }
    }
    , s3: {
        options: {
          key: 'KEY_HERE',
          secret: 'SECRET_HERE',
          bucket: 'slatebox',
          access: 'public-read'
        }
        , dev: {
          upload: [{
            src: 'assets/gzipped/slatebox.min.js',
            dest: 'slatebox.min.js'
          }]
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-s3');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'compress', 'rename', 'copy']); //, 's3'

};