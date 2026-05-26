import { Image, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/palette';

export function LogoMark({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  const iconSize = compact ? 44 : 72;
  const titleColor = light ? '#ffffff' : palette.text;
  const subtitleColor = light ? '#ffe5cf' : palette.earth;

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.icon}>
        <Image
          source={require('../assets/logo_acoustics.png')}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      </View>
      <View>
        <Text style={[styles.title, compact && styles.compactTitle, { color: titleColor }]}>
          Northacoustics
        </Text>
        <Text style={[styles.subtitle, compact && styles.compactSubtitle, { color: subtitleColor }]}>
          FIELD
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  compactContainer: {
    gap: 10,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titleLight: {
    color: '#ffffff',
  },
  compactTitle: {
    fontSize: 18,
  },
  subtitle: {
    color: palette.earth,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 6,
  },
  compactSubtitle: {
    letterSpacing: 4,
  },
});
