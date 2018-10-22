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

/* eslint-disable max-len */

import Model from 'gmp/model';
import Credential, {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  SNMP_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
  USERNAME_SSH_KEY_CREDENTIAL_TYPE,
  esxi_credential_filter,
  smb_credential_filter,
  snmp_credential_filter,
  ssh_credential_filter,
} from 'gmp/models/credential';
import {testModel} from 'gmp/models/testing';

import {
  parseDate,
  NO_VALUE,
  YES_VALUE,
} from 'gmp/parser';

const USERNAME_PASSWORD_CREDENTIAL = new Credential({
  type: USERNAME_PASSWORD_CREDENTIAL_TYPE,
});
const USERNAME_SSH_KEY_CREDENTIAL = new Credential({
  type: USERNAME_SSH_KEY_CREDENTIAL_TYPE,
});
const CLIENT_CERTIFICATE_CREDENTIAL = new Credential({
  type: CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
});
const SNMP_CREDENTIAL = new Credential({type: SNMP_CREDENTIAL_TYPE});

const createAllCredentials = () => [
  CLIENT_CERTIFICATE_CREDENTIAL,
  USERNAME_PASSWORD_CREDENTIAL,
  USERNAME_SSH_KEY_CREDENTIAL,
  SNMP_CREDENTIAL,
];


testModel(Credential, 'credential');

describe('Credential Model tests', () => {

  test('should parse certificate_info', () => {
    const elem = {
      certificate_info: {
        activation_time: '2018-10-10T11:41:23.022Z',
        expiration_time: '2019-10-10T11:41:23.022Z',
      },
    };
    const credential = new Credential(elem);

    expect(credential.certificate_info.activationTime).toEqual(parseDate('2018-10-10T11:41:23.022Z'));
    expect(credential.certificate_info.expirationTime).toEqual(parseDate('2019-10-10T11:41:23.022Z'));
    expect(credential.certificate_info.activation_time).toBeUndefined();
    expect(credential.certificate_info.expiration_time).toBeUndefined();
  });

  test('should parse type', () => {
    const credential = new Credential({type: 'foo'});

    expect(credential.credential_type).toEqual('foo');
  });

  test('should parse allow_insecure as Yes/No', () => {
    const elem1 = {allow_insecure: '1'};
    const elem2 = {allow_insecure: '0'};
    const cred1 = new Credential(elem1);
    const cred2 = new Credential(elem2);

    expect(cred1.allow_insecure).toEqual(YES_VALUE);
    expect(cred2.allow_insecure).toEqual(NO_VALUE);
  });

  test('should return given targets as array of instances of target model', () => {
    const elem = {
      targets: {
        target: {},
      },
    };
    const credential = new Credential(elem);

    expect(credential.targets).toEqual([new Model({}, 'target')]);
  });

  test('should return empty array if no targets are given', () => {
    const credential = new Credential({});

    expect(credential.targets).toEqual([]);
  });

  test('should return given scanners as array of instances of scanner model', () => {
    const elem = {
      scanners: {
        scanner: {},
      },
    };
    const credential = new Credential(elem);

    expect(credential.scanners).toEqual([new Model({}, 'scanner')]);
  });

  test('isAllowInsecure() should return correct true/false', () => {
    const cred1 = new Credential({allow_insecure: '0'});
    const cred2 = new Credential({allow_insecure: '1'});

    expect(cred1.isAllowInsecure()).toBe(false);
    expect(cred2.isAllowInsecure()).toBe(true);
  });
});


describe('Credential model function tests', () => {

  test('ssh_credential_filter should return filter with correct true/false', () => {
    const type1 = {credential_type: 'cc'};
    const type2 = {credential_type: 'usk'};
    const type3 = {credential_type: 'up'};

    expect(ssh_credential_filter(type1)).toEqual(false);
    expect(ssh_credential_filter(type2)).toEqual(true);
    expect(ssh_credential_filter(type3)).toEqual(true);
  });

  test('smb_credential_filter should return filter with correct true/false', () => {
    const type1 = {credential_type: 'snmp'};
    const type2 = {credential_type: 'up'};

    expect(smb_credential_filter(type1)).toEqual(false);
    expect(smb_credential_filter(type2)).toEqual(true);
  });

  test('esxi_credential_filter should return filter with correct true/false', () => {
    const type1 = {credential_type: 'snmp'};
    const type2 = {credential_type: 'up'};

    expect(esxi_credential_filter(type1)).toEqual(false);
    expect(esxi_credential_filter(type2)).toEqual(true);
  });

  test('snmp_credential_filter should return filter with correct true/false', () => {
    const type1 = {credential_type: 'cc'};
    const type2 = {credential_type: 'snmp'};

    expect(snmp_credential_filter(type1)).toEqual(false);
    expect(snmp_credential_filter(type2)).toEqual(true);
  });

  test('should filter non ssh credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(ssh_credential_filter)).toEqual(
      expect.arrayContaining([
        USERNAME_PASSWORD_CREDENTIAL,
        USERNAME_SSH_KEY_CREDENTIAL,
      ]));
  });

  test('should filter non smb credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(smb_credential_filter)).toEqual([
      USERNAME_PASSWORD_CREDENTIAL,
    ]);
  });

  test('should filter non smb credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(esxi_credential_filter)).toEqual([
      USERNAME_PASSWORD_CREDENTIAL,
    ]);
  });

  test('should filter non snmp credentials', () => {
    const allCredentials = createAllCredentials();
    expect(allCredentials.filter(snmp_credential_filter)).toEqual([
      SNMP_CREDENTIAL,
    ]);
  });

});

// vim: set ts=2 sw=2 tw=80:
