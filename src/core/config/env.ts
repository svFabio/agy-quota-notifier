export const ENV = {
  DB_NAME: process.env.EXPO_PUBLIC_DB_NAME || 'default.db',
  NOTIFICATION_TITLE: process.env.EXPO_PUBLIC_DEFAULT_NOTIFICATION_TITLE || 'Aviso',
  CHANNEL_ID: process.env.EXPO_PUBLIC_CHANNEL_ID || 'default',
  CHANNEL_NAME: process.env.EXPO_PUBLIC_CHANNEL_NAME || 'Default Channel',
};
