import { StyleSheet, Text, View } from "react-native";

export function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#11313A",
    borderRadius: 20,
    minWidth: 108,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    color: "#BFD0D6",
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});

