/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import {
  DingtalkOutlined,
  GoogleOutlined,
  LeftOutlined,
  LoginOutlined,
  MailOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { Plugin, SwitchLanguage, useApp, usePlugin, useSystemSettings } from '@nocobase/client-v2';
import PluginAuthClientV2, {
  AuthenticatorsContext,
  AuthenticatorsContextProvider,
  type AuthOptions,
  type Authenticator,
} from '@nocobase/plugin-auth/client-v2';
import { Alert, Button, Col, Empty, Row, Space, Spin, theme } from 'antd';
import MarkdownIt from 'markdown-it';
import React, { lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useOutletContext } from 'react-router-dom';

const NAMESPACE = '@taichuy/plugin-login-lite';
const DEFAULT_BG_URL = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
const DEFAULT_POWERED_BY_HTML =
  '<div>Powered by <a href="https://www.nocobase.com/" target="_blank">NocoBase</a></div>';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

type LoginConfigOptions = {
  useSystemName?: 'yes' | 'no';
  customSystemName?: string;
  leftContentType?: 'image' | 'html' | 'url';
  leftImage?: string;
  leftUrl?: string;
  leftHtml?: string;
  loginMethods?: string[];
  copyright?: string;
  icp?: string;
  themeColor?: string;
  themeOpacity?: number;
  fontColor?: string;
  formThemeColor?: string;
  formFontColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
};

type LoginConfigRecord = LoginConfigOptions & {
  options?: LoginConfigOptions;
  __previewLive?: boolean;
};

type LoaderMap<L> = Record<string, L>;

type SignInComponentProps = {
  authenticator: Authenticator;
};

type LoginOption = {
  type: 'authenticator';
  key: string;
  label: string;
  icon: React.ReactNode;
  authenticator: Authenticator;
};

function useLoginLiteTranslation() {
  return useTranslation([NAMESPACE, 'client'], { nsMode: 'fallback' });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const maybeError = error as {
    message?: string;
    response?: { data?: { errors?: { message?: string }[] } };
  };
  return maybeError.response?.data?.errors?.[0]?.message || maybeError.message || fallback;
}

function getResponseData<T>(response: { data?: { data?: T } | T } | undefined): T | undefined {
  const payload = response?.data;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T | undefined;
}

function normalizeLoginConfig(config: LoginConfigRecord | undefined): LoginConfigOptions {
  return config?.options || config || {};
}

function MarkdownRenderer({ content }: { content: string }) {
  const html = useMemo(() => md.render(content || ''), [content]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) {
    return 'transparent';
  }
  if (!hex.startsWith('#')) {
    return hex;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function useLoaderMap<K extends keyof AuthOptions>(field: K): LoaderMap<NonNullable<AuthOptions[K]>> {
  const plugin = usePlugin(PluginAuthClientV2);
  return useMemo(() => {
    const result: LoaderMap<NonNullable<AuthOptions[K]>> = {};
    for (const [authType, options] of plugin.authTypes.getEntities()) {
      const loader = options[field];
      if (loader) {
        result[authType] = loader as NonNullable<AuthOptions[K]>;
      }
    }
    return result;
  }, [field, plugin]);
}

function lazyByAuthType<P>(loaderMap: LoaderMap<() => Promise<{ default: React.ComponentType<P> }>>) {
  const cache = new Map<string, React.LazyExoticComponent<React.ComponentType<P>>>();
  return (authType: string) => {
    if (!loaderMap[authType]) {
      return undefined;
    }
    if (!cache.has(authType)) {
      cache.set(authType, lazy(loaderMap[authType]));
    }
    return cache.get(authType);
  };
}

export function AuthLayoutRenderV2({
  loginConfig: propsLoginConfig,
  children,
}: {
  loginConfig?: LoginConfigRecord;
  children?: React.ReactNode;
}) {
  const { data } = useSystemSettings() || {};
  const { t: tCollections } = useTranslation('lm-collections');
  const { token } = theme.useToken();
  const [bgUrl, setBgUrl] = useState('');

  const loginConfig = normalizeLoginConfig(propsLoginConfig);
  const isPreview = !!propsLoginConfig?.__previewLive;
  const isHtmlContent = loginConfig.leftContentType === 'html';
  const isUrlContent = loginConfig.leftContentType === 'url';
  const themeColor = loginConfig.themeColor || '#000';
  const themeOpacity = loginConfig.themeOpacity !== undefined ? loginConfig.themeOpacity : 1;
  const bgColor = themeOpacity !== 1 && themeColor.startsWith('#') ? hexToRgba(themeColor, themeOpacity) : themeColor;
  const fontColor = loginConfig.fontColor || '#fff';
  const systemTitle = String(data?.data?.title || 'NocoBase');
  const systemName = loginConfig.useSystemName === 'no' ? loginConfig.customSystemName : tCollections(systemTitle);
  const footerCopyright = loginConfig.copyright || DEFAULT_POWERED_BY_HTML;

  useEffect(() => {
    if (loginConfig.leftContentType === 'image') {
      setBgUrl(loginConfig.leftImage || DEFAULT_BG_URL);
    } else if (!loginConfig.leftContentType) {
      setBgUrl(DEFAULT_BG_URL);
    }
  }, [loginConfig.leftContentType, loginConfig.leftImage]);

  return (
    <Row
      style={{
        width: isPreview ? '100%' : '100vw',
        height: isPreview ? '100%' : '100vh',
        minHeight: isPreview ? '100%' : '100vh',
        overflow: 'hidden',
      }}
      className={css`
        @media (max-width: 768px) {
          .login-lite-left-pane {
            display: none;
          }
        }
      `}
    >
      <Col className="login-lite-left-pane" flex="auto" style={{ height: '100%' }}>
        {isUrlContent ? (
          <iframe
            src={loginConfig.leftUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Embedded Content"
          />
        ) : isHtmlContent ? (
          <div
            style={{ width: '100%', height: '100%', border: 'none' }}
            dangerouslySetInnerHTML={{ __html: loginConfig.leftHtml || '' }}
          />
        ) : (
          <div
            style={{
              height: '100%',
              backgroundColor: '#111',
              backgroundImage: `url(${bgUrl || DEFAULT_BG_URL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.1)',
              }}
            />
          </div>
        )}
      </Col>
      <Col
        flex="400px"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: bgColor,
          color: fontColor,
        }}
        className={css`
          @media (max-width: 768px) {
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
        `}
      >
        <div style={{ position: 'fixed', top: token.paddingLG, right: token.paddingLG, color: fontColor }}>
          <SwitchLanguage />
        </div>
        <div
          className={css`
            .content-wrapper,
            .main-content {
              width: 100%;
              display: flex;
              justify-content: center;
            }
          `}
        >
          <div style={{ width: '70%', margin: '0 auto 20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: fontColor }}>{systemName}</h1>
          </div>
          <div className="content-wrapper">
            <div className="main-content">
              <AuthenticatorsContextProvider>
                {children || <Outlet context={{ loginConfig: propsLoginConfig }} />}
              </AuthenticatorsContextProvider>
            </div>
          </div>
          <div style={{ width: '90%', margin: '40px auto 0', color: fontColor, textAlign: 'center' }}>
            <div style={{ marginBottom: 8 }}>
              <MarkdownRenderer content={footerCopyright} />
            </div>
            {loginConfig.icp ? (
              <div style={{ marginBottom: 8 }}>
                <MarkdownRenderer content={loginConfig.icp} />
              </div>
            ) : null}
          </div>
        </div>
      </Col>
    </Row>
  );
}

export function CustomSignInPageV2({ loginConfig: propsLoginConfig }: { loginConfig?: LoginConfigRecord }) {
  const [t] = useLoginLiteTranslation();
  const { loginConfig: contextLoginConfig } = useOutletContext<{ loginConfig?: LoginConfigRecord }>() || {};
  const rawLoginConfig = propsLoginConfig || contextLoginConfig;
  const loginConfig = normalizeLoginConfig(rawLoginConfig);
  const authenticators = useContext(AuthenticatorsContext);
  const signInFormLoaders = useLoaderMap('signInFormLoader');
  const signInButtonLoaders = useLoaderMap('signInButtonLoader');
  const resolveSignInForm = useMemo(() => lazyByAuthType<SignInComponentProps>(signInFormLoaders), [signInFormLoaders]);
  const resolveSignInButton = useMemo(
    () => lazyByAuthType<SignInComponentProps>(signInButtonLoaders),
    [signInButtonLoaders],
  );

  useEffect(() => {
    document.title = t('Signin');
  }, [t]);

  const loginMethods = loginConfig.loginMethods || ['password'];
  const showPassword = loginMethods.includes('password');

  const availableOptions: LoginOption[] = useMemo(() => {
    const options: LoginOption[] = [];
    authenticators.forEach((authenticator) => {
      const hasForm = !!resolveSignInForm(authenticator.authType);
      const hasButton = !!resolveSignInButton(authenticator.authType);
      const isBasicOrEmail =
        authenticator.authType === 'basic' || authenticator.authType === 'email' || authenticator.authType === 'Email';

      if ((!hasForm && !hasButton) || (isBasicOrEmail && !showPassword)) {
        return;
      }

      let icon = <LoginOutlined />;
      if (isBasicOrEmail) {
        icon =
          authenticator.authType === 'email' || authenticator.authType === 'Email' ? (
            <MailOutlined />
          ) : (
            <UserOutlined />
          );
      } else if (authenticator.authType.toLowerCase() === 'sms') {
        icon = <MobileOutlined />;
      } else if (authenticator.authType.toLowerCase() === 'dingtalk') {
        icon = <DingtalkOutlined />;
      } else if (authenticator.authType.toLowerCase() === 'google' || authenticator.authType === 'Google') {
        icon = <GoogleOutlined />;
      }

      options.push({
        type: 'authenticator',
        key: authenticator.name,
        label: authenticator.title || (isBasicOrEmail ? t('Password Login') : authenticator.name),
        icon,
        authenticator,
      });
    });
    return options;
  }, [authenticators, resolveSignInButton, resolveSignInForm, showPassword, t]);

  const [mode, setMode] = useState<string>('select');
  const [currentAuthenticator, setCurrentAuthenticator] = useState<Authenticator | null>(null);

  useEffect(() => {
    if (availableOptions.length === 1 && mode === 'select') {
      const option = availableOptions[0];
      setMode(option.key);
      setCurrentAuthenticator(option.authenticator);
    }
  }, [availableOptions, mode]);

  const formThemeColor = loginConfig.formThemeColor || 'rgba(255,255,255,0.12)';
  const formFontColor = loginConfig.formFontColor || '#fff';
  const buttonBgColor = loginConfig.buttonBgColor || 'rgba(255,255,255,0.2)';
  const buttonTextColor = loginConfig.buttonTextColor || formFontColor;

  if (!availableOptions.length) {
    return <Empty description={t('No authentication methods available.')} />;
  }

  return (
    <Space
      direction="vertical"
      className={css`
        display: flex;
        width: 100%;
      `}
    >
      {mode === 'select' && availableOptions.length > 1 ? (
        <div style={{ width: '70%', margin: '0 auto' }}>
          <div
            className={css`
              display: grid;
              grid-template-columns: 1fr;
              gap: 14px;
            `}
          >
            {availableOptions.map((option) => {
              const ButtonComponent = resolveSignInButton(option.authenticator.authType);
              const FormComponent = resolveSignInForm(option.authenticator.authType);
              if (ButtonComponent && !FormComponent) {
                return (
                  <div
                    key={option.key}
                    className={css`
                      width: 100%;
                      .ant-btn {
                        width: 100%;
                        height: 44px;
                        border-radius: 999px;
                        background: ${buttonBgColor};
                        border-color: ${buttonBgColor} !important;
                        color: ${buttonTextColor} !important;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: none;
                      }
                      .ant-btn:hover {
                        background: ${buttonBgColor} !important;
                        border-color: ${buttonBgColor} !important;
                        color: ${buttonTextColor} !important;
                        opacity: 0.92 !important;
                      }
                    `}
                  >
                    <Suspense fallback={<Spin />}>
                      <ButtonComponent authenticator={option.authenticator} />
                    </Suspense>
                  </div>
                );
              }

              return (
                <Button
                  key={option.key}
                  block
                  size="large"
                  type="default"
                  icon={option.icon}
                  onClick={() => {
                    setMode(option.key);
                    setCurrentAuthenticator(option.authenticator);
                  }}
                  className={css`
                    height: 44px;
                    border-radius: 999px;
                    background: ${buttonBgColor};
                    border-color: ${buttonBgColor} !important;
                    color: ${buttonTextColor} !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {mode !== 'select' || availableOptions.length === 1 ? (
        <div
          style={{
            maxWidth: 360,
            width: '90%',
            margin: '40px auto 0',
            padding: 32,
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
            .ant-input::placeholder {
              color: ${formFontColor} !important;
              opacity: 0.6;
            }
            .ant-input:hover,
            .ant-input:focus,
            .ant-input-password:hover,
            .ant-input-password:focus-within,
            .ant-input-affix-wrapper:hover,
            .ant-input-affix-wrapper-focused {
              border-color: rgba(255, 255, 255, 0.5) !important;
            }
            .ant-btn-primary {
              background-color: ${buttonBgColor} !important;
              border-color: ${buttonBgColor} !important;
              color: ${buttonTextColor} !important;
            }
            .ant-form-item-explain-error {
              color: #ffccc7 !important;
            }
            .ant-form-item-label > label,
            label {
              color: ${formFontColor} !important;
            }
            .ant-btn-default,
            .ant-btn:not(.ant-btn-primary):not(.ant-btn-link):not(.ant-btn-text) {
              background-color: transparent !important;
              border-color: rgba(255, 255, 255, 0.4) !important;
              color: ${formFontColor} !important;
            }
            a {
              color: ${formFontColor} !important;
              text-decoration: underline;
              opacity: 0.8;
            }
          `}
        >
          {availableOptions.length > 1 ? (
            <div style={{ marginBottom: 16 }}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => {
                  setMode('select');
                  setCurrentAuthenticator(null);
                }}
                style={{ color: formFontColor, paddingLeft: 0 }}
              >
                {t('Back')}
              </Button>
            </div>
          ) : null}

          {currentAuthenticator ? (
            <Suspense fallback={<Spin />}>
              {(() => {
                const FormComponent = resolveSignInForm(currentAuthenticator.authType);
                const ButtonComponent = resolveSignInButton(currentAuthenticator.authType);
                const Component = FormComponent || ButtonComponent;
                return Component ? <Component authenticator={currentAuthenticator} /> : null;
              })()}
            </Suspense>
          ) : null}
        </div>
      ) : null}
    </Space>
  );
}

export function CustomAuthLayoutV2() {
  const app = useApp();
  const [t] = useLoginLiteTranslation();
  const [state, setState] = useState<{
    loginConfig?: LoginConfigRecord;
    loading: boolean;
    error?: string;
  }>({
    loading: true,
  });

  useEffect(() => {
    let active = true;
    app.apiClient
      .resource('login_configs')
      .getActiveConfig({
        type: 'home',
      })
      .then((res) => {
        if (!active) {
          return;
        }
        setState({
          loginConfig: getResponseData<LoginConfigRecord>(res) || {},
          loading: false,
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setState({
          loginConfig: {},
          loading: false,
          error: getErrorMessage(error, t('Failed to fetch login config')),
        });
      });

    return () => {
      active = false;
    };
  }, [app.apiClient, t]);

  if (state.loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <AuthLayoutRenderV2 loginConfig={state.loginConfig}>
      {state.error ? <Alert type="warning" showIcon message={state.error} /> : undefined}
    </AuthLayoutRenderV2>
  );
}

export class PluginLoginLiteClientV2 extends Plugin {
  private registerAuthRoutes = () => {
    this.router.add('auth', {
      componentLoader: async () => ({ default: CustomAuthLayoutV2 }),
    });
    this.router.add('auth.signin', {
      path: '/signin',
      skipAuthCheck: true,
      componentLoader: async () => ({ default: CustomSignInPageV2 }),
    });
  };

  async beforeLoad() {
    this.app.eventBus.addEventListener('plugin:auth:loaded', this.registerAuthRoutes);
    this.app.eventBus.addEventListener('plugin:@nocobase/plugin-auth:loaded', this.registerAuthRoutes);
  }

  async load() {
    this.registerAuthRoutes();
  }
}

export default PluginLoginLiteClientV2;
