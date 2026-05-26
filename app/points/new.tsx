import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { PrimaryButton } from '../../components/primary-button';
import { ScreenContainer } from '../../components/screen-container';
import { TextField } from '../../components/text-field';
import { useFieldData } from '../../providers/field-data-provider';
import { palette } from '../../theme/palette';

export default function NewPointScreen() {
  const { projects, createMeasurementPoint } = useFieldData();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id ?? null);
  const [pointName, setPointName] = useState('');
  const [environmentDescription, setEnvironmentDescription] = useState('');
  const [soilUse, setSoilUse] = useState('');
  const [sensitiveReceiver, setSensitiveReceiver] = useState('');
  const [observations, setObservations] = useState('');
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const handleCaptureGps = async () => {
    setCapturingGps(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Debes conceder acceso a ubicacion para capturar coordenadas.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setGps({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo obtener la ubicacion.';
      Alert.alert('GPS no disponible', message);
    } finally {
      setCapturingGps(false);
    }
  };

  const handleCapturePhoto = async () => {
    setCapturingPhoto(true);
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert('Permiso requerido', 'Debes conceder acceso a la camara para registrar la fotografia.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo capturar la fotografia.';
      Alert.alert('Camara no disponible', message);
    } finally {
      setCapturingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      Alert.alert('Proyecto requerido', 'Primero crea un proyecto para asociar el punto.');
      return;
    }

    if (!pointName.trim()) {
      Alert.alert('Punto incompleto', 'Ingresa un nombre o codigo para el punto de medicion.');
      return;
    }

    if (!gps) {
      Alert.alert('GPS pendiente', 'Captura las coordenadas antes de guardar el punto.');
      return;
    }

    setSubmitting(true);
    try {
      await createMeasurementPoint({
        projectId: selectedProjectId,
        pointName: pointName.trim(),
        latitude: gps.latitude,
        longitude: gps.longitude,
        photoUri,
        environmentDescription: environmentDescription.trim(),
        soilUse: soilUse.trim(),
        sensitiveReceiver: sensitiveReceiver.trim(),
        observations: observations.trim(),
        capturedAt: new Date().toISOString(),
      });

      Alert.alert('Punto registrado', 'El punto quedo guardado localmente con su GPS y fotografia.');
      router.replace('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Punto de medicion"
      subtitle="Registra un punto en terreno con coordenadas y evidencia fotografica."
      scroll
    >
      <Text style={styles.label}>Proyecto asociado</Text>
      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aun no hay proyectos. Crea uno antes de registrar un punto.</Text>
        </View>
      ) : (
        <View style={styles.selectorGroup}>
          {projects.map((project) => {
            const selected = project.id === selectedProjectId;
            return (
              <Pressable
                key={project.id}
                onPress={() => setSelectedProjectId(project.id)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{project.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedProject ? <Text style={styles.helper}>Proyecto activo: {selectedProject.name}</Text> : null}

      <TextField label="Nombre o codigo del punto" value={pointName} onChangeText={setPointName} placeholder="Ej. P1 - Deslinde norte" />
      <TextField label="Descripcion del entorno" value={environmentDescription} onChangeText={setEnvironmentDescription} placeholder="Vivienda aislada con camino de ripio" multiline />
      <TextField label="Uso de suelo observado" value={soilUse} onChangeText={setSoilUse} placeholder="Residencial" />
      <TextField label="Receptor sensible cercano" value={sensitiveReceiver} onChangeText={setSensitiveReceiver} placeholder="Vivienda permanente a 35 m" />
      <TextField label="Observaciones" value={observations} onChangeText={setObservations} placeholder="Ruido esporadico por camioneta" multiline />

      <PrimaryButton
        label={capturingGps ? 'Capturando GPS...' : 'Capturar GPS'}
        onPress={handleCaptureGps}
        disabled={capturingGps || projects.length === 0}
        variant="secondary"
      />
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Coordenadas</Text>
        <Text style={styles.statusText}>
          {gps ? `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}` : 'Aun no se capturaron coordenadas.'}
        </Text>
      </View>

      <PrimaryButton
        label={capturingPhoto ? 'Abriendo camara...' : 'Tomar fotografia'}
        onPress={handleCapturePhoto}
        disabled={capturingPhoto || projects.length === 0}
        variant="secondary"
      />
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Fotografia</Text>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} />
        ) : (
          <Text style={styles.statusText}>Aun no se registra fotografia del punto.</Text>
        )}
      </View>

      <PrimaryButton
        label={submitting ? 'Guardando...' : 'Guardar punto'}
        onPress={handleSave}
        disabled={submitting || projects.length === 0}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 10,
  },
  selectorGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.surface,
  },
  chipSelected: {
    borderColor: palette.accent,
    backgroundColor: palette.surfaceAlt,
  },
  chipText: {
    color: palette.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: palette.accent,
  },
  helper: {
    color: palette.muted,
    marginBottom: 18,
  },
  emptyState: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 12,
  },
  emptyText: {
    color: palette.muted,
    lineHeight: 20,
  },
  statusCard: {
    marginTop: 14,
    marginBottom: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statusTitle: {
    color: palette.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusText: {
    color: palette.muted,
    lineHeight: 20,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: palette.surfaceAlt,
  },
});
