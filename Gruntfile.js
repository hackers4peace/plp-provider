module.exports = function(grunt){

  grunt.initConfig({
    develop: {
      daemon: {
        file: 'daemon.js'
      }
    },
    watch: {
      daemon: {
        files: ['daemon.js'],
        tasks: ['develop'],
        options: {
          spawn: false
        }
      },
      test: {
        files: ['test/**/*.js'],
        tasks: ['mochaTest']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['develop', 'watch']);

};
