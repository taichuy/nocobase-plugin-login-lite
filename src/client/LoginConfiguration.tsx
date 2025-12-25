/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import { createForm } from '@formily/core';
import { ISchema, useForm } from '@formily/react';
import { uid } from '@formily/shared';
import {
  SchemaComponent,
  SchemaComponentOptions,
  ActionContext,
  useCompile,
  useRecord,
  useRequest,
  ExtendCollectionsProvider,
  useAPIClient,
  useBlockRequestContext,
  useActionContext,
} from '@nocobase/client';
import { usePluginTranslation, tStr } from './locale';
import { Button, Dropdown, message, Card, Tabs } from 'antd';
import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { loginTypes } from './schemas/loginTypes';
import { LoginConfigDesigner } from './LoginConfigDesigner';

const collection = {
  name: 'login_configs',
  fields: [
    {
      name: 'title',
      interface: 'input',
      uiSchema: {
        title: tStr('Title'),
        type: 'string',
        'x-component': 'Input',
        required: true,
      } as ISchema,
    },
    {
      name: 'enabled',
      interface: 'boolean',
      uiSchema: {
        title: tStr('Enable'),
        type: 'boolean',
        'x-component': 'Checkbox',
        default: true,
      } as ISchema,
    },
    {
      name: 'type',
      interface: 'select',
      uiSchema: {
        title: tStr('Type'),
        type: 'string',
        'x-component': 'Select',
        enum: [{ label: tStr('Home configuration'), value: 'home' }],
        required: true,
      } as ISchema,
    },
    {
      name: 'description',
      interface: 'textarea',
      uiSchema: {
        title: tStr('Description'),
        type: 'string',
        'x-component': 'Input.TextArea',
      } as ISchema,
    },
    {
      name: 'options',
      interface: 'json',
      uiSchema: {
        title: tStr('Configuration options'),
        type: 'string',
        'x-component': 'Input.JSON',
        default: '{}',
      } as ISchema,
    },
  ],
};

const PreviewToolbar = () => {
  return null;
};

const CreateLoginConfig = (props: { type?: string }) => {
  const { t } = usePluginTranslation();
  const [schema, setSchema] = useState({});
  const [currentType, setCurrentType] = useState<string>('');
  const compile = useCompile();
  const [visible, setVisible] = useState(false);
  const api = useAPIClient();
  const { service } = useBlockRequestContext();

  const useCloseActionProps = () => {
    return {
      onClick() {
        setVisible(false);
      },
    };
  };

  const useCreateSubmitAction = () => {
    const form = useForm();
    return {
      async onClick() {
        await form.submit(async (values) => {
          if (values.enabled) {
            const { data } = await api.resource('login_configs').list({
              filter: {
                type: currentType,
                enabled: true,
              },
              paginate: false,
            });
            const enabledConfigs = data?.data || [];
            if (enabledConfigs.length > 0) {
              await Promise.all(
                enabledConfigs.map((config) =>
                  api.resource('login_configs').update({
                    filterByTk: config.id,
                    values: {
                      enabled: false,
                    },
                  }),
                ),
              );
            }
          }
          await api.resource('login_configs').create({
            values: {
              ...values,
              type: currentType,
            },
          });
          message.success(t('Created successfully'));
          setVisible(false);
          service?.refresh();
        });
      },
    };
  };

  // Pre-fetch active config to use as default
  const { data: activeConfigResult } = useRequest(
    {
      resource: 'login_configs',
      action: 'getActiveConfig',
      params: { type: 'home' },
    },
    {
      manual: false, // Fetch on mount
    },
  );
  const activeConfig = (activeConfigResult as any)?.data || {};

  const openDrawer = (key: string) => {
    setCurrentType(key);
    const loginType = loginTypes[key];
    if (!loginType) return;
    setVisible(true);
    const schemaProperties = _.cloneDeep(loginType.fieldset);

    // Use active config options if available and type matches, otherwise empty
    const fallbackOptions = {
      useSystemName: 'yes',
      leftContentType: 'image',
      leftImage: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
      themeColor: '#000',
      fontColor: '#fff',
      formThemeColor: 'rgba(255,255,255,0.12)',
      formFontColor: '#fff',
      buttonBgColor: 'rgba(255,255,255,0.2)',
      buttonTextColor: '#fff',
      copyright: `<div>Powered by NocoBase</div>`,
      icp: `<div>Modified by taichuy</div>`,
    };
    const defaultOptions =
      key === 'home'
        ? { ...fallbackOptions, ...(activeConfig?.options ? _.cloneDeep(activeConfig.options) : {}) }
        : activeConfig?.options
          ? _.cloneDeep(activeConfig.options)
          : {};

    setSchema({
      type: 'object',
      properties: {
        [uid()]: {
          type: 'void',
          'x-component': 'Action.Drawer',
          'x-component-props': {
            width: '100vw',
            bodyStyle: { padding: 0, background: '#f0f2f5' },
          },
          'x-decorator': 'FormV2',
          'x-decorator-props': {
            initialValue: {
              type: loginType.name,
              options: defaultOptions,
              title: activeConfig?.title,
              enabled: activeConfig?.enabled,
              description: activeConfig?.description,
              __previewLive: true,
            },
          },
          title: t('Add') + ' - ' + compile(loginType.title),
          properties: {
            designer: {
              type: 'void',
              'x-component': 'LoginConfigDesigner',
              'x-component-props': {
                schema: {
                  type: 'object',
                  properties: schemaProperties,
                },
              },
            },
            footer: {
              type: 'void',
              'x-component': 'Action.Drawer.Footer',
              properties: {
                previewToolbar: {
                  type: 'void',
                  'x-component': 'PreviewToolbar',
                  'x-align': 'left',
                },
                cancel: {
                  title: t('Cancel'),
                  'x-component': 'Action',
                  'x-use-component-props': 'useCloseActionProps',
                  'x-component-props': {
                    htmlType: 'button',
                  },
                },
                submit: {
                  title: t('Submit'),
                  'x-component': 'Action',
                  'x-use-component-props': 'useCreateSubmitAction',
                  'x-component-props': {
                    type: 'primary',
                    htmlType: 'button',
                  },
                },
              },
            },
          },
        },
      },
    });
  };

  return (
    <div>
      <ActionContext.Provider value={{ visible, setVisible }}>
        {props.type ? (
          <Button type={'primary'} icon={<PlusOutlined />} onClick={() => openDrawer(props.type)}>
            {t('Add')}
          </Button>
        ) : (
          <Dropdown
            menu={{
              onClick(info) {
                openDrawer(info.key);
              },
              items: Object.values(loginTypes).map((type: any) => ({
                key: type.name,
                label: type.title,
              })),
            }}
          >
            <Button type={'primary'} icon={<PlusOutlined />}>
              {t('Add')} <DownOutlined />
            </Button>
          </Dropdown>
        )}
        <SchemaComponent
          scope={{ t, createOnly: true, useCreateSubmitAction, useCloseActionProps }}
          schema={schema}
          components={{ LoginConfigDesigner, PreviewToolbar }}
        />
      </ActionContext.Provider>
    </div>
  );
};

const EditLoginConfig = () => {
  const { t } = usePluginTranslation();
  const record = useRecord();
  const [schema, setSchema] = useState({});
  const compile = useCompile();
  const [visible, setVisible] = useState(false);
  const api = useAPIClient();
  const { service } = useBlockRequestContext();

  const useCloseActionProps = () => {
    return {
      onClick() {
        setVisible(false);
      },
    };
  };

  const useEditSubmitAction = () => {
    const form = useForm();
    return {
      async onClick() {
        await form.submit(async (values) => {
          if (values.enabled) {
            const { data } = await api.resource('login_configs').list({
              filter: {
                type: record.type,
                enabled: true,
                id: { $ne: record.id },
              },
              paginate: false,
            });
            const enabledConfigs = data?.data || [];
            if (enabledConfigs.length > 0) {
              await Promise.all(
                enabledConfigs.map((config) =>
                  api.resource('login_configs').update({
                    filterByTk: config.id,
                    values: {
                      enabled: false,
                    },
                  }),
                ),
              );
            }
          }
          await api.resource('login_configs').update({
            filterByTk: record.id,
            values,
          });
          message.success(t('Updated successfully'));
          setVisible(false);
          service?.refresh();
        });
      },
    };
  };

  const onEdit = useCallback(async () => {
    const loginType = loginTypes[record.type];
    if (!loginType) {
      return;
    }
    const { data } = await api.resource('login_configs').get({
      filterByTk: record.id,
    });
    const configData = data?.data || {};
    if (configData.options && typeof configData.options === 'string') {
      try {
        configData.options = JSON.parse(configData.options);
      } catch (e) {
        console.error('Parse options failed', e);
      }
    }
    setVisible(true);
    const schemaProperties = _.cloneDeep(loginType.fieldset);
    setSchema({
      type: 'object',
      properties: {
        [uid()]: {
          type: 'void',
          'x-component': 'Action.Drawer',
          'x-component-props': {
            width: '100vw',
            bodyStyle: { padding: 0, background: '#f0f2f5' },
          },
          'x-decorator': 'FormV2',
          'x-decorator-props': {
            initialValue: {
              ...configData,
              __previewLive: true,
            },
          },
          title: t('Edit') + ' - ' + compile(loginType.title),
          properties: {
            designer: {
              type: 'void',
              'x-component': 'LoginConfigDesigner',
              'x-component-props': {
                record: record,
                config: {
                  ...configData,
                  __previewLive: true,
                },
                schema: {
                  type: 'object',
                  properties: schemaProperties,
                },
              },
            },
            footer: {
              type: 'void',
              'x-component': 'Action.Drawer.Footer',
              properties: {
                previewToolbar: {
                  type: 'void',
                  'x-component': 'PreviewToolbar',
                  'x-align': 'left',
                },
                cancel: {
                  title: t('Cancel'),
                  'x-component': 'Action',
                  'x-use-component-props': 'useCloseActionProps',
                  'x-component-props': {
                    htmlType: 'button',
                  },
                },
                submit: {
                  title: t('Submit'),
                  'x-component': 'Action',
                  'x-use-component-props': 'useEditSubmitAction',
                  'x-component-props': {
                    type: 'primary',
                    htmlType: 'button',
                  },
                },
              },
            },
          },
        },
      },
    });
  }, [record, compile, api]);

  return (
    <div>
      <ActionContext.Provider value={{ visible, setVisible }}>
        <a onClick={onEdit}>{t('Edit')}</a>
        <SchemaComponent
          scope={{ t, useEditSubmitAction, useCloseActionProps }}
          schema={schema}
          components={{ LoginConfigDesigner, PreviewToolbar }}
        />
      </ActionContext.Provider>
    </div>
  );
};

export const LoginConfiguration = () => {
  const { t } = usePluginTranslation();
  const useRefreshAction = () => {
    const { service } = useBlockRequestContext();
    return {
      async run() {
        service?.refresh?.();
      },
    };
  };
  const api = useAPIClient();

  const useStandardCreateAction = () => {
    const form = useForm();
    const { setVisible } = useActionContext();
    const { service } = useBlockRequestContext();
    return {
      async onClick() {
        await form.submit(async (values) => {
          await api.resource('login_configs').create({
            values,
          });
          message.success(t('Created successfully'));
          setVisible(false);
          service?.refresh?.();
        });
      },
    };
  };

  const useStandardUpdateAction = () => {
    const form = useForm();
    const { setVisible } = useActionContext();
    const { service } = useBlockRequestContext();
    const record = useRecord();
    return {
      async onClick() {
        await form.submit(async (values) => {
          await api.resource('login_configs').update({
            filterByTk: record.id,
            values,
          });
          message.success(t('Updated successfully'));
          setVisible(false);
          service?.refresh?.();
        });
      },
    };
  };

  const useStandardDestroyAction = () => {
    const { service } = useBlockRequestContext();
    const record = useRecord();
    return {
      async run() {
        await api.resource('login_configs').destroy({
          filterByTk: record.id,
        });
        message.success(t('Deleted successfully'));
        service?.refresh?.();
      },
    };
  };

  const useStandardCancelAction = () => {
    const form = useForm();
    const ctx = useActionContext();
    return {
      async onClick() {
        ctx.setVisible(false);
        form.reset();
      },
    };
  };

  const useStandardValuesFromRecord = (options) => {
    const record = useRecord();
    const api = useAPIClient();
    const ctx = useActionContext();
    const form = React.useMemo(() => createForm(), []);
    const result = useRequest(
      async () => {
        if (!record?.id) {
          return { data: {} };
        }
        try {
          const res = await api.resource('login_configs').get({ filterByTk: record.id });
          const raw = (res as any)?.data?.data ?? (res as any)?.data;
          const data = _.omit(_.cloneDeep(raw || record), ['__parent', '__collectionName']);
          if (typeof data?.options === 'string') {
            try {
              data.options = JSON.parse(data.options);
            } catch (e) {
              void e;
            }
          }
          return { data };
        } catch (e) {
          const data = _.omit(_.cloneDeep(record), ['__parent', '__collectionName']);
          if (typeof data?.options === 'string') {
            try {
              data.options = JSON.parse(data.options);
            } catch (err) {
              void err;
            }
          }
          return { data };
        }
      },
      {
        ...options,
        manual: true,
        onSuccess(data) {
          if (data?.data) {
            form.setValues(data.data);
          }
        },
      },
    );
    React.useEffect(() => {
      if (ctx?.visible) {
        result.run();
      }
    }, [ctx?.visible, record?.id]);
    return {
      form,
    };
  };

  const useTableBlockProps = () => {
    const { service } = useBlockRequestContext();
    return {
      loading: service?.loading,
      dataSource: service?.data?.data,
      pagination: {
        current: service?.data?.meta?.page,
        pageSize: service?.data?.meta?.pageSize,
        total: service?.data?.meta?.count,
        onChange: (page, pageSize) => {
          service.run({ page, pageSize });
        },
      },
    };
  };

  const createSchema = (type?: string) => ({
    type: 'void',
    name: uid(),
    'x-decorator': 'TableBlockProvider',
    'x-decorator-props': {
      collection: 'login_configs',
      action: 'list',
      params: {
        pageSize: 20,
        sort: '-createdAt',
        filter: type ? { type } : undefined,
        appends: [],
      },
    },
    properties: {
      actions: {
        type: 'void',
        'x-component': 'ActionBar',
        'x-component-props': {
          style: {
            marginBottom: 16,
          },
        },
        properties: {
          create: {
            type: 'void',
            'x-component': 'CreateLoginConfig',
            'x-component-props': {
              type: type,
            },
          },
          refresh: {
            type: 'void',
            title: t('Refresh'),
            'x-component': 'Action',
            'x-component-props': {
              icon: 'ReloadOutlined',
              useAction: '{{ useRefreshAction }}',
            },
          },
        },
      },
      table: {
        type: 'array',
        'x-component': 'TableV2',
        'x-use-component-props': 'useTableBlockProps',
        'x-component-props': {
          rowKey: 'id',
          rowSelection: {
            type: 'checkbox',
          },
        },
        properties: {
          title: {
            type: 'void',
            'x-component': 'TableV2.Column',
            'x-component-props': { title: t('Title') },
            properties: {
              title: {
                type: 'string',
                'x-component': 'CollectionField',
                'x-read-pretty': true,
              },
            },
          },
          type: {
            type: 'void',
            'x-component': 'TableV2.Column',
            'x-component-props': { title: t('Type') },
            properties: {
              type: {
                type: 'string',
                'x-component': 'CollectionField',
                'x-read-pretty': true,
              },
            },
          },
          description: {
            type: 'void',
            'x-component': 'TableV2.Column',
            'x-component-props': { title: t('Description') },
            properties: {
              description: {
                type: 'string',
                'x-component': 'CollectionField',
                'x-read-pretty': true,
              },
            },
          },
          enabled: {
            type: 'void',
            'x-component': 'TableV2.Column',
            'x-component-props': { title: t('Enable') },
            properties: {
              enabled: {
                type: 'boolean',
                'x-component': 'CollectionField',
                'x-read-pretty': true,
              },
            },
          },
          actions: {
            type: 'void',
            'x-component': 'TableV2.Column',
            'x-component-props': { title: t('Actions') },
            properties: {
              actions: {
                type: 'void',
                'x-component': 'Space',
                properties: {
                  update: {
                    type: 'void',
                    'x-component': 'EditLoginConfig',
                  },
                  delete: {
                    type: 'void',
                    'x-component': 'Action.Link',
                    'x-component-props': {
                      confirm: {
                        title: t('Delete'),
                        content: t('Are you sure you want to delete it?'),
                      },
                      useAction: '{{ useStandardDestroyAction }}',
                    },
                    title: t('Delete'),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <ExtendCollectionsProvider collections={[collection]}>
      <SchemaComponentOptions
        components={{ CreateLoginConfig, EditLoginConfig }}
        scope={{
          t,
          useRefreshAction,
          useStandardCreateAction,
          useStandardUpdateAction,
          useStandardDestroyAction,
          useStandardCancelAction,
          useStandardValuesFromRecord,
          useTableBlockProps,
        }}
      >
        <Card bordered={false}>
          <Tabs
            items={[
              {
                key: 'home',
                label: t('Home configuration'),
                children: <SchemaComponent scope={{ useRefreshAction }} schema={createSchema('home')} />,
              },
            ]}
          />
        </Card>
      </SchemaComponentOptions>
    </ExtendCollectionsProvider>
  );
};

export { LoginConfiguration as LoginConfigurationPane };
