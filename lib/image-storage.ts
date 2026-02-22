/**
 * Image storage: use AWS S3 when configured (saves Supabase egress), else Supabase Storage.
 * Set AWS_S3_BUCKET + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION to use S3.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabaseAdmin } from "./supabase";

const S3_BUCKET = process.env.AWS_S3_BUCKET;
const S3_REGION = process.env.AWS_REGION || "us-east-1";

function getS3Client(): S3Client | null {
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
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET!,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000",
      })
    );
    // Public URL (bucket must have public read policy or use CloudFront)
    const baseUrl = process.env.AWS_S3_PUBLIC_URL || `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;
    const url = `${baseUrl.replace(/\/$/, "")}/${fileName}`;
    return { url };
  }

  // Fallback: Supabase Storage
  if (!supabaseAdmin) {
    throw new Error("No storage configured. Set AWS S3 or Supabase credentials.");
  }
  const { error } = await supabaseAdmin.storage
    .from("article-images")
    .upload(fileName, buffer, { contentType, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from("article-images").getPublicUrl(fileName);
  return { url: data.publicUrl };
}
