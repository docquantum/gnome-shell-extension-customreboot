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

const Gettext = imports.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SystemdBoot = Me.imports.systemdBoot;
const Grub = Me.imports.grub;
const SystemActions = imports.misc.systemActions;
const Main = imports.ui.main;
const BoxPointer = imports.ui.boxpointer;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;

const BootLoaderType = {
    SYSTEMD_BOOT : 0,
    GRUB : 1
};

const BootLoaderClass = {
    0: SystemdBoot,
    1: Grub
};

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
    return new Extension();
}

var g_debug = false;

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

    async enable() {
        g_debug = true; //temp, need to make accessible from settings
        this._bootLoaderType = BootLoaderType.SYSTEMD_BOOT;
        this._currentBootLoader = getCurrentBootloader();
        this._bootOptions = await this._currentBootLoader.getBootOptions();
        this._createSubMenu();
        if(g_debug)
            this._debugPrint();
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
        log(`DebugLog for ${Me.metadata.uuid}:`)
        log(`\tBootloader: ${Object.keys(BootLoaderType)[this._bootLoaderType]}`)
        log(`\tCurrent Set Option: ${this._currentSetOption}`);
        log(`\tBoot Options:`)
        this._bootOptions.forEach((v, k) => {
            log(`\t\t${k} = ${v}`)
        });
    }

    _createSubMenu() {
        this._bootOptionsSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Restart Into...'), true);
        this._bootOptionsSubMenu.icon.icon_name = 'system-reboot-symbolic';
        this._bootOptions.forEach((id, title) => {
            let item = new PopupMenu.PopupMenuItem(String(title), false);
            item.connect('activate', () => {
                this._currentBootLoader.setBootOption(String(id))
                .then(result => {
                    if(result){
                        this._currentSetOption = id;
                        this._systemActions.activateRestart();
                    } else if(g_debug)
                        log("Failed to set boot option, or canceled!");
                })
                .catch(e => {
                    logError(e);
                });                
            });
            this._bootOptionsSubMenu.menu.addMenuItem(item);
        });
        this._system.menu.addMenuItem(this._bootOptionsSubMenu);
    }

    _destroySubMenu() {
        this._bootOptionsSubMenu.destroy();
        this._bootOptionsSubMenu = null;
    }
}

const getCurrentBootloader = function() {
    // Get bootloader from system or settings...
    
    // Default to systemd-boot right now...
    return BootLoaderClass[BootLoaderType.SYSTEMD_BOOT];
}