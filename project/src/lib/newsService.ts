import { supabase } from './supabaseClient';
import { NewsArticle, NewsInterest } from '../types';

interface NewsFilters {
  category: string;
  date: string;
  source: string;
  sortBy: 'relevance' | 'date' | 'popularity';
}

interface TrendingTopic {
  topic: string;
  count: number;
  category: string;
}

interface ArticleWithViews {
  title: string;
  category: string;
  views: number;
}

interface RecommendationAnalytics {
  totalRecommendations: number;
  viewRate: number;
  bookmarkRate: number;
  notInterestedRate: number;
  byCategory: Record<string, {
    total: number;
    viewRate: number;
    bookmarkRate: number;
    notInterestedRate: number;
  }>;
  bySource: Record<string, {
    total: number;
    viewRate: number;
    bookmarkRate: number;
    notInterestedRate: number;
  }>;
}

declare global {
  interface ImportMetaEnv {
    VITE_NEWS_API_KEY: string;
    VITE_HUGGINGFACE_API_KEY: string;
  }
}

class NewsService {
  private supabase;
  private newsApiKey: string;

  constructor() {
    this.supabase = supabase;
    this.newsApiKey = import.meta.env.VITE_NEWS_API_KEY;
  }

  async fetchNews(interests: NewsInterest[]): Promise<NewsArticle[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const fromDate = yesterday.toISOString();

    const articles: NewsArticle[] = [];

    for (const interest of interests) {
      const query = interest.keywords.join(' OR ');
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${this.newsApiKey}`
      );

      if (!response.ok) {
        console.error(`Error fetching news for ${interest.category}:`, response.statusText);
        continue;
      }

      const data = await response.json();
      const processedArticles = data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source,
        category: interest.category,
      }));

      articles.push(...processedArticles);
    }

    return articles;
  }

  async summarizeArticle(article: NewsArticle): Promise<string> {
    try {
      // Get the full article content
      const response = await fetch(article.url);
      const html = await response.text();
      
      // Extract the main content using a simple heuristic
      // This is a basic implementation - you might want to use a proper HTML parser
      const content = html
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Use Hugging Face API for summarization
      const summaryResponse = await fetch(
        'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: content,
            parameters: {
              max_length: 130,
              min_length: 30,
            },
          }),
        }
      );

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const summaryData = await summaryResponse.json();
      return summaryData[0].summary_text;
    } catch (error) {
      console.error('Error summarizing article:', error);
      // Fallback to description or title if summarization fails
      return article.description || article.title;
    }
  }

  async saveUserInterests(userId: string, interests: NewsInterest[]): Promise<void> {
    const { error } = await this.supabase
      .from('user_interests')
      .upsert({
        user_id: userId,
        interests: interests,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  async getUserInterests(userId: string): Promise<NewsInterest[]> {
    const { data, error } = await this.supabase
      .from('user_interests')
      .select('interests')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.interests || [];
  }

  async searchNews(
    query: string,
    filters: NewsFilters,
    page: number = 1,
    pageSize: number = 12
  ): Promise<NewsArticle[]> {
    try {
      let queryBuilder = supabase
        .from('articles')
        .select('*');

      // Apply search query
      if (query) {
        queryBuilder = queryBuilder.textSearch('title', query);
      }

      // Apply category filter
      if (filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      // Apply date filter
      if (filters.date !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (filters.date) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        queryBuilder = queryBuilder.gte('publishedAt', startDate.toISOString());
      }

      // Apply source filter
      if (filters.source !== 'all') {
        queryBuilder = queryBuilder.eq('source', filters.source);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'date':
          queryBuilder = queryBuilder.order('publishedAt', { ascending: false });
          break;
        case 'popularity':
          queryBuilder = queryBuilder.order('views', { ascending: false });
          break;
        case 'relevance':
        default:
          if (query) {
            queryBuilder = queryBuilder.order('_relevance', { ascending: false });
          } else {
            queryBuilder = queryBuilder.order('publishedAt', { ascending: false });
          }
          break;
      }

      // Apply pagination
      const start = (page - 1) * pageSize;
      queryBuilder = queryBuilder
        .range(start, start + pageSize - 1)
        .limit(pageSize);

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  async getLatestNews(page: number = 1, pageSize: number = 10): Promise<NewsArticle[]> {
    try {
      const start = (page - 1) * pageSize;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('publishedAt', { ascending: false })
        .range(start, start + pageSize - 1)
        .limit(pageSize);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  async getTrendingNews(page: number = 1, pageSize: number = 5): Promise<NewsArticle[]> {
    try {
      const start = (page - 1) * pageSize;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('views', { ascending: false })
        .range(start, start + pageSize - 1)
        .limit(pageSize);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching trending news:', error);
      return [];
    }
  }

  async getNewsByCategory(
    category: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<NewsArticle[]> {
    try {
      const start = (page - 1) * pageSize;
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('publishedAt', { ascending: false })
        .range(start, start + pageSize - 1)
        .limit(pageSize);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching news by category:', error);
      return [];
    }
  }

  async incrementArticleViews(articleId: string, userId?: string): Promise<void> {
    try {
      // Increment total views
      const { error: incrementError } = await supabase.rpc('increment_article_views', {
        article_id: articleId
      });

      if (incrementError) {
        throw incrementError;
      }

      // If user is logged in, track their view
      if (userId) {
        // Get article category
        const { data: article, error: articleError } = await supabase
          .from('articles')
          .select('category')
          .eq('id', articleId)
          .single();

        if (articleError) {
          throw articleError;
        }

        // Track user view
        const { error: trackError } = await supabase.rpc('track_article_view', {
          p_user_id: userId,
          p_article_id: articleId,
          p_category: article.category
        });

        if (trackError) {
          throw trackError;
        }
      }
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  }

  async getArticleSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('title')
        .textSearch('title', query)
        .limit(5);

      if (error) {
        throw error;
      }

      return (data || []).map(article => article.title);
    } catch (error) {
      console.error('Error fetching article suggestions:', error);
      return [];
    }
  }

  async getTrendingTopics(category: string = 'all'): Promise<TrendingTopic[]> {
    try {
      let query = supabase
        .from('articles')
        .select('title, category, views')
        .order('views', { ascending: false })
        .limit(50);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Extract topics from titles using NLP-like approach
      const topics = (data as ArticleWithViews[])?.map(article => {
        const words = article.title
          .toLowerCase()
          .split(/\s+/)
          .filter((word: string) => 
            word.length > 3 && 
            !['the', 'and', 'that', 'this', 'with', 'from'].includes(word)
          );
        return {
          words,
          category: article.category,
          views: article.views || 0
        };
      }) || [];

      // Count topic occurrences
      const topicCounts = new Map<string, { count: number; category: string }>();
      topics.forEach(({ words, category }: { words: string[]; category: string }) => {
        words.forEach((word: string) => {
          const existing = topicCounts.get(word) || { count: 0, category };
          topicCounts.set(word, {
            count: existing.count + 1,
            category: existing.category
          });
        });
      });

      // Convert to array and sort by count
      const trendingTopics = Array.from(topicCounts.entries())
        .map(([topic, { count, category }]) => ({
          topic,
          count,
          category
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return trendingTopics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  async markArticleNotInterested(userId: string, articleId: string): Promise<void> {
    try {
      // Get article category
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('category')
        .eq('id', articleId)
        .single();

      if (articleError) {
        throw articleError;
      }

      // Mark article as not interested
      const { error: preferenceError } = await supabase.rpc('mark_article_not_interested', {
        p_user_id: userId,
        p_article_id: articleId,
        p_category: article.category
      });

      if (preferenceError) {
        throw preferenceError;
      }
    } catch (error) {
      console.error('Error marking article as not interested:', error);
      throw error;
    }
  }

  async getRecommendedArticles(userId: string): Promise<NewsArticle[]> {
    try {
      // Get user interests
      const interests = await this.getUserInterests(userId);
      
      // Get user's recently viewed articles
      const { data: recentViews } = await supabase
        .from('article_views')
        .select('article_id, category')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(10);

      // Get articles marked as not interested
      const { data: notInterested } = await supabase
        .from('article_preferences')
        .select('article_id')
        .eq('user_id', userId)
        .eq('preference_type', 'not_interested');

      const notInterestedIds = notInterested?.map(pref => pref.article_id) || [];

      // Extract categories from interests and recent views
      const userCategories = new Set([
        ...interests.map(interest => interest.category),
        ...(recentViews || []).map(view => view.category)
      ]);

      // If no categories found, return trending articles
      if (userCategories.size === 0) {
        return this.getTrendingNews(1, 5);
      }

      // Get articles from user's preferred categories, excluding not interested articles
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .in('category', Array.from(userCategories))
        .not('id', 'in', notInterestedIds)
        .order('publishedAt', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return articles || [];
    } catch (error) {
      console.error('Error fetching recommended articles:', error);
      return [];
    }
  }

  async trackRecommendationInteraction(
    userId: string,
    articleId: string,
    recommendationType: 'interest_based' | 'trending' | 'view_history',
    interactionType: 'view' | 'bookmark' | 'not_interested',
    value: boolean
  ): Promise<void> {
    try {
      // Get article details
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('category, source')
        .eq('id', articleId)
        .single();

      if (articleError) {
        throw articleError;
      }

      // Track interaction
      const { error: trackingError } = await supabase.rpc('track_recommendation_interaction', {
        p_user_id: userId,
        p_article_id: articleId,
        p_recommendation_type: recommendationType,
        p_category: article.category,
        p_source: article.source,
        p_interaction_type: interactionType,
        p_value: value
      });

      if (trackingError) {
        throw trackingError;
      }
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error);
    }
  }

  async getRecommendationAnalytics(userId: string): Promise<RecommendationAnalytics> {
    try {
      const { data, error } = await this.supabase
        .from('recommendation_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const analytics: RecommendationAnalytics = {
        totalRecommendations: data.length,
        viewRate: 0,
        bookmarkRate: 0,
        notInterestedRate: 0,
        byCategory: {},
        bySource: {}
      };

      // Calculate overall rates
      const viewedCount = data.filter(item => item.was_viewed).length;
      const bookmarkedCount = data.filter(item => item.was_bookmarked).length;
      const notInterestedCount = data.filter(item => item.was_marked_not_interested).length;

      analytics.viewRate = data.length > 0 ? viewedCount / data.length : 0;
      analytics.bookmarkRate = data.length > 0 ? bookmarkedCount / data.length : 0;
      analytics.notInterestedRate = data.length > 0 ? notInterestedCount / data.length : 0;

      // Calculate rates by category and source
      data.forEach(item => {
        // Category analytics
        if (!analytics.byCategory[item.category]) {
          analytics.byCategory[item.category] = {
            total: 0,
            viewRate: 0,
            bookmarkRate: 0,
            notInterestedRate: 0
          };
        }
        analytics.byCategory[item.category].total++;
        if (item.was_viewed) analytics.byCategory[item.category].viewRate++;
        if (item.was_bookmarked) analytics.byCategory[item.category].bookmarkRate++;
        if (item.was_marked_not_interested) analytics.byCategory[item.category].notInterestedRate++;

        // Source analytics
        if (!analytics.bySource[item.source]) {
          analytics.bySource[item.source] = {
            total: 0,
            viewRate: 0,
            bookmarkRate: 0,
            notInterestedRate: 0
          };
        }
        analytics.bySource[item.source].total++;
        if (item.was_viewed) analytics.bySource[item.source].viewRate++;
        if (item.was_bookmarked) analytics.bySource[item.source].bookmarkRate++;
        if (item.was_marked_not_interested) analytics.bySource[item.source].notInterestedRate++;
      });

      // Calculate final rates for categories and sources
      Object.keys(analytics.byCategory).forEach(category => {
        const total = analytics.byCategory[category].total;
        analytics.byCategory[category].viewRate = total > 0 ? analytics.byCategory[category].viewRate / total : 0;
        analytics.byCategory[category].bookmarkRate = total > 0 ? analytics.byCategory[category].bookmarkRate / total : 0;
        analytics.byCategory[category].notInterestedRate = total > 0 ? analytics.byCategory[category].notInterestedRate / total : 0;
      });

      Object.keys(analytics.bySource).forEach(source => {
        const total = analytics.bySource[source].total;
        analytics.bySource[source].viewRate = total > 0 ? analytics.bySource[source].viewRate / total : 0;
        analytics.bySource[source].bookmarkRate = total > 0 ? analytics.bySource[source].bookmarkRate / total : 0;
        analytics.bySource[source].notInterestedRate = total > 0 ? analytics.bySource[source].notInterestedRate / total : 0;
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching recommendation analytics:', error);
      throw error;
    }
  }
}

export const newsService = new NewsService(); 