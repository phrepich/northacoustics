import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { LogoMark } from "../components/logo-mark";
import { MetricChip } from "../components/metric-chip";
import { SectionCard } from "../components/section-card";
import { StatusPill } from "../components/status-pill";
import { useFieldData } from "../providers/field-data-provider";

export default function DashboardScreen() {
  const router = useRouter();
  const { clients, currentUser, projects, points, syncQueue, logout, lastSyncAt } = useFieldData();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <LogoMark compact />
        <Pressable onPress={logout} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>Salir</Text>
        </Pressable>
      </View>

      <SectionCard title={`Hola, ${currentUser?.fullName ?? "técnico"}`} subtitle="Operación rápida para terreno">
        <Text style={styles.paragraph}>
          Rol activo: <Text style={styles.strong}>{currentUser?.role ?? "technician"}</Text>. Última sincronización:{" "}
          {lastSyncAt ? new Date(lastSyncAt).toLocaleString("es-CL") : "pendiente"}.
        </Text>
        <View style={styles.metricsRow}>
          <MetricChip label="Clientes" value={String(clients.length)} />
          <MetricChip label="Proyectos" value={String(projects.length)} />
          <MetricChip label="Puntos" value={String(points.length)} />
        </View>
      </SectionCard>

      <SectionCard title="Estado operativo" subtitle="Seguimiento inmediato para no perder trazabilidad">
        <View style={styles.rowBetween}>
          <Text style={styles.paragraph}>Cola offline pendiente</Text>
          <StatusPill value={syncQueue.length ? "pending" : "approved"} />
        </View>
        <Text style={styles.bigNumber}>{syncQueue.length}</Text>
        <Text style={styles.paragraph}>acciones listas para sincronizar con la base central.</Text>
      </SectionCard>

      <View style={styles.grid}>
        <ActionTile
          label="Clientes y proyectos"
          onPress={() => router.push("/clients")}
          tone="dark"
          subtitle="CRUD principal"
        />
        <ActionTile
          label="Nuevo proyecto"
          onPress={() => router.push("/projects/new")}
          subtitle="Campaña o visita"
        />
        <ActionTile
          label="Registrar punto"
          onPress={() => router.push("/points/new")}
          subtitle="GPS, fotos y contexto"
        />
        <ActionTile
          label="Sincronizar"
          onPress={() => router.push("/sync")}
          subtitle="Offline y reintentos"
        />
        <ActionTile
          label="Nueva medición"
          onPress={() => router.push("/measurements/new")}
          subtitle="LAeq, Lmax, Lmin"
        />
      </View>
    </ScrollView>
  );
}

function ActionTile({
  label,
  subtitle,
  onPress,
  tone = "light",
}: {
  label: string;
  subtitle: string;
  onPress: () => void;
  tone?: "light" | "dark";
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tile, tone === "dark" && styles.tileDark]}>
      <Text style={[styles.tileLabel, tone === "dark" && styles.tileLabelDark]}>{label}</Text>
      <Text style={[styles.tileSubtitle, tone === "dark" && styles.tileSubtitleDark]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bigNumber: {
    color: "#10212B",
    fontSize: 42,
    fontWeight: "800",
  },
  container: {
    gap: 18,
    padding: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  paragraph: {
    color: "#57727E",
    fontSize: 14,
    lineHeight: 21,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D6E0E4",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryLabel: {
    color: "#11313A",
    fontWeight: "700",
  },
  strong: {
    color: "#10212B",
    fontWeight: "700",
  },
  tile: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    minHeight: 140,
    padding: 18,
    width: "47%",
  },
  tileDark: {
    backgroundColor: "#11313A",
  },
  tileLabel: {
    color: "#10212B",
    fontSize: 18,
    fontWeight: "800",
  },
  tileLabelDark: {
    color: "#FFFFFF",
  },
  tileSubtitle: {
    color: "#57727E",
    fontSize: 13,
    marginTop: 10,
  },
  tileSubtitleDark: {
    color: "#C6D5DA",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
});
