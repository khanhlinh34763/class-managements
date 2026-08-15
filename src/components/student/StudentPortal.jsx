import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, LogIn } from 'lucide-react';
import { subscribe } from '../../services/storage';
import { hashPassword } from '../../utils/auth';
import FloatingStickers from '../common/FloatingStickers';
import AppShell from '../AppShell';

const SESSION_KEY = 'studentSessionId';

export default function StudentPortal({ onBack }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const unsubStudents = subscribe('students', setStudents);
    return () => {
      unsubStudents && unsubStudents();
    };
  }, []);

  useEffect(() => {
    if (restored || students.length === 0) return;
    const savedId = localStorage.getItem(SESSION_KEY);
    if (savedId) {
      const found = students.find((s) => s.id === savedId);
      if (found) setSelectedStudent(found);
    }
    setRestored(true);
  }, [students, restored]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const uname = username.trim().toLowerCase();
    if (!uname || !password) return;
    setLoggingIn(true);
    const found = students.find((s) => s.username && s.username.toLowerCase() === uname);
    if (!found) {
      setLoginError('Tên đăng nhập không tồn tại.');
      setLoggingIn(false);
      return;
    }
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) {
      setLoginError('Sai mật khẩu. Hãy thử lại.');
      setLoggingIn(false);
      return;
    }
    localStorage.setItem(SESSION_KEY, found.id);
    setSelectedStudent(found);
    setUsername('');
    setPassword('');
    setLoggingIn(false);
  };

  // Đăng xuất: xoá phiên và quay về màn chọn vai trò
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSelectedStudent(null);
    onBack();
  };

  // Đã đăng nhập -> dùng chung giao diện với giáo viên nhưng giới hạn quyền
  if (selectedStudent) {
    return (
      <AppShell role="student" currentStudent={selectedStudent} onLogout={handleLogout} />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 relative overflow-hidden">
      <FloatingStickers />
      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="text-center space-y-2">
          <GraduationCap size={40} className="mx-auto text-happy-pink" />
          <h1 className="text-2xl font-extrabold text-gray-800">Đăng nhập học sinh</h1>
          <p className="text-gray-400">Nhập tên đăng nhập và mật khẩu cô giáo đã cấp cho em</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl card-shadow p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vd: an123"
              autoComplete="username"
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
            />
          </div>
          {loginError && <p className="text-sm text-red-500 font-medium">{loginError}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full flex items-center justify-center gap-2 py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50"
          >
            <LogIn size={18} /> {loggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
