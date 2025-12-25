/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Context, Next } from '@nocobase/actions';

export const create = async (ctx: Context, next: Next) => {
  const { values } = ctx.action.params;
  const repo = ctx.db.getRepository('login_configs');

  // If the new config is enabled, disable other configs of the same type
  if (values.enabled === true && values.type) {
    await repo.update({
      filter: {
        type: values.type,
      },
      values: { enabled: false },
    });
  }

  const result = await repo.create({
    values,
  });

  ctx.body = result;
  await next();
};

export const update = async (ctx: Context, next: Next) => {
  const { filterByTk, values } = ctx.action.params;
  const repo = ctx.db.getRepository('login_configs');

  // Get current config to know the type if not provided in values
  const currentConfig = await repo.findOne({ filterByTk });
  if (!currentConfig) {
    ctx.throw(404, ctx.t('Configuration not found'));
  }

  const type = values.type || currentConfig.type;

  // If the updated config is enabled, disable other configs of the same type
  if (values.enabled === true) {
    await repo.update({
      filter: {
        id: {
          $ne: filterByTk,
        },
        type: type,
      },
      values: { enabled: false },
    });
  }

  const result = await repo.update({
    filterByTk,
    values,
  });

  ctx.body = result;

  await next();
};

export const getActiveConfig = async (ctx: Context, next: Next) => {
  const repo = ctx.db.getRepository('login_configs');
  const { type } = ctx.action.params;

  // 安全检查：如果用户未登录，只允许获取 type='home' 的配置
  // 防止未授权用户获取敏感配置（如公众号 AppSecret 等）
  if (!ctx.state.currentUser && type !== 'home') {
    ctx.throw(403, ctx.t('Forbidden: Only "home" config is publicly accessible'));
  }

  const filter: any = {
    enabled: true,
  };

  if (type) {
    filter.type = type;
  }

  // Get the first enabled config
  // If type is provided, it returns the active config for that type.
  // If no type provided, it returns the most recently updated active config of any type.
  const config = await repo.findOne({
    filter,
    sort: ['-updatedAt'],
  });

  if (config) {
    ctx.body = config.toJSON();
  } else {
    ctx.body = null;
  }
};
