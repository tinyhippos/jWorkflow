module.exports = function(grunt) {

	var VERSION = "0-9-0";
	
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
          'dist/isMobile_'+VERSION+'_min.js': ['lib/jsFlow.js']
        }
      }
    }

  });

	grunt.loadNpmTasks('grunt-qunit-minimalist');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify', 'qunit-minimalist']);

};