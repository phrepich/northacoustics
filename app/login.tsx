import { Alert, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { LogoMark } from '../components/logo-mark';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { TextField } from '../components/text-field';
import { useFieldData } from '../providers/field-data-provider';
import { palette } from '../theme/palette';

export default function LoginScreen() {
  const { login, supabaseConfig, isLoading } = useFieldData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Datos incompletos', 'Ingresa correo y contraseña para continuar.');
      return;
    }

    if (!supabaseConfig.isConfigured) {
      Alert.alert(
        'Error de configuración',
        'Supabase no está configurado. Verifica las variables de entorno: EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY'
      );
      return;
    }

    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
      Alert.alert('Error de acceso', message);
    }
  };

  return (
    <ScreenContainer
      title="Acceso a NorthAcoustics"
      subtitle="Ingresa con tu correo y contraseña para acceder al sistema de mediciones acústicas."
      scroll
    >
      <View style={styles.brandCard}>
        <LogoMark />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Estado de Supabase</Text>
        <Text style={[styles.info, { color: supabaseConfig.isConfigured ? palette.success || '#10b981' : palette.error || '#ef4444' }]}>
          {supabaseConfig.isConfigured ? '✓ Configurado' : '✗ No configurado'}
        </Text>
      </View>

      {!supabaseConfig.isConfigured && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Las variables de entorno de Supabase no están configuradas. Por favor, copia .env.example a .env.local y llena los valores de tu proyecto Supabase.
          </Text>
        </View>
      )}

      <TextField
        label="Correo electrónico"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="tu@email.com"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />

      <TextField
        label="Contraseña"
        secureTextEntry
        placeholder="Ingresa tu contraseña"
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />

      <PrimaryButton
        label={isLoading ? 'Ingresando...' : 'Ingresar'}
        onPress={handleLogin}
        disabled={isLoading || !supabaseConfig.isConfigured}
      />

      <View style={styles.footerCard}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <PrimaryButton
          label="Crear cuenta"
          onPress={() => router.push('/signup')}
          variant="secondary"
          disabled={isLoading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 12,
  },
  label: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  info: {
    fontSize: 13,
    fontWeight: '600',
  },
  warningCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.error + '20',
    borderWidth: 1,
    borderColor: palette.error + '40',
    marginBottom: 16,
  },
  warningText: {
    color: palette.error || '#ef4444',
    fontSize: 12,
    lineHeight: 18,
  },
  footerCard: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  footerText: {
    textAlign: 'center',
    color: palette.muted,
    marginBottom: 12,
    fontSize: 14,
  },
});
