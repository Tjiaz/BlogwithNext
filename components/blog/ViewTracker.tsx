"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;

    // Track view after a short delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      fetch(`/api/posts/${encodeURIComponent(slug)}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Optionally update the view count in the UI
            const viewElement = document.querySelector('[data-view-count]');
            if (viewElement && data.views !== undefined) {
              viewElement.textContent = `${data.views} views`;
            }
          }
        })
        .catch((error) => {
          console.error("Failed to track view:", error);
        });

      hasTracked.current = true;
    }, 1000); // Wait 1 second before tracking

    return () => clearTimeout(timer);
  }, [slug]);

  return null; // This component doesn't render anything
}
