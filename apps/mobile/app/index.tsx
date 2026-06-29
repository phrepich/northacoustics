import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { LogoMark } from "../components/logo-mark";
import { useFieldData } from "../providers/field-data-provider";

export default function SplashScreen() {
  const router = useRouter();
  const { currentUser, isBooting } = useFieldData();

  useEffect(() => {
    if (isBooting) {
      return;
    }

    const timer = setTimeout(() => {
      router.replace(currentUser ? "/dashboard" : "/login");
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentUser, isBooting, router]);

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <LogoMark />
        <Text style={styles.tagline}>Levantamiento ambiental y acústico en terreno</Text>
        <Text style={styles.caption}>Sincronización técnica segura para informes profesionales</Text>
        <ActivityIndicator color="#0F4C5C" size="small" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    color: "#57727E",
    fontSize: 13,
    maxWidth: 240,
    textAlign: "center",
  },
  loader: {
    marginTop: 12,
  },
  panel: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  screen: {
    alignItems: "center",
    backgroundColor: "#E8EFF1",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  tagline: {
    color: "#10212B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
});

