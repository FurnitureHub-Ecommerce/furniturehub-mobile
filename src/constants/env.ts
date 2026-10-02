/**
 * Environment configuration for FurnitureHub Mobile Application
 */

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.furniturehub.com/v1',
  APP_NAME: 'FurnitureHub',
  APP_VERSION: '1.0.0',
  TIMEOUT: 15000,
  ENABLE_ANALYTICS: false,
};
