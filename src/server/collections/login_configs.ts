/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

const NAMESPACE = '@taichuy/plugin-login-html';

export default {
  name: 'login_configs',
  dumpRules: 'required' as any,
  model: 'LoginConfigModel', // Optional: if we want to define a custom model later
  title: 'Login Configurations',
  fields: [
    {
      name: 'id',
      type: 'bigInt',
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    {
      name: 'title',
      type: 'string',
      title: '{{t("Title")}}',
      comment: `{{t("Configuration title", { ns: "${NAMESPACE}" })}}`,
      required: true,
    },
    {
      name: 'enabled',
      type: 'boolean',
      title: '{{t("Enable")}}',
      defaultValue: true,
    },
    {
      name: 'type',
      type: 'string',
      title: '{{t("Type")}}',
      comment: `{{t("Configuration type: home=Home config", { ns: "${NAMESPACE}" })}}`,
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      title: '{{t("Description")}}',
    },
    {
      name: 'options',
      type: 'json',
      title: `{{t("Configuration options", { ns: "${NAMESPACE}" })}}`,
      defaultValue: {},
    },
  ],
};
