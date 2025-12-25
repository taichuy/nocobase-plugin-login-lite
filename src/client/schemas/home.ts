/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { tStr } from '../locale';

export default {
  title: tStr('Home configuration'),
  name: 'home',
  fieldset: {
    title: {
      title: tStr('Title'),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      required: true,
    },
    description: {
      title: tStr('Description'),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Input.TextArea',
    },
    options: {
      type: 'object',
      'x-component': 'fieldset',
      properties: {
        useSystemName: {
          title: tStr('Use system name'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Radio.Group',
          enum: [
            { label: tStr('Yes'), value: 'yes' },
            { label: tStr('No'), value: 'no' },
          ],
          default: 'yes',
          required: true,
        },
        customSystemName: {
          title: tStr('Custom system name'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-reactions': [
            {
              dependencies: ['.useSystemName'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "no"}}',
                  required: '{{$deps[0] === "no"}}',
                },
              },
            },
          ],
        },
        leftContentType: {
          title: tStr('Left side content display'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Radio.Group',
          enum: [
            { label: tStr('Image'), value: 'image' },
            { label: tStr('HTML embed'), value: 'html' },
            { label: tStr('Webpage embed'), value: 'url' },
          ],
          default: 'image',
          required: true,
        },
        leftImage: {
          title: tStr('Left side image URL'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          default: 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN',
          'x-reactions': [
            {
              dependencies: ['.leftContentType'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "image"}}',
                },
              },
            },
          ],
        },
        leftUrl: {
          title: tStr('Webpage embed URL'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-reactions': [
            {
              dependencies: ['.leftContentType'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "url"}}',
                  required: '{{$deps[0] === "url"}}',
                },
              },
            },
          ],
        },
        leftHtml: {
          title: tStr('HTML embed code'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Input.TextArea',
          'x-reactions': [
            {
              dependencies: ['.leftContentType'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] === "html"}}',
                },
              },
            },
          ],
        },
        loginMethods: {
          title: tStr('Open login methods'),
          type: 'array',
          'x-decorator': 'FormItem',
          'x-component': 'Checkbox.Group',
          enum: [{ label: tStr('Password Login'), value: 'password' }],
          default: ['password'],
        },
        copyright: {
          title: tStr('Copyright settings (Markdown)'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Markdown',
          default: '<div>Powered by <a href="https://www.nocobase.com/" target="_blank">NocoBase</a></div>',
        },
        icp: {
          title: tStr('ICP filing information (Markdown)'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'Markdown',
          default: '<div>Modified by <a href="https://www.taichuy.com/" target="_blank">太初y</a></div>',
        },
        themeColor: {
          title: tStr('Background theme color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: '#000',
        },
        fontColor: {
          title: tStr('Font color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: '#fff',
        },
        formThemeColor: {
          title: tStr('Login form theme color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: 'rgba(255,255,255,0.12)',
        },
        formFontColor: {
          title: tStr('Login form text color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: '#fff',
        },
        buttonBgColor: {
          title: tStr('Button background color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: 'rgba(255,255,255,0.2)',
        },
        buttonTextColor: {
          title: tStr('Button text color'),
          type: 'string',
          'x-decorator': 'FormItem',
          'x-component': 'CustomColorPicker',
          default: '#fff',
        },
      },
    },
    enabled: {
      title: tStr('Enable'),
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Checkbox',
      default: true,
    },
  },
};
