"use client";

import { useEffect, useRef } from "react";

interface AdSenseBannerProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
}

export default function AdSenseBanner({
  slot,
  style = { display: "block", minWidth: "320px", width: "100%" },
  format = "auto",
  responsive = true,
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Wait for container to have width before initializing
    const initAd = () => {
      if (initialized.current || !adRef.current) return;

      const container = adRef.current.parentElement || adRef.current;
      const width = container instanceof HTMLElement ? container.offsetWidth : 0;

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

    // Also try after a short delay
    const timer = setTimeout(initAd, 100);

    // Use ResizeObserver if available
    if (adRef.current && typeof ResizeObserver !== "undefined") {
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
    <div ref={adRef} className="w-full min-w-[320px]">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-4120496705202818"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
