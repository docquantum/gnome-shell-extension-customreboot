/* extension.js
 *
 * Copyright (C) 2020
 *      Daniel Shchur (DocQuantum) <shchurgood@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
*/

/* exported init */

'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const SystemActions = imports.misc.systemActions;
const Gettext = imports.gettext;
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
    return new Extension();
}

class Extension {
    constructor() {
        this._bootOptions = null;
        this._currentSetOption = null;
        this._currentBootLoader = null;
        this._aggregateMenu = Main.panel.statusArea.aggregateMenu;
        this._system = this._aggregateMenu._system;
        this._bootOptionsSubMenu = null;
        this._systemActions = new SystemActions.getDefault();
    }

    enable() {
        this._bootLoaderType = 0;
        this._currentBootLoader = Utils.getCurrentBootloader();
        this._currentBootLoader.getBootOptions().then((bootOps) => {
            if(bootOps === undefined)
                throw new Error("Failed to parse get boot options!")
            this._bootOptions = bootOps;
            this._currentSetOption = getDefaultOption(bootOps);
            this._createSubMenu();
            this._debugPrint();
        });
    }

    disable() {
        this.destroy();
    }

    destroy() {
        this._bootOptions = null;
        this._currentSetOption = null;
        this._currentBootLoader = null;
        this._destroySubMenu();
    }

    _debugPrint() {
        Utils._log(`${Me.metadata.uuid} Loaded with:`)
        Utils._log(`\tBootloader: ${Utils.getBootLoaderName(this._bootLoaderType)}`)
        Utils._log(`\tCurrent Set Option: ${this._currentSetOption}`);
        Utils._log(`\tBoot Options:`)
        this._bootOptions.forEach((v, k) => {
            Utils._log(`\t\t${k} = ${v}`)
        });
    }

    _createSubMenu() {
        this._bootOptionsSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Restart Into...'), true);
        this._bootOptionsSubMenu.icon.icon_name = 'system-reboot-symbolic';
        this._bootOptions.forEach((id, title) => {
            let item = new PopupMenu.PopupMenuItem(String(title), false);
            item.connect('activate', () => {
                this._currentBootLoader.setBootOption(String(id)).then(result => {
                    if(result){
                        this._currentSetOption = id;
                        this._systemActions.activateRestart();
                    } else {
                        Utils._logWarn("Failed to set boot option, or canceled!");
                    }
                })
                .catch(e => {
                    logError(e);
                });                
            });
            this._bootOptionsSubMenu.menu.addMenuItem(item);
        });
        this._system.menu.addMenuItem(this._bootOptionsSubMenu);
        Utils._log("Created and added the boot submenu.");
    }

    _destroySubMenu() {
        this._bootOptionsSubMenu.destroy();
        this._bootOptionsSubMenu = null;
    }
}