import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { generateId } from '../lib/ids';
import { STORAGE_KEYS, readStorageItem, writeStorageItem } from '../lib/storage';
import { supabaseConfig } from '../lib/supabase';
import {
  Client,
  CreateClientInput,
  CreateMeasurementPointInput,
  CreateProjectInput,
  MeasurementPoint,
  Project,
  Session,
} from '../types/domain';
import { signIn, signOut, getCurrentUser, getUserProfile, onAuthStateChange } from '../lib/auth';

type FieldDataContextValue = {
  isReady: boolean;
  isLoading: boolean;
  session: Session | null;
  clients: Client[];
  projects: Project[];
  measurementPoints: MeasurementPoint[];
  supabaseConfig: typeof supabaseConfig;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createClient: (input: CreateClientInput) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<void>;
  createMeasurementPoint: (input: CreateMeasurementPointInput) => Promise<void>;
};

const FieldDataContext = createContext<FieldDataContextValue | null>(null);

export function FieldDataProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);

  // Initialize from storage and auth state
  useEffect(() => {
    async function hydrate() {
      try {
        // Check current auth session from Supabase
        const { user } = await getCurrentUser();

        if (user && supabaseConfig.isConfigured) {
          // Get user profile with role
          const { profile } = await getUserProfile(user.id);

          if (profile) {
            const nextSession: Session = {
              id: user.id,
              email: user.email || '',
              signedInAt: new Date().toISOString(),
              mode: 'supabase',
              profile,
              accessToken: user.user_metadata?.provider_token,
            };

            setSession(nextSession);
            return; // Exit early, user is authenticated
          }
        }

        // Fallback: read from storage (for offline or unauthenticated state)
        const storedSession = await readStorageItem<Session | null>(STORAGE_KEYS.session, null);
        setSession(storedSession);
      } catch (err) {
        console.error('Hydration error:', err);
      } finally {
        setIsReady(true);
      }

      // Load data from storage
      const [storedClients, storedProjects, storedPoints] = await Promise.all([
        readStorageItem<Client[]>(STORAGE_KEYS.clients, []),
        readStorageItem<Project[]>(STORAGE_KEYS.projects, []),
        readStorageItem<MeasurementPoint[]>(STORAGE_KEYS.measurementPoints, []),
      ]);

      setClients(storedClients);
      setProjects(storedProjects);
      setMeasurementPoints(storedPoints);
    }

    hydrate();

    // Listen to auth state changes
    const subscription = onAuthStateChange(async (event, authSession) => {
      if (event === 'SIGNED_IN' && authSession?.user) {
        // User signed in
        const { profile } = await getUserProfile(authSession.user.id);

        const nextSession: Session = {
          id: authSession.user.id,
          email: authSession.user.email || '',
          signedInAt: new Date().toISOString(),
          mode: 'supabase',
          profile,
          accessToken: authSession.access_token,
        };

        setSession(nextSession);
        await writeStorageItem(STORAGE_KEYS.session, nextSession);
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setSession(null);
        await writeStorageItem(STORAGE_KEYS.session, null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo<FieldDataContextValue>(
    () => ({
      isReady,
      isLoading,
      session,
      clients,
      projects,
      measurementPoints,
      supabaseConfig,
      async login(email: string, password: string) {
        if (!supabaseConfig.isConfigured) {
          throw new Error('Supabase no está configurado. Verifica EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY');
        }

        setIsLoading(true);
        try {
          const { user, error } = await signIn(email, password);

          if (error) {
            throw error;
          }

          if (!user) {
            throw new Error('No user returned from Supabase');
          }

          // Get profile with role
          const { profile } = await getUserProfile(user.id);

          const nextSession: Session = {
            id: user.id,
            email: user.email || '',
            signedInAt: new Date().toISOString(),
            mode: 'supabase',
            profile,
            accessToken: user.user_metadata?.provider_token,
          };

          setSession(nextSession);
          await writeStorageItem(STORAGE_KEYS.session, nextSession);
        } finally {
          setIsLoading(false);
        }
      },
      async logout() {
        setIsLoading(true);
        try {
          const { error } = await signOut();
          if (error) throw error;

          setSession(null);
          await writeStorageItem(STORAGE_KEYS.session, null);
        } finally {
          setIsLoading(false);
        }
      },
      async createClient(input: CreateClientInput) {
        const nextClients = [
          {
            id: generateId('client'),
            createdAt: new Date().toISOString(),
            ...input,
          },
          ...clients,
        ];

        setClients(nextClients);
        await writeStorageItem(STORAGE_KEYS.clients, nextClients);
      },
      async createProject(input: CreateProjectInput) {
        const nextProjects = [
          {
            id: generateId('project'),
            createdAt: new Date().toISOString(),
            ...input,
          },
          ...projects,
        ];

        setProjects(nextProjects);
        await writeStorageItem(STORAGE_KEYS.projects, nextProjects);
      },
      async createMeasurementPoint(input: CreateMeasurementPointInput) {
        const nextPoints = [
          {
            id: generateId('point'),
            createdAt: new Date().toISOString(),
            ...input,
          },
          ...measurementPoints,
        ];

        setMeasurementPoints(nextPoints);
        await writeStorageItem(STORAGE_KEYS.measurementPoints, nextPoints);
      },
    }),
    [clients, isReady, isLoading, measurementPoints, projects, session, supabaseConfig]
  );

  return <FieldDataContext.Provider value={value}>{children}</FieldDataContext.Provider>;
}

export function useFieldData() {
  const context = useContext(FieldDataContext);
  if (!context) {
    throw new Error('useFieldData debe usarse dentro de FieldDataProvider.');
  }

  return context;
}
