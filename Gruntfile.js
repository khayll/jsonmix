module.exports = function(grunt) {
  grunt.initConfig({
    jasmine : {
      src : 'src/**/*.js',
      options: {
        specs : 'test/**/*.spec.js',
        helpers : 'test/helpers/*.js'
      }
    }
  });

  // Register tasks.
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask('default', 'jasmine');
  grunt.registerTask('test', ['jasmine']);
};
