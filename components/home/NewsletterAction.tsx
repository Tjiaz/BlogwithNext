"use client";

import { useEffect, useState } from "react";

export default function NewsletterAction({ token, action }: { token: string; action: "confirm" | "unsubscribe" }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const isConfirm = action === "confirm";

  useEffect(() => {
    if (!token) setError("This link is invalid.");
  }, [token]);

  async function submit() {
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/newsletter/${action}/${encodeURIComponent(token)}`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Request could not be completed.");
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request could not be completed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-xl items-center px-4 py-16">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{isConfirm ? "Confirm your subscription" : "Unsubscribe from AzByteGems"}</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          {isConfirm ? "Confirm to receive practical Python, data science, and AI tutorials by email." : "You can stop receiving AzByteGems newsletter emails below."}
        </p>
        {!message && !error && <button onClick={submit} disabled={working} className="mt-6 rounded-lg bg-[#0a73b0] px-5 py-3 font-semibold text-white hover:bg-[#085f91] disabled:opacity-60">{working ? "Please wait…" : isConfirm ? "Confirm subscription" : "Unsubscribe"}</button>}
        {message && <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950/40 dark:text-green-200">{message}</p>}
        {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
        {isConfirm && error && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">The confirmation link may have expired. You can submit the signup form again to receive a new link.</p>}
      </section>
    </main>
  );
}
