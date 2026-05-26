export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'cliente';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: 'active' | 'inactive';
};

export type Session = {
  id: string;
  email: string;
  signedInAt: string;
  mode: 'local' | 'supabase';
  profile?: UserProfile;
  accessToken?: string;
};

export type Client = {
  id: string;
  name: string;
  rut: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  internalCode: string;
  address: string;
  commune: string;
  region: string;
  visitDate: string;
  responsible: string;
  objective: string;
  createdAt: string;
};

export type MeasurementPoint = {
  id: string;
  projectId: string;
  pointName: string;
  latitude: number;
  longitude: number;
  photoUri: string | null;
  environmentDescription: string;
  soilUse: string;
  sensitiveReceiver: string;
  observations: string;
  capturedAt: string;
  createdAt: string;
};

export type CreateClientInput = Omit<Client, 'id' | 'createdAt'>;
export type CreateProjectInput = Omit<Project, 'id' | 'createdAt'>;
export type CreateMeasurementPointInput = Omit<MeasurementPoint, 'id' | 'createdAt'>;
