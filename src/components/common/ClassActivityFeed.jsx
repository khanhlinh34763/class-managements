import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { subscribe } from '../../services/storage';
import { formatDateVN } from '../../utils/helpers';
import Card from './Card';

const STICKERS = ['🌸', '🌈', '⭐', '🎀', '🦋', '🐰', '🍭'];

function stickerFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash += id.charCodeAt(i);
  return STICKERS[hash % STICKERS.length];
}

export default function ClassActivityFeed({ className = '', maxHeight = 'max-h-72' }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsub = subscribe('posts', setPosts);
    return () => unsub && unsub();
  }, []);

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sortedPosts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="font-bold text-gray-700 flex items-center gap-2">
        <Megaphone size={18} className="text-happy-pink" /> Hoạt động của lớp
      </p>
      <div className={`space-y-3 ${maxHeight} overflow-y-auto pr-1`}>
        {sortedPosts.map((post) => (
          <Card key={post.id} className="flex gap-3 items-start text-left">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-pink-50 flex items-center justify-center text-xl">
              {stickerFor(post.id)}
            </div>
            <div className="min-w-0">
              {post.title && <p className="font-bold text-gray-800 text-sm">{post.title}</p>}
              <p className="text-xs text-gray-400 font-medium">
                {post.authorName ? `${post.authorName} • ` : ''}{formatDateVN(post.createdAt)}
              </p>
              <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
