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
/*global describe, beforeEach, it*/

'use strict';


var generator = require('./util/generator'),
    helpers = require('yeoman-generator').test,
    assert = require('assert');


describe('App', function () {
    var dependencies = [
            '../../app',
            '../../controller',
            '../../locale',
            '../../model',
            '../../page',
            '../../template'
        ],
        prompt;

    beforeEach(function () {
        prompt = {
            appName: 'Awesomeness',
            appDescription: 'Check out my new awesome app!',
            appAuthor: 'Me',
            requireJs: false,
            cssFramework: 'LESS'
        };
    });


    it('creates dot files', function (done) {
        generator('app', dependencies, [], prompt, function () {
            helpers.assertFiles([
                '.bowerrc',
                '.editorconfig',
                '.gitignore',
                '.jshintignore',
                '.jshintrc',
                '.nodemonignore'
            ]);

            done();
        });
    });


    it('creates project files with LESS CSS Framework', function (done) {
        generator('app', dependencies, [], prompt, function (app) {
            helpers.assertFiles([
                'Gruntfile.js',
                'README.md',
                'bower.json',
                'index.js',
                'package.json',
                'config/app.json',
                'config/middleware.json',
                'controllers/index.js',
                'locales/US/en/index.properties',
                'models/index.js',
                'public/css/app.less',
                'public/js/app.js',
                'public/templates/index.dust',
                'public/templates/layouts/master.dust'
            ]);

            helpers.assertFile('Gruntfile.js', /app\.less/g);
            helpers.assertFile('Gruntfile.js', /'jshint', 'less',/g);
            
            helpers.assertFile('config/middleware.json', /"less": "css"/g);
            helpers.assertFile('config/middleware.json', /"sass": false/g);

            assert(app.npmDependencies[0] === 'less');
            assert(app.npmDevDependencies[0] === 'grunt-contrib-less');

            done();
        });
    });

    it('creates project files with SASS CSS Framework', function (done) {
        prompt.cssFramework = 'SASS';

        generator('app', dependencies, [], prompt, function (app) {
            helpers.assertFiles([
                'Gruntfile.js',
                'README.md',
                'bower.json',
                'index.js',
                'package.json',
                'config/app.json',
                'config/middleware.json',
                'controllers/index.js',
                'locales/US/en/index.properties',
                'models/index.js',
                'public/css/app.scss',
                'public/js/app.js',
                'public/templates/index.dust',
                'public/templates/layouts/master.dust'
            ]);

            helpers.assertFile('Gruntfile.js', /app\.scss/g);
            helpers.assertFile('Gruntfile.js', /'jshint', 'sass',/g);
            
            helpers.assertFile('config/middleware.json', /"sass": "css"/g);
            helpers.assertFile('config/middleware.json', /"less": false/g);

            assert(app.npmDependencies[0] === 'node-sass');
            assert(app.npmDevDependencies[0] === 'grunt-contrib-sass');

            done();
        });
    });


    it('creates an app bootstrapped with RequireJS', function (done) {
        prompt.requireJs = true;

        generator('app', dependencies, [], prompt, function () {
            helpers.assertFiles([
                ['public/templates/layouts/master.dust', /require\.js/],
                ['public/js/app.js', /require\(/],
                'public/js/config.js'
            ]);

            done();
        });
    });
});
