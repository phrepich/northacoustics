import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D6E0E4",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: "#10212B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  content: {
    gap: 12,
  },
  subtitle: {
    color: "#57727E",
    fontSize: 13,
    marginBottom: 12,
  },
  title: {
    color: "#10212B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
});

