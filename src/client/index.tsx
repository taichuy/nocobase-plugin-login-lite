/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/client';
import { CustomColorPicker } from './components/CustomColorPicker';
import { CustomAuthLayout } from './CustomAuthLayout';
import { CustomSignInPage } from './CustomSignInPage';
import { LoginConfigurationPane } from './LoginConfiguration';
import { tStr } from './locale';

export class PluginLoginHtmlClient extends Plugin {
  async afterAdd() {
    // await this.app.pm.add()
  }

  async beforeLoad() {}

  // You can get and modify the app instance here
  async load() {
    this.app.pluginSettingsManager.add('plugin-login', {
      title: tStr('Login configurations'),
      icon: 'SettingOutlined',
      Component: LoginConfigurationPane,
    });

    // Register custom AuthLayout and SignInPage components to override default ones
    this.app.addComponents({
      AuthLayout: CustomAuthLayout,
      SignInPage: CustomSignInPage as any,
      CustomColorPicker,
    });
  }
}

export default PluginLoginHtmlClient;
