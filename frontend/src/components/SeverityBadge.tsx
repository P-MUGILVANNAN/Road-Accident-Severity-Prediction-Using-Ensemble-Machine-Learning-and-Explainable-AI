import React from 'react';

interface SeverityBadgeProps {
  severity: 'Slight' | 'Serious' | 'Fatal' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const getStyles = () => {
    switch (severity) {
      case 'Fatal':
        return 'bg-rose-100 text-rose-700 border-rose-300 ring-rose-500/20';
      case 'Serious':
        return 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-500/20';
      case 'Slight':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-500/20';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3.5 py-1 text-sm font-semibold';
      case 'md':
      default:
        return 'px-2.5 py-0.5 text-xs font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors ${getStyles()} ${getSize()}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          severity === 'Fatal'
            ? 'bg-rose-600 animate-pulse'
            : severity === 'Serious'
            ? 'bg-amber-600'
            : 'bg-emerald-600'
        }`}
      />
      {severity}
    </span>
  );
};
