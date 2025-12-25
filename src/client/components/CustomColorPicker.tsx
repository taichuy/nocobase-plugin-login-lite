/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React from 'react';
import { ColorPicker } from 'antd';
import { connect, mapProps } from '@formily/react';

export const CustomColorPicker = connect(
  (props) => {
    const { value, onChange, ...others } = props;
    return (
      <ColorPicker
        value={value}
        onChange={(color) => {
          const rgba = color.toRgb();
          const alpha = typeof rgba.a === 'number' ? rgba.a : 1;
          if (alpha < 1) {
            onChange(`rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`);
          } else {
            onChange(color.toHexString());
          }
        }}
        showText
        {...others}
      />
    );
  },
  mapProps((props) => {
    return {
      ...props,
    };
  }),
);
