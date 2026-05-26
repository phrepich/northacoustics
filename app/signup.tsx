import { Alert, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { LogoMark } from '../components/logo-mark';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { TextField } from '../components/text-field';
import { useFieldData } from '../providers/field-data-provider';
import { palette } from '../theme/palette';
import { signUp } from '../lib/auth';

export default function SignupScreen() {
  const { supabaseConfig, isLoading } = useFieldData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para continuar.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Las contraseñas deben ser iguales.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!supabaseConfig.isConfigured) {
      Alert.alert(
        'Error de configuración',
        'Supabase no está configurado. Verifica las variables de entorno.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, error } = await signUp(email.trim(), password, fullName.trim());

      if (error) {
        throw error;
      }

      Alert.alert(
        'Cuenta creada',
        `Usuario registrado correctamente. Ahora puedes iniciar sesión con ${email}.`,
        [
          {
            text: 'Ir a login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
      Alert.alert('Error de registro', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Crear cuenta"
      subtitle="Regístrate para acceder a NorthAcoustics y comenzar a registrar mediciones acústicas."
      scroll
    >
      <View style={styles.brandCard}>
        <LogoMark />
      </View>

      <TextField
        label="Nombre completo"
        placeholder="Juan Pérez"
        value={fullName}
        onChangeText={setFullName}
        editable={!isSubmitting}
      />

      <TextField
        label="Correo electrónico"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="tu@email.com"
        value={email}
        onChangeText={setEmail}
        editable={!isSubmitting}
      />

      <TextField
        label="Contraseña"
        secureTextEntry
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
      />

      <TextField
        label="Confirmar contraseña"
        secureTextEntry
        placeholder="Repite la contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isSubmitting}
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Al crear tu cuenta, recibirás el rol de "cliente". Los roles "supervisor" y "admin" deben ser asignados por un administrador.
        </Text>
      </View>

      <PrimaryButton
        label={isSubmitting ? 'Registrando...' : 'Crear cuenta'}
        onPress={handleSignup}
        disabled={isSubmitting || !supabaseConfig.isConfigured}
      />

      <View style={styles.footerCard}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <PrimaryButton
          label="Ir a login"
          onPress={() => router.push('/login')}
          variant="secondary"
          disabled={isSubmitting}
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
    marginBottom: 24,
    alignItems: 'center',
  },
  infoCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
  },
  infoText: {
    color: palette.muted,
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
