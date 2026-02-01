# Ezoic ads.txt Setup Guide

## ✅ Implementation Complete

The ads.txt file has been implemented for your domain: **www.azbytegems.com**

### What Was Implemented

1. **Route Handler**: Created `app/ads.txt/route.ts` that:
   - Fetches ads.txt content from Ezoic's ads.txt manager
   - Serves it at `https://www.azbytegems.com/ads.txt`
   - Caches the content for 1 hour (ISR)
   - Falls back to redirect if fetch fails

2. **Ezoic Configuration**:
   - Ezoic Account ID: `19390`
   - Domain: `www.azbytegems.com`
   - URL: `https://srv.adstxtmanager.com/19390/www.azbytegems.com`

## 🧪 Testing Your Setup

### 1. Test the ads.txt File

Visit in your browser:
```
https://www.azbytegems.com/ads.txt
```

**Expected Result**: You should see a list of authorized ad sellers in plain text format, something like:
```
# ads.txt file for www.azbytegems.com
# Managed by Ezoic
google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0
...
```

### 2. Verify with curl

```bash
curl -L https://www.azbytegems.com/ads.txt
```

### 3. Check Response Headers

```bash
curl -I https://www.azbytegems.com/ads.txt
```

You should see:
- `Content-Type: text/plain; charset=utf-8`
- `Cache-Control: public, max-age=3600`
- Status: `200 OK`

### 4. Validate with ads.txt Validator

Use online validators to ensure your ads.txt is properly formatted:
- https://adstxt.guru/
- https://www.adstxtvalidator.com/

## 🔄 Automated Updates (Optional)

### Option 1: Vercel Cron Jobs (Recommended for Vercel)

Since you're deploying on Vercel, you can set up automated updates using Vercel Cron Jobs:

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-ads-txt",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

2. Create `app/api/cron/update-ads-txt/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Revalidate the ads.txt route to fetch fresh content
  revalidatePath("/ads.txt");

  return NextResponse.json({ 
    success: true, 
    message: "ads.txt cache revalidated",
    timestamp: new Date().toISOString()
  });
}
```

3. Add `CRON_SECRET` to your Vercel environment variables

4. The cron job will run every 6 hours and refresh the ads.txt cache

### Option 2: External Cron Service

If you prefer using an external cron service (like cron-job.org, EasyCron, etc.):

**Endpoint to call**:
```
https://www.azbytegems.com/api/cron/update-ads-txt
```

**Schedule**: Every 6-12 hours

**Method**: GET with Authorization header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

### Option 3: Manual Update

The ads.txt file automatically updates every hour (ISR revalidation). If you need to force an update:

1. Visit: `https://www.azbytegems.com/ads.txt?revalidate=true` (if you add this feature)
2. Or wait for the next revalidation cycle (1 hour)

## 📝 Notes

- **Caching**: The ads.txt content is cached for 1 hour to reduce load on Ezoic's servers
- **Fallback**: If fetching fails, the route redirects to Ezoic's URL
- **Domain**: Make sure your domain `www.azbytegems.com` is correctly configured in Ezoic dashboard
- **HTTPS**: Ensure your site uses HTTPS (Vercel provides this automatically)

## 🔍 Troubleshooting

### ads.txt Not Showing

1. **Clear Cache**: Clear your browser cache and try again
2. **Check Deployment**: Ensure your latest code is deployed to Vercel
3. **Check Ezoic**: Verify your domain is correctly set up in Ezoic dashboard
4. **Check Logs**: Check Vercel function logs for any errors

### 404 Error

- Ensure the route file exists at `app/ads.txt/route.ts`
- Check that the file is committed and pushed to your repository
- Verify the deployment succeeded on Vercel

### Content Not Updating

- The file is cached for 1 hour
- Wait for cache expiration or trigger a revalidation
- Check Ezoic dashboard to ensure ads.txt content is updated there

## 📚 Additional Resources

- [Ezoic ads.txt Documentation](https://support.ezoic.com/support/solutions/articles/48001157978-ads-txt-setup)
- [IAB ads.txt Specification](https://iabtechlab.com/ads-txt/)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)

## ✅ Checklist

- [x] Route handler created at `/ads.txt`
- [x] Ezoic URL configured correctly
- [x] Caching implemented (1 hour)
- [x] Fallback redirect implemented
- [ ] Tested in browser
- [ ] Validated with ads.txt validator
- [ ] Set up automated updates (optional)
