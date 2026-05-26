import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  session: 'northacoustics:session',
  clients: 'northacoustics:clients',
  projects: 'northacoustics:projects',
  measurementPoints: 'northacoustics:measurement-points',
} as const;

export async function readStorageItem<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeStorageItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
