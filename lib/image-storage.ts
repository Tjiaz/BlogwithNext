/**
 * Image storage: use AWS S3 when configured (saves Supabase egress), else Supabase Storage.
 * Set AWS_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION to use S3.
 *
 * If AWS credentials are invalid/expired, upload automatically falls back to Supabase Storage
 * when SUPABASE_SERVICE_ROLE_KEY is set (set IMAGE_STORAGE_FORCE=supabase to skip S3 entirely).
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabaseAdmin } from "./supabase";

const S3_BUCKET = process.env.AWS_S3_BUCKET;
const S3_REGION = process.env.AWS_REGION || "us-east-1";

function getS3Client(): S3Client | null {
  const force = process.env.IMAGE_STORAGE_FORCE?.toLowerCase();
  if (force === "supabase") {
    return null;
  }
  if (!S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadToSupabase(
  buffer: Buffer,
  contentType: string,
  fileName: string
): Promise<{ url: string }> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase Storage is not configured (missing SUPABASE_SERVICE_ROLE_KEY). Fix AWS keys or add Supabase admin creds.",
    );
  }
  const { error } = await supabaseAdmin.storage
    .from("article-images")
    .upload(fileName, buffer, { contentType, upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from("article-images").getPublicUrl(fileName);
  return { url: data.publicUrl };
}

export function useS3(): boolean {
  return !!getS3Client();
}

export async function uploadImage(
  buffer: Buffer,
  contentType: string,
  fileName: string
): Promise<{ url: string }> {
  const s3 = getS3Client();

  if (s3) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET!,
          Key: fileName,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000",
        }),
      );
      const baseUrl =
        process.env.AWS_S3_PUBLIC_URL ||
        `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;
      const url = `${baseUrl.replace(/\/$/, "")}/${fileName}`;
      return { url };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`⚠️ S3 upload failed (${msg}), falling back to Supabase Storage if available`);
      return uploadToSupabase(buffer, contentType, fileName);
    }
  }

  return uploadToSupabase(buffer, contentType, fileName);
}
