// SPDX-License-Identifier: Apache-2.0
/**
 * Schema Field Types
 * 
 * Type definitions for schema field renderers.
 */

import { ReactNode } from 'react';
import { SchemaField } from '@/features/perspectives/types';

export interface BaseFieldProps {
  field: SchemaField;
  value: any;
  className?: string;
  children?: ReactNode;
}

export interface TagFieldProps extends BaseFieldProps {
  value: string[];
}

export interface NodeFieldProps extends BaseFieldProps {
  value: {
    id: string;
    label: string;
    type?: string;
    [key: string]: any;
  };
}

export interface EdgeFieldProps extends BaseFieldProps {
  value: {
    source: string;
    target: string;
    type?: string;
    [key: string]: any;
  };
}

export interface ArrayFieldProps extends BaseFieldProps {
  value: any[];
}

export interface TextFieldProps extends BaseFieldProps {
  value: string;
}

export interface NumberFieldProps extends BaseFieldProps {
  value: number;
}

export interface ComplexFieldProps extends BaseFieldProps {
  value: Record<string, any>;
} 