import { StyleSheet, Text, View } from "react-native";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.icon}>
        <View style={[styles.wave, { height: 18 }]} />
        <View style={[styles.wave, { height: 30 }]} />
        <View style={[styles.wave, { height: 42 }]} />
        <View style={[styles.wave, { height: 30 }]} />
        <View style={[styles.wave, { height: 18 }]} />
      </View>
      <View>
        <Text style={[styles.title, compact && styles.compactTitle]}>Northacoustics</Text>
        <Text style={[styles.subtitle, compact && styles.compactSubtitle]}>FIELD</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    gap: 10,
  },
  compactSubtitle: {
    letterSpacing: 4,
  },
  compactTitle: {
    fontSize: 18,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  icon: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 6,
  },
  subtitle: {
    color: "#57727E",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 6,
  },
  title: {
    color: "#11313A",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  wave: {
    backgroundColor: "#0F4C5C",
    borderRadius: 999,
    width: 6,
  },
});

