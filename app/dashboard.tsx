import { StyleSheet, Text, View, Alert } from 'react-native';
import { router } from 'expo-router';

import { LogoMark } from '../components/logo-mark';
import { PrimaryButton } from '../components/primary-button';
import { ScreenContainer } from '../components/screen-container';
import { StatCard } from '../components/stat-card';
import { useFieldData } from '../providers/field-data-provider';
import { palette } from '../theme/palette';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  cliente: 'Cliente',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444',
  supervisor: '#f97316',
  tecnico: '#3b82f6',
  cliente: '#10b981',
};

export default function DashboardScreen() {
  const { clients, projects, measurementPoints, session, logout, isLoading } = useFieldData();

  if (!session) {
    // Not authenticated, redirect to login
    router.replace('/login');
    return null;
  }

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const roleLabel = session.profile?.role
    ? ROLE_LABELS[session.profile.role] || session.profile.role
    : 'Usuario';

  const roleColor = session.profile?.role ? ROLE_COLORS[session.profile.role] : palette.muted;

  return (
    <ScreenContainer
      title="Dashboard"
      subtitle={`Bienvenido${session.profile?.full_name ? ', ' + session.profile.full_name : ''}`}
      scroll
    >
      <View style={styles.brandBanner}>
        <LogoMark compact />
        <Text style={styles.brandBannerText}>Sistema de mediciones acústicas y ambientales</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View>
            <Text style={styles.profileEmail}>{session.email}</Text>
            {session.profile?.full_name && (
              <Text style={styles.profileName}>{session.profile.full_name}</Text>
            )}
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>
        <Text style={styles.profileSubtext}>
          Modo: {session.mode === 'supabase' ? 'Supabase' : 'Local'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.grid}>
        <StatCard label="Clientes" value={String(clients.length)} />
        <StatCard label="Proyectos" value={String(projects.length)} />
        <StatCard label="Puntos" value={String(measurementPoints.length)} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <PrimaryButton
          label="Crear cliente"
          onPress={() => router.push('/clients/new')}
          disabled={isLoading}
        />
        <PrimaryButton
          label="Crear proyecto"
          onPress={() => router.push('/projects/new')}
          variant="secondary"
          disabled={isLoading}
        />
        <PrimaryButton
          label="Registrar punto de medición"
          onPress={() => router.push('/points/new')}
          variant="secondary"
          disabled={isLoading}
        />
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen de datos</Text>
        <Text style={styles.summaryText}>
          Clientes: {clients.length} | Proyectos: {projects.length} | Puntos: {measurementPoints.length}
        </Text>
        <Text style={styles.summaryText}>
          Los datos se sincronizan con Supabase en tiempo real. Puedes acceder desde cualquier dispositivo.
        </Text>
      </View>

      {/* Logout Button */}
      <PrimaryButton
        label={isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
        variant="ghost"
        onPress={handleLogout}
        disabled={isLoading}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  brandBanner: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 20,
  },
  brandBannerText: {
    marginTop: 12,
    color: palette.muted,
    lineHeight: 21,
    fontSize: 14,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 13,
    color: palette.muted,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileSubtext: {
    fontSize: 12,
    color: palette.muted,
  },
  section: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 14,
  },
  summaryText: {
    color: palette.muted,
    lineHeight: 22,
    marginBottom: 8,
    fontSize: 13,
  },
});
