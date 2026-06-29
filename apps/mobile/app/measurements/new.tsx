import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionCard } from "../../components/section-card";
import { useFieldData } from "../../providers/field-data-provider";

export default function NewMeasurementScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const { points, createMeasurement } = useFieldData();
  const availablePoints = useMemo(
    () => (projectId ? points.filter((point) => point.projectId === projectId) : points),
    [points, projectId],
  );

  const selectedPoint = availablePoints[0];
  const [measurementType, setMeasurementType] = useState("Ruido de evaluación");
  const [laeq, setLaeq] = useState("54.2");
  const [lmax, setLmax] = useState("63.5");
  const [lmin, setLmin] = useState("44.0");
  const [l10, setL10] = useState("57.1");
  const [l50, setL50] = useState("53.5");
  const [l90, setL90] = useState("46.8");
  const [temperature, setTemperature] = useState("15.2");
  const [humidity, setHumidity] = useState("68");
  const [windSpeed, setWindSpeed] = useState("1.5");
  const [weatherState, setWeatherState] = useState("Despejado");
  const [technicalNotes, setTechnicalNotes] = useState("");

  const saveMeasurement = () => {
    if (!selectedPoint) {
      return;
    }

    const startedAt = new Date();
    const endedAt = new Date(startedAt.getTime() + 30 * 60 * 1000);

    createMeasurement({
      pointId: selectedPoint.id,
      measurementType,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMinutes: 30,
      laeq: Number(laeq),
      lmax: Number(lmax),
      lmin: Number(lmin),
      l10: Number(l10),
      l50: Number(l50),
      l90: Number(l90),
      weighting: "A",
      equipmentResponse: "Fast",
      equipmentName: "Svantek SVAN 977",
      soundLevelMeterCode: "SLM-NA-04",
      serialNumber: "SV977-180245",
      calibratorName: "Larson Davis CAL200",
      initialCalibration: 94,
      finalCalibration: 94,
      validity: "valid",
      technicalNotes,
      environmentalConditions: {
        temperatureC: Number(temperature),
        relativeHumidity: Number(humidity),
        windSpeedMs: Number(windSpeed),
        cloudiness: "Parcial",
        weatherState,
        weatherNotes: "Ingreso manual desde terreno.",
        externalEvidence: "Ingreso manual",
      },
    });

    router.replace(projectId ? `/projects/${projectId}` : "/dashboard");
  };

  if (!selectedPoint) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Primero debes crear al menos un punto de medición.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="Punto asociado" subtitle="La medición se vinculará al primer punto disponible del proyecto">
        <Text style={styles.itemTitle}>{selectedPoint.code}</Text>
        <Text style={styles.paragraph}>{selectedPoint.environmentDescription}</Text>
      </SectionCard>

      <SectionCard title="Parámetros acústicos" subtitle="Registro de medición principal">
        <FieldRow label="Tipo de medición" value={measurementType} onChangeText={setMeasurementType} />
        <FieldRow label="LAeq" value={laeq} onChangeText={setLaeq} keyboardType="numeric" />
        <FieldRow label="Lmax" value={lmax} onChangeText={setLmax} keyboardType="numeric" />
        <FieldRow label="Lmin" value={lmin} onChangeText={setLmin} keyboardType="numeric" />
        <FieldRow label="L10" value={l10} onChangeText={setL10} keyboardType="numeric" />
        <FieldRow label="L50" value={l50} onChangeText={setL50} keyboardType="numeric" />
        <FieldRow label="L90" value={l90} onChangeText={setL90} keyboardType="numeric" />
      </SectionCard>

      <SectionCard title="Condiciones ambientales" subtitle="Ingreso manual o respaldo externo">
        <FieldRow label="Temperatura (°C)" value={temperature} onChangeText={setTemperature} keyboardType="numeric" />
        <FieldRow label="Humedad (%)" value={humidity} onChangeText={setHumidity} keyboardType="numeric" />
        <FieldRow label="Viento (m/s)" value={windSpeed} onChangeText={setWindSpeed} keyboardType="numeric" />
        <FieldRow label="Estado del tiempo" value={weatherState} onChangeText={setWeatherState} />
        <TextInput
          multiline
          onChangeText={setTechnicalNotes}
          placeholder="Notas técnicas"
          style={[styles.input, styles.multiline]}
          value={technicalNotes}
        />
      </SectionCard>

      <Pressable onPress={saveMeasurement} style={styles.primaryButton}>
        <Text style={styles.primaryLabel}>Guardar medición</Text>
      </Pressable>
    </ScrollView>
  );
}

function FieldRow({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput keyboardType={keyboardType} onChangeText={onChangeText} style={styles.input} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 20,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  emptyText: {
    color: "#57727E",
    fontSize: 16,
    textAlign: "center",
  },
  fieldLabel: {
    color: "#10212B",
    fontSize: 14,
    fontWeight: "700",
  },
  fieldRow: {
    gap: 8,
  },
  input: {
    backgroundColor: "#F5F8F9",
    borderColor: "#D6E0E4",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  itemTitle: {
    color: "#10212B",
    fontSize: 18,
    fontWeight: "800",
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  paragraph: {
    color: "#57727E",
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
});
