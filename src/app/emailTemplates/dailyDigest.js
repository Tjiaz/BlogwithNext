// app/api/cron/daily-digest/route.js
import { sendDailyDigest } from "@/lib/dailyDigest";

export async function GET() {
  try {
    await sendDailyDigest();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
}
