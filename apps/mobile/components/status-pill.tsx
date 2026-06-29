import { StyleSheet, Text, View } from "react-native";

const palette = {
  approved: { bg: "#DFF2E5", text: "#22543D" },
  reviewed: { bg: "#E5EEF8", text: "#234E70" },
  measured: { bg: "#FFF4D9", text: "#8A5A00" },
  pending: { bg: "#EFEFEF", text: "#505A63" },
  valid: { bg: "#DFF2E5", text: "#22543D" },
  invalid: { bg: "#FFE2E2", text: "#A61B1B" },
} as const;

export function StatusPill({ value }: { value: keyof typeof palette | string }) {
  const style = palette[value as keyof typeof palette] ?? palette.pending;

  return (
    <View style={[styles.pill, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

