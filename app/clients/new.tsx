import { Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { PrimaryButton } from '../../components/primary-button';
import { ScreenContainer } from '../../components/screen-container';
import { TextField } from '../../components/text-field';
import { useFieldData } from '../../providers/field-data-provider';

export default function NewClientScreen() {
  const { createClient } = useFieldData();
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Falta informacion', 'Ingresa al menos el nombre del cliente.');
      return;
    }

    setSubmitting(true);
    try {
      await createClient({
        name: name.trim(),
        rut: rut.trim(),
        contact: contact.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });

      Alert.alert('Cliente creado', 'El cliente se guardo correctamente en el almacenamiento local.');
      router.replace('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      title="Nuevo cliente"
      subtitle="Registra la ficha basica del cliente para asociar proyectos y visitas."
      scroll
    >
      <TextField label="Nombre cliente" value={name} onChangeText={setName} placeholder="Ej. Planta Industrial Los Boldos" />
      <TextField label="RUT empresa" value={rut} onChangeText={setRut} placeholder="76.123.456-7" />
      <TextField label="Contacto" value={contact} onChangeText={setContact} placeholder="Nombre del contacto" />
      <TextField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextField label="Telefono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextField label="Direccion" value={address} onChangeText={setAddress} placeholder="Direccion o emplazamiento" />
      <TextField label="Observaciones" value={notes} onChangeText={setNotes} placeholder="Notas tecnicas o administrativas" multiline />
      <PrimaryButton label={submitting ? 'Guardando...' : 'Guardar cliente'} onPress={handleSave} disabled={submitting} />
    </ScreenContainer>
  );
}
