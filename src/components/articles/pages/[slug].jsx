import { useRouter } from 'next/router';
import { getArticleBySlug,getAllArticles } from '../../utils/articles';
import Articles from '@/components/arrticles/Articles';

const ArticlePage = ({ article }) => {
    const router = useRouter();
    
    if (router.isFallback) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <Articles article={article} /> {/* Assuming Article component takes the article as a prop */}
      </div>
    );
  };
  
  // Fetch article data based on the slug in the URL
  export async function getStaticPaths() {
    const articles = await getAllArticles(); // Function that returns all available articles
    const paths = articles.map(article => ({
      params: { slug: article.topic.toLowerCase().replace(' ', '-') }, // Create paths based on the topic name
    }));
  
    return { paths, fallback: true };
  }

  export async function getStaticProps({ params }) {
    const article = await getArticleBySlug(params.slug); // Fetch the article based on slug
  
    if (!article) {
      return {
        notFound: true,
      };
    }
  
    return {
      props: { article },
      revalidate: 10, // Enable Incremental Static Regeneration
    };
  }
  
  export default ArticlePage;