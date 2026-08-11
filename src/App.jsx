import React, { useState } from 'react';
import { AppDataProvider } from './context/AppDataContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DashboardTab from './components/tabs/DashboardTab';
import StudentsTab from './components/tabs/StudentsTab';
import AttendanceTab from './components/tabs/AttendanceTab';
import EmulationTab from './components/tabs/EmulationTab';
import ClassroomToolsTab from './components/tabs/ClassroomToolsTab';
import QuizTab from './components/tabs/QuizTab';
import DataTab from './components/tabs/DataTab';

const TAB_COMPONENTS = {
  dashboard: DashboardTab,
  students: StudentsTab,
  attendance: AttendanceTab,
  emulation: EmulationTab,
  tools: ClassroomToolsTab,
  quiz: QuizTab,
  data: DataTab,
};

function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveComponent = TAB_COMPONENTS[activeTab] || DashboardTab;

  return (
    <div className="h-screen w-screen flex bg-blue-50/40 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        className="hidden md:flex w-64 shrink-0 border-r border-blue-50"
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
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}