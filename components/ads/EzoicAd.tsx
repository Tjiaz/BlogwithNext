"use client";

import { useEffect } from "react";

interface EzoicAdProps {
  /**
   * Ezoic ad placeholder ID (e.g., "ezoic-pub-ad-placeholder-101")
   * You'll get these IDs from Ezoic after signing up
   */
  placeholderId: string;
  /**
   * Ad position name for reference (e.g., "sidebar-top", "in-content-1")
   */
  position?: string;
  /**
   * Minimum height for the ad container (prevents layout shift)
   */
  minHeight?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Ezoic Ad Component
 * 
 * This component creates a placeholder div that Ezoic's script will replace with ads.
 * After signing up with Ezoic, you'll receive specific placeholder IDs to use.
 * 
 * Usage:
 * <EzoicAd placeholderId="ezoic-pub-ad-placeholder-101" position="sidebar-top" />
 */
export default function EzoicAd({
  placeholderId,
  position = "ad",
  minHeight = "250px",
  className = "",
}: EzoicAdProps) {
  useEffect(() => {
    // Ezoic script will automatically detect and replace these divs
    // Make sure the Ezoic script is loaded in your layout.tsx
  }, []);

  return (
    <div
      id={placeholderId}
      className={`ezoic-ad ${className}`}
      data-position={position}
      style={{
        minHeight: minHeight,
        display: "block",
        textAlign: "center",
        margin: "1rem 0",
      }}
      aria-label={`Advertisement - ${position}`}
    >
      {/* Placeholder content - will be replaced by Ezoic */}
      <div
        style={{
          minHeight: minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          border: "1px dashed #d1d5db",
          borderRadius: "8px",
          color: "#9ca3af",
          fontSize: "14px",
        }}
        className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600"
      >
        <span>Advertisement</span>
      </div>
    </div>
  );
}
