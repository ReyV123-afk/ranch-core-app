import { createClient } from '@supabase/supabase-js';

interface AuthResponse {
  user: any;
  error: Error | null;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class AuthService {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user, error };
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user, error };
  }

  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  async updateProfile(data: any): Promise<AuthResponse> {
    const { data: user, error } = await supabase.auth.updateUser(data);
    return { user, error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }
}

export const authService = new AuthService(); 