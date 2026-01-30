"use client";

import { useEffect, useRef } from "react";

interface AdSenseRectangleProps {
  slot?: string;
}

export default function AdSenseRectangle({ slot }: AdSenseRectangleProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Wait for container to have width before initializing
    const initAd = () => {
      if (initialized.current || !adRef.current) return;

      const container = adRef.current;
      const width = container.offsetWidth;

      // Only initialize if container has width
      if (width > 0) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          initialized.current = true;
        } catch (err) {
          console.error("AdSense error:", err);
        }
      }
    };

    // Try immediately
    initAd();

    // Also try after a short delay to ensure container is rendered
    const timer = setTimeout(initAd, 100);

    // Use ResizeObserver to detect when container gets width
    if (adRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        initAd();
      });
      resizeObserver.observe(adRef.current);

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={adRef} className="w-full min-w-[320px] flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: "320px", width: "100%" }}
        data-ad-client="ca-pub-4120496705202818"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
