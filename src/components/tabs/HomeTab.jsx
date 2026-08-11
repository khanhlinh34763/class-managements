import React, { useState } from 'react';
import { Plus, Trash2, Home, Megaphone } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDateVN } from '../../utils/helpers';

const STICKERS = ['🌸', '🌈', '⭐', '🎀', '🦋', '🐰', '🍭'];

function stickerFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash += id.charCodeAt(i);
  return STICKERS[hash % STICKERS.length];
}

export default function HomeTab() {
  const { posts, addPost, deletePost, settings } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deletingPost, setDeletingPost] = useState(null);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const resetForm = () => {
    setTitle('');
    setContent('');
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setError('');
    setPosting(true);
    try {
      await addPost({ title: title.trim(), content: content.trim(), authorName: settings.teacherName });
      resetForm();
      setShowCreate(false);
    } catch (err) {
      setError(
        err.code === 'permission-denied'
          ? 'Chưa có quyền đăng bài. Hãy kiểm tra Firestore Rules cho collection "posts".'
          : 'Có lỗi xảy ra, hãy thử lại.',
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
          <Home size={20} className="text-happy-pink" /> Hoạt động của lớp
        </h3>
        <button
          type="button"
          onClick={() => { setError(''); setShowCreate(true); }}
          className="flex items-center gap-2 bg-happy-pink text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-pink-600"
        >
          <Plus size={16} /> Đăng hoạt động
        </button>
      </div>

      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id} className="flex gap-4 items-start">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl">
              {stickerFor(post.id)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {post.title && <p className="font-extrabold text-gray-800">{post.title}</p>}
                  <p className="text-xs text-gray-400 font-medium">
                    {post.authorName ? `${post.authorName} • ` : ''}{formatDateVN(post.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingPost(post)}
                  className="p-2 rounded-full bg-red-50 text-red-400 hover:bg-red-100 shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          </Card>
        ))}
        {sortedPosts.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
            <Megaphone size={40} className="text-pink-200" />
            <p>Chưa có hoạt động nào được đăng. Hãy chia sẻ điều gì đó với lớp nhé! 🌸</p>
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Đăng hoạt động mới">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tiêu đề (không bắt buộc)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Buổi tham quan vườn thú"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ hoạt động của lớp hôm nay..."
              rows={5}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || posting}
            className="w-full py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-40"
          >
            {posting ? 'Đang đăng...' : 'Đăng lên trang chủ'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={() => deletingPost && deletePost(deletingPost.id)}
        title="Xoá hoạt động"
        message="Bạn có chắc muốn xoá hoạt động này không?"
        confirmText="Xoá"
        danger
      />
    </div>
  );
}
