/***@@@ BEGIN LICENSE @@@***/
/*───────────────────────────────────────────────────────────────────────────*\
│  Copyright (C) 2013 eBay Software Foundation                                │
│                                                                             │
│hh ,'""`.                                                                    │
│  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
│  |(@)(@)|  you may not use this file except in compliance with the License. │
│  )  __  (  You may obtain a copy of the License at                          │
│ /,'))((`.\                                                                  │
│(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
│ `\ `)(' /'                                                                  │
│                                                                             │
│   Unless required by applicable law or agreed to in writing, software       │
│   distributed under the License is distributed on an "AS IS" BASIS,         │
│   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
│   See the License for the specific language governing permissions and       │
│   limitations under the License.                                            │
\*───────────────────────────────────────────────────────────────────────────*/
/***@@@ END LICENSE @@@***/
'use strict';


var util = require('util'),
    path = require('path'),
    crypto = require('crypto'),
    yeoman = require('yeoman-generator'),
    kraken = require('../lib/kraken'),
    dependencies = require('./dependencies');


var Generator = module.exports = function Generator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    kraken.banner();

    this.hookFor('kraken:page', {
        args: ['index'].concat(args),
        options: {
            options: {
                json: false
            }
        }
    });

    this.on('end', function () {
        var that = this;

        this.installDependencies({
            skipInstall: options['skip-install'],
            callback: function () {
                that.bowerInstall(that.bowerDependencies, { save: true });
                that.npmInstall(that.npmDevDependencies, { saveDev: true});
                that.npmInstall(that.npmDependencies, {save: true});
            }
        });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
    this.bowerDependencies = [];
    this.npmDependencies = [];
    this.npmDevDependencies = [];
    this.secretHash = crypto.randomBytes(20).toString('hex');
};


util.inherits(Generator, yeoman.generators.Base);


Generator.prototype.askFor = function askFor() {
    var prompts = [],
        callback = this.async();

    // Config prompts
    prompts.push({
        name: 'appName',
        message: 'Application name'
    });

    prompts.push({
        name: 'appDescription',
        message: 'Description'
    });

    prompts.push({
        name: 'appAuthor',
        message: 'Author'
    });

    prompts.push({
        type: 'confirm',
        name: 'requireJs',
        message: 'Use RequireJS?',
        default: true
    });

    prompts.push({
        type: 'list',
        name: 'cssFramework',
        message: "CSS Framework",
        choices: ['LESS', 'SASS'],
        default: 0
    });

    this.prompt(prompts, function (props) {
        this.appName = props.appName;
        this.appDescription = JSON.stringify( props.appDescription );
        this.appAuthor = JSON.stringify( props.appAuthor );
        
        // Load cssFramework information from dependencies.js
        this.cssFramework = dependencies[props.cssFramework];
        // Set the choice to true; e.g this.cssFramework.LESS = true
        this.cssFramework[props.cssFramework] = true;

        if ((this.requireJs = props.requireJs)) {
            this.bowerDependencies.push('requirejs');
            this.npmDevDependencies.push('grunt-contrib-requirejs');
        }

        this.npmDependencies.push(this.cssFramework.dependency);
        this.npmDevDependencies.push(this.cssFramework.gruntTask);

        callback();
    }.bind(this));
};

Generator.prototype.app = function app() {
    var appName = this.appName;

    this.mkdir(appName);
    process.chdir(appName);

    // Base directory structure
    this.mkdir('config');
    this.mkdir('controllers');
    this.mkdir('lib');
    this.mkdir('models');
    this.mkdir('public/css');
    this.mkdir('public/js');
    this.mkdir('public/templates');

    // Template files
    this.template('_README.md', 'README.md');
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('config/_app.json', 'config/app.json');
    this.template('config/_middleware.json', 'config/middleware.json');

};

Generator.prototype.projectfiles = function projectfiles() {
    this.copy('index.js', 'index.js');
    this.copy('gitignore', '.gitignore');
    this.copy('nodemonignore', '.nodemonignore');
    this.copy('jshintignore', '.jshintignore');
    this.copy('jshintrc', '.jshintrc');
    this.copy('editorconfig', '.editorconfig');
    this.copy('bowerrc', '.bowerrc');
    
    this.template('_Gruntfile.js', 'Gruntfile.js');

    this.template('public/css/_app.style', 'public/css/app.' + this.cssFramework.ext);

    this.template('public/js/_app.js', 'public/js/app.js');

    if (this.requireJs) {
        this.copy('public/js/config.js', 'public/js/config.js');
    }

    this.copy('public/js/jshintignore', 'public/js/.jshintignore');
    this.copy('public/js/jshintrc', 'public/js/.jshintrc');

    this.template('public/templates/layouts/_master.dust', 'public/templates/layouts/master.dust');
};
