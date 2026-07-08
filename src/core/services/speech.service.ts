import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '';
const VOICE_ID = process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB';
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

/**
 * Habla el texto usando ElevenLabs (voz IA de alta calidad).
 * Si no hay API key configurada o falla la red, cae al motor TTS del sistema.
 */
export async function speak(text: string): Promise<void> {
  // Fallback al motor del sistema si no hay API key
  if (!API_KEY || API_KEY === 'TU_API_KEY_AQUI') {
    Speech.speak(text, { language: 'es', rate: 0.9, pitch: 0.7 });
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    // Convertir la respuesta a base64 y guardarla como archivo temporal
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = arrayBufferToBase64(audioBuffer);
    const fileUri = FileSystem.cacheDirectory + `jarvis_${Date.now()}.mp3`;

    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Configurar el modo de audio y reproducir
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();

    // Limpiar el archivo temporal cuando termine
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        FileSystem.deleteAsync(fileUri, { idempotent: true });
      }
    });

  } catch (error) {
    console.warn('[SpeechService] ElevenLabs falló, usando fallback:', error);
    // Fallback al motor del sistema si algo falla
    Speech.speak(text, { language: 'es', rate: 0.9, pitch: 0.7 });
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
