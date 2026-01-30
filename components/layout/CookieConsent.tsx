"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowModal(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 sm:p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Cookie Icon */}
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 sm:hidden">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] rounded-full flex items-center justify-center">
                      <Cookie className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    We Value Your Privacy
                  </h3>
                </div>
                <button
                  onClick={handleDecline}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and
                personalize content. By clicking "Accept All", you consent to our use of cookies.
                You can learn more about how we use cookies in our{" "}
                <Link
                  href="/privacy"
                  className="text-[#0a73b0] hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0a73b0] to-[#2a9bd0] text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm sm:text-base"
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  Decline
                </button>
                <Link
                  href="/privacy"
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all text-center sm:text-left text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
