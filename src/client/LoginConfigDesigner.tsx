/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FormConsumer, useForm } from '@formily/react';
import { toJS } from '@formily/reactive';
import { useDebounceFn } from 'ahooks';
import {
  SchemaComponent,
  Input,
  FormItem,
  Checkbox,
  Radio,
  Select,
  InputNumber,
  Password,
  Space,
  Markdown,
  Action,
  ActionBar,
  useAPIClient,
} from '@nocobase/client';
import { usePluginTranslation } from './locale';
import { CustomSignInPage } from './CustomSignInPage';
import { AuthLayoutRender } from './CustomAuthLayout';
import { CustomColorPicker } from './components/CustomColorPicker';

export const LoginConfigDesigner = (props: any) => {
  const { t } = usePluginTranslation();
  const { schema, config } = props;
  const form = useForm();
  const [displayValues, setDisplayValues] = useState(toJS(form.values));
  const { run: applyPreview } = useDebounceFn((next) => setDisplayValues(next), { wait: 400 });
  const lastPreviewVersionRef = useRef<number | undefined>(undefined);
  const api = useAPIClient();

  useEffect(() => {
    if (config) {
      form.setValues(config);
    }
  }, [config, form]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 左侧预览区域 */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          borderRight: '1px solid #f0f0f0',
          overflow: 'hidden',
          background: '#f0f2f5',
        }}
      >
        <FormConsumer>
          {() => {
            const values = toJS(form.values);
            const livePreview = values?.__previewLive ?? true;
            const previewVersion = values?.__previewVersion;
            if (livePreview) {
              applyPreview(values);
            } else {
              if (previewVersion && previewVersion !== lastPreviewVersionRef.current) {
                lastPreviewVersionRef.current = previewVersion;
                setDisplayValues(values);
              }
            }
            return (
              <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <AuthLayoutRender loginConfig={displayValues}>
                  <CustomSignInPage loginConfig={displayValues} />
                </AuthLayoutRender>
              </div>
            );
          }}
        </FormConsumer>
      </div>

      {/* 右侧配置区域 */}
      <div style={{ width: 400, padding: 24, overflowY: 'auto', background: '#fff', borderLeft: '1px solid #f0f0f0' }}>
        <SchemaComponent
          schema={schema}
          scope={{
            t,
          }}
          components={{
            Input,
            FormItem,
            Checkbox,
            Radio,
            Select,
            InputNumber,
            Password,
            Space,
            Markdown,
            Action,
            ActionBar,
            CustomColorPicker,
            fieldset: 'fieldset',
          }}
        />
      </div>
    </div>
  );
};
