module.exports = function(grunt){
  grunt.initConfig({

    execute: {
        target: {
            src: ['app.js']
        }
    },

    // Builds Sass
    sass: {
      dev: {
        files: {
          'public/stylesheets/application.css': 'public/sass/application.scss',
          'public/stylesheets/examples.css': 'public/sass/examples.scss'
        },
        options: {
          includePaths: ['govuk/public/sass'],
          outputStyle: 'expanded'
        }
      }
    },

    // Copies templates and assets from external modules and dirs
    copy: {

      govuk_template: {
        src: 'node_modules/govuk_template_mustache/views/layouts/govuk_template.html',
        dest: 'govuk/views/',
        expand: true,
        flatten: true,
        filter: 'isFile'
      },

      govuk_assets: {
        files: [
          {
            expand: true,
            src: '**',
            cwd: 'node_modules/govuk_template_mustache/assets',
            dest: 'govuk/public/'
          }
        ]
      },

      govuk_frontend_toolkit: {
        expand: true,
        src: '**',
        cwd: 'node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/stylesheets/',
        dest: 'govuk/public/sass/'
      },

      govuk_frontend_toolkit_assets: {
        expand: true,
        src: '**',
        cwd: 'node_modules/govuk_frontend_toolkit/govuk_frontend_toolkit/images/',
        dest: 'govuk/public/images/icons/'
      },

    },

    // workaround for libsass
    replace: {
      fixSass: {
        src: ['govuk/public/sass/**/*.scss'],
        overwrite: true,
        replacements: [{
          from: /filter:chroma(.*);/g,
          to: 'filter:unquote("chroma$1");'
        }]
      }
    },

    // Watches styles and specs for changes
    watch: {
      css: {
        files: ['public/sass/**/*.scss'],
        tasks: ['sass'],
        options: { nospawn: true }
      }
    },

/*
    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ext: 'html, js'
        }
      }
    },

*/
    concurrent: {
        target: {
            tasks: ['watch', 'execute'],
            options: {
                logConcurrentOutput: true
            }
        }
    }
  });
  [
    'grunt-contrib-copy',
    'grunt-contrib-watch',
    'grunt-sass',
    'grunt-execute',
    // 'grunt-nodemon',
    'grunt-text-replace',
    'grunt-concurrent'
  ].forEach(function (task) {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask(
    'convert_template',
    'Converts the govuk_template to use mustache inheritance',
    function () {
      var script = require(__dirname + '/lib/template-conversion.js');

      script.convert();
      grunt.log.writeln('govuk_template converted');
    }
  );

  grunt.registerTask('default', [
    'copy:govuk_template',
    'copy:govuk_assets',
    'convert_template',
    'copy:govuk_frontend_toolkit',
    'copy:govuk_frontend_toolkit_assets',
    'replace',
    'sass',
    'concurrent:target'
  ]);
};
