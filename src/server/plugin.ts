/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Plugin } from '@nocobase/server';
import path from 'path';
import { create, update, getActiveConfig } from './actions/loginConfig';

export class PluginLoginHtmlServer extends Plugin {
  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    await this.db.import({
      directory: path.resolve(__dirname, 'collections'),
    });

    this.app.resourcer.define({
      name: 'login_configs',
      actions: {
        create,
        update,
        getActiveConfig,
      },
      only: ['list', 'get', 'create', 'update', 'destroy', 'getActiveConfig'],
    });
    this.app.acl.allow('login_configs', 'getActiveConfig', 'public');
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default PluginLoginHtmlServer;
