import React, { useState } from 'react';
import { AppDataProvider } from '../context/AppDataContext';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import HomeTab from './tabs/HomeTab';
import DashboardTab from './tabs/DashboardTab';
import StudentsTab from './tabs/StudentsTab';
import AttendanceTab from './tabs/AttendanceTab';
import EmulationTab from './tabs/EmulationTab';
import ClassroomToolsTab from './tabs/ClassroomToolsTab';
import QuizTab from './tabs/QuizTab';
import PeriodicEvalTab from './tabs/PeriodicEvalTab';
import DataTab from './tabs/DataTab';

const TAB_COMPONENTS = {
  home: HomeTab,
  dashboard: DashboardTab,
  students: StudentsTab,
  attendance: AttendanceTab,
  emulation: EmulationTab,
  tools: ClassroomToolsTab,
  quiz: QuizTab,
  periodic: PeriodicEvalTab,
  data: DataTab,
};

// Học sinh chỉ được xem 4 mục này
export const STUDENT_TABS = ['home', 'dashboard', 'students', 'quiz'];

export default function AppShell({ role = 'admin', currentStudent = null, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowedTabs = role === 'student' ? STUDENT_TABS : Object.keys(TAB_COMPONENTS);
  const effectiveTab = allowedTabs.includes(activeTab) ? activeTab : 'home';
  const ActiveComponent = TAB_COMPONENTS[effectiveTab] || HomeTab;

  return (
    <AppDataProvider>
      <div className="h-screen w-screen flex bg-pink-50/40 overflow-hidden">
        <Sidebar
          role={role}
          activeTab={effectiveTab}
          onChangeTab={setActiveTab}
          onLogout={onLogout}
          className="hidden md:flex w-64 shrink-0 border-r border-pink-100"
        />
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <Sidebar
              role={role}
              activeTab={effectiveTab}
              onChangeTab={setActiveTab}
              onNavigate={() => setSidebarOpen(false)}
              onLogout={onLogout}
              className="relative z-50 w-72 h-full shadow-2xl"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar activeTab={effectiveTab} onOpenSidebar={() => setSidebarOpen(true)} currentStudent={currentStudent} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <ActiveComponent onChangeTab={setActiveTab} role={role} currentStudent={currentStudent} />
          </main>
        </div>
      </div>
    </AppDataProvider>
  );
}
