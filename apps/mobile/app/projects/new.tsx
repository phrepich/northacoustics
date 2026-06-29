import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionCard } from "../../components/section-card";
import { useFieldData } from "../../providers/field-data-provider";

export default function NewProjectScreen() {
  const router = useRouter();
  const { clients, createProject } = useFieldData();
  const selectedClient = useMemo(() => clients[0], [clients]);

  const [name, setName] = useState("Nueva campaña acústica");
  const [internalCode, setInternalCode] = useState(`NAF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
  const [siteAddress, setSiteAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [region, setRegion] = useState("Biobío");
  const [professionalResponsible, setProfessionalResponsible] = useState("Ing. Paula Alvarado");
  const [studyObjective, setStudyObjective] = useState("");
  const [reportType, setReportType] = useState("Informe de ruido DS 38");
  const [applicableRegulation, setApplicableRegulation] = useState("DS N°38/2011 MMA");
  const [generalNotes, setGeneralNotes] = useState("");

  if (!selectedClient) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Primero crea un cliente para asociar el proyecto.</Text>
      </View>
    );
  }

  const saveProject = () => {
    createProject({
      clientId: selectedClient.id,
      name,
      internalCode,
      siteAddress,
      district,
      region,
      visitDate: new Date().toISOString().slice(0, 10),
      professionalResponsible,
      studyObjective,
      reportType,
      applicableRegulation,
      generalNotes,
      status: "pending",
    });

    router.replace("/clients");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="Cliente asociado" subtitle="Para este MVP el nuevo proyecto se vincula al primer cliente de la lista">
        <Text style={styles.itemTitle}>{selectedClient.name}</Text>
        <Text style={styles.paragraph}>{selectedClient.companyRut}</Text>
      </SectionCard>

      <SectionCard title="Datos del proyecto" subtitle="Formulario operativo mínimo para comenzar el flujo">
        <FieldRow label="Nombre del proyecto" onChangeText={setName} value={name} />
        <FieldRow label="Código interno" onChangeText={setInternalCode} value={internalCode} />
        <FieldRow label="Dirección / emplazamiento" onChangeText={setSiteAddress} value={siteAddress} />
        <FieldRow label="Comuna" onChangeText={setDistrict} value={district} />
        <FieldRow label="Región" onChangeText={setRegion} value={region} />
        <FieldRow
          label="Profesional responsable"
          onChangeText={setProfessionalResponsible}
          value={professionalResponsible}
        />
        <FieldRow label="Objetivo de la medición" onChangeText={setStudyObjective} value={studyObjective} multiline />
        <FieldRow label="Tipo de informe" onChangeText={setReportType} value={reportType} />
        <FieldRow label="Normativa aplicable" onChangeText={setApplicableRegulation} value={applicableRegulation} />
        <FieldRow label="Observaciones generales" onChangeText={setGeneralNotes} value={generalNotes} multiline />
      </SectionCard>

      <Pressable onPress={saveProject} style={styles.primaryButton}>
        <Text style={styles.primaryLabel}>Guardar proyecto</Text>
      </Pressable>
    </ScrollView>
  );
}

function FieldRow({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
      />
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
    minHeight: 90,
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
