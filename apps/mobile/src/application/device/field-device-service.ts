import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { seedBundle } from "@northacoustics/shared";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function requestCurrentCoordinates(enableDemoMode: boolean): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== "granted") {
    if (enableDemoMode) {
      const fallback = seedBundle.points[0];
      return {
        latitude: fallback.latitude,
        longitude: fallback.longitude,
      };
    }

    throw new Error("Debes conceder permiso de ubicación para capturar GPS.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export async function capturePointPhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.75,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}
