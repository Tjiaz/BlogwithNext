export const newArticleTemplate = (article) => {
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}/article_details/${article.id}`;
  const topicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}/articles/${article.topic}`;
  
  // Format topic name
  const formatTopic = (topic) => {
    if (!topic) return "";
    return topic
      .split("_")
      .map(word => {
        if (word.toLowerCase() === "ai" || word.toLowerCase() === "nlp" || word.toLowerCase() === "sql") {
          return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const formattedTopic = formatTopic(article.topic);
  const articleImage = article.filtered_images?.[0] || article.hero_image || `${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}/azbyte.jpeg`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Article: ${article.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #0b73b1 0%, #2991ce 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">AZbyteGems</h1>
                  <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">New Article Published!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 15px; color: #242424; font-size: 24px; font-weight: 700; line-height: 1.3;">${article.title}</h2>
                  
                  ${article.description ? `
                  <p style="margin: 0 0 20px; color: #626262; font-size: 16px; line-height: 1.6;">${article.description}</p>
                  ` : ''}
                  
                  <!-- Article Image -->
                  <div style="margin: 20px 0; border-radius: 8px; overflow: hidden;">
                    <img src="${articleImage}" alt="${article.title}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
                  </div>
                  
                  <!-- Article Meta -->
                  <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #0b73b1;">
                    <p style="margin: 0 0 8px; color: #242424; font-size: 14px;">
                      <strong>Author:</strong> ${article.author || 'AZbyteGems Team'}
                    </p>
                    <p style="margin: 0 0 8px; color: #242424; font-size: 14px;">
                      <strong>Topic:</strong> 
                      <a href="${topicUrl}" style="color: #0b73b1; text-decoration: none; font-weight: 600;">${formattedTopic}</a>
                    </p>
                    ${article.date ? `
                    <p style="margin: 0; color: #626262; font-size: 14px;">
                      <strong>Published:</strong> ${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    ` : ''}
                  </div>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${articleUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0b73b1 0%, #2991ce 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(11, 115, 177, 0.3);">Read Article</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0 0 10px; color: #626262; font-size: 14px;">
                    You're receiving this because you subscribed to AZbyteGems newsletter.
                  </p>
                  <p style="margin: 0; color: #626262; font-size: 12px;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}" style="color: #0b73b1; text-decoration: none;">Visit our website</a> | 
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://azbytegems.com"}/unsubscribe" style="color: #0b73b1; text-decoration: none;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
