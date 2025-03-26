import React, { useState, useEffect } from 'react';
import { Bookmark, User } from '../types';
import { bookmarkService } from '../lib/bookmarkService';
import TagEditor from './TagEditor';

interface BookmarkListProps {
  user: User;
}

type SortOption = 'newest' | 'oldest' | 'title';

const BookmarkList: React.FC<BookmarkListProps> = ({ user }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadBookmarks();
    loadTags();
  }, [user.id, selectedTags]);

  const loadBookmarks = async () => {
    try {
      const { bookmarks: data, error } = await bookmarkService.getBookmarks(user.id, {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      if (error) throw error;
      setBookmarks(data);
    } catch (err) {
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const { tags: data, error } = await bookmarkService.getBookmarkTags(user.id);
      if (error) throw error;
      setTags(data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await bookmarkService.removeBookmark(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleUpdateTags = async (bookmarkId: string, newTags: string[]) => {
    try {
      const { error } = await bookmarkService.updateBookmarkTags(user.id, bookmarkId, newTags);
      if (error) throw error;
      setBookmarks(bookmarks.map((b: Bookmark) => 
        b.id === bookmarkId ? { ...b, tags: newTags } : b
      ));
    } catch (err) {
      setError('Failed to update tags. Please try again.');
    }
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.article.title.localeCompare(b.article.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {bookmarks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No bookmarked articles found.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    <a 
                      href={bookmark.article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {bookmark.article.title}
                    </a>
                  </h3>
                  <p className="text-gray-600 mb-2">{bookmark.article.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{bookmark.article.source}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(bookmark.article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <TagEditor
                  tags={bookmark.tags}
                  onUpdate={(newTags) => handleUpdateTags(bookmark.id, newTags)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkList; 