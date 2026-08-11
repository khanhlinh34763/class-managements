import React from 'react';
import { GraduationCap, ShieldCheck, Sun } from 'lucide-react';
import FloatingStickers from '../common/FloatingStickers';
import ClassActivityFeed from '../common/ClassActivityFeed';

export default function RoleSelect({ onSelectRole }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 relative overflow-hidden">
      <FloatingStickers />
      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-happy-pink to-happy-orange rounded-3xl flex items-center justify-center shadow-lg">
            <Sun size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">Lớp học cô Linh 🌸</h1>
          <p className="text-gray-400 font-medium">Lớp học hạnh phúc — Bạn là ai?</p>
        </div>
        <ClassActivityFeed className="text-left" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => onSelectRole('admin')}
            className="flex flex-col items-center gap-3 bg-white rounded-3xl p-8 card-shadow hover:scale-105 transition-transform border-2 border-transparent hover:border-happy-blue"
          >
            <div className="w-16 h-16 rounded-2xl bg-happy-blue flex items-center justify-center">
              <ShieldCheck size={30} className="text-white" />
            </div>
            <p className="font-extrabold text-gray-700 text-lg">Giáo viên</p>
            <p className="text-sm text-gray-400">Đăng nhập để quản lý lớp học</p>
          </button>
          <button
            type="button"
            onClick={() => onSelectRole('student')}
            className="flex flex-col items-center gap-3 bg-white rounded-3xl p-8 card-shadow hover:scale-105 transition-transform border-2 border-transparent hover:border-happy-pink"
          >
            <div className="w-16 h-16 rounded-2xl bg-happy-pink flex items-center justify-center">
              <GraduationCap size={30} className="text-white" />
            </div>
            <p className="font-extrabold text-gray-700 text-lg">Học sinh</p>
            <p className="text-sm text-gray-400">Chọn tên và làm bài trắc nghiệm</p>
          </button>
        </div>
      </div>
    </div>
  );
}