import React from 'react';
import NewsSearch from '../components/NewsSearch';

const Search: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search News</h1>
      <NewsSearch />
    </div>
  );
};

export default Search;