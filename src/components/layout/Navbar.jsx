import React, { useState } from 'react';
import { Menu, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { MENU_ITEMS } from './Sidebar';

export default function Navbar({ activeTab, onOpenSidebar }) {
  const { mode, changeMode, isOnlineAvailable, settings } = useAppData();
  const current = MENU_ITEMS.find((item) => item.key === activeTab);
  const [switching, setSwitching] = useState(false);

  const handleToggleMode = () => {
    if (!isOnlineAvailable) return;
    setSwitching(true);
    const nextMode = mode === 'online' ? 'offline' : 'online';
    changeMode(nextMode);
    setTimeout(() => setSwitching(false), 500);
  };

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
      <button
        type="button"
        onClick={handleToggleMode}
        disabled={!isOnlineAvailable || switching}
        title={isOnlineAvailable ? 'Bấm để chuyển chế độ lưu trữ' : 'Chưa cấu hình Firebase, chỉ dùng được Offline'}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
          mode === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        } ${isOnlineAvailable ? 'hover:opacity-80 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      >
        {mode === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
        {mode === 'online' ? 'Trực tuyến (Firebase)' : 'Ngoại tuyến (Máy này)'}
      </button>
    </header>
  );
}