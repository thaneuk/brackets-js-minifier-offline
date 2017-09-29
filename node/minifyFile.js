/*!
 * Copyright (c) 2017 Gregory Jackson. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the 'Software'),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* global define, Promise, DomainManager */

'use strict';

const
    fs = require('fs'),
    path = require('path'),
    childProcess = require('child_process'),
    compilerJar = 'google.closure.compiler/closure-compiler-v20170910.jar',
    WHITE = ' --compilation_level WHITESPACE_ONLY ',
    SIMPLE = ' --compilation_level SIMPLE_OPTIMIZATIONS ',
    ADV = ' --compilation_level ADVANCED_OPTIMIZATIONS ';

let minifierLog = {
    log: [],
    logMinificationSuccess: function (file) {
        this.logMinificationResult(file, true);
    },
    logMinificationFailure: function (file) {
        this.logMinificationResult(file, false);
    },
    logMinificationResult: function (file, result) {
        this.log.push({
            success: result,
            file: file,
            time: Date.now()
        });
    },
    clearMinificationLog: function () {
        minifierLog.log = [];
    },
    returnMinificationLog: function () {
        return minifierLog.log;
    }
};


/**
 * @private
 * Handler function for file minification
 * @param extensionPath {string} path of extension
 * @param filename {string} file name
 * @param [options] {object} file name
 * @param [options.minSuffix] {string} alternative file suffix
 * @param [options.optimizationLevel] {string} change optimization level
 * @return {object}
 */
function minifyFile(extensionPath, filename, options) {
    let filePath,
        fileType,
        basename,
        pathlessFilename,
        newFile,
        newFullName,
        optimizations;

    if (!filename) {
        throw 'Filename to minify required.';
    }

    options = options || {};
    options.minSuffix = options.minSuffix || 'min';

    filePath = path.dirname(filename);
    fileType = path.win32.extname(filename);
    basename = path.basename(filename, fileType);
    pathlessFilename = basename + fileType;

    switch (options.optimizationLevel) {
        case 'adv':
            optimizations = ADV;
            break;
        case 'white':
            optimizations = WHITE;
            break;
        default:
            optimizations = SIMPLE;
    }

    optimizations = SIMPLE;

    if (options.optimizationLevel === 'adv') {
        optimizations = ADV;
    } else if (options.optimizationLevel === 'white') {
        optimizations = WHITE;
    }

    if (['.js', '.js.erb', '.jsm', '._js'].includes(fileType)) {

        fs.access(filename, fs.constants.R_OK, (err) => {
            if (!err) {

                newFile = `${basename}.${(options.minSuffix || 'min')}${fileType}`;
                newFullName = `${filePath}${path.sep}${newFile}`;

                deleteFileSync(newFullName);

                childProcess.exec(`java -jar "${extensionPath}${compilerJar}" ${optimizations} --js "${filename}" --js_output_file "${newFullName}"`, {
                    timeout: 5000
                }, error => {
                    if (!error) {
                        if (fs.existsSync(newFullName)) {
                            console.log(`${newFullName} created successfully.`);
                            minifierLog.logMinificationSuccess(pathlessFilename);
                        }
                    } else {
                        console.error(`minifyFile:exec error: ${error}`);
                        minifierLog.logMinificationFailure(pathlessFilename);
                    }
                });

            }
        });

        return {
            error: false,
        };

    } else {
        return {error: true, message: `${pathlessFilename} does not have a recognised file suffix.`};
    }
}

function deleteFileSync(file) {
    try {
        return fs.unlinkSync(file);
    } catch (e) {
        /* if file doesn't exist an error will be thrown */
    }
}


/**
 * @param {DomainManager} domainManager The DomainManager for the server
 */
function init(domainManager) {
    if (!domainManager.hasDomain('minifier')) {
        domainManager.registerDomain('minifier', {major: 0, minor: 1});
    }

    domainManager.registerCommand(
        'minifier',
        'minifyFile',
        minifyFile,
        false,
        'function for file minification',
        [{
            name: 'extensionPath',
            type: 'string'
        }, {
            name: 'filename',
            type: 'string'
        }, {
            name: 'options',
            type: 'string'
        }],
        [{
            name: 'object',
            type: 'object'
        }]
    );

    domainManager.registerCommand(
        'minifier',
        'returnMinificationLog',
        minifierLog.returnMinificationLog,
        false,
        'function to return the log of minification activity',
        [],
        [{
            name: 'object',
            type: 'object'
        }]
    );

    domainManager.registerCommand(
        'minifier',
        'clearMinificationLog',
        minifierLog.clearMinificationLog,
        false,
        'function to clear log of minification activity',
        [],
        []
    );
}

exports.init = init;
