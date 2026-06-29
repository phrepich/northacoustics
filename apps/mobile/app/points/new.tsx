import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionCard } from "../../components/section-card";
import { useFieldData } from "../../providers/field-data-provider";

export default function NewPointScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const { projects, requestCurrentCoordinates, capturePhoto, createPoint } = useFieldData();
  const fallbackProjectId = projectId ?? projects[0]?.id;

  const [code, setCode] = useState("Punto nuevo");
  const [environmentDescription, setEnvironmentDescription] = useState("");
  const [landUse, setLandUse] = useState("Residencial");
  const [nearestSensitiveReceiver, setNearestSensitiveReceiver] = useState("");
  const [estimatedDistance, setEstimatedDistance] = useState("50");
  const [sketchReference, setSketchReference] = useState("");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const onCaptureLocation = async () => {
    try {
      setMessage("");
      const nextCoords = await requestCurrentCoordinates();
      setCoordinates(nextCoords);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible capturar GPS.");
    }
  };

  const onTakePhoto = async () => {
    const uri = await capturePhoto();
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const onSave = () => {
    if (!fallbackProjectId || !coordinates) {
      return;
    }

    createPoint({
      projectId: fallbackProjectId,
      code,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      photoUri: photoUri ?? undefined,
      environmentDescription,
      sketchReference,
      landUse,
      nearestSensitiveReceiver,
      estimatedDistanceToSourceM: Number(estimatedDistance) || 0,
      notes: "Registrado desde flujo móvil por etapas.",
    });

    router.replace(`/projects/${fallbackProjectId}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="1. Identificación del punto" subtitle="Datos mínimos para trazabilidad técnica">
        <TextInput onChangeText={setCode} placeholder="Código del punto" style={styles.input} value={code} />
        <TextInput
          multiline
          onChangeText={setEnvironmentDescription}
          placeholder="Descripción del entorno"
          style={[styles.input, styles.multiline]}
          value={environmentDescription}
        />
        <TextInput
          onChangeText={setSketchReference}
          placeholder="Croquis o referencia descriptiva"
          style={styles.input}
          value={sketchReference}
        />
        <TextInput onChangeText={setLandUse} placeholder="Uso de suelo observado" style={styles.input} value={landUse} />
        <TextInput
          onChangeText={setNearestSensitiveReceiver}
          placeholder="Receptor sensible cercano"
          style={styles.input}
          value={nearestSensitiveReceiver}
        />
        <TextInput
          keyboardType="numeric"
          onChangeText={setEstimatedDistance}
          placeholder="Distancia estimada a fuente emisora (m)"
          style={styles.input}
          value={estimatedDistance}
        />
      </SectionCard>

      <SectionCard title="2. GPS y evidencia" subtitle="Captura con fallback para trabajo sin señal">
        <Pressable onPress={onCaptureLocation} style={styles.primaryButton}>
          <Text style={styles.primaryLabel}>Capturar coordenadas GPS</Text>
        </Pressable>
        <Pressable onPress={onTakePhoto} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>Tomar fotografía del punto</Text>
        </Pressable>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {coordinates
              ? `Lat ${coordinates.latitude.toFixed(5)} · Lon ${coordinates.longitude.toFixed(5)}`
              : "Aun no se capturan coordenadas."}
          </Text>
          <Text style={styles.infoText}>{photoUri ? `Foto lista: ${photoUri}` : "Sin fotografía capturada."}</Text>
          {message ? <Text style={styles.infoText}>{message}</Text> : null}
        </View>
      </SectionCard>

      <Pressable disabled={!coordinates} onPress={onSave} style={[styles.primaryButton, !coordinates && styles.disabledButton]}>
        <Text style={styles.primaryLabel}>Guardar punto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoBox: {
    backgroundColor: "#F5F8F9",
    borderRadius: 18,
    gap: 8,
    padding: 16,
  },
  infoText: {
    color: "#57727E",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#F5F8F9",
    borderColor: "#D6E0E4",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0F4C5C",
    borderRadius: 18,
    paddingVertical: 16,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#E8EFF1",
    borderRadius: 18,
    paddingVertical: 16,
  },
  secondaryLabel: {
    color: "#11313A",
    fontWeight: "700",
  },
});
