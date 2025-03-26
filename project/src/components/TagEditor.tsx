import React, { useState, useRef, useEffect } from 'react';

interface TagEditorProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  className?: string;
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, onUpdate, className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onUpdate([...tags, newTag]);
      }
      setInputValue('');
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map(tag => (
        <span
          key={tag}
          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      ))}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              const newTag = inputValue.trim();
              if (!tags.includes(newTag)) {
                onUpdate([...tags, newTag]);
              }
            }
            setIsEditing(false);
            setInputValue('');
          }}
          placeholder="Add tag..."
          className="px-2 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add tag
        </button>
      )}
    </div>
  );
};

export default TagEditor; 