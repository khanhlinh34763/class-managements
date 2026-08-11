import React from 'react';
import {
  LayoutDashboard, Users, ClipboardCheck, Trophy, Wand2, FileQuestion, Database, Sun,
} from 'lucide-react';

const MENU_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'students', label: 'Học sinh', icon: Users },
  { key: 'attendance', label: 'Điểm danh', icon: ClipboardCheck },
  { key: 'emulation', label: 'Thi đua', icon: Trophy },
  { key: 'tools', label: 'Công cụ lớp học', icon: Wand2 },
  { key: 'quiz', label: 'Trắc nghiệm', icon: FileQuestion },
  { key: 'data', label: 'Dữ liệu & Báo cáo', icon: Database },
];

export default function Sidebar({ activeTab, onChangeTab, className = '', onNavigate }) {
  return (
    <aside className={`bg-white flex flex-col ${className}`}>
      <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-50">
        <div className="w-11 h-11 bg-gradient-to-br from-happy-yellow to-happy-orange rounded-2xl flex items-center justify-center shadow-md">
          <Sun size={24} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-gray-800 leading-tight">Lớp học cô Linh</p>
          <p className="text-xs text-gray-400 font-medium">Lớp học hạnh phúc</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => { onChangeTab(item.key); if (onNavigate) onNavigate(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-happy-blue text-white shadow-lg shadow-blue-200 scale-[1.02]'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-happy-blue'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-blue-50 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} - Lớp học hạnh phúc
      </div>
    </aside>
  );
}

export { MENU_ITEMS };