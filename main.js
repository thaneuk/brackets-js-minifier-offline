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

/*global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    const
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ProjectManager = brackets.getModule('project/ProjectManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        NodeDomain = brackets.getModule('utils/NodeDomain'),
        Strings = require('strings'),
        extensionPath = ExtensionUtils.getModulePath(module),
        preferences = require('preferences/preferences'),
        minifier = new NodeDomain('minifier', ExtensionUtils.getModulePath(module, 'node/minifyFile')),

        CommandManager = brackets.getModule('command/CommandManager'),
        Menus = brackets.getModule('command/Menus');

    let onSaveMenuItem;

    console.log(Strings);
    console.log(preferences);

    // setTimeout(() => {
    //     minifier.exec('returnMinificationLog').done(l => console.log(l)).fail(err => console.error(err));
    // }, 2000);

    function createMenuOptions() {
        let jsMinifyCmdIdentifier = 'gcMin.cm',
            jsMinifyEditCmdIdentifier = 'gcMin.edit.cm',
            jsMinifyOnSaveCmdIdentifier = 'gcMin.on.save.cm',
            projectContextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
            editMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

        CommandManager.register(Strings.contextMenuText, jsMinifyCmdIdentifier, jsMinifyContextMenuItemClick);
        CommandManager.register(Strings.editMenuText, jsMinifyEditCmdIdentifier, jsMinifyEditMenuItemClick);
        onSaveMenuItem = CommandManager.register(Strings.editMenuTextToggle, jsMinifyOnSaveCmdIdentifier, toggleOnSavePreference);
        onSaveMenuItem.setChecked(preferences.minifyOnSave);

        projectContextMenu.addMenuDivider();
        projectContextMenu.addMenuItem(jsMinifyCmdIdentifier);

        editMenu.addMenuDivider();
        editMenu.addMenuItem(jsMinifyEditCmdIdentifier, 'Ctrl-Alt-M');
        editMenu.addMenuItem(jsMinifyOnSaveCmdIdentifier);
    }

    function jsMinifyContextMenuItemClick() {
        let contextFile = ProjectManager.getContext();

        if (contextFile) {
            if (contextFile._name.match(/.min./) === null) {

                minifier.exec('minifyFile', extensionPath, contextFile._path, {
                    optimizationLevel: preferences.optimizationLevel
                }).done(r => {
                    if (r.error) {
                        console.error(r.message);
                    }
                }).fail(err => console.error(err));

            }
        }
    }

    function jsMinifyEditMenuItemClick() {
        minifyDocument(DocumentManager.getCurrentDocument());
    }

    function monitorSaves() {
        DocumentManager.on('documentSaved', function (event, document) {
            if (preferences.minifyOnSave && document) {
                minifyDocument(document);
            }
        });
    }

    function minifyDocument(document) {
        if (document && document.language._id === 'javascript') {
            if (document.file._name.match(/.min./) === null) {

                minifier.exec('minifyFile', extensionPath, document.file._path, {
                    optimizationLevel: preferences.optimizationLevel
                }).done(r => {
                    if (r.error) {
                        console.error(r.message);
                    }
                }).fail(err => console.error(err));

            }
        }
    }

    function toggleOnSavePreference() {
        onSaveMenuItem.setChecked(preferences.minifyOnSave = !preferences.minifyOnSave);
    }


    createMenuOptions();
    monitorSaves();

});
