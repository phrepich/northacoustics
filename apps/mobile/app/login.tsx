import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { LogoMark } from "../components/logo-mark";
import { SectionCard } from "../components/section-card";
import { useFieldData } from "../providers/field-data-provider";

export default function LoginScreen() {
  const router = useRouter();
  const { isDemoMode, isSupabaseConfigured, login } = useFieldData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await login(email, password);
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage("No fue posible iniciar sesión con Supabase. Revisa correo, contraseña y variables de entorno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <LogoMark />
        <Text style={styles.heading}>Trabajo en terreno con trazabilidad técnica</Text>
        <Text style={styles.subheading}>
          Accede con tu cuenta Northacoustics. Esta pantalla usa Supabase Auth y solo entra en modo demo si el entorno lo habilita explícitamente.
        </Text>
      </View>

      <SectionCard title="Iniciar sesión" subtitle="Correo y contraseña con persistencia local del MVP">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo"
          placeholderTextColor="#7A9099"
          style={styles.input}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#7A9099"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Pressable onPress={onSubmit} style={styles.primaryButton}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryLabel}>Entrar</Text>}
        </Pressable>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <Text style={styles.helper}>
          Estado de configuración: {isSupabaseConfigured ? "Supabase configurado" : isDemoMode ? "modo demo habilitado" : "faltan variables de entorno"}.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 20,
  },
  header: {
    gap: 10,
    paddingTop: 16,
  },
  heading: {
    color: "#10212B",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 16,
  },
  errorText: {
    color: "#A61B1B",
    fontSize: 13,
    lineHeight: 20,
  },
  helper: {
    color: "#57727E",
    fontSize: 13,
    lineHeight: 20,
  },
  input: {
    backgroundColor: "#F5F8F9",
    borderColor: "#D6E0E4",
    borderRadius: 16,
    borderWidth: 1,
    color: "#10212B",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0F4C5C",
    borderRadius: 18,
    paddingVertical: 16,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  subheading: {
    color: "#57727E",
    fontSize: 15,
    lineHeight: 22,
  },
});
