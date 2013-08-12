var fs = require('fs');
var ugly = require('uglify-js');

var writeToFile = function( code, path ){
  var out = fs.openSync( path , 'w+');
  fs.writeSync( out, code );
  fs.closeSync( out );
};

// READ VERSION
var projectData = JSON.parse(fs.readFileSync("package.json").toString());

// META
var libFile = "lib/jsFlow.js";
var libFileFactory = "lib/factories.js";
var fileCore 		= "dist/jsFlow_core_"+projectData.version+".js";
var fileCoreMin = "dist/jsFlow_core_"+projectData.version+"_min.js";
var fileFull 		= "dist/jsFlow_full_"+projectData.version+".js";
var fileFullMin = "dist/jsFlow_full_"+projectData.version+"_min.js";

// READ CODE
var codeCore = fs.readFileSync(libFile).toString();
var codeFull = codeCore + "\n" + fs.readFileSync(libFileFactory).toString();

// WRITE LIB
writeToFile( codeCore, fileCore );
writeToFile( codeFull, fileFull );            
writeToFile( ugly.minify( fileCore ).code,  fileCoreMin);
writeToFile( ugly.minify( fileFull ).code,  fileFullMin);