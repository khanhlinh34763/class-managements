import React from 'react';
import { getAvatarFallback } from '../../utils/helpers';

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-28 h-28 text-4xl',
};

const COLOR_LIST = ['bg-happy-pink', 'bg-happy-blue', 'bg-happy-green', 'bg-happy-orange', 'bg-happy-purple'];

function colorFromName(name) {
  if (!name) return COLOR_LIST[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_LIST[Math.abs(hash) % COLOR_LIST.length];
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-md ${className}`}
      />
    );
  }
  return (
    <div className={`${sizeClass} ${colorFromName(name)} rounded-full flex items-center justify-center font-bold text-white border-2 border-white shadow-md ${className}`}>
      {getAvatarFallback(name)}
    </div>
  );
}