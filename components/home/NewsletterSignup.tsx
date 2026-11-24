"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter-constants";

interface NewsletterSignupProps {
  source: string;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  consentClassName?: string;
}

export default function NewsletterSignup({
  source,
  buttonLabel = "Subscribe",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  consentClassName = "",
}: NewsletterSignupProps) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          source,
          website: new FormData(event.currentTarget).get("website"),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not subscribe. Please try again.");
      if (!result.alreadySubscribed) {
        window.gtag?.("event", "newsletter_signup", { form_location: source });
      }
      setMessage(result.message || "Check your inbox for a confirmation email.");
      setEmail("");
      setConsent(false);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <label className="sr-only" htmlFor={`${id}-email`}>Email address</label>
      <input
        id={`${id}-email`}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        required
        disabled={submitting}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#0a73b0] disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 ${inputClassName}`}
      />
      <div className="flex items-start gap-2">
        <input
          id={`${id}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
          disabled={submitting}
          className="mt-1 h-4 w-4 accent-[#0a73b0]"
        />
        <label htmlFor={`${id}-consent`} className={`text-xs leading-relaxed text-gray-600 dark:text-gray-300 ${consentClassName}`}>
          {NEWSLETTER_CONSENT_TEXT} See the <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
        </label>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button type="submit" disabled={submitting || !consent} className={`w-full rounded-lg bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}>
        {submitting ? "Submitting…" : buttonLabel}
      </button>
      <p aria-live="polite" className="text-xs text-gray-600 dark:text-gray-300">{message || error}</p>
    </form>
  );
}
