import ReactNativeBlobUtil from 'react-native-blob-util';

export interface JarvisSettings {
  apiKey: string;
  voiceId: string;
}

const SETTINGS_PATH = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/jarvis_settings.json`;

export const defaultSettings: JarvisSettings = {
  apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '',
  voiceId: process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB',
};

export async function getSettings(): Promise<JarvisSettings> {
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(SETTINGS_PATH);
    if (!exists) return defaultSettings;
    const data = await ReactNativeBlobUtil.fs.readFile(SETTINGS_PATH, 'utf8');
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (error) {
    console.warn('[Settings] Error leyendo settings', error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: JarvisSettings): Promise<void> {
  await ReactNativeBlobUtil.fs.writeFile(SETTINGS_PATH, JSON.stringify(settings), 'utf8');
}
