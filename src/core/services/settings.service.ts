import ReactNativeBlobUtil from 'react-native-blob-util';

export interface JarvisSettings {
  apiKey: string;
  voiceId: string;
}

const SETTINGS_PATH = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/jarvis_settings.json`;

export const defaultSettings: JarvisSettings = {
  // C-01: Do NOT use EXPO_PUBLIC_ here. EXPO_PUBLIC_ vars are inlined into
  // the JS bundle at build time and are permanently extractable from the APK.
  // The API key must come exclusively from the user-saved settings file.
  apiKey: '',
  voiceId: 'pNInz6obpgDQGcFmaJgB',
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
  // C-07: Wrap in try/catch — a disk write failure (full disk, revoked
  // permissions) must not produce an unhandled rejection that crashes the app.
  try {
    await ReactNativeBlobUtil.fs.writeFile(SETTINGS_PATH, JSON.stringify(settings), 'utf8');
  } catch (error) {
    console.error('[Settings] Error saving settings', error);
    throw error; // Re-throw so the UI caller can show feedback.
  }
}
