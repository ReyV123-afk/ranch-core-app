import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookmarkService } from '../lib/bookmarkService';
import { Bookmark } from '../types';

const BookmarkList: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    loadBookmarks();
    loadTags();
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const { bookmarks: data, error } = await bookmarkService.getBookmarks(user.id);
      if (error) throw error;
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    if (!user) return;
    try {
      const { tags, error } = await bookmarkService.getBookmarkTags(user.id);
      if (error) throw error;
      setAvailableTags(tags);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!user) return;
    try {
      const { error } = await bookmarkService.deleteBookmark(user.id, bookmarkId);
      if (error) throw error;
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
      setError('Failed to delete bookmark');
    }
  };

  const filteredBookmarks = selectedTags.length > 0
    ? bookmarks.filter(bookmark => 
        selectedTags.every(tag => bookmark.tags.includes(tag))
      )
    : bookmarks;

  if (loading) {
    return <div>Loading bookmarks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Please sign in to view your bookmarks</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => {
              setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTags.includes(tag)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBookmarks.map(bookmark => (
          <div key={bookmark.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-lg mb-2">
              <a
                href={bookmark.article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {bookmark.article.title}
              </a>
            </h3>
            <p className="text-gray-600 mb-4">{bookmark.article.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkList; 