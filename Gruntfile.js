module.exports = function(grunt) {

  grunt.initConfig({
    	
		qunit-minimalist: {
        options: {
            parameters: 'noglobals=true',
            phantomOptions: {
                '--web-security': false
            }
        },
        all: {
            src: [path.join('test', 'test.html')]
        }
    }
		
    uglify: {
      my_target: {
        files: {
          'dist/isMobile_0-9-0_min.js': ['lib/jsFlow.js']
        }
      }
    }

  });

	grunt.loadNpmTasks('grunt-qunit-minimalist');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify', 'qunit-minimalist']);

};