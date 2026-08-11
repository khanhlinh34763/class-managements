import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import RoleSelect from './components/auth/RoleSelect';
import AdminLogin from './components/auth/AdminLogin';
import StudentPortal from './components/student/StudentPortal';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import HomeTab from './components/tabs/HomeTab';
import DashboardTab from './components/tabs/DashboardTab';
import StudentsTab from './components/tabs/StudentsTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import EmulationTab from './components/tabs/EmulationTab';
import ClassroomToolsTab from './components/tabs/ClassroomToolsTab';
import QuizTab from './components/tabs/QuizTab';
import DataTab from './components/tabs/DataTab';

const TAB_COMPONENTS = {
  home: HomeTab,
  dashboard: DashboardTab,
  students: StudentsTab,
  attendance: AttendanceTab,
  emulation: EmulationTab,
  tools: ClassroomToolsTab,
  quiz: QuizTab,
  data: DataTab,
};

function AdminShell() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveComponent = TAB_COMPONENTS[activeTab] || HomeTab;

  return (
    <AppDataProvider>
      <div className="h-screen w-screen flex bg-pink-50/40 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onLogout={logout}
          className="hidden md:flex w-64 shrink-0 border-r border-pink-100"
        />
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onNavigate={() => setSidebarOpen(false)}
              onLogout={logout}
              className="relative z-50 w-72 h-full shadow-2xl"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar activeTab={activeTab} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <ActiveComponent onChangeTab={setActiveTab} />
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
}

function AdminGate({ onBack }) {
  const { user, authLoading } = useAuth();

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

  return <AdminShell />;
}

function AppShellRouter() {
  const [role, setRole] = useState(null);

  if (role === 'admin') {
    return <AdminGate onBack={() => setRole(null)} />;
  }

  if (role === 'student') {
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