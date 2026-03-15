"use client";

import { KeyRound } from "lucide-react";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Anthropic API key input field.
 * Displayed at the top of the form with a key icon.
 * The key is stored only in component state and sent per-request.
 */
export default function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  return (
    <div className="card-section flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-gray-600 shrink-0">
        <KeyRound className="w-4 h-4" />
        <span>Anthropic API Key</span>
      </div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-ant-..."
        className="form-input font-mono text-sm"
      />
    </div>
  );
}
