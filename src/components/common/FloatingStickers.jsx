import React from 'react';

const DEFAULT_ITEMS = [
  { emoji: '🌸', position: 'top-10 left-8 md:left-16', anim: 'animate-float' },
  { emoji: '🎈', position: 'top-14 right-10 md:right-20', anim: 'animate-bounce-slow' },
  { emoji: '⭐', position: 'bottom-16 left-12 md:left-24', anim: 'animate-wiggle' },
  { emoji: '🦋', position: 'bottom-10 right-8 md:right-16', anim: 'animate-float' },
];

export default function FloatingStickers({ items = DEFAULT_ITEMS }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" aria-hidden="true">
      {items.map((item, index) => (
        <span
          key={index}
          className={`sticker absolute text-4xl md:text-5xl opacity-40 ${item.position} ${item.anim}`}
          style={{ animationDelay: `${index * 0.3}s` }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
