import React from 'react';
import { Info } from 'lucide-react';

export function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <Info size={16} />
      <span>{message}</span>
    </div>
  );
}
