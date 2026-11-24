"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const [consented, setConsented] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const readConsent = () => setConsented(localStorage.getItem("cookieConsent") === "accepted");
    readConsent();
    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      const granted = detail === "accepted";
      setConsented(granted);
      window.gtag?.("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    };
    window.addEventListener("cookie-consent-change", handleConsent);
    return () => window.removeEventListener("cookie-consent-change", handleConsent);
  }, []);

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId) || !consented || !loaded) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer!.push(args));
    window.gtag("event", "page_view", {
      page_path: `${pathname}${window.location.search}`,
      page_title: document.title,
    });
  }, [consented, loaded, measurementId, pathname]);

  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId) || !consented) return null;

  return (
    <>
      <Script
        id="google-analytics-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('consent','update',{analytics_storage:'granted'});window.gtag('js',new Date());window.gtag('config','${measurementId}',{send_page_view:false});`,
        }}
      />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" onReady={() => setLoaded(true)} />
    </>
  );
}
