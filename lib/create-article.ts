import { revalidateTag, revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { extractFirstImageFromContent } from "@/lib/utils";
import { notifySubscribersOfNewArticle } from "@/lib/notify-subscribers";

export type CreateArticleInput = {
  title: string;
  description: string;
  content: string;
  topic: string;
  tags?: string[] | string;
  author?: string;
  hero_image?: string;
  coverImage?: string;
  cover_image?: string;
  is_published?: boolean;
  notify?: boolean;
};

export type CreateArticleResult = {
  id: string;
  slug: string;
  url: string;
  title: string;
  topic: string;
  author: string;
  published_at: string;
  hero_image: string | null;
};

function normalizeTags(tags?: string[] | string): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!baseSlug) {
    baseSlug = `article-${Date.now()}`;
  }

  let slug = baseSlug;
  let slugCounter = 1;

  while (true) {
    const { data: existing } = await supabaseAdmin!
      .from("final_articles")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (!existing || existing.length === 0) {
      return slug;
    }
    slug = `${baseSlug}-${slugCounter}`;
    slugCounter++;
  }
}

export async function createArticle(
  input: CreateArticleInput,
  options?: { defaultAuthor?: string },
): Promise<CreateArticleResult> {
  const {
    title,
    description,
    content,
    topic,
    tags,
    author,
    hero_image,
    coverImage,
    cover_image,
    is_published = true,
    notify = true,
  } = input;

  if (!title?.trim() || !description?.trim() || !content?.trim() || !topic?.trim()) {
    throw new Error("Missing required fields: title, description, content, topic");
  }

  if (!supabaseAdmin) {
    throw new Error(
      "Database connection not available. Check SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const slug = await generateUniqueSlug(title.trim());

  const explicitCover =
    (typeof hero_image === "string" && hero_image.trim()) ||
    (typeof coverImage === "string" && coverImage.trim()) ||
    (typeof cover_image === "string" && cover_image.trim()) ||
    null;

  const extractedImage = extractFirstImageFromContent(content);
  const coverUrl = explicitCover || extractedImage || null;
  const now = new Date().toISOString();
  const authorName =
    author?.trim() ||
    options?.defaultAuthor?.trim() ||
    process.env.N8N_DEFAULT_AUTHOR?.trim() ||
    "AzByteGems";

  const newPost = {
    title: title.trim(),
    description: description.trim(),
    excerpt: description.trim(),
    content,
    topic: topic.trim(),
    category: topic.trim(),
    tags: normalizeTags(tags),
    author: authorName,
    author_name: authorName,
    date: now,
    published_at: now,
    created_at: now,
    updated_at: now,
    hero_image: coverUrl,
    img: coverUrl,
    featured_image: coverUrl,
    views: 0,
    likes: 0,
    comments: [],
    slug,
    is_published,
    reading_time: "5 min read",
  };

  const { data, error } = await supabaseAdmin
    .from("final_articles")
    .insert(newPost)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create article");
  }

  revalidateTag("articles", "max");
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/topics/${topic.trim().toLowerCase().replace(/\s+/g, "-")}`);

  if (notify && is_published) {
    notifySubscribersOfNewArticle({
      title: data.title,
      description: data.description || data.excerpt || "",
      slug: data.slug,
      topic: data.topic || data.category || "",
      author: data.author || data.author_name || authorName,
    }).catch((err) => console.error("Failed to notify subscribers:", err));
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://azbytegems.com";

  return {
    id: data.id,
    slug: data.slug,
    url: `${siteUrl.replace(/\/$/, "")}/${data.slug}`,
    title: data.title,
    topic: data.topic || data.category || "",
    author: data.author || data.author_name || authorName,
    published_at: data.published_at || now,
    hero_image: coverUrl,
  };
}
