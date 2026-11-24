export type NewsletterArticle = {
  title: string;
  slug: string;
  description: string;
  author: string;
  publication: string;
  readTime: string;
  views: number;
  claps: number;
  url: string;
};

export type NewsletterTemplateSubscriber = {
  email: string;
  name?: string;
  firstName?: string;
};

export class NewsletterTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NewsletterTemplateError";
  }
}

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function renderVariables(template: string, fields: Record<string, unknown>) {
  return template.replace(/{{\s*([a-zA-Z][\w]*)\s*}}/g, (_match, key: string) => {
    if (!(key in fields)) {
      throw new NewsletterTemplateError(`Unknown newsletter template field: {{${key}}}`);
    }
    return escapeHtml(fields[key]);
  });
}

export function renderNewsletterTemplate(
  template: string,
  subscriber: NewsletterTemplateSubscriber,
  articles: NewsletterArticle[],
) {
  const name = subscriber.name?.trim() || subscriber.firstName?.trim() || "Reader";
  const common = { name, email: subscriber.email };
  let rendered = template.replace(/{{\s*#articles\s*}}([\s\S]*?){{\s*\/articles\s*}}/g, (_match, block: string) => {
    if (!articles.length) {
      return '<p style="font-family:Arial,sans-serif;color:#555">No new articles are available today. Visit AzByteGems to explore our latest guides.</p>';
    }
    return articles.map((article) => renderVariables(block, { ...common, ...article })).join("");
  });

  rendered = renderVariables(rendered, common);
  if (/{{\s*[#/]/.test(rendered) || /{{[^{}]*}}/.test(rendered)) {
    throw new NewsletterTemplateError("The newsletter contains an unsupported or unmatched template tag.");
  }
  return rendered;
}
