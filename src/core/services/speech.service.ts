import ReactNativeBlobUtil from 'react-native-blob-util';
import * as Speech from 'expo-speech';

// Metro a veces empaqueta módulos CommonJS como objetos namespace donde la función constructora es 'default'.
const Sound = require('react-native-sound');
Sound.setCategory('Playback', true);

let activeSound: any = null;

export async function speak(text: string): Promise<void> {
  const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';
  const VOICE_ID = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB';

  if (!API_KEY) {
    console.warn('[SpeechService] Sin API key → fallback');
    fallbackSpeak(text);
    return;
  }

  try {
    console.log('[JARVIS] Llamando a ElevenLabs...');

    // Usamos ReactNativeBlobUtil.fetch (sin config) — da base64 directo sin problemas de ArrayBuffer
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
    console.log('[JARVIS] ElevenLabs status:', status);

    if (status !== 200) {
      throw new Error(`ElevenLabs HTTP ${status}: ${res.text()}`);
    }

    // .base64() da el audio directo sin conversiones manuales
    const base64 = res.base64();
    console.log('[JARVIS] Audio base64 length:', base64?.length ?? 0);

    if (!base64 || base64.length < 100) {
      throw new Error('Audio base64 vacío o inválido');
    }

    const fileUri = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/jarvis_${Date.now()}.mp3`;
    await ReactNativeBlobUtil.fs.writeFile(fileUri, base64, 'base64');

    // Detener sonido anterior
    if (activeSound) {
      activeSound.stop(() => { activeSound?.release(); activeSound = null; });
    }

    // Reproducir con react-native-sound
    activeSound = new Sound(fileUri, '', (error: any) => {
      if (error) {
        console.error('[JARVIS] Error cargando Sound:', JSON.stringify(error));
        fallbackSpeak(text);
        return;
      }

      activeSound?.play((success) => {
        if (!success) console.warn('[SpeechService] Reproducción fallida');
        activeSound?.release();
        activeSound = null;
        ReactNativeBlobUtil.fs.unlink(fileUri).catch(() => {});
      });
    });

    setTimeout(() => {
      if (activeSound) {
        activeSound.release();
        activeSound = null;
        ReactNativeBlobUtil.fs.unlink(fileUri).catch(() => {});
      }
    }, 60_000);

  } catch (error: any) {
    console.error('[JARVIS] ERROR TOTAL:', error?.message ?? String(error));
    fallbackSpeak(text);
  }
}

function fallbackSpeak(text: string): void {
  console.log('[JARVIS] → usando voz del sistema (fallback)');
  Speech.stop();
  Speech.speak(text, { language: 'es-US', rate: 0.85, pitch: 0.75 });
}
