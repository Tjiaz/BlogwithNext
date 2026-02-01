-- Supabase PostgreSQL Schema for Blog Application
-- Run this SQL in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table (main content)
CREATE TABLE IF NOT EXISTS final_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  excerpt TEXT,
  summary TEXT,
  content TEXT,
  topic TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  author_name TEXT,
  date TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  img TEXT,
  featured_image TEXT,
  image TEXT,
  image_url TEXT,
  hero_image TEXT,
  filtered_images TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  reading_time TEXT DEFAULT '5 min read',
  CONSTRAINT final_articles_slug_unique UNIQUE (slug)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_final_articles_slug ON final_articles(slug);
CREATE INDEX IF NOT EXISTS idx_final_articles_topic ON final_articles(topic);
CREATE INDEX IF NOT EXISTS idx_final_articles_category ON final_articles(category);
CREATE INDEX IF NOT EXISTS idx_final_articles_date ON final_articles(date DESC);
CREATE INDEX IF NOT EXISTS idx_final_articles_published_at ON final_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_final_articles_created_at ON final_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_final_articles_tags ON final_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_final_articles_title_search ON final_articles USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_final_articles_content_search ON final_articles USING GIN(to_tsvector('english', COALESCE(content, '')));

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

-- Newsletter logs table
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT,
  recipient_count INTEGER,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_logs_sent_at ON newsletter_logs(sent_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_final_articles_updated_at BEFORE UPDATE ON final_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE final_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to published articles
CREATE POLICY "Public can read published articles" ON final_articles
  FOR SELECT USING (is_published = true);

-- Policy: Allow authenticated users to insert/update articles (adjust as needed)
CREATE POLICY "Authenticated users can manage articles" ON final_articles
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public to subscribe to newsletter
CREATE POLICY "Public can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated users to read newsletter subscribers (admin only)
CREATE POLICY "Authenticated users can read subscribers" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');
