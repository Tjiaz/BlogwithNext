# Supabase Setup - Finding Your API Keys

## Where to Find Your Keys

Based on what you're seeing, here's how to find the correct keys:

### Step 1: Go to Settings → API

1. In your Supabase dashboard, click the **Settings** icon (⚙️) in the left sidebar
2. Click **API** from the settings menu

### Step 2: Look for "Project API keys" Section

You should see a section that looks like this:

```
Project API keys

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

service_role (secret)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

### Step 3: Copy the Correct Keys

**What you need:**

1. **Project URL** ✅ You already have this:
   ```
   https://owmqmqsgmkfuayfpfmva.supabase.co
   ```

2. **anon public key**: 
   - Look for the key labeled "anon" or "anon public"
   - It's a long string starting with `eyJ` (this is a JWT token)
   - Click the "Copy" button next to it

3. **service_role key** (optional, for admin operations):
   - Look for the key labeled "service_role" 
   - Also starts with `eyJ`
   - Click the "Copy" button next to it
   - ⚠️ Keep this secret!

### If You See Different Keys

If you're seeing keys like:
- `sb_publishable_...` 
- `sb_secret_...`

These might be from a different section. The keys you need are:
- **JWT tokens** (long strings starting with `eyJ`)
- Found in **Settings → API → Project API keys**

### Quick Visual Guide

```
Supabase Dashboard
├── Settings (⚙️ icon)
│   └── API
│       ├── Project URL: https://xxxxx.supabase.co  ← You have this ✅
│       └── Project API keys
│           ├── anon public: eyJhbGci...  ← Copy this
│           └── service_role: eyJhbGci...  ← Copy this (optional)
```

## Add to .env.local

Once you have the keys, add them to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://owmqmqsgmkfuayfpfmva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (your anon key here)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (your service_role key here - optional)
```

## Still Can't Find Them?

1. Make sure you're in the correct project
2. Check that you have the right permissions (project owner/admin)
3. Try refreshing the page
4. The keys should be visible - if they're hidden, click "Reveal" or "Show"

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/api
- Supabase Discord: https://discord.supabase.com
