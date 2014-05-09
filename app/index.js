//'use strict';


// Requirements
var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    yeoman = require('yeoman-generator'),
    wrench = require('wrench'),
    chalk = require('chalk'),
    mkdirp = require('mkdirp'),
    codeigniter = require('../util/codeigniter'),
    splash = require('../util/splash'),
    Logger = require('../util/log'),
    Config = require('../util/config');



// Export the module
module.exports = Generator;

// Extend the base generator
function Generator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);



    // setup the test-framework property, Gruntfile template will need this
    this.testFramework = options['test-framework'] || 'mocha';
    this.coffee = options.coffee;

    // for hooks to resolve on mocha by default
    options['test-framework'] = this.testFramework;

    // resolved to mocha by default (could be switched to jasmine for instance)
    this.hookFor('test-framework', {
        as: 'app',
        options: {
            options: {
                'skip-install': options['skip-install-message'],
                'skip-message': options['skip-install']
            }
        }
    });

    // Log level option
    this.option('log', {
        desc: 'The log verbosity level: [ verbose | log | warn | error ]',
        defaults: 'log',
        alias: 'l',
        name: 'level'
    });

    // Enable advanced features
    this.option('advanced', {
        desc: 'Makes advanced features available',
        alias: 'a'
    });


    // Shortcut for --log=verbose
    this.option('verbose', {
        desc: 'Verbose logging',
        alias: 'v'
    });
    if (this.options.verbose) {
        this.options.log = 'verbose';
    }

    // Setup the logger
    this.logger = Logger({
        level: this.options.log
    });

    // Log the options
    try {
        this.logger.verbose('\nOptions: ' + JSON.stringify(this.options, null, '  '));
    } catch (e) {
        // This is here because when a generator is run by selecting it after running `yo`,
        // the options is a circular data structure, causing an error when converting to json.
        // Verbose cannot be called this way, so there is no need to log anything.
    }

    // Load the config files
    this.conf = new Config();

    //this.options = options;

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};


util.inherits(Generator, yeoman.generators.Base);


Generator.prototype.whatCanYoemanDoForYou = function() {

    var done = this.async(),
        me = this;

    // welcome message
    this.logger.log(splash.rci, {
        logPrefix: ''
    });

    getInput();

    function getInput() {
        me.prompt(require('./prompts')(me.options.advanced, me.conf.get()), function(input) {
            me.prompt([{
                message: 'Does this all look correct?',
                name: 'confirm',
                type: 'confirm'
            }], function(i) {
                if (i.confirm) {


                    me.logger.log('Installing CodeIgniter now...');

                    //Place user defined CodeIgniter directory in the app folder
                    //ToDo: create gloabl variable and set this in the Util/CodeIgniter file
                    //input.ciDir = 'app/' + input.ciDir

                    //Get CodeIgniter files
                    //ToDo: pull down from the interwebs
                    codeigniter.installCodeIgniter(me, input);


                    var features = input.features;

                    function hasFeature(feat) {
                        return features.indexOf(feat) !== -1;
                    }

                    //ToDo: automate this based on what's being promted
                    me.assetsDir = input.assetsDir;
                    me.includeCompass = hasFeature('includeCompass');
                    me.includeBootstrap = hasFeature('includeBootstrap');
                    me.includeFontAwesome = hasFeature('includeFontAwesome');
                    me.includeModernizr = hasFeature('includeModernizr');


                    // Save the users input
                    me.conf.set(input);

                    me.logger.verbose('User Input: ' + JSON.stringify(me.conf.get(), null, '  '));
                    me.logger.log(splash.go, {
                        logPrefix: ''
                    });
                    done();

                    me.logger.log('YO, CodeIgniter is now installed!');

                } else {
                   
                    getInput();
                }
            });
        });
    }
};

// Save settings to .restful-ci file
Generator.prototype.saveDaMoFoSettings = function() {
    this.logger.log('Writing .restful-ci file');
    fs.writeFileSync('.restful-ci', JSON.stringify(this.conf.get(), null, '\t'));
};

Generator.prototype.getMaGruntfile = function() {
    this.template('Gruntfile.js');
};

Generator.prototype.andMyPackage = function() {
    this.template('_package.json', 'package.json');
};

Generator.prototype.alsoGetGit = function() {
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
};

Generator.prototype.bowDownTOBower = function() {
    this.copy('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
};

Generator.prototype.jshintDatShit = function() {
    this.copy('jshintrc', '.jshintrc');
};

Generator.prototype.editorConfig = function() {
    this.copy('editorconfig', '.editorconfig');
};


Generator.prototype.h5bp = function() {
    this.copy('favicon.ico', 'app/favicon.ico');
    this.copy('404.html', 'app/404.html');
    this.copy('robots.txt', 'app/robots.txt');
    this.copy('htaccess', 'app/.htaccess');
};

Generator.prototype.createIndexFile = function() {

    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
    this.indexFile = this.engine(this.indexFile, this);

    // wire Bootstrap plugins
    if (this.includeBootstrap) {
        var bs = 'bower_components/bootstrap' + (this.includeCompass ? '-sass-official/vendor/assets/javascripts/bootstrap/' : '/js/');
        this.indexFile = this.appendScripts(this.indexFile, this.assetsDir + '/scripts/plugins.js', [
            bs + 'affix.js',
            bs + 'alert.js',
            bs + 'dropdown.js',
            bs + 'tooltip.js',
            bs + 'modal.js',
            bs + 'transition.js',
            bs + 'button.js',
            bs + 'popover.js',
            bs + 'carousel.js',
            bs + 'scrollspy.js',
            bs + 'collapse.js',
            bs + 'tab.js'
        ]);
    }

    this.indexFile = this.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: this.assetsDir + '/scripts/main.js',
        sourceFileList: [this.assetsDir + '/scripts/main.js'],
        searchPath: '{app,.tmp}'
    });
};

Generator.prototype.mainStylesheet = function() {
    var css = 'main.' + (this.includeCompass ? 's' : '') + 'css';
    this.copy(css, 'app/'+this.assetsDir+'/styles/' + css);
};

Generator.prototype.app = function() {

    this.mkdir('app');
    this.mkdir('app/' + this.assetsDir);

    this.mkdir('app/'+this.assetsDir+'/scripts');
    this.mkdir('app/'+this.assetsDir+'/styles');
    this.mkdir('app/'+this.assetsDir+'/images');

    //this.copy('yo-restful-ci.png', 'app/'+this.assetsDir+'/images/yo-restful-ci.png');

    

    this.write('app/index.html', this.indexFile);

    if (this.coffee) {
        this.write(
            'app/'+this.assetsDir+'/scripts/main.coffee',
            'console.log "\'Allo from CoffeeScript!"'
        );
    } else {
        this.write('app/'+this.assetsDir+'/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
    }
};

Generator.prototype.install = function() {
    if (this.options['skip-install']) {
        return;
    }

    var done = this.async();
    this.installDependencies({
        skipMessage: this.options['skip-install-message'],
        skipInstall: this.options['skip-install'],
        callback: done
    });
};



// All done
Generator.prototype.aboutDamnTime = function() {
    this.logger.log(chalk.bold.green('\nAll Done!!\n------------------------\n'), {
        logPrefix: ''
    });
    this.logger.log('I tried my best to set things up, but I\'m only human right? **wink wink**\nSo, you should probably check your `config.php` to make sure all the settings work on your environment.', {
        logPrefix: ''
    });
};