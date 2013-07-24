module.exports = function(grunt) {
	
	var VERSION = "0-9-0";
	
	var uglyFiles = {};
	uglyFiles['dist/isMobile_'+VERSION+'_min.js'] = [ 'dist/jsFlow_'+VERSION+'.js' ];
	
	var cfg = {
    
    copy: {
  		main: {
   		  files: [
					{src: ['lib/jsFlow.js'], dest: 'dist/jsFlow_'+VERSION+'.js', filter: 'isFile' }
				]
			}
		},
    
		'qunit-minimalist': {
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
        files: uglyFiles
      }
    }

  };

  grunt.initConfig( cfg );

  grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-qunit-minimalist');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify', 'qunit-minimalist']);

};