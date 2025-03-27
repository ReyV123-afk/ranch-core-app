import { supabase } from './supabaseClient';
import { NewsArticle, Bookmark } from '../types';

class BookmarkService {
  async createBookmark(userId: string, article: NewsArticle): Promise<{ bookmark: Bookmark | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([
          {
            user_id: userId,
            article: article,
            tags: []
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { bookmark: this.transformBookmark(data), error: null };
    } catch (err) {
      console.error('Error creating bookmark:', err);
      return { bookmark: null, error: err as Error };
    }
  }

  async getBookmarks(userId: string): Promise<{ bookmarks: Bookmark[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { bookmarks: data.map(this.transformBookmark), error: null };
    } catch (err) {
      console.error('Error getting bookmarks:', err);
      return { bookmarks: [], error: err as Error };
    }
  }

  async deleteBookmark(userId: string, bookmarkId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      return { error: err as Error };
    }
  }

  async updateBookmarkTags(userId: string, bookmarkId: string, tags: string[]): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ tags })
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error updating bookmark tags:', err);
      return { error: err as Error };
    }
  }

  async getBookmarkTags(userId: string): Promise<{ tags: string[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('tags')
        .eq('user_id', userId);

      if (error) throw error;
      const allTags = data.flatMap(bookmark => bookmark.tags);
      const uniqueTags = [...new Set(allTags)];
      return { tags: uniqueTags, error: null };
    } catch (err) {
      console.error('Error getting bookmark tags:', err);
      return { tags: [], error: err as Error };
    }
  }

  private transformBookmark(data: any): Bookmark {
    return {
      id: data.id,
      userId: data.user_id,
      article: data.article,
      tags: data.tags || [],
      createdAt: data.created_at
    };
  }
}

export const bookmarkService = new BookmarkService(); 