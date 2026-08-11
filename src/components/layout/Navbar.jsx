import React from 'react';
import { Menu, Cloud, Sparkles } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { MENU_ITEMS } from './Sidebar';

export default function Navbar({ activeTab, onOpenSidebar }) {
  const { settings } = useAppData();
  const current = MENU_ITEMS.find((item) => item.key === activeTab);

  return (
    <header className="bg-white border-b border-blue-50 px-4 md:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-blue-50"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            {current ? current.label : 'Tổng quan'}
            <Sparkles size={18} className="text-happy-yellow" />
          </h1>
          <p className="text-sm text-gray-400 font-medium hidden md:block">
            {settings.className} • GVCN: {settings.teacherName}
          </p>
        </div>
      </div>
    </header>
  );
}