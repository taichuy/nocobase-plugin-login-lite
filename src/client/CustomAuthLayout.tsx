/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Col, Row } from 'antd';
import { Outlet } from 'react-router-dom';
import { useSystemSettings, useToken, useAPIClient, useRequest } from '@nocobase/client';
import { usePluginTranslation } from './locale';
import { AuthenticatorsContextProvider } from '@nocobase/plugin-auth/client';
import { css } from '@emotion/css';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function MarkdownRenderer({ content }: { content: string }) {
  const html = useMemo(() => md.render(content || ''), [content]);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const hexToRgba = (hex: string, alpha: number) => {
  if (!hex) return 'transparent';
  if (!hex.startsWith('#')) return hex;
  let r = 0,
    g = 0,
    b = 0;
  // Handle short #000
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

export function AuthLayoutRender({
  loginConfig: propsLoginConfig,
  children,
}: {
  loginConfig: any;
  children?: React.ReactNode;
}) {
  const { data } = useSystemSettings() || {};
  const { t } = usePluginTranslation();

  // Use options if available, otherwise fallback to the object itself (in case it's already the options object)
  const loginConfig = propsLoginConfig?.options || propsLoginConfig || {};

  // 默认配置
  const defaultBgUrl = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
  const [bgUrl, setBgUrl] = useState(defaultBgUrl);

  useEffect(() => {
    if (loginConfig.leftContentType === 'image') {
      setBgUrl(loginConfig.leftImage || defaultBgUrl);
    } else if (!loginConfig.leftContentType) {
      // Fallback to initial logic if no config
      setBgUrl(defaultBgUrl);
    }
  }, [loginConfig.leftContentType, loginConfig.leftImage, defaultBgUrl]);

  const systemName = loginConfig.useSystemName === 'no' ? loginConfig.customSystemName : t(data?.data?.title);
  const isHtmlContent = loginConfig.leftContentType === 'html';
  const isUrlContent = loginConfig.leftContentType === 'url';

  const themeColor = loginConfig.themeColor || '#000';
  const themeOpacity = loginConfig.themeOpacity !== undefined ? loginConfig.themeOpacity : 1;

  let bgColor = themeColor;
  if (themeOpacity !== 1 && themeColor.startsWith('#')) {
    bgColor = hexToRgba(themeColor, themeOpacity);
  }

  const fontColor = loginConfig.fontColor || '#fff';

  return (
    <Row style={{ height: '100%', overflow: 'hidden' }}>
      <Col flex="auto" style={{ height: '100%' }}>
        {/* 左侧内容区域 */}
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
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              color: '#fff',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.1)', // 轻微遮罩
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
      >
        <div
          className={css`
            .content-wrapper {
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .main-content {
              width: 100%;
              display: flex;
              justify-content: center;
            }
          `}
        >
          <div style={{ width: '70%', margin: '0 auto', marginBottom: 20, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: fontColor }}>{systemName}</h1>
          </div>
          <div className="content-wrapper">
            <div className="main-content">
              <AuthenticatorsContextProvider>
                {children ? children : <Outlet context={{ loginConfig: propsLoginConfig }} />}
              </AuthenticatorsContextProvider>
            </div>
          </div>
          <div
            className={css`
              text-align: center;
            `}
            style={{ width: '90%', margin: '40px auto 0', color: fontColor }}
          >
            {loginConfig.copyright ? (
              <div style={{ marginBottom: 8 }}>
                <MarkdownRenderer content={loginConfig.copyright} />
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                <MarkdownRenderer
                  content={`<div>Powered by <a href="https://www.nocobase.com/" target="_blank">NocoBase</a></div>`}
                />
              </div>
            )}

            {loginConfig.icp && (
              <div style={{ marginBottom: 8 }}>
                <MarkdownRenderer content={loginConfig.icp} />
              </div>
            )}
          </div>
        </div>
      </Col>
    </Row>
  );
}

export function CustomAuthLayout() {
  const { data: loginConfigResult } = useRequest(
    {
      resource: 'login_configs',
      action: 'getActiveConfig', // This action needs to be implemented in server
      params: {
        type: 'home',
      },
    },
    {
      onError: (err) => {
        console.error('Failed to fetch login config', err);
      },
    },
  );

  const loginConfig = (loginConfigResult as any)?.data || {};

  return <AuthLayoutRender loginConfig={loginConfig} />;
}
