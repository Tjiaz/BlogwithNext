# Use AWS S3 for Images (reduce Supabase egress)

Image uploads use **AWS S3** when configured, so image traffic no longer counts against your Supabase bandwidth quota.

## 1. Create an S3 bucket

1. In **AWS Console** → **S3** → **Create bucket**
2. Choose a name (e.g. `blogz-article-images`)
3. Pick a region (e.g. `us-east-1`)
4. Leave "Block all public access" **unchecked** if you want direct public URLs (or use CloudFront later)
5. Create the bucket

## 2. Make the bucket public (for direct image URLs)

1. Open your bucket → **Permissions**
2. Under **Bucket policy**, edit and add (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Save

## 3. Create an IAM user for the app

1. **IAM** → **Users** → **Create user** (e.g. `blogz-upload`)
2. Attach policy: **Create inline policy** → JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

3. Create user → **Security credentials** → **Create access key** (Application running outside AWS) → copy **Access key ID** and **Secret access key**

## 4. Add to `.env` / Vercel

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=blogz-article-images
```

Optional: if you use a custom domain or CloudFront for the bucket:

```env
AWS_S3_PUBLIC_URL=https://your-cdn-or-custom-domain.com
```

## 5. Behavior

- **With S3 env vars set**: New uploads go to S3. Article images are served from S3 (no Supabase egress).
- **Without S3**: Uploads fall back to Supabase Storage (previous behavior).

Existing images already in Supabase Storage will keep working (article-image redirects to whatever URL is stored). New images will use S3 once configured.
