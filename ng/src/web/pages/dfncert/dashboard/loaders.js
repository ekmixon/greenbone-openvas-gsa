/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from '../../../components/dashboard2/data/loader';

export const DFNCERT_CREATED = 'dfncert-by-created';
export const DFNCERT_SEVERITY_CLASS = 'dfncert-severity-class';

export const dfnCertsCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.dfncerts.getCreatedAggregates({filter})
    .then(r => r.data),
  DFNCERT_CREATED);

export const DfnCertsCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={DFNCERT_CREATED}
    filter={filter}
    load={dfnCertsCreatedLoader}
    subscriptions={[
      'dfncerts.timer',
      'dfncerts.changed',
    ]}
  >
    {children}
  </Loader>
);

DfnCertsCreatedLoader.propTypes = loaderPropTypes;

export const dfnCertSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.dfncerts.getSeverityAggregates({filter})
    .then(r => r.data),
  DFNCERT_SEVERITY_CLASS);

export const DfnCertSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={DFNCERT_SEVERITY_CLASS}
    filter={filter}
    load={dfnCertSeverityLoader}
    subscriptions={[
      'dfncerts.timer',
      'dfncerts.changed',
    ]}
  >
    {children}
  </Loader>
);

DfnCertSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
