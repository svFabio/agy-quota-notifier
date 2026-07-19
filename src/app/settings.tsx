import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, SIZES } from '../core/constants/theme';
import { Text } from '../components/ui/Text';
import { getSettings, saveSettings, JarvisSettings } from '../core/services/settings.service';
import { testSpeak } from '../core/services/speech.service';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [settings, setSettings] = useState<JarvisSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setApiKey(s.apiKey);
      setVoiceId(s.voiceId);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setTestResult(null);
    try {
      await saveSettings({ apiKey: apiKey.trim(), voiceId: voiceId.trim() });
      router.back();
    } catch {
      alert('Could not save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    // Save first so the test uses the current inputs
    try {
      await saveSettings({ apiKey: apiKey.trim(), voiceId: voiceId.trim() });
    } catch {
      setTestResult({ ok: false, error: 'Could not save settings before testing.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const result = await testSpeak();
    setTestResult(result);
    setIsTesting(false);
  };

  if (!settings) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text weight="bold" style={[styles.title, { color: colors.text }]}>Panel Jarvis</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Ionicons name="key-outline" size={24} color={colors.primary} style={styles.icon} />
          <View style={styles.inputContainer}>
            <Text weight="semiBold" style={[styles.label, { color: colors.text }]}>API Key (ElevenLabs)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk_..."
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Ionicons name="mic-outline" size={24} color={colors.primary} style={styles.icon} />
          <View style={styles.inputContainer}>
            <Text weight="semiBold" style={[styles.label, { color: colors.text }]}>Voice ID</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={voiceId}
              onChangeText={setVoiceId}
              placeholder="Ej: pNInz6obpgDQGcFmaJgB"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={isSaving || isTesting}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text weight="bold" style={styles.saveButtonText}>Guardar Configuración</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { borderColor: colors.primary }]}
          onPress={handleTest}
          disabled={isSaving || isTesting}
        >
          {isTesting ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="volume-high-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text weight="bold" style={[styles.testButtonText, { color: colors.primary }]}>Test Voice</Text>
            </>
          )}
        </TouchableOpacity>

        {testResult && (
          <View style={[
            styles.resultBox,
            { backgroundColor: testResult.ok ? '#1a3a1a' : '#3a1a1a', borderColor: testResult.ok ? '#4caf50' : '#f44336' }
          ]}>
            <Ionicons
              name={testResult.ok ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={20}
              color={testResult.ok ? '#4caf50' : '#f44336'}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: testResult.ok ? '#4caf50' : '#f44336', flex: 1, fontSize: 12 }}>
              {testResult.ok ? 'ElevenLabs OK — si no escuchaste nada revisa el volumen.' : testResult.error}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.screenTop,
    marginBottom: SIZES.large,
  },
  backButton: {
    marginRight: SIZES.base,
    padding: SIZES.base,
  },
  title: {
    fontSize: SIZES.h2,
  },
  content: {
    paddingHorizontal: SIZES.padding,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: SIZES.base,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 4,
    fontSize: SIZES.font,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.extraLarge,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: SIZES.h3,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    marginTop: SIZES.base,
  },
  testButtonText: {
    fontSize: SIZES.h3,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginTop: SIZES.base,
  },
});
