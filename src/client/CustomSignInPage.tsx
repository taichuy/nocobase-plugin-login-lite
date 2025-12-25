/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useContext, useState, useEffect } from 'react';
import { Space, Button } from 'antd';
import { css } from '@emotion/css';
import { useCurrentDocumentTitle, useViewport, usePlugin } from '@nocobase/client';
import { usePluginTranslation } from './locale';
import AuthPlugin, { AuthenticatorsContext } from '@nocobase/plugin-auth/client';
import { UserOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';

const useSignInForms = () => {
  const plugin = usePlugin(AuthPlugin);
  const authTypes = plugin.authTypes.getEntities();
  const signInForms: any = {};
  for (const [authType, options] of authTypes) {
    if (options.components?.SignInForm) {
      signInForms[authType] = options.components.SignInForm;
    }
  }
  return signInForms;
};

export const CustomSignInPage = ({ loginConfig: propsLoginConfig }: { loginConfig?: any }) => {
  const { t } = usePluginTranslation();
  useCurrentDocumentTitle('Signin');
  useViewport();
  const { loginConfig: contextLoginConfig } = useOutletContext<any>() || {};
  const rawLoginConfig = propsLoginConfig || contextLoginConfig;
  const loginConfig = rawLoginConfig?.options || rawLoginConfig || {};

  const [mode, setMode] = useState<'select' | 'password'>('password');

  const signInForms = useSignInForms();
  const authenticators = useContext(AuthenticatorsContext);

  // We only support password login in this simplified version for now
  // const loginMethods = loginConfig?.loginMethods || ['password'];

  const passwordAuthenticator =
    authenticators.find((a) => a.authType === 'basic' || a.authType === 'email') || authenticators[0];

  let PasswordComponent = null;
  if (passwordAuthenticator) {
    const C = signInForms[passwordAuthenticator.authType];
    if (C) {
      PasswordComponent = React.createElement(C, { authenticator: passwordAuthenticator });
    }
  }

  const formThemeColor = loginConfig?.formThemeColor || 'rgba(255,255,255,0.12)';
  const formFontColor = loginConfig?.formFontColor || '#fff';
  const buttonBgColor = loginConfig?.buttonBgColor || 'rgba(255,255,255,0.2)';
  const buttonTextColor = loginConfig?.buttonTextColor || formFontColor;

  return (
    <Space
      direction="vertical"
      className={css`
        display: flex;
        width: 100%;
      `}
    >
      <div
        style={{
          maxWidth: 360,
          width: '90%',
          margin: '40px auto 0',
          padding: '32px',
          background: formThemeColor,
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 16,
          backdropFilter: 'blur(6px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          color: formFontColor,
        }}
        className={css`
          .ant-input,
          .ant-input-password,
          .ant-input-affix-wrapper {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: ${formFontColor} !important;
            backdrop-filter: blur(4px);
          }
          .ant-input-affix-wrapper > input.ant-input {
            background-color: transparent !important;
            color: ${formFontColor} !important;
          }
          .ant-input::placeholder,
          .ant-input-affix-wrapper::placeholder {
            color: ${formFontColor} !important;
            opacity: 0.6;
          }
          .ant-input:hover,
          .ant-input:focus,
          .ant-input-password:hover,
          .ant-input-password:focus-within,
          .ant-input-affix-wrapper:hover,
          .ant-input-affix-wrapper:focus,
          .ant-input-affix-wrapper-focused {
            border-color: rgba(255, 255, 255, 0.5) !important;
          }
          .ant-btn-primary {
            background-color: ${buttonBgColor} !important;
            border-color: ${buttonBgColor} !important;
            color: ${buttonTextColor} !important;
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05) !important;
          }
          .ant-btn-primary:hover {
            filter: brightness(1.06);
          }
          .ant-form-item-explain-error {
            color: #ffccc7 !important;
          }
          a {
            color: ${formFontColor} !important;
            text-decoration: underline;
            opacity: 0.8;
          }
          a:hover {
            opacity: 1;
          }
        `}
      >
        {PasswordComponent}
      </div>
    </Space>
  );
};
