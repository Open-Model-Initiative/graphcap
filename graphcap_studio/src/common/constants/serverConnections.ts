// SPDX-License-Identifier: Apache-2.0

/**
 * Server connection constants
 */
export const SERVER_IDS = {
  MEDIA_SERVER: 'media-server',
  GRAPHCAP_SERVER: 'graphcap-server'
} as const;

export const SERVER_NAMES = {
  [SERVER_IDS.MEDIA_SERVER]: 'Media Server',
  [SERVER_IDS.GRAPHCAP_SERVER]: 'GraphCap Server'
} as const;

export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  TESTING: 'testing'
} as const;

export const DEFAULT_URLS = {
  [SERVER_IDS.MEDIA_SERVER]: 'http://localhost:32400',
  [SERVER_IDS.GRAPHCAP_SERVER]: 'http://localhost:32100'
} as const; 