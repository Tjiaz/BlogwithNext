import { NextResponse } from "next/server";

// Ezoic ads.txt handler
// Fetches ads.txt content from Ezoic's ads.txt manager service and serves it
const EZOIC_ADS_TXT_URL = "https://srv.adstxtmanager.com/19390/www.azbytegems.com";

export async function GET() {
  try {
    // Fetch ads.txt content from Ezoic
    const response = await fetch(EZOIC_ADS_TXT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ads.txt fetcher)',
      },
      // Don't cache during fetch - we'll handle caching via headers
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch ads.txt: ${response.status} ${response.statusText}`);
      // Fallback: redirect if fetch fails
      return NextResponse.redirect(EZOIC_ADS_TXT_URL, { status: 301 });
    }

    const content = await response.text();

    // Serve the ads.txt content with proper headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        // Allow CORS for ad networks
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching ads.txt:', error);
    // Fallback: redirect if fetch fails
    return NextResponse.redirect(EZOIC_ADS_TXT_URL, { status: 301 });
  }
}

// Make this route dynamic to skip build-time generation
// The route will be generated on-demand when requested
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
