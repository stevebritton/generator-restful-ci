var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    chalk = require('chalk'),
    exec = require('child_process').exec,
    EventEmitter = require('events').EventEmitter,
    codeigniterRepo = "git://github.com/EllisLab/CodeIgniter.git",
    codeigniterDownload = "http://ellislab.com/codeigniter/download.zip";




//ToDo: pull this down from the interwebs
function installCodeIgniter(generator, config) {

    var done = generator.async(),
        cdDirectory = 'app/' + config.ciDir;

    generator.directory('codeigniter/application', cdDirectory + '/application');
    generator.directory('codeigniter/system', cdDirectory + '/system');
    generator.copy('codeigniter/index.php', cdDirectory + '/index.php');

    done();

};



module.exports = {
    installCodeIgniter: installCodeIgniter,
};