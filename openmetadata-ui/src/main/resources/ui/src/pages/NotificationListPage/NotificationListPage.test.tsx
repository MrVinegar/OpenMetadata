/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '../../constants/constants';
import NotificationListPage from './NotificationListPage';

const MOCK_DATA = [
  {
    id: '971a21b3-eeaf-4765-bda7-4e2cdb9788de',
    name: 'alert-test',
    fullyQualifiedName: 'alert-test',
    href: 'http://localhost:8585/api/v1/events/subscriptions/971a21b3-eeaf-4765-bda7-4e2cdb9788de',
    version: 0.1,
    updatedAt: 1682366749021,
    updatedBy: 'admin',
    filteringRules: {
      resources: ['all'],
      rules: [
        {
          name: 'matchIngestionPipelineState',
          effect: 'include',
          condition: "matchIngestionPipelineState('partialSuccess')",
        },
      ],
    },
    subscriptionType: 'Email',
    subscriptionConfig: {
      receivers: ['test@gmail.com'],
    },
    enabled: true,
    batchSize: 10,
    timeout: 10,
    readTimeout: 12,
    deleted: false,
    provider: 'user',
  },
];

jest.mock('../../rest/alertsAPI', () => ({
  getAllAlerts: jest.fn().mockImplementation(() =>
    Promise.resolve({
      data: MOCK_DATA,
      paging: { total: 1 },
    })
  ),
}));

jest.mock('../../utils/GlobalSettingsUtils', () => ({
  getSettingPageEntityBreadCrumb: jest.fn().mockImplementation(() => [
    {
      name: 'setting',
      url: ROUTES.SETTINGS,
    },
  ]),
}));

jest.mock('../../components/PageLayoutV1/PageLayoutV1', () => {
  return jest.fn().mockImplementation(({ children }) => <div>{children}</div>);
});

jest.mock(
  '../../components/common/TitleBreadcrumb/TitleBreadcrumb.component',
  () => {
    return jest.fn().mockImplementation(() => <p>TitleBreadcrumb</p>);
  }
);

describe('Alerts Page Tests', () => {
  it('Title should be rendered', async () => {
    const { findByText } = render(<NotificationListPage />, {
      wrapper: MemoryRouter,
    });

    expect(await findByText('label.notification-plural')).toBeInTheDocument();
  });

  it('SubTitle should be rendered', async () => {
    const { findByText } = render(<NotificationListPage />, {
      wrapper: MemoryRouter,
    });

    expect(await findByText(/message.alerts-description/)).toBeInTheDocument();
  });

  it('Add alert button should be rendered', async () => {
    const { findByText } = render(<NotificationListPage />, {
      wrapper: MemoryRouter,
    });

    expect(await findByText(/label.create-entity/)).toBeInTheDocument();
  });
});
