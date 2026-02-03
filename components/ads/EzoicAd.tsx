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
    // Ezoic requires NO styling on placeholder divs
    // The div should only have the ID - Ezoic will handle styling
    <div
      id={placeholderId}
      data-position={position}
      aria-label={`Advertisement - ${position}`}
    >
      {/* Ezoic will replace this div with ads - no placeholder content needed */}
    </div>
  );
}
