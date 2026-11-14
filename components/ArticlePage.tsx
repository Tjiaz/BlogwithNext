// components/ArticlePage.tsx

import { useState, useEffect } from 'react';
import TOC from './TOC';
import { Article } from '../lib/models/article';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [headings, setHeadings] = useState<Heading[] | null>(null);

  useEffect(() => {
    // Fetch article data from your database (e.g., Supabase)
    // This is a placeholder implementation
    const mockArticle: Article = {
      id: '1',
      title: 'Sample Article Title',
      content: 'This is the content of the article...',
      headings: [
        { id: 'introduction', text: 'Introduction', level: 2, position: 100 },
        { id: 'background', text: 'Background', level: 2, position: 500 },
        { id: 'conclusion', text: 'Conclusion', level: 2, position: 900 }
      ]
    };

    setArticle(mockArticle);
    setHeadings(mockArticle.headings);
  }, []);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="article-page">
      <h1>{article.title}</h1>
      <div className="content" dangerouslySetInnerHTML={{ __html: article.content }} ></div>
      <TOC headings={headings || []} ></TOC>
    </div>
  );
}