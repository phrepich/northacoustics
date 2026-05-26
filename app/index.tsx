import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { LogoMark } from '../components/logo-mark';
import { useFieldData } from '../providers/field-data-provider';
import { palette } from '../theme/palette';

export default function IndexScreen() {
  const { isReady, session } = useFieldData();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeout = setTimeout(() => {
      router.replace(session ? '/dashboard' : '/login');
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isReady, session]);

  return (
    <View style={styles.container}>
      <View style={styles.heroPanel}>
        <View style={styles.signalGlow} />
        <LogoMark light />
      </View>
      <Text style={styles.title}>Trabajo en terreno para informes ambientales</Text>
      <Text style={styles.subtitle}>
        Registro tecnico de clientes, proyectos, puntos de medicion y evidencia en una sola app.
      </Text>
      <ActivityIndicator color={palette.accent} size="large" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroPanel: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 28,
    backgroundColor: palette.earth,
    borderWidth: 1,
    borderColor: '#9d6324',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  signalGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 174, 72, 0.18)',
    top: -60,
    right: -50,
  },
  title: {
    marginTop: 20,
    fontSize: 25,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: palette.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  loader: {
    marginTop: 26,
  },
});
