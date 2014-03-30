'use strict';
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');




var CodeigniterGenerator = module.exports = function CodeigniterGenerator(args, options, config) {
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

    this.options = options;

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};


util.inherits(CodeigniterGenerator, yeoman.generators.Base);

CodeigniterGenerator.prototype.askFor = function askFor() {

    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
        this.log(this.yeoman);
        this.log(chalk.magenta('You\'re using the fantastic Codeigniter generator. Out of the box I include Codeigniter, jQuery, and a Gruntfile.js to build your app.'));
    }


    var prompts = [{
        type: 'checkbox',
        name: 'features',
        message: 'What more would you like?',
        choices: [{
            name: 'Bootstrap',
            value: 'includeBootstrap',
            checked: true
        }, {
            name: 'Sass with Compass',
            value: 'includeCompass',
            checked: false
        }, {
            name: 'Modernizr',
            value: 'includeModernizr',
            checked: false
        }]
    }];

    this.prompt(prompts, function(answers) {
        var features = answers.features;

        function hasFeature(feat) {
            return features.indexOf(feat) !== -1;
        }

        this.includeCompass = hasFeature('includeCompass');
        this.includeBootstrap = hasFeature('includeBootstrap');
        this.includeModernizr = hasFeature('includeModernizr');

        done();
    }.bind(this));


};


CodeigniterGenerator.prototype.gruntfile = function gruntfile() {
    this.template('Gruntfile.js');
};

CodeigniterGenerator.prototype.packageJSON = function packageJSON() {
    this.template('_package.json', 'package.json');
};

CodeigniterGenerator.prototype.git = function git() {
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
};

CodeigniterGenerator.prototype.bower = function bower() {
    this.copy('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
};

CodeigniterGenerator.prototype.jshint = function jshint() {
    this.copy('jshintrc', '.jshintrc');
};

CodeigniterGenerator.prototype.editorConfig = function editorConfig() {
    this.copy('editorconfig', '.editorconfig');
};

CodeigniterGenerator.prototype.h5bp = function h5bp() {
    this.copy('favicon.ico', 'app/favicon.ico');
    this.copy('404.html', 'app/404.html');
    this.copy('robots.txt', 'app/robots.txt');
    this.copy('htaccess', 'app/.htaccess');
};

CodeigniterGenerator.prototype.Codeigniter = function Codeigniter() {
    this.directory('codeigniter/application', 'app/application');
    this.directory('codeigniter/system', 'app/system');
    this.copy('codeigniter/index.php', 'app/index.php');
};

CodeigniterGenerator.prototype.mainStylesheet = function mainStylesheet() {
    var css = 'main.' + (this.includeCompass ? 's' : '') + 'css';
    this.copy(css, '/app/web/styles/' + css);
};

CodeigniterGenerator.prototype.writeIndex = function writeIndex() {

    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
    this.indexFile = this.engine(this.indexFile, this);

    // wire Bootstrap plugins
    if (this.includeBootstrap) {
        var bs = '<?php echo(base_url) ?>/bower_components/bootstrap' + (this.includeCompass ? '-sass-official/vendor/assets/javascripts/bootstrap/' : '/js/');
        this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
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
        optimizedPath: 'web/scripts/main.js',
        sourceFileList: ['web/scripts/main.js'],
        searchPath: '{app,.tmp}'
    });
};


CodeigniterGenerator.prototype.app = function app() {

    this.mkdir('app');
    this.mkdir('app/web');

    this.mkdir('app/web/scripts');
    this.mkdir('app/web/styles');
    this.mkdir('app/web/images');

    this.write('app/application/views/index.php', this.indexFile);

    if (this.coffee) {
        this.write(
            'app/scripts/main.coffee',
            'console.log "\'Allo from CoffeeScript!"'
        );
    } else {
        this.write('app/web/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
    }
};

CodeigniterGenerator.prototype.install = function() {
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