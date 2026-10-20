/**
 * Environment configuration for FurnitureHub Mobile Application
 */

export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api-furniturehub-minhdevops.up.railway.app',
  APP_NAME: 'FurnitureHub',
  APP_VERSION: '1.0.0',
  TIMEOUT: 45000, // 45s để đối phó Railway cold start
  ENABLE_ANALYTICS: false,
};
