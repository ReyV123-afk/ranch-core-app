import { NewsArticle as NewsServiceArticle } from '../lib/newsService';

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  interests: string[];
  preferences: {
    emailNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface Bookmark {
  id: string;
  userId: string;
  article: NewsServiceArticle;
  tags: string[];
  createdAt: string;
}

export type NewsArticle = NewsServiceArticle;

export interface Newsletter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
  subscribers: string[];
}