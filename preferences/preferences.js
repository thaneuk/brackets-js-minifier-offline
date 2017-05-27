/*!
 * Copyright (c) 2017 Gregory Jackson. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*global define, brackets */

define(function (require, exports, module) {
    'use strict';

    const
        PreferencesManager = brackets.getModule('preferences/PreferencesManager'),
        preferences = PreferencesManager.getExtensionPrefs('js-minifier-offline-google-closure');

    /* this will set defaults */
    preferences.definePreference('optimization-level', 'string', 'simple');
    preferences.definePreference('minify-on-save', 'boolean', false);
    preferences.save();


    let pref = {};

    Object.defineProperties(pref, {
        optimizationLevel: {
            get: () => preferences.get('optimization-level'),
            set: level => {
                switch (level) {
                    case 'advanced':
                        preferences.set('optimization-level', 'advanced');
                        break;
                    case 'white':
                        preferences.set('optimization-level', 'white');
                        break;
                    default:
                        preferences.set('optimization-level', 'simple')
                }
                preferences.save();
            },
            enumerable: true
        },
        minifyOnSave: {
            get: () => preferences.get('minify-on-save'),
            set: minOnSave => {
                preferences.set('minify-on-save', !!minOnSave);
                preferences.save();
            },
            enumerable: true
        }
    });

    module.exports = pref;

});
