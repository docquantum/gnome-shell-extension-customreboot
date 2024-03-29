/* grub.js
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

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const Gio = imports.gi.Gio;
const ByteArray = imports.byteArray;


/**
 * getBootOptions:
 * @returns {[Map, String]} Map(title, title), defaultOption
 * 
 * Parses the grub config to get the currently configured
 * menuentries.
 * defaultOption is set to the first menuentry
 */
async function getBootOptions() {
    try {
        let cfgpath = Utils.getGrubConfig();
        if (cfgpath == "") {
            throw new String("Failed to find grub config");
        }

        let bootOptions = new Map();

        let file = Gio.file_new_for_path(cfgpath);
        let [suc, content] = file.load_contents(null);
        if (!suc) {
            throw new String("Failed to load grub config");
        }

        let lines;
        if (content instanceof Uint8Array) {
            lines = ByteArray.toString(content);
        }
        else {
            lines = content.toString();
        }

        let entryRx = /^menuentry ['"]([^'"]+)/;
        lines.split('\n').forEach(l => {
            let res = entryRx.exec(l);
            if (res && res.length) {
                bootOptions.set(res[1], res[1])
            }
        });

        bootOptions.forEach((v, k) => {
            Utils._log(`${k} = ${v}`);
        });

        return [bootOptions, bootOptions.keys().next().value];
            
    } catch (e) {
        Utils._logWarning(e);
        return undefined;
    }
}

/**
 * setBootOption:
 * 
 * @param {string} title
 * @returns {bool} whether it was able to set it or not
 * 
 * The menuentry title to be passed to grub-reboot so that that
 * boot option is set to be the one to boot off of next boot. 
 */
 async function setBootOption(title) {
    try {
        let [status, stdout, stderr] = await Utils.execCommand(
            ['/usr/bin/pkexec', '/usr/sbin/grub-reboot', title],
        );
        if (status !== 0)
            throw new String(`Failed to set boot option to ${title}:\nExitCode: ${status}\nstdout: ${stdout}\nstderr: ${stderr}`);
        Utils._log(`Set boot option to ${title}: ${status}\n${stdout}\n${stderr}`);
        return true;
    } catch (e) {
        Utils._logWarning(e);
        return false;
    }
}