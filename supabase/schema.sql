-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists public.users (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    is_premium boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_preferences table
create table if not exists public.user_preferences (
    user_id uuid references public.users on delete cascade primary key,
    email_notifications boolean default true,
    dark_mode boolean default false,
    language text default 'en',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add full text search index for articles
CREATE INDEX articles_title_description_idx ON articles USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Create index for faster bookmark lookups
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_article_id_idx ON bookmarks(article_id);

-- Create newsletters table
create table if not exists public.newsletters (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users on delete cascade not null,
    title text not null,
    description text,
    schedule text not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create newsletter_subscribers table
create table if not exists public.newsletter_subscribers (
    id uuid default uuid_generate_v4() primary key,
    newsletter_id uuid references public.newsletters on delete cascade not null,
    email text not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(newsletter_id, email)
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table articles enable row level security;
alter table bookmarks enable row level security;
alter table public.newsletters enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Users policies
create policy "Users can view their own data"
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update their own data"
    on public.users for update
    using (auth.uid() = id);

-- User preferences policies
create policy "Users can view their own preferences"
    on public.user_preferences for select
    using (auth.uid() = user_id);

create policy "Users can update their own preferences"
    on public.user_preferences for update
    using (auth.uid() = user_id);

-- Articles policies
create policy "Allow public read access to articles"
  on articles for select
  to public
  using (true);

create policy "Allow authenticated users to create articles"
  on articles for insert
  to authenticated
  with check (true);

-- Bookmarks policies
create policy "Allow users to read own bookmarks"
  on bookmarks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to create own bookmarks"
  on bookmarks for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow users to update own bookmarks"
  on bookmarks for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to delete own bookmarks"
  on bookmarks for delete
  to authenticated
  using (auth.uid() = user_id);

-- Newsletters policies
create policy "Users can view their own newsletters"
    on public.newsletters for select
    using (auth.uid() = user_id);

create policy "Users can insert their own newsletters"
    on public.newsletters for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own newsletters"
    on public.newsletters for update
    using (auth.uid() = user_id);

create policy "Users can delete their own newsletters"
    on public.newsletters for delete
    using (auth.uid() = user_id);

-- Newsletter subscribers policies
create policy "Users can view their newsletter subscribers"
    on public.newsletter_subscribers for select
    using (exists (
        select 1 from public.newsletters
        where newsletters.id = newsletter_subscribers.newsletter_id
        and newsletters.user_id = auth.uid()
    ));

create policy "Users can insert subscribers for their newsletters"
    on public.newsletter_subscribers for insert
    with check (exists (
        select 1 from public.newsletters
        where newsletters.id = newsletter_subscribers.newsletter_id
        and newsletters.user_id = auth.uid()
    ));

create policy "Users can update their newsletter subscribers"
    on public.newsletter_subscribers for update
    using (exists (
        select 1 from public.newsletters
        where newsletters.id = newsletter_subscribers.newsletter_id
        and newsletters.user_id = auth.uid()
    ));

create policy "Users can delete their newsletter subscribers"
    on public.newsletter_subscribers for delete
    using (exists (
        select 1 from public.newsletters
        where newsletters.id = newsletter_subscribers.newsletter_id
        and newsletters.user_id = auth.uid()
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();

create trigger handle_user_preferences_updated_at
    before update on public.user_preferences
    for each row
    execute function public.handle_updated_at();

create trigger handle_newsletters_updated_at
    before update on public.newsletters
    for each row
    execute function public.handle_updated_at();

create trigger handle_newsletter_subscribers_updated_at
    before update on public.newsletter_subscribers
    for each row
    execute function public.handle_updated_at(); 