import { createClient } from '@supabase/supabase-js';
import { Bookmark, NewsArticle } from '../types';
import { supabase } from './supabaseClient';

interface SupabaseBookmark {
  id: string;
  user_id: string;
  article: NewsArticle;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  }
}

export interface Bookmark {
  id?: string;
  userId: string;
  articleId: string;
  title: string;
  url: string;
  publishedAt: string;
  tags: string[];
  createdAt?: string;
}

class BookmarkService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async getUserBookmarks(): Promise<Bookmark[]> {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      return bookmarks || [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'userId' | 'createdAt'>): Promise<Bookmark | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([bookmark])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  }

  async removeBookmark(articleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('articleId', articleId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  async updateBookmarkTags(articleId: string, tags: string[]): Promise<Bookmark | null> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .update({ tags })
        .eq('articleId', articleId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating bookmark tags:', error);
      return null;
    }
  }

  async getBookmarkTags(): Promise<string[]> {
    try {
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('tags');

      if (error) {
        throw error;
      }

      // Extract unique tags from all bookmarks
      const allTags = bookmarks?.flatMap(b => b.tags) || [];
      return Array.from(new Set(allTags));
    } catch (error) {
      console.error('Error fetching bookmark tags:', error);
      return [];
    }
  }

  async getBookmarks(userId: string, options: {
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ bookmarks: Bookmark[]; error: Error | null }> {
    try {
      let query = this.supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.tags?.length) {
        query = query.contains('tags', options.tags);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        bookmarks: (data as SupabaseBookmark[]).map(this.mapSupabaseBookmark),
        error: null,
      };
    } catch (error) {
      return { bookmarks: [], error: error as Error };
    }
  }

  private mapSupabaseBookmark(data: SupabaseBookmark): Bookmark {
    return {
      id: data.id,
      userId: data.user_id,
      articleId: data.article.id,
      title: data.article.title,
      url: data.article.url,
      publishedAt: data.article.publishedAt,
      tags: data.tags,
      createdAt: data.created_at,
    };
  }

  async updateBookmarkTags(userId: string, bookmarkId: string, tags: string[]): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('bookmarks')
        .update({ tags })
        .eq('user_id', userId)
        .eq('id', bookmarkId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async getBookmarkTags(userId: string): Promise<{ tags: string[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('bookmarks')
        .select('tags')
        .eq('user_id', userId);

      if (error) throw error;

      const allTags = (data as { tags: string[] }[]).reduce((acc: string[], item) => {
        return [...acc, ...(item.tags || [])];
      }, []);

      const uniqueTags = [...new Set(allTags)];

      return { tags: uniqueTags, error: null };
    } catch (error) {
      return { tags: [], error: error as Error };
    }
  }
}

export const bookmarkService = new BookmarkService(); 