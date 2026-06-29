import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { SectionCard } from "../../components/section-card";
import { StatusPill } from "../../components/status-pill";
import { buildDemoClient, useFieldData } from "../../providers/field-data-provider";

export default function ClientsScreen() {
  const { clients, createClient, getProjectsByClient, isDemoMode } = useFieldData();
  const [counter, setCounter] = useState(3);
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [district, setDistrict] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="Ingreso rápido de cliente" subtitle="Formulario resumido para el MVP">
        <TextInput
          onChangeText={setName}
          placeholder="Nombre del cliente"
          placeholderTextColor="#7A9099"
          style={styles.input}
          value={name}
        />
        <TextInput
          onChangeText={setRut}
          placeholder="RUT empresa"
          placeholderTextColor="#7A9099"
          style={styles.input}
          value={rut}
        />
        <TextInput
          onChangeText={setDistrict}
          placeholder="Dirección / comuna"
          placeholderTextColor="#7A9099"
          style={styles.input}
          value={district}
        />
        <Pressable
          onPress={() => {
            createClient({
              name: name || `Nuevo cliente ${counter}`,
              companyRut: rut || `77.${100000 + counter}-K`,
              address: district || "Dirección pendiente",
              contactName: "Pendiente",
              contactEmail: `cliente${counter}@demo.cl`,
              phone: "+56 9 0000 0000",
              notes: "Creado desde el módulo móvil.",
            });
            setCounter((current) => current + 1);
            setName("");
            setRut("");
            setDistrict("");
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryLabel}>Guardar cliente</Text>
        </Pressable>
        {isDemoMode ? (
          <Pressable
            onPress={() => {
              createClient(buildDemoClient(counter));
              setCounter((current) => current + 1);
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryLabel}>Agregar cliente demo</Text>
          </Pressable>
        ) : null}
        <Link href="/projects/new" style={styles.projectLink}>
          Crear proyecto para un cliente
        </Link>
      </SectionCard>

      {clients.map((client) => {
        const projects = getProjectsByClient(client.id);

        return (
          <SectionCard key={client.id} title={client.name} subtitle={`${client.companyRut} · ${client.address}`}>
            <Text style={styles.paragraph}>
              Contacto: {client.contactName} · {client.contactEmail}
            </Text>
            <Text style={styles.paragraph}>Teléfono: {client.phone}</Text>
            <StatusPill value={projects.length ? projects[0].status : "pending"} />
            <View style={styles.projectList}>
              {projects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id} style={styles.projectLink}>
                  {project.name}
                </Link>
              ))}
            </View>
          </SectionCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 20,
  },
  input: {
    backgroundColor: "#F5F8F9",
    borderColor: "#D6E0E4",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  paragraph: {
    color: "#57727E",
    fontSize: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0F4C5C",
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  projectLink: {
    backgroundColor: "#E8EFF1",
    borderRadius: 14,
    color: "#11313A",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  projectList: {
    gap: 10,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#B9C9CE",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryLabel: {
    color: "#11313A",
    fontWeight: "700",
  },
});
