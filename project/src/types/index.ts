export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  source: string;
  category: string;
  views?: number;
}

export interface NewsInterest {
  category: string;
  keywords: string[];
  frequency: 'daily' | 'weekly';
}

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  interests?: NewsInterest[];
  preferences: {
    emailNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

export interface Bookmark {
  id: string;
  userId: string;
  article: NewsArticle;
  tags: string[];
  createdAt: string;
}

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  isSubscribed: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  keywords: string[];
  subscriberCount: number;
  isActive: boolean;
}