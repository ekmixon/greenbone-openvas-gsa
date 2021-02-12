/* Copyright (C) 2021 Greenbone Networks GmbH
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
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Note from 'gmp/models/note';

import {isDefined} from 'gmp/utils/identity';

import {
  createCloneNoteQueryMock,
  createDeleteNoteQueryMock,
  createExportNotesByIdsQueryMock,
  createGetNoteQueryMock,
  detailsNote,
  noPermNote,
  inUseNote,
} from 'web/graphql/__mocks__/notes';

import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {createGetPermissionsQueryMock} from 'web/graphql/__mocks__/permissions';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '456',
  }),
}));

setLocale('en');

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

const parsedNote = Note.fromObject(detailsNote);
const parsedNoPermNote = Note.fromObject(noPermNote);
const parsedInUseNote = Note.fromObject(inUseNote);

let currentSettings;
let renewSession;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Note detailspage tests', () => {
  test('should render full detailspage', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const [mock, resultFunc] = createGetNoteQueryMock();
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });
    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('note text');

    const links = baseElement.querySelectorAll('a');

    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );

    expect(screen.getAllByTitle('Note List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/notes');

    expect(baseElement).toHaveTextContent('456');
    expect(baseElement).toHaveTextContent(
      'Created:Wed, Dec 23, 2020 3:14 PM CET',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jan 4, 2021 12:54 PM CET',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    const tabs = screen.getAllByTestId('entities-tab-title');
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    expect(baseElement).toHaveTextContent('NVT Name');
    expect(baseElement).toHaveTextContent('foo nvt');

    expect(baseElement).toHaveTextContent('NVT OID');
    expect(baseElement).toHaveTextContent('123');

    expect(baseElement).toHaveTextContent('Active');
    expect(baseElement).toHaveTextContent('Yes');

    expect(baseElement).toHaveTextContent('Application');

    expect(baseElement).toHaveTextContent('Hosts');
    expect(baseElement).toHaveTextContent('127.0.0.1');

    expect(baseElement).toHaveTextContent('Port');
    expect(baseElement).toHaveTextContent('666');

    expect(baseElement).toHaveTextContent('Severity');
    expect(baseElement).toHaveTextContent('> 0.0');

    expect(baseElement).toHaveTextContent('Task');
    expect(baseElement).toHaveTextContent('task x');

    expect(baseElement).toHaveTextContent('Result');
    expect(baseElement).toHaveTextContent('result name');

    expect(baseElement).toHaveTextContent('Appearance');

    expect(baseElement).toHaveTextContent('note text');
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetNoteQueryMock('456', detailsNote);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });

    const [
      renewSessionMock,
      renewSessionResult,
    ] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, renewSessionMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();
    expect(renewSessionResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('note:unnamed');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const [mock, resultFunc] = createGetNoteQueryMock('456', detailsNote);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=456 first=1 rows=-1',
      },
      {permissions: null},
    );
    const [
      renewSessionMock,
      renewSessionResult,
    ] = createRenewSessionQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [mock, permissionMock, renewSessionMock],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

    await wait();

    expect(renewSessionResult).toHaveBeenCalled();
    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const gmp = {
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
        renewSession,
      },
    };
    const [renewQueryMock] = createRenewSessionQueryMock();
    const [mock, resultFunc] = createGetNoteQueryMock('456', detailsNote);
    const [cloneMock, cloneResult] = createCloneNoteQueryMock();
    const [deleteMock, deleteResult] = createDeleteNoteQueryMock();
    const [exportMock, exportResult] = createExportNotesByIdsQueryMock(['456']);
    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=456 first=1 rows=-1',
    });

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        renewQueryMock,
        mock,
        cloneMock,
        deleteMock,
        exportMock,
        permissionMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    render(<Detailspage id="456" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();

    const cloneIcon = screen.getAllByTitle('Clone Note');
    expect(cloneIcon[0]).toBeInTheDocument();

    fireEvent.click(cloneIcon[0]);

    await wait();

    expect(cloneResult).toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Note as XML');
    expect(exportIcon[0]).toBeInTheDocument();

    fireEvent.click(exportIcon[0]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle('Move Note to trashcan');
    expect(deleteIcon[0]).toBeInTheDocument();

    fireEvent.click(deleteIcon[0]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });
});

describe('Note ToolBarIcons tests', () => {
  test('should render', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {element} = render(
      <ToolBarIcons
        entity={parsedNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const links = element.querySelectorAll('a');

    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/reports.html#managing-notes',
    );
    expect(screen.getAllByTitle('Help: Notes')[0]).toBeInTheDocument();

    expect(links[1]).toHaveAttribute('href', '/notes');
    expect(screen.getAllByTitle('Note List')[0]).toBeInTheDocument();
  });

  test('should call click handlers', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });
    render(
      <ToolBarIcons
        entity={parsedNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Edit Note');
    const deleteIcon = screen.getAllByTitle('Move Note to trashcan');
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);
    expect(handleNoteCloneClick).toHaveBeenCalledWith(parsedNote);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);
    expect(handleNoteEditClick).toHaveBeenCalledWith(parsedNote);

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleNoteDeleteClick).toHaveBeenCalledWith(parsedNote);

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);
    expect(handleNoteDownloadClick).toHaveBeenCalledWith(parsedNote);
  });

  test('should not call click handlers without permission', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedNoPermNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Permission to edit Note denied');
    const deleteIcon = screen.getAllByTitle(
      'Permission to move Note to trashcan denied',
    );
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleNoteCloneClick).toHaveBeenCalledWith(parsedNoPermNote);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleNoteEditClick).not.toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);

    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleNoteDownloadClick).toHaveBeenCalledWith(parsedNoPermNote);
  });

  test('should call correct click handlers for note in use', () => {
    const handleNoteCloneClick = jest.fn();
    const handleNoteDeleteClick = jest.fn();
    const handleNoteDownloadClick = jest.fn();
    const handleNoteEditClick = jest.fn();
    const handleNoteCreateClick = jest.fn();

    const gmp = {settings: {manualUrl}};

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={parsedInUseNote}
        onNoteCloneClick={handleNoteCloneClick}
        onNoteDeleteClick={handleNoteDeleteClick}
        onNoteDownloadClick={handleNoteDownloadClick}
        onNoteEditClick={handleNoteEditClick}
        onNoteCreateClick={handleNoteCreateClick}
      />,
    );

    const cloneIcon = screen.getAllByTitle('Clone Note');
    const editIcon = screen.getAllByTitle('Edit Note');
    const deleteIcon = screen.getAllByTitle('Note is still in use');
    const exportIcon = screen.getAllByTitle('Export Note as XML');

    expect(cloneIcon[0]).toBeInTheDocument();
    fireEvent.click(cloneIcon[0]);

    expect(handleNoteCloneClick).toHaveBeenCalledWith(parsedInUseNote);

    expect(editIcon[0]).toBeInTheDocument();
    fireEvent.click(editIcon[0]);

    expect(handleNoteEditClick).toHaveBeenCalled();

    expect(deleteIcon[0]).toBeInTheDocument();
    fireEvent.click(deleteIcon[0]);
    expect(handleNoteDeleteClick).not.toHaveBeenCalled();

    expect(exportIcon[0]).toBeInTheDocument();
    fireEvent.click(exportIcon[0]);

    expect(handleNoteDownloadClick).toHaveBeenCalledWith(parsedInUseNote);
  });
});
