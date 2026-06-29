import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "../components/section-card";
import { StatusPill } from "../components/status-pill";
import { useFieldData } from "../providers/field-data-provider";

export default function SyncScreen() {
  const { isDemoMode, isSupabaseConfigured, syncConflicts, syncQueue, syncTelemetry, runSync, lastSyncAt } = useFieldData();
  const [message, setMessage] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title="Sincronización offline" subtitle="La cola local se vacía cuando vuelve la conectividad">
        <View style={styles.summary}>
          <Text style={styles.bigNumber}>{syncQueue.length}</Text>
          <View>
            <StatusPill value={syncQueue.length ? "pending" : "approved"} />
            <Text style={styles.caption}>
              Último sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString("es-CL") : "aun no ejecutado"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={async () => {
            try {
              setMessage("");
              await runSync();
              setMessage("Sincronización completada.");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "No fue posible sincronizar.");
            }
          }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryLabel}>Ejecutar sincronización</Text>
        </Pressable>
        <Text style={styles.caption}>
          Fuente activa: {isSupabaseConfigured ? "Supabase real" : isDemoMode ? "Demo local" : "Sin configurar"}.
        </Text>
        {message ? <Text style={styles.caption}>{message}</Text> : null}
      </SectionCard>

      <SectionCard title="Panel técnico de sincronización" subtitle="Telemetría local y trazabilidad operacional">
        <View style={styles.metricsGrid}>
          <Metric label="Pendientes" value={String(syncTelemetry.pendingOperations)} />
          <Metric label="Fallidas" value={String(syncTelemetry.failedOperations)} />
          <Metric label="Conflictos" value={String(syncConflicts.length)} />
          <Metric label="Reintentos" value={String(syncTelemetry.retryCount)} />
          <Metric label="Fotos" value={String(syncTelemetry.pendingPhotos)} />
          <Metric label="Storage" value={`${Math.round(syncTelemetry.localStorageBytes / 1024)} KB`} />
        </View>
        <Text style={styles.caption}>
          Duración promedio: {Math.round(syncTelemetry.averageDurationMs)} ms · Volumen sincronizado:{" "}
          {Math.round(syncTelemetry.syncedBytes / 1024)} KB.
        </Text>
        <Text style={styles.caption}>
          Último ciclo técnico:{" "}
          {syncTelemetry.lastFinishedAt ? new Date(syncTelemetry.lastFinishedAt).toLocaleString("es-CL") : "sin ciclos registrados"}.
        </Text>
      </SectionCard>

      {syncConflicts.length ? (
        <SectionCard title="Conflictos pendientes" subtitle="No se sobrescriben datos sin resolución controlada">
          {syncConflicts.map((conflict) => (
            <View key={conflict.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{conflict.entity}</Text>
              <Text style={styles.caption}>
                {conflict.reason} · entidad {conflict.entityId}
              </Text>
              <Text style={styles.caption}>
                local v{conflict.localVersion} · remoto v{conflict.remoteVersion ?? "n/d"} · política {conflict.policy}
              </Text>
            </View>
          ))}
        </SectionCard>
      ) : null}

      {syncQueue.map((item) => (
        <SectionCard key={item.id} title={`${item.action} · ${item.status ?? "pending"}`} subtitle={`Entidad ${item.entityId}`}>
          <Text style={styles.caption}>
            {item.entity ?? "entidad"} · {item.operation ?? "operación"} · prioridad {item.priority ?? 0} · intentos{" "}
            {item.attempts ?? 0}
          </Text>
          {item.lastError ? <Text style={styles.errorText}>{item.lastError}</Text> : null}
          <Text style={styles.caption}>{JSON.stringify(item.payload, null, 2)}</Text>
        </SectionCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bigNumber: {
    color: "#10212B",
    fontSize: 42,
    fontWeight: "800",
  },
  caption: {
    color: "#57727E",
    fontSize: 13,
    lineHeight: 20,
  },
  container: {
    gap: 18,
    padding: 20,
  },
  errorText: {
    color: "#B42318",
    fontSize: 13,
    lineHeight: 20,
  },
  itemCard: {
    backgroundColor: "#F5F8F9",
    borderRadius: 18,
    gap: 6,
    padding: 14,
  },
  itemTitle: {
    color: "#10212B",
    fontSize: 16,
    fontWeight: "800",
  },
  metricBox: {
    backgroundColor: "#F5F8F9",
    borderRadius: 16,
    minWidth: "46%",
    padding: 14,
  },
  metricLabel: {
    color: "#57727E",
    fontSize: 12,
  },
  metricValue: {
    color: "#10212B",
    fontSize: 20,
    fontWeight: "800",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  summary: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
});

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
