import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FloatingStickers from '../common/FloatingStickers';

export default function AdminLogin({ onBack }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 relative overflow-hidden">
      <FloatingStickers />
      <div className="max-w-sm w-full bg-white rounded-3xl card-shadow p-8 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-happy-blue flex items-center justify-center">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">Đăng nhập Giáo viên</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              placeholder="colinh@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50"
          >
            <LogIn size={18} /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}