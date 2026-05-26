import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { palette } from '../theme/palette';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruta no encontrada</Text>
      <Text style={styles.subtitle}>La pantalla solicitada no existe en esta base limpia.</Text>
      <Link href="/dashboard" style={styles.link}>
        Volver al dashboard
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    marginTop: 10,
    color: palette.muted,
    textAlign: 'center',
  },
  link: {
    marginTop: 18,
    color: palette.accent,
    fontWeight: '700',
  },
});
