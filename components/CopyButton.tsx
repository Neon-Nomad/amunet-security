
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CopyButton: React.FC<{ text: string; label?: string; className?: string }> = ({ text, label, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors border border-gray-600 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-sentinel-success" />
          {label ? 'Copied!' : ''}
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {label || ''}
        </>
      )}
    </button>
  );
};
