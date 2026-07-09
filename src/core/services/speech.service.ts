import ReactNativeBlobUtil from 'react-native-blob-util';
import * as Speech from 'expo-speech';
import { getSettings } from './settings.service';

// Función rápida para hashear el texto y usarlo de nombre de archivo
function hashCode(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

// Metro a veces empaqueta módulos CommonJS como objetos namespace donde la función constructora es 'default'.
const Sound = require('react-native-sound');
Sound.setCategory('Playback', true);

let activeSound: any = null;

export async function speak(text: string): Promise<void> {
  const settings = await getSettings();
  const API_KEY = settings.apiKey;
  const VOICE_ID = settings.voiceId;

  if (!API_KEY) {
    console.warn('[SpeechService] Sin API key → fallback');
    fallbackSpeak(text);
    return;
  }

  try {
    const fileUri = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/jarvis_${VOICE_ID}_${hashCode(text)}.mp3`;
    const exists = await ReactNativeBlobUtil.fs.exists(fileUri);

    if (exists) {
      console.log('[JARVIS] Reproduciendo desde caché (Ahorro de API 💰):', fileUri);
    } else {
      console.log('[JARVIS] Llamando a ElevenLabs...');

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
        throw new Error(`ElevenLabs HTTP ${status}: ${res.text()}`);
      }

      const base64 = res.base64();
      if (!base64 || base64.length < 100) {
        throw new Error('Audio base64 vacío o inválido');
      }

      await ReactNativeBlobUtil.fs.writeFile(fileUri, base64, 'base64');
    }

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
        // NOTA: Ya NO borramos el archivo porque es un caché permanente
      });
    });

    // Auto-release por seguridad (sin borrar archivo)
    setTimeout(() => {
      if (activeSound) {
        activeSound.release();
        activeSound = null;
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
