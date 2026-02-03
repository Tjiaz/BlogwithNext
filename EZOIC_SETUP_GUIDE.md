# Ezoic Ad Integration Guide

This guide will help you set up Ezoic ads on your blog after signing up with Ezoic.

## Step 1: Sign Up with Ezoic

1. Go to [https://www.ezoic.com](https://www.ezoic.com)
2. Sign up for an account
3. Submit your website for approval
4. Wait for approval (usually 24-48 hours)

## Step 2: Get Your Ezoic Script

After approval, Ezoic will provide you with:

- A JavaScript snippet to add to your site
- Specific placeholder IDs for each ad position

## Step 3: Add Ezoic Script to Your Site

1. Open `app/layout.tsx`
2. Find the comment: `{/* Ezoic Ad Script - Add your Ezoic script here after signing up */}`
3. Replace the comment with your actual Ezoic script:

```tsx
<Script
  src="https://www.ezoic.com/ezoic/ezoic.js"
  strategy="afterInteractive"
/>
```

**Note:** The exact script URL will be provided by Ezoic in your dashboard.

## Step 4: Update Placeholder IDs

After Ezoic approves your site, you'll receive specific placeholder IDs for each ad position. Update these IDs in the following files:

### Homepage (`app/page.tsx`)

- `ezoic-pub-ad-placeholder-104` - Banner between hero and content
- `ezoic-pub-ad-placeholder-105` - Banner before topics section

### Homepage Sidebar (`components/layout/Sidebar.tsx`)

- `ezoic-pub-ad-placeholder-106` - Top of sidebar
- `ezoic-pub-ad-placeholder-107` - Middle of sidebar

### Blog Post Pages (`app/[slug]/page.tsx`)

- `ezoic-pub-ad-placeholder-108` - In-content ad 1 (after first paragraph)
- `ezoic-pub-ad-placeholder-109` - In-content ad 2 (mid-article)

### Blog Post Sidebar (`components/blog/ArticleSidebar.tsx`)

- `ezoic-pub-ad-placeholder-101` - Top of sidebar
- `ezoic-pub-ad-placeholder-102` - Middle of sidebar
- `ezoic-pub-ad-placeholder-103` - Bottom of sidebar

### Topic Pages Sidebar (`app/topics/[slug]/page.tsx`)

- `ezoic-pub-ad-placeholder-110` - Top of sidebar
- `ezoic-pub-ad-placeholder-111` - Middle of sidebar

## Step 5: Test Your Ads

1. Deploy your changes to production
2. Visit your site and check that:
   - Ad placeholders are visible (they show "Advertisement" text)
   - Ezoic script is loading (check browser console)
   - Ads appear after Ezoic processes your site

## Ad Positions Summary

### Homepage

- ✅ Banner ad between hero and content sections
- ✅ Banner ad before topics section
- ✅ 2 sidebar ads (top and middle)

### Blog Post Pages

- ✅ 2 in-content ads (after first paragraph, mid-article)
- ✅ 3 sidebar ads (top, middle, bottom)

### Topic Pages

- ✅ 2 sidebar ads (top and middle)

## Troubleshooting

### Ads Not Showing

1. **Check Ezoic Script**: Make sure the Ezoic script is added to `app/layout.tsx`
2. **Verify Placeholder IDs**: Ensure placeholder IDs match what Ezoic provided
3. **Check Browser Console**: Look for any JavaScript errors
4. **Ezoic Dashboard**: Check your Ezoic dashboard for any setup issues

### Placeholder IDs Not Working

- Ezoic will provide you with the correct placeholder IDs after approval
- Replace all placeholder IDs in the code with your actual IDs
- Each ad position should have a unique ID

### Ads Showing Placeholder Text

- This is normal before Ezoic processes your site
- After approval and setup, Ezoic will replace placeholders with actual ads
- It may take a few hours for ads to start showing

## Important Notes

- **Don't use placeholder IDs in production**: These are example IDs. You must replace them with your actual Ezoic placeholder IDs.
- **Ezoic approval required**: Ads won't show until Ezoic approves your site
- **Ad revenue**: Revenue depends on traffic and ad performance
- **Ad placement**: You can adjust ad positions by modifying the `EzoicAd` component placement in your pages

## Support

- Ezoic Support: [https://support.ezoic.com](https://support.ezoic.com)
- Ezoic Documentation: [https://support.ezoic.com/hc/en-us](https://support.ezoic.com/hc/en-us)
