import { welcomeTemplate } from "./welcome";

export const templates = {
  welcome: welcomeTemplate,
  // Add more templates here as needed
};

export const getTemplate = (templateName, data = {}) => {
  let template = templates[templateName];

  // Replace any variables in the template
  Object.keys(data).forEach((key) => {
    template = template.replace(`{{${key}}}`, data[key]);
  });

  return template;
};
