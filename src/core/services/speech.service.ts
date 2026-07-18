import ReactNativeBlobUtil from 'react-native-blob-util';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getSettings } from './settings.service';

// Quick hash for cache file names
function hashCode(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

// C-02: Load react-native-sound lazily only on native platforms.
// Calling Sound.setCategory at module scope crashes on web and can race
// against the native bridge on Android in production builds.
let _Sound: any = null;
function getSound(): any {
  if (_Sound) return _Sound;
  if (Platform.OS === 'web') return null;
  const raw = require('react-native-sound');
  _Sound = raw.default || raw;
  _Sound.setCategory('Playback', true);
  return _Sound;
}

// C-03 + C-04: Generation counter ensures the 60s safety timer and the
// stop() callback always act on the exact instance they were created for.
let activeSound: any = null;
let activeSoundGen = 0;

async function callElevenLabs(text: string, API_KEY: string, VOICE_ID: string): Promise<string> {
  const fileUri = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/jarvis_${VOICE_ID}_${hashCode(text)}.mp3`;
  const exists = await ReactNativeBlobUtil.fs.exists(fileUri);

  if (exists) {
    console.log('[JARVIS] Playing from cache:', fileUri);
    return fileUri;
  }

  console.log('[JARVIS] Calling ElevenLabs...');
  const res = await ReactNativeBlobUtil.fetch(
    'POST',
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  );

  const status = res.info().status;
  if (status !== 200) {
    const body = typeof res.text === 'function' ? String(res.text()) : String(status);
    throw new Error(`ElevenLabs HTTP ${status}: ${body}`);
  }

  const base64 = res.base64();
  if (!base64 || base64.length < 100) {
    throw new Error('Empty or invalid audio base64 from ElevenLabs');
  }

  await ReactNativeBlobUtil.fs.writeFile(fileUri, base64, 'base64');
  return fileUri;
}

function playFile(fileUri: string, text: string): void {
  const Sound = getSound();
  if (!Sound) return;

  // C-04: Stop previous sound using a local snapshot so the async callback
  // cannot accidentally release the new instance assigned below.
  if (activeSound) {
    const prevSound = activeSound;
    activeSound = null;
    prevSound.stop(() => { prevSound.release(); });
  }

  // Bump generation so stale timers/callbacks know they are outdated.
  activeSoundGen += 1;
  const myGen = activeSoundGen;

  activeSound = new Sound(fileUri, '', (error: any) => {
    if (error) {
      console.error('[JARVIS] Error loading Sound:', JSON.stringify(error));
      fallbackSpeak(text);
      return;
    }

    // RJ-009: Use local snapshot so a concurrent speak() that nulls
    // activeSound cannot cause .play() to silently no-op.
    const mySound = activeSound;
    if (!mySound) return;

    mySound.play((success: boolean) => {
      if (!success) console.warn('[SpeechService] Playback failed');
      // C-03: Only release if we are still the active generation.
      if (activeSoundGen === myGen) {
        mySound.release();
        activeSound = null;
      }
    });
  });

  // C-03: Safety release — generation snapshot prevents this timer from
  // touching a sound that belongs to a later speak() call.
  const safetyGen = myGen;
  setTimeout(() => {
    if (activeSoundGen === safetyGen && activeSound) {
      activeSound.release();
      activeSound = null;
    }
  }, 60_000);
}

export async function speak(text: string): Promise<void> {
  const Sound = getSound();
  if (!Sound) {
    fallbackSpeak(text);
    return;
  }

  const settings = await getSettings();
  const API_KEY = settings.apiKey?.trim();
  const VOICE_ID = settings.voiceId?.trim();

  if (!API_KEY) {
    console.warn('[SpeechService] No API key → fallback');
    fallbackSpeak(text);
    return;
  }

  try {
    const fileUri = await callElevenLabs(text, API_KEY, VOICE_ID || 'pNInz6obpgDQGcFmaJgB');
    playFile(fileUri, text);
  } catch (error: any) {
    console.error('[JARVIS] ERROR:', error?.message ?? String(error));
    fallbackSpeak(text);
  }
}

/** Diagnostic function — returns the exact error so Settings can show it. */
export async function testSpeak(): Promise<{ ok: boolean; error?: string }> {
  try {
    const settings = await getSettings();
    const API_KEY = settings.apiKey?.trim();
    const VOICE_ID = settings.voiceId?.trim();

    if (!API_KEY) return { ok: false, error: 'No API key configured in Settings.' };
    if (!VOICE_ID) return { ok: false, error: 'No Voice ID configured in Settings.' };

    const fileUri = await callElevenLabs('Connection test.', API_KEY, VOICE_ID);
    playFile(fileUri, 'Connection test.');
    return { ok: true };
  } catch (error: any) {
    return { ok: false, error: error?.message ?? String(error) };
  }
}

function fallbackSpeak(text: string): void {
  console.log('[JARVIS] → using system voice (fallback)');
  Speech.stop();
  Speech.speak(text, { language: 'es-US', rate: 0.85, pitch: 0.75 });
}
