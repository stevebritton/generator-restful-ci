module.exports = function(advanced, defaults) {

    // Validate required
    var requiredValidate = function(value) {
        if (value == '') {
            return 'This field is required.';
        }
        return true;
    };
    // When advanced
    var advancedWhen = function() {
        return advanced;
    };

    return [

        {
            message: 'What shall we name your Codeigniter install directory?',
            name: 'ciDir',
            default: defaults.ciDir || 'codeigniter',
            validate: requiredValidate,
        },

        {
            type: 'checkbox',
            name: 'features',
            message: 'What more would you like?',
            choices: [{
                name: 'Bootstrap',
                value: 'includeBootstrap',
                checked: true
            }, {
                name: 'Font Awesome',
                value: 'includeFontAwesome',
                checked: true
            }, {
                name: 'Modernizr',
                value: 'includeModernizr',
                checked: false
            }, {
                name: 'Sass with Compass',
                value: 'includeCompass',
                checked: false
            }, ]
        },
    ]
};