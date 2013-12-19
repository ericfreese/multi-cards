module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

  grunt.initConfig({
    watch: {
      browserify: {
        files: ['src/client/**/*', 'src/lib/**/*'],
        tasks: ['browserify:dev']
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    nodemon: {
      dev: {
        options: {
          file: './src/server/main.js'
        }
      }
    },

    browserify: {
      dev: {
        files: {
          'src/static/client.js': [ 'src/client/client.js' ],
        },
        options: {
          debug: true
        }
      }
    }
  });

  grunt.registerTask('dev', [
    'browserify:dev',
    'concurrent:dev'
  ]);
};
