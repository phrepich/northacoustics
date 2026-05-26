import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/palette';

type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({
  title,
  subtitle,
  children,
  scroll = false,
}: ScreenContainerProps) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <Wrapper
      style={styles.wrapper}
      contentContainerStyle={scroll ? styles.scrollContent : undefined}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: palette.muted,
    lineHeight: 22,
  },
});
