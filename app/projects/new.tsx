import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';

import { PrimaryButton } from '../../components/primary-button';
import { ScreenContainer } from '../../components/screen-container';
import { TextField } from '../../components/text-field';
import { useFieldData } from '../../providers/field-data-provider';
import { palette } from '../../theme/palette';

export default function NewProjectScreen() {
  const { clients, createProject } = useFieldData();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id ?? null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  const handleSave = async () => {
    if (!selectedClientId) {
      Alert.alert('Cliente requerido', 'Primero crea un cliente para asociar el proyecto.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Proyecto incompleto', 'Ingresa el nombre del proyecto.');
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        clientId: selectedClientId,
        name: name.trim(),
        internalCode: code.trim(),
        address: address.trim(),
        commune: '',
        region: '',
        visitDate: visitDate.trim(),
        responsible: responsible.trim(),
        objective: goal.trim(),
      });

      Alert.alert('Proyecto creado', 'El proyecto fue guardado localmente y ya puede usarse para registrar puntos.');
      router.replace('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Nuevo proyecto"
      subtitle="Asocia una campana a un cliente y deja lista la visita de terreno."
      scroll
    >
      <Text style={styles.label}>Cliente asociado</Text>
      {clients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aun no hay clientes. Crea uno antes de registrar el proyecto.</Text>
        </View>
      ) : (
        <View style={styles.selectorGroup}>
          {clients.map((client) => {
            const selected = client.id === selectedClientId;
            return (
              <Pressable
                key={client.id}
                onPress={() => setSelectedClientId(client.id)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{client.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedClient ? <Text style={styles.helper}>Cliente activo: {selectedClient.name}</Text> : null}

      <TextField label="Nombre del proyecto" value={name} onChangeText={setName} placeholder="Ej. Campana de ruido nocturno" />
      <TextField label="Codigo interno" value={code} onChangeText={setCode} placeholder="NAC-2026-014" />
      <TextField label="Direccion o emplazamiento" value={address} onChangeText={setAddress} placeholder="Camino interior parcela 10" />
      <TextField label="Fecha de visita" value={visitDate} onChangeText={setVisitDate} placeholder="2026-04-12" />
      <TextField label="Profesional responsable" value={responsible} onChangeText={setResponsible} placeholder="Nombre del responsable" />
      <TextField label="Objetivo de la medicion" value={goal} onChangeText={setGoal} placeholder="Verificar cumplimiento DS 38" multiline />
      <PrimaryButton label={submitting ? 'Guardando...' : 'Guardar proyecto'} onPress={handleSave} disabled={submitting || clients.length === 0} />
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
});
