import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ProjectMapPreview } from "../../components/project-map-preview";
import { SectionCard } from "../../components/section-card";
import { StatusPill } from "../../components/status-pill";
import { useFieldData, useProjectReportPreview } from "../../providers/field-data-provider";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProjectAggregate, createReportVersion } = useFieldData();
  const aggregate = id ? getProjectAggregate(id) : null;
  const reportPreview = useProjectReportPreview(id ?? "");

  if (!aggregate) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Proyecto no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard title={aggregate.project.name} subtitle={`${aggregate.project.internalCode} · ${aggregate.project.siteAddress}`}>
        <StatusPill value={aggregate.project.status} />
        <Text style={styles.paragraph}>Objetivo: {aggregate.project.studyObjective}</Text>
        <Text style={styles.paragraph}>Normativa: {aggregate.project.applicableRegulation}</Text>
        <Text style={styles.paragraph}>Responsable: {aggregate.project.professionalResponsible}</Text>
      </SectionCard>

      <SectionCard title="Puntos de medición" subtitle="Vista de terreno y estado por punto">
        <ProjectMapPreview points={aggregate.points} />
        {aggregate.points.map((point) => (
          <View key={point.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{point.code}</Text>
            <Text style={styles.paragraph}>{point.environmentDescription}</Text>
            <Text style={styles.muted}>
              {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
            </Text>
            <StatusPill value={point.status} />
          </View>
        ))}
        <View style={styles.linksRow}>
          <Link href={`/points/new?projectId=${aggregate.project.id}`} style={styles.linkButton}>
            Nuevo punto
          </Link>
          <Link href={`/measurements/new?projectId=${aggregate.project.id}`} style={styles.linkButtonDark}>
            Nueva medición
          </Link>
        </View>
      </SectionCard>

      <SectionCard title="Resultados" subtitle="Resumen acústico y checklist">
        {aggregate.measurements.map((measurement) => (
          <View key={measurement.id} style={styles.itemCard}>
            <Text style={styles.itemTitle}>{measurement.measurementType}</Text>
            <Text style={styles.paragraph}>
              LAeq {measurement.laeq} dB(A) · Lmax {measurement.lmax} · Lmin {measurement.lmin}
            </Text>
            <Text style={styles.muted}>
              {measurement.environmentalConditions.temperatureC} °C · {measurement.environmentalConditions.windSpeedMs}
              {" "}m/s
            </Text>
            <StatusPill value={measurement.validity} />
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Preparación del informe" subtitle="Payload listo para automatización documental">
        <Text style={styles.itemTitle}>{reportPreview?.title}</Text>
        <Text style={styles.paragraph}>{reportPreview?.executiveSummary}</Text>
        <Pressable onPress={() => createReportVersion(aggregate.project.id)}>
          <Text style={styles.ctaText}>Generar nueva versión borrador</Text>
        </Pressable>
        {aggregate.reports.map((report) => (
          <Text key={report.id} style={styles.muted}>
            v{report.version} · {report.status} · {new Date(report.generatedAt).toLocaleString("es-CL")}
          </Text>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    padding: 20,
  },
  ctaText: {
    color: "#0F4C5C",
    fontSize: 15,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: "#57727E",
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
  linkButton: {
    backgroundColor: "#E8EFF1",
    borderRadius: 16,
    color: "#11313A",
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkButtonDark: {
    backgroundColor: "#11313A",
    borderRadius: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  muted: {
    color: "#57727E",
    fontSize: 13,
  },
  paragraph: {
    color: "#57727E",
    fontSize: 14,
    lineHeight: 20,
  },
});
