"use client";

import { useEffect } from "react";

interface AdSenseBannerProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
}

export default function AdSenseBanner({
  slot,
  style = { display: "block" },
  format = "auto",
  responsive = true,
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-4120496705202818"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
