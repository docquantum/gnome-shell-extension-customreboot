/* systemd-boot.js
 *
 * Copyright (C) 2020
 *      DocQuantum <docquantum@protonmail.com>
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


const Gio = imports.gi.Gio;

function getBootOptions() {
    try {
      let proc = Gio.Subprocess.new(
        ["/usr/sbin/bootctl", "list"],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
      );
      let [success, stdout, stderr] = proc.communicate_utf8(null, null);
      if (!success) throw "Failed to get output from bootctl: " + stderr;
      let lines = stdout.split('\n');
      let titleRx = /(?<=title:\s+).+/;
      let idRx = /(?<=id:\s+).+/;
      let count = 0;
      let titles = [];
      let ids = []
      lines.forEach(l => {
        let title = titleRx.exec(l);
        let id = idRx.exec(l);
        if (title && title.length) {
          titles.push(title);
        } else if (id && id.length) {
          ids.push(id);
        }
      });
      if (titles.length !== ids.length) throw "Number of titles and ids do not match!";
      let bootOptions = new Map();
      for (let i = 0; i < titles.length; i++) {
        bootOptions.set(titles[i], ids[i])
      }
      return bootOptions;
    } catch (e) {
      logError(e);
      return undefined;
    }
  }