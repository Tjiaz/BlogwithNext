import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(".env.local");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await sb
  .from("final_articles")
  .select("title,content")
  .eq("slug", "cm8kksqu50001oux5jsln5zjm")
  .single();

if (error) {
  console.error(error);
  process.exit(1);
}

const c = data.content || "";
const freq = {};
for (const m of c.matchAll(/<\/?([a-z0-9]+)/gi)) {
  const t = m[1].toLowerCase();
  freq[t] = (freq[t] || 0) + 1;
}
console.log(data.title);
console.log(freq);
console.log("---");
console.log(c.slice(0, 3000));
