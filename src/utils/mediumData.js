import articles from "../../medium_ids";

export const fetchMediumData = async () => {
    const baseUrl = 'https://medium2.p.rapidapi.com/article/';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '7494c5f766msh811ac8633c75b17p1f45dbjsn8d1b295ec5da',
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
        topic: result.topic
      };
      filteredArticle.push(fetchedArticles)
    }
      catch(error){ 
        console.log(`Error fetching article ${id}:`,error)

    }

    }
    return fetchedArticles

}