var fs = require('fs');
var ugly = require('uglify-js');

var writeToFile = function( code, path ){
  var out = fs.openSync( path , 'w+');
  fs.writeSync( out, code );
  fs.closeSync( out );
};

var libFile = "lib/jsFlow.js";

// READ VERSION
var projectData = JSON.parse(fs.readFileSync("package.json").toString());

// WRITE LIB
writeToFile( fs.readFileSync(libFile).toString(), 
             "dist/jsFlow_"+projectData.version+".js");
             
// WRITE MINIFIED LIB
writeToFile( ugly.minify(libFile).code,  
             "dist/jsFlow_"+projectData.version+"_min.js");