import { NextRequest } from "next/server";

/**
 * Validates API key for automation endpoints (n8n, cron, etc.).
 * Set CREATE_POST_API_KEY (or N8N_API_KEY) in env.
 *
 * Accepts:
 *   Authorization: Bearer <key>
 *   x-api-key: <key>
 */
export function verifyCreatePostApiKey(req: NextRequest): boolean {
  const expected =
    process.env.CREATE_POST_API_KEY || process.env.N8N_API_KEY || "";
  if (!expected) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token && token === expected) return true;
  }

  const apiKey = req.headers.get("x-api-key");
  if (apiKey && apiKey === expected) return true;

  return false;
}
