#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = "web.html";
var DEFAULT_URL = ""

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var checkURL = function(url_input) {
    DEFAULT_URL = url_input;
};

var response = function(result, response) {
    if (result instanceof Error) {
	console.error('Error: ' + util.format(result.message));
	} else {
	    fs.writeFileSync('web.html', result);
	    var checkJson = checkHtmlFile('web.html', DEFAULT_CHECK);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
       }
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('f, --file', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_file>', 'Path to url', clone(checkURL))
        .parse(process.argv);
    var argvs = JSON.stringify(process.argv, null, 4);
    if (argvs.indexOf("-u") == -1) {
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}
 else {
     var DEFAULT_CHECK = program.checks;
    rest.get(DEFAULT_URL).on('complete', response)
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

