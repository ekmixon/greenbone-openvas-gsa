/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import Capabilities from 'gmp/capabilities/capabilities';

import Task, {TASK_STATUS} from 'gmp/models/task';

import {rendererWith, fireEvent} from 'web/utils/testing';
import {MockedProvider} from '@apollo/react-testing';

import Theme from 'web/utils/theme';

import StartIcon from '../starticon';

describe('Task StartIcon component tests', () => {
  test('should render in active state with correct permissions', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <StartIcon task={task} onClick={clickHandler} />
      </MockedProvider>,
    );

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Start');
    expect(element).not.toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if wrong command level permissions are given', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      target: {_id: '123'},
      permissions: {permission: [{name: 'get_task'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <StartIcon task={task} />
      </MockedProvider>,
    );
    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(false);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Permission to start Task denied');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should render in inactive state if task is already active', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.requested,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });
    const clickHandler = jest.fn();

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <StartIcon task={task} />
      </MockedProvider>,
    );

    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);

    fireEvent.click(element);

    expect(clickHandler).not.toHaveBeenCalled();
    expect(element).toHaveAttribute('title', 'Task is already active');
    expect(element).toHaveStyleRule('fill', Theme.inputBorderGray, {
      modifier: `svg path`,
    });
  });

  test('should not be rendered if task is running', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.running,
      target: {_id: '123'},
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <StartIcon task={task} />
      </MockedProvider>,
    );
    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);
    expect(element).toEqual(null);
  });

  test('should not be rendered if task is a container', () => {
    const caps = new Capabilities(['everything']);
    const task = Task.fromElement({
      status: TASK_STATUS.new,
      permissions: {permission: [{name: 'everything'}]},
    });

    const {render} = rendererWith({capabilities: caps});

    const {element} = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <StartIcon task={task} />
      </MockedProvider>,
    );
    expect(caps.mayOp('start_task')).toEqual(true);
    expect(task.userCapabilities.mayOp('start_task')).toEqual(true);
    expect(element).toEqual(null);
  });
});

// vim: set ts=2 sw=2 tw=80:
