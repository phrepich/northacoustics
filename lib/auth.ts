import { supabase } from './supabase-client';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'tecnico' | 'cliente';
  status: 'active' | 'inactive';
};

/**
 * Sign up with email and password
 * Automatically creates a profile with default role 'cliente'
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { user: null, error };
  }

  // Create profile in public.profiles table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: 'cliente', // default role for new users
        status: 'active',
      });

    if (profileError) {
      return { user: null, error: profileError };
    }
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, error };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId: string): Promise<{
  profile: UserProfile | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, status')
    .eq('id', userId)
    .single();

  return { profile: data as UserProfile | null, error };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}

/**
 * Request password reset
 */
export async function resetPasswordRequest(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'northacoustics://reset-password',
  });

  return { data, error };
}

/**
 * Update password with token
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}
