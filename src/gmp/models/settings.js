/* Copyright (C) 2016-2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {isDefined} from 'gmp/utils/identity';

class Settings {
  constructor() {
    this._settings = {};
  }

  has(name) {
    return name in this._settings;
  }

  set(name, value) {
    this._settings[name] = value;
  }

  get(name) {
    const setting = this._settings[name];
    if (isDefined(setting)) {
      return setting;
    }
    return {};
  }

  getEntries() {
    return Object.entries(this._settings);
  }
}

export default Settings;

// vim: set ts=2 sw=2 tw=80: