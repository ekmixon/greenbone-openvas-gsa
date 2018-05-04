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

export const ALL_SEC_INFOS_CREATED = 'allinfo-by-created';
export const ALL_SEC_INFOS_SEVERITY_CLASS = 'allinfo-severity-class';
export const ALL_SEC_INFOS_TYPE = 'allinfo-type';

export const allSecInfoCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.secinfos.getCreatedAggregates({filter})
    .then(r => r.data),
  ALL_SEC_INFOS_CREATED);

export const AllSecInfosCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={ALL_SEC_INFOS_CREATED}
    filter={filter}
    load={allSecInfoCreatedLoader}
    subscriptions={[
      'all_sec_info.timer',
      'all_sec_info.changed',
    ]}
  >
    {children}
  </Loader>
);

AllSecInfosCreatedLoader.propTypes = loaderPropTypes;

export const allSecInfosSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.secinfos.getSeverityAggregates({filter})
    .then(r => r.data),
  ALL_SEC_INFOS_SEVERITY_CLASS);

export const AllSecInfosSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={ALL_SEC_INFOS_SEVERITY_CLASS}
    filter={filter}
    load={allSecInfosSeverityLoader}
    subscriptions={[
      'all_sec_info.timer',
      'all_sec_info.changed',
    ]}
  >
    {children}
  </Loader>
);

AllSecInfosSeverityLoader.propTypes = loaderPropTypes;

export const allSecInfosTypeLoader = loadFunc(
  ({gmp, filter}) => gmp.secinfos.getTypeAggregates({filter})
    .then(r => r.data),
  ALL_SEC_INFOS_TYPE);

export const AllSecInfosTypeLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={ALL_SEC_INFOS_TYPE}
    filter={filter}
    load={allSecInfosTypeLoader}
    subscriptions={[
      'all_sec_info.timer',
      'all_sec_info.changed',
    ]}
  >
    {children}
  </Loader>
);

AllSecInfosTypeLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80: