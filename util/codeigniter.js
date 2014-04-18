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

    var done = generator.async();

    generator.directory('codeigniter/application', config.ciDir + '/application');
    generator.directory('codeigniter/system', config.ciDir + '/system');
    generator.copy('codeigniter/index.php', config.ciDir + '/index.php');

    done();

};



module.exports = {
    installCodeIgniter: installCodeIgniter,
};