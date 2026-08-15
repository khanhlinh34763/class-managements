import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleSelect from './components/auth/RoleSelect';
import AdminLogin from './components/auth/AdminLogin';
import StudentPortal from './components/student/StudentPortal';
import AppShell from './components/AppShell';

function AdminGate({ onBack }) {
  const { user, authLoading, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-gray-400 font-semibold">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onBack={onBack} />;
  }

  // Đăng xuất: thoát Firebase và quay về màn chọn vai trò
  const handleLogout = async () => {
    await logout();
    onBack();
  };

  return <AppShell role="admin" onLogout={handleLogout} />;
}

function AppShellRouter() {
  const { user, authLoading } = useAuth();
  const [role, setRole] = useState(null);
  const initedRef = useRef(false);

  // Phiên đăng nhập học sinh được lưu ở localStorage (không dùng Firebase Auth)
  const hasStudentSession = typeof window !== 'undefined'
    && !!window.localStorage.getItem('studentSessionId');

  // Reload vẫn giữ nguyên vai trò: ưu tiên lựa chọn hiện tại → giáo viên (Firebase) → học sinh (localStorage)
  const effectiveRole = role
    || (user ? 'admin' : null)
    || (hasStudentSession ? 'student' : null);

  // Ghi nhớ vai trò MỘT LẦN khi vào bằng phiên đã lưu, để lúc đăng xuất setRole(null)
  // thực sự đổi trạng thái và quay về màn chọn vai trò (không "chộp" lại vai trò sau khi đăng xuất)
  useEffect(() => {
    if (initedRef.current || authLoading) return;
    initedRef.current = true;
    if (effectiveRole) setRole(effectiveRole);
  }, [authLoading, effectiveRole]);

  // Chờ Firebase kiểm tra phiên đăng nhập để tránh nhấp nháy màn chọn vai trò
  if (authLoading && !role) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center text-gray-400 font-semibold">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (effectiveRole === 'admin') {
    return <AdminGate onBack={() => setRole(null)} />;
  }

  if (effectiveRole === 'student') {
    return <StudentPortal onBack={() => setRole(null)} />;
  }

  return <RoleSelect onSelectRole={setRole} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShellRouter />
    </AuthProvider>
  );
}
