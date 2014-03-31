/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;

describe('restful-ci generator', function() {
    beforeEach(function(done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('restful-ci:app', [
                '../../app', [
                helpers.createDummyGenerator(),
                'mocha:app'
                ]

            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function(done) {
        var expected = [
            // add files you expect to exist here.
            '.jshintrc',
            '.editorconfig'
        ];

        helpers.mockPrompt(this.app, {
            features: ['includeCompass']
        });
        this.app.options['skip-install'] = true;
        this.app.run({}, function() {
            helpers.assertFile(expected);
            done();
        });
    });
});