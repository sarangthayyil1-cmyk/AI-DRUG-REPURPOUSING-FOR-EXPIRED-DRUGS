"use client";

import { FlaskConical } from "lucide-react";

/**
 * Top navigation bar with PharmStable branding.
 * Matches the dark header from the design screenshots.
 */
export default function Header() {
  return (
    <header className="bg-[#1A1A2E] text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Logo icon */}
        <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        {/* Brand name */}
        <span className="text-lg font-bold tracking-tight">PharmStable</span>
        {/* Version badge */}
        <span className="text-xs font-semibold bg-brand/20 text-brand px-2 py-0.5 rounded-md">
          v0.1
        </span>
      </div>
      <nav className="text-sm font-medium tracking-widest text-gray-400 uppercase">
        Drug Stability Analysis
      </nav>
    </header>
  );
}
