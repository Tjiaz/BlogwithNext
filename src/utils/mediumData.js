import articles from "../../medium_ids";

export const fetchMediumData = async () => {
    const apiKey = process.env.NEXT_PUBLIC_MEDIUM_RAPID_KEY;
    
    const baseUrl = 'https://medium2.p.rapidapi.com/article/';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'medium2.p.rapidapi.com'
      }
    };
  
    const fetchedArticles = [];
  
    for (const id of articles.datascience_articles) {
      try {
        const response = await fetch(baseUrl + id, options);
        const result = await response.json();
      
    
      // Extract only the required fields
      const filteredArticle = {
        id: result.id,
        image_url: result.image_url,
        title: result.title,
        description: result.description,
        author: result.author,
        published_at: result.published_at,
        topics: result.topics
      };
      console.log('Filtered article:', filteredArticle);

      fetchedArticles.push(filteredArticle)
    }
      catch(error){ 
        console.log(`Error fetching article ${id}:`,error)

    }

    }
    return fetchedArticles

}