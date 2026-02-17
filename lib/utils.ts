const BAD_SLUG = "[object Object]";
const BAD_SLUG_PREFIX = "[object";

function toSlugString(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "string") {
    if (val === BAD_SLUG || val.includes(BAD_SLUG_PREFIX)) return null;
    return val;
  }
  const str = String(val);
  if (str === BAD_SLUG || str.includes(BAD_SLUG_PREFIX)) return null;
  return str;
}

/**
 * Safely extracts a slug string from a post object.
 * Never returns [object Object] - returns "invalid-slug" for bad data.
 */
export function getPostSlug(post: any): string {
  if (!post) return "invalid-slug";

  const slug = toSlugString(post.slug) ?? toSlugString(post._id) ?? toSlugString(post.id);
  return slug ?? "invalid-slug";
}

/**
 * Validates that a slug is a valid string and not [object Object]
 */
export function isValidSlug(slug: any): slug is string {
  return (
    typeof slug === "string" &&
    slug !== "[object Object]" &&
    !slug.includes("[object")
  );
}

/**
 * Checks if an email is in the admin emails list
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const adminEmails =
    process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const adminEmailList = adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase());

  return adminEmailList.includes(email.toLowerCase());
}

/**
 * Extracts the first image URL from HTML content
 * Returns null if no image is found
 */
export function extractFirstImageFromContent(
  content: string | null | undefined,
): string | null {
  if (!content || typeof content !== "string") {
    return null;
  }

  // More flexible regex that matches img tags with src attribute in any position
  // Handles: <img src="url">, <img src='url'>, <img src=url>, <img class="..." src="url">
  const imgRegex = /<img[^>]*?src\s*=\s*["']?([^"'\s>]+)["']?[^>]*>/i;
  const match = content.match(imgRegex);

  if (match && match[1]) {
    let imageUrl = match[1].trim();

    // Remove any trailing quotes or special characters
    imageUrl = imageUrl.replace(/^["']|["']$/g, "");

    // Skip empty or very short URLs (likely parsing errors)
    if (imageUrl.length < 5) {
      return null;
    }

    // Allow data URIs (base64) if they're reasonably long (actual images, not icons)
    if (imageUrl.startsWith("data:image/")) {
      // Base64 images should be at least 100 chars to be a real image
      if (imageUrl.length >= 100) {
        return imageUrl;
      }
      return null; // Skip small base64 images (likely icons/sprites)
    }

    // Return regular URLs (http/https or relative paths)
    return imageUrl;
  }

  return null;
}

/**
 * Removes the first image from HTML content to prevent duplicate display
 * Returns the content with the first image tag removed
 */
export function removeFirstImageFromContent(
  content: string | null | undefined,
): string {
  if (!content || typeof content !== "string") {
    return content || "";
  }

  // Remove the first img tag (handles various formats)
  // Match: <img src="...">, <img src='...'>, <img src=...>, <img ... src="...">
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
  let cleaned = content.replace(imgRegex, "");

  // If no match with quotes, try without quotes
  if (cleaned === content) {
    const imgRegex2 = /<img[^>]*src=([^\s>]+)[^>]*>/i;
    cleaned = content.replace(imgRegex2, "");
  }

  return cleaned;
}

/**
 * Gets the best available image from an article/post object
 * Prioritizes: hero_image > filtered_images[0] > img > featuredImage > image > imageUrl > extracted from content
 * Returns default image if no image is found
 */
export function getBestImage(
  post: any,
  content?: string | null | undefined,
): string {
  const DEFAULT_IMAGE = "/images/azbyte.jpeg";

  if (!post) return DEFAULT_IMAGE;

  // Get first image from filtered_images array if it exists
  const filteredImage =
    post.filtered_images &&
    Array.isArray(post.filtered_images) &&
    post.filtered_images.length > 0
      ? post.filtered_images[0]
      : null;

  // Prioritize hero_image, then filtered_images, then other image fields
  const bestImage =
    post.hero_image ||
    filteredImage ||
    post.img ||
    post.featuredImage ||
    post.image ||
    post.imageUrl ||
    null;

  // If we have a valid image (and it's not the default), return it
  if (bestImage && bestImage !== DEFAULT_IMAGE && bestImage.trim() !== "") {
    return bestImage;
  }

  // If no image found and content is provided, try extracting from content
  if (!bestImage && content) {
    const extractedImage = extractFirstImageFromContent(content);
    if (extractedImage) {
      return extractedImage;
    }
  }

  // Return default image if no image found
  return DEFAULT_IMAGE;
}
