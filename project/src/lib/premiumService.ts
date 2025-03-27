import { supabase } from './supabaseClient';
import { Newsletter } from '../types';

class PremiumService {
  async getNewsletters(userId: string): Promise<Newsletter[]> {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('userId', userId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting newsletters:', err);
      return [];
    }
  }

  async createNewsletter(
    userId: string,
    title: string,
    description: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    categories: string[],
    keywords: string[]
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          userId,
          title,
          description,
          schedule,
          categories,
          keywords,
          isActive: true
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error creating newsletter:', err);
      return null;
    }
  }

  async updateNewsletter(
    newsletterId: string,
    updates: Partial<Newsletter>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletters')
        .update(updates)
        .eq('id', newsletterId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating newsletter:', err);
      return false;
    }
  }

  async deleteNewsletter(newsletterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', newsletterId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting newsletter:', err);
      return false;
    }
  }
}

export const premiumService = new PremiumService(); 