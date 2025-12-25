/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { InputNumber } from 'antd';
import { connect, mapProps } from '@formily/react';

export const PercentageInput = connect(
  InputNumber,
  mapProps((props) => {
    return {
      ...props,
      min: 0,
      max: 1,
      step: 0.01,
      formatter: (value) => {
        if (value === undefined || value === null || value === '') {
          return '';
        }
        return `${(Number(value) * 100).toFixed(0)}%`;
      },
      parser: (value) => {
        const parsed = parseFloat(value?.replace('%', '') || '0');
        return isNaN(parsed) ? 0 : parsed / 100;
      },
      style: { width: '100%', ...props.style },
    };
  }),
);
