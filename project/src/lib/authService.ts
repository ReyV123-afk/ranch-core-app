import { createClient } from '@supabase/supabase-js';

declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  preferences: {
    emailNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

class AuthService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          user_id: data.user?.id,
          email: email,
          is_premium: false,
          preferences: {
            emailNotifications: true,
            darkMode: false,
            language: 'en',
          },
        });

      if (profileError) throw profileError;

      return { user: this.transformUser(data.user), error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: this.transformUser(data.user), error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;

      if (!user) return { user: null, error: null };

      // Fetch user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      return { user: this.transformUser(user, profile), error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<User['preferences']>): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ preferences })
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async upgradeToPremium(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  private transformUser(authUser: any, profile?: any): User {
    return {
      id: authUser.id,
      email: authUser.email,
      isPremium: profile?.is_premium || false,
      preferences: profile?.preferences || {
        emailNotifications: true,
        darkMode: false,
        language: 'en',
      },
    };
  }
}

export const authService = new AuthService(); 