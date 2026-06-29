import { Platform, StyleSheet, Text, View } from "react-native";

import type { MeasurementPoint } from "@northacoustics/shared";

let NativeMapView: any = null;
let NativeMarker: any = null;

if (Platform.OS !== "web") {
  const maps = require("react-native-maps");
  NativeMapView = maps.default;
  NativeMarker = maps.Marker;
}

export function ProjectMapPreview({ points }: { points: MeasurementPoint[] }) {
  if (!points.length) {
    return (
      <View style={[styles.emptyMap, styles.map]}>
        <Text style={styles.emptyText}>Aun no hay puntos georreferenciados.</Text>
      </View>
    );
  }

  if (Platform.OS === "web" || !NativeMapView || !NativeMarker) {
    return (
      <View style={[styles.webMap, styles.map]}>
        <Text style={styles.webMapTitle}>Vista simplificada de puntos</Text>
        {points.map((point) => (
          <View key={point.id} style={styles.webPoint}>
            <Text style={styles.webPointTitle}>{point.code}</Text>
            <Text style={styles.webPointText}>
              {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
            </Text>
            <Text style={styles.webPointText}>{point.environmentDescription}</Text>
          </View>
        ))}
      </View>
    );
  }

  const first = points[0];

  return (
    <NativeMapView
      style={styles.map}
      region={{
        latitude: first.latitude,
        longitude: first.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {points.map((point) => (
        <NativeMarker
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          key={point.id}
          title={point.code}
          description={point.environmentDescription}
        />
      ))}
    </NativeMapView>
  );
}

const styles = StyleSheet.create({
  emptyMap: {
    alignItems: "center",
    backgroundColor: "#E8EFF1",
    justifyContent: "center",
  },
  emptyText: {
    color: "#57727E",
    fontSize: 13,
  },
  map: {
    borderRadius: 24,
    height: 240,
    overflow: "hidden",
    width: "100%",
  },
  webMap: {
    backgroundColor: "#E8EFF1",
    gap: 10,
    padding: 16,
  },
  webMapTitle: {
    color: "#10212B",
    fontSize: 15,
    fontWeight: "800",
  },
  webPoint: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    gap: 4,
    padding: 12,
  },
  webPointText: {
    color: "#57727E",
    fontSize: 12,
  },
  webPointTitle: {
    color: "#10212B",
    fontSize: 14,
    fontWeight: "700",
  },
});
