# AzByteGems SEO and Email Operations

## Implemented in the application

- `/sitemap.xml` is generated from published Supabase articles and their topics. It is cached for one hour.
- `/robots.txt` points at the production sitemap.
- Homepage, article, topic, resource, dataset, blog, and about pages have more specific page titles and descriptions. Utility and private areas are marked noindex.
- Article pages emit `BlogPosting` JSON-LD and canonical/Open Graph metadata.
- The topic directory and homepage topic links render on the server for crawlers and visitors without JavaScript.
- Newsletter forms share one component, require affirmative consent, record consent wording/version/time/source, and request email confirmation.
- Confirmed signups receive a welcome email. Campaign email sends include a visible unsubscribe link and RFC 8058 one-click unsubscribe headers.
- The newsletter admin composer can send a rendered test to the signed-in administrator, preview rendered templates, and target either all confirmed active subscribers or selected eligible subscribers.
- Newsletter template fields are HTML-escaped. `{{name}}` falls back to “Reader” until signup collects a name. `{{#articles}}...{{/articles}}` renders the latest three published articles; article fields include `title`, `url`, `author`, `publication`, `description`, `readTime`, `views`, and `claps` (the site's likes count).
- Historical active subscriber records without a confirmation record are excluded from sends. The admin page surfaces these records for review; they can rejoin by submitting the signup form and confirming again.
- Google Analytics 4 is optional and loads only after the visitor accepts optional cookies. It records page views and `newsletter_signup` events when a Measurement ID is configured.

## Deployment configuration required

Set these in the deployment environment, not in committed source files:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID in the form `G-XXXXXXXXXX`; omit it to leave analytics disabled. |
| `EMAIL_HOST` | SMTP host from the email provider. |
| `EMAIL_PORT` | SMTP port, commonly `465` (TLS) or `587` (STARTTLS). |
| `EMAIL_USER` | SMTP username. |
| `EMAIL_PASSWORD` | SMTP credential or app password. |
| `EMAIL_FROM` | Verified sender such as `AzByteGems <newsletter@your-domain>`; align it with the authenticated sending domain. |
| `NEXT_PUBLIC_SITE_URL` | `https://www.azbytegems.com`, used to build confirmation and unsubscribe URLs. |

After setting variables, redeploy and submit a test signup. Verify the confirmation, welcome, new-article, manual newsletter, and unsubscribe emails, including one-click unsubscribe from a mail client. Confirm production has the correct `DATABASE_URL` and that the MongoDB newsletter collection is reachable.

## Search engine account setup

1. Verify `azbytegems.com` as a Domain property in Google Search Console and verify it in Bing Webmaster Tools.
2. Submit `https://www.azbytegems.com/sitemap.xml` in each console.
3. Inspect the homepage, one topic page, and several article URLs. Resolve crawl, canonical, mobile usability, or structured-data errors shown by the tools.
4. Review Search Console query/page reports monthly. Use impressions and clicks to choose content updates and new tutorial topics.
5. Check Core Web Vitals and mobile rendering on real pages after deployment.

## Email domain and subscriber setup

1. Ask the SMTP/email provider for the exact SPF, DKIM, and DMARC DNS records for the sending domain. Add those records at the DNS host and verify them with the provider before sending campaigns. Keep the visible From domain aligned with the authenticated domain.
2. Review the existing MongoDB newsletter list and retain evidence of how each older contact opted in. Records without a recorded confirmation are currently suppressed from campaigns. Only after verifying consent, an administrator may mark an individual legacy record `legacyConsentReviewed: true`; otherwise leave it suppressed or let that reader subscribe again.
3. Keep a consistent newsletter promise. The current product copy promises email when new practical guides are published; plan a sustainable publishing cadence before advertising a weekly or monthly schedule.
4. Use the admin newsletter page to prepare useful, accurate campaigns. Monitor delivery failures, bounces, unsubscribes, and clicks/visits from campaign links. Do not add people who have not opted in.
5. Review the privacy policy against the actual providers, retention periods, analytics, and locations of subscribers before launch. Consent and marketing rules depend on where recipients are located; obtain qualified advice if needed.

## Ongoing content and promotion

- Plan a steady mix of hands-on Python, data-science, AI, and machine-learning tutorials based on real reader questions and Search Console data.
- Add tested code, original examples, datasets, diagrams, sources, author information, and meaningful update dates to important guides.
- Link each article to its topic hub, prerequisites, and useful next steps. Refresh older tutorials when dependencies or tools change.
- Promote each new guide with a short code example or practical takeaway in the newsletter and relevant communities. Track campaign links and prioritize channels that bring engaged readers.
