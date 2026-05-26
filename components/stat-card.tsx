import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/palette';

type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  value: {
    color: palette.accent,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    color: palette.muted,
    fontWeight: '600',
  },
});
