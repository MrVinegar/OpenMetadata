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

import { Button, Form, FormProps, Input, Space, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { AxiosError } from 'axios';
import { isEmpty, isUndefined } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ActivityFeedTabs } from '../../../components/ActivityFeed/ActivityFeedTab/ActivityFeedTab.interface';
import { useAuthContext } from '../../../components/Auth/AuthProviders/AuthProvider';
import ResizablePanels from '../../../components/common/ResizablePanels/ResizablePanels';
import TitleBreadcrumb from '../../../components/common/TitleBreadcrumb/TitleBreadcrumb.component';
import ExploreSearchCard from '../../../components/ExploreV1/ExploreSearchCard/ExploreSearchCard';
import Loader from '../../../components/Loader/Loader';
import { SearchedDataProps } from '../../../components/SearchedData/SearchedData.interface';
import { FQN_SEPARATOR_CHAR } from '../../../constants/char.constants';
import { EntityField } from '../../../constants/Feeds.constants';
import { TASK_SANITIZE_VALUE_REGEX } from '../../../constants/regex.constants';
import { EntityTabs, EntityType } from '../../../enums/entity.enum';
import {
  CreateThread,
  TaskType,
} from '../../../generated/api/feed/createThread';
import { Chart } from '../../../generated/entity/data/chart';
import { ThreadType } from '../../../generated/entity/feed/thread';
import { TagLabel } from '../../../generated/type/tagLabel';
import { useFqn } from '../../../hooks/useFqn';
import { postThread } from '../../../rest/feedsAPI';
import { getEntityDetailLink } from '../../../utils/CommonUtils';
import {
  ENTITY_LINK_SEPARATOR,
  getEntityFeedLink,
  getEntityName,
} from '../../../utils/EntityUtils';
import {
  fetchEntityDetail,
  fetchOptions,
  getBreadCrumbList,
  getColumnObject,
  getEntityColumnsDetails,
  getTaskMessage,
} from '../../../utils/TasksUtils';
import { showErrorToast, showSuccessToast } from '../../../utils/ToastUtils';
import Assignees from '../shared/Assignees';
import { TagsTabs } from '../shared/TagsTabs';
import '../task-page.style.less';
import { EntityData, Option } from '../TasksPage.interface';

const UpdateTag = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [form] = useForm();
  const { currentUser } = useAuthContext();

  const { entityType } = useParams<{ entityType: EntityType }>();

  const { fqn: entityFQN } = useFqn();
  const queryParams = new URLSearchParams(location.search);

  const field = queryParams.get('field');
  const value = queryParams.get('value');

  const [entityData, setEntityData] = useState<EntityData>({} as EntityData);
  const [chartData, setChartData] = useState([] as Chart[]);

  const [options, setOptions] = useState<Option[]>([]);
  const [assignees, setAssignees] = useState<Option[]>([]);
  const [currentTags, setCurrentTags] = useState<TagLabel[]>([]);
  const [suggestion, setSuggestion] = useState<TagLabel[]>([]);

  const sanitizeValue = useMemo(
    () => value?.replaceAll(TASK_SANITIZE_VALUE_REGEX, '') ?? '',
    [value]
  );

  const taskMessage = useMemo(
    () =>
      getTaskMessage({
        value,
        entityType,
        entityData,
        field,
        startMessage: 'Update tags',
      }),
    [value, entityType, field, entityData]
  );

  const back = () => history.goBack();

  const columnObject = useMemo(() => {
    const column = sanitizeValue.split(FQN_SEPARATOR_CHAR).slice(-1);

    return getColumnObject(
      column[0],
      getEntityColumnsDetails(entityType, entityData),
      entityType,
      chartData
    );
  }, [field, entityData, chartData, entityType]);

  const getTags = () => {
    if (!isEmpty(columnObject) && !isUndefined(columnObject)) {
      return columnObject.tags ?? [];
    } else {
      return entityData.tags ?? [];
    }
  };

  const onSearch = (query: string) => {
    const data = {
      query,
      setOptions,
    };
    fetchOptions(data);
  };

  const getTaskAbout = () => {
    if (field && value) {
      return `${field}${ENTITY_LINK_SEPARATOR}${value}${ENTITY_LINK_SEPARATOR}tags`;
    } else {
      return EntityField.TAGS;
    }
  };

  const onCreateTask: FormProps['onFinish'] = (value) => {
    const data: CreateThread = {
      from: currentUser?.name as string,
      message: value.title || taskMessage,
      about: getEntityFeedLink(entityType, entityFQN, getTaskAbout()),
      taskDetails: {
        assignees: assignees.map((assignee) => ({
          id: assignee.value,
          type: assignee.type,
        })),
        suggestion: JSON.stringify(suggestion),
        type: TaskType.UpdateTag,
        oldValue: JSON.stringify(currentTags),
      },
      type: ThreadType.Task,
    };
    postThread(data)
      .then(() => {
        showSuccessToast(
          t('server.create-entity-success', {
            entity: t('label.task'),
          })
        );
        history.push(
          getEntityDetailLink(
            entityType,
            entityFQN,
            EntityTabs.ACTIVITY_FEED,
            ActivityFeedTabs.TASKS
          )
        );
      })
      .catch((err: AxiosError) => showErrorToast(err));
  };

  useEffect(() => {
    fetchEntityDetail(
      entityType,
      entityFQN as string,
      setEntityData,
      setChartData
    );
  }, [entityFQN, entityType]);

  useEffect(() => {
    const owner = entityData.owner;
    let defaultAssignee: Option[] = [];
    if (owner) {
      defaultAssignee = [
        {
          label: getEntityName(owner),
          value: owner.id || '',
          type: owner.type,
          name: owner.name,
        },
      ];
      setAssignees(defaultAssignee);
      setOptions(defaultAssignee);
    }
    form.setFieldsValue({
      title: taskMessage.trimEnd(),
      updatedTags: getTags(),
      assignees: defaultAssignee,
    });
  }, [entityData, columnObject]);

  useEffect(() => {
    setCurrentTags(getTags());
    setSuggestion(getTags());
  }, [entityData, columnObject]);

  if (isEmpty(entityData)) {
    return <Loader />;
  }

  return (
    <ResizablePanels
      firstPanel={{
        minWidth: 700,
        flex: 0.6,
        children: (
          <div className="max-width-md w-9/10 m-x-auto m-y-md d-grid gap-4">
            <TitleBreadcrumb
              titleLinks={[
                ...getBreadCrumbList(entityData, entityType),
                {
                  name: t('label.create-entity', {
                    entity: t('label.task'),
                  }),
                  activeTitle: true,
                  url: '',
                },
              ]}
            />
            <div className="m-t-0 request-tags" key="update-tags">
              <Typography.Paragraph
                className="text-base"
                data-testid="form-title">
                {t('label.create-entity', {
                  entity: t('label.task'),
                })}
              </Typography.Paragraph>
              <Form form={form} layout="vertical" onFinish={onCreateTask}>
                <Form.Item
                  data-testid="title"
                  label={`${t('label.title')}:`}
                  name="title">
                  <Input
                    disabled
                    placeholder={t('label.task-entity', {
                      entity: t('label.title'),
                    })}
                  />
                </Form.Item>
                <Form.Item
                  data-testid="assignees"
                  label={`${t('label.assignee-plural')}:`}
                  name="assignees"
                  rules={[
                    {
                      required: true,
                      message: t('message.field-text-is-required', {
                        fieldText: t('label.assignee-plural'),
                      }),
                    },
                  ]}>
                  <Assignees
                    disabled={Boolean(entityData.owner)}
                    options={options}
                    value={assignees}
                    onChange={setAssignees}
                    onSearch={onSearch}
                  />
                </Form.Item>

                {currentTags.length ? (
                  <Form.Item
                    data-testid="tags-label"
                    label={t('label.update-entity', {
                      entity: t('label.tag-plural'),
                    })}
                    name="updatedTags"
                    rules={[
                      {
                        required: true,
                        message: t('message.field-text-is-required', {
                          fieldText: t('label.tag-plural'),
                        }),
                      },
                    ]}>
                    <TagsTabs
                      tags={currentTags}
                      value={suggestion}
                      onChange={setSuggestion}
                    />
                  </Form.Item>
                ) : null}

                <Form.Item>
                  <Space
                    className="w-full justify-end"
                    data-testid="cta-buttons"
                    size={16}>
                    <Button type="link" onClick={back}>
                      {t('label.back')}
                    </Button>
                    <Button
                      data-testid="submit-test"
                      htmlType="submit"
                      type="primary">
                      {t('label.submit')}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </div>
        ),
      }}
      pageTitle={t('label.task')}
      secondPanel={{
        minWidth: 60,
        flex: 0.4,
        children: (
          <ExploreSearchCard
            hideBreadcrumbs
            showTags
            id={entityData.id ?? ''}
            source={
              {
                ...entityData,
                entityType,
              } as SearchedDataProps['data'][number]['_source']
            }
          />
        ),
      }}
    />
  );
};

export default UpdateTag;
