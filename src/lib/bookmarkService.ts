import { Bookmark, NewsArticle } from '../types';

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}

class BookmarkService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  async addBookmark(bookmark: { article: NewsArticle; tags: string[] }): Promise<Bookmark | null> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
        },
        body: JSON.stringify({
          article: bookmark.article,
          tags: bookmark.tags
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add bookmark');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  }

  async removeBookmark(bookmarkId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bookmarks?id=eq.${bookmarkId}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.supabaseKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  async getBookmarks(userId: string): Promise<{ bookmarks: Bookmark[]; error: Error | null }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bookmarks?user_id=eq.${userId}`, {
        headers: {
          'apikey': this.supabaseKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      return { bookmarks: data, error: null };
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return { bookmarks: [], error: error as Error };
    }
  }

  async updateBookmarkTags(userId: string, bookmarkId: string, tags: string[]): Promise<{ error: Error | null }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bookmarks?id=eq.${bookmarkId}&user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseKey,
        },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark tags');
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating bookmark tags:', error);
      return { error: error as Error };
    }
  }

  async getBookmarkTags(userId: string): Promise<{ tags: string[]; error: Error | null }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/bookmarks?user_id=eq.${userId}&select=tags`, {
        headers: {
          'apikey': this.supabaseKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmark tags');
      }

      const data = await response.json();
      const allTags = data.flatMap((bookmark: { tags: string[] }) => bookmark.tags || []);
      const uniqueTags = [...new Set(allTags)] as string[];

      return { tags: uniqueTags, error: null };
    } catch (error) {
      console.error('Error fetching bookmark tags:', error);
      return { tags: [], error: error as Error };
    }
  }
}

export const bookmarkService = new BookmarkService(); 