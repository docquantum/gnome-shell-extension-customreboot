/* utils.js
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

/* exports execCommand */


const Gio = imports.gi.Gio;

/**
 * execCommand:
 * 
 * @param {String[]} argv 
 * @param {String} input 
 * @param {Gio.Cancellable} cancellable
 * 
 * Executes a command asynchronously.
 */
function execCommand(argv, input = null, cancellable = null) {
    let flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;

    if (input !== null)
        flags |= Gio.SubprocessFlags.STDIN_PIPE;

    let proc = new Gio.Subprocess({
        argv: argv,
        flags: flags
    });
    proc.init(cancellable);
    return new Promise((resolve,reject) => {
        proc.communicate_utf8_async(input, cancellable, (proc, res) => {
            try {
                resolve([(function() {
                    if(!proc.get_if_exited())
                        throw "fail";
                    return proc.get_exit_status()
                })()].concat(proc.communicate_utf8_finish(res).slice(1)));
            } catch (e) {
                reject(e);
            }
        });
    });
}