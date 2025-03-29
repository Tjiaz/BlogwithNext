import { welcomeTemplate } from "./welcome";
import { digestTemplate } from "./digest";

export const templates = {
  welcome: welcomeTemplate,
  digest: digestTemplate,
  // Add more templates here as needed
};

export const getTemplate = (templateName, data = {}) => {
  let template = templates[templateName];

  // Handle array data (like articles) with more complex replacement
  if (templateName === "digest" && data.articles) {
    let articlesHtml = "";
    data.articles.forEach((article) => {
      let articleHtml = template.match(
        /{{#articles}}([\s\S]*?){{\/articles}}/
      )[1];
      Object.keys(article).forEach((key) => {
        articleHtml = articleHtml.replace(
          new RegExp(`{{${key}}}`, "g"),
          article[key]
        );
      });
      articlesHtml += articleHtml;
    });
    template = template.replace(
      /{{#articles}}[\s\S]*?{{\/articles}}/,
      articlesHtml
    );
  }

  // Replace any variables in the template
  Object.keys(data).forEach((key) => {
    template = template.replace(`{{${key}}}`, data[key]);
  });

  return template;
};
