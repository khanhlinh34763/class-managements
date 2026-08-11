import React, { useState, useMemo } from 'react';
import { Star, TrendingUp, TrendingDown, MessageCircle, Plus, Minus, Trophy } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import { getWeekKey, GROUP_COLORS } from '../../utils/helpers';
import { fireStarConfetti } from '../../utils/confetti';

const QUICK_ACTIONS = [
  { type: 'phatbieu', label: 'Phát biểu', points: 1, icon: MessageCircle, color: 'bg-happy-blue' },
  { type: 'tiendo', label: 'Tiến bộ', points: 2, icon: TrendingUp, color: 'bg-happy-green' },
  { type: 'nenep', label: 'Vi phạm nề nếp', points: -1, icon: TrendingDown, color: 'bg-red-400' },
];

export default function EmulationTab() {
  const { students, addEmulationPoint, getWeeklyRanking } = useAppData();
  const [weekKey, setWeekKey] = useState(getWeekKey(new Date()));
  const [customModalStudent, setCustomModalStudent] = useState(null);
  const [customPoints, setCustomPoints] = useState(1);
  const [customReason, setCustomReason] = useState('');

  const ranking = useMemo(() => getWeeklyRanking(weekKey), [getWeeklyRanking, weekKey]);

  const handleQuickAction = async (studentId, action) => {
    await addEmulationPoint(studentId, action.points, action.label, action.type);
    if (action.points > 0) {
      fireStarConfetti();
    }
  };

  const handleCustomSubmit = async () => {
    if (!customModalStudent || !customReason.trim()) return;
    await addEmulationPoint(customModalStudent.id, customPoints, customReason.trim(), 'custom');
    if (customPoints > 0) fireStarConfetti();
    setCustomModalStudent(null);
    setCustomReason('');
    setCustomPoints(1);
  };

  const changeWeek = (offset) => {
    const [yearStr, wStr] = weekKey.split('-W');
    let year = parseInt(yearStr, 10);
    let week = parseInt(wStr, 10) + offset;
    if (week < 1) { year -= 1; week = 52; }
    if (week > 53) { year += 1; week = 1; }
    setWeekKey(`${year}-W${String(week).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-happy-purple to-purple-400 text-white">
        <div className="flex items-center gap-2">
          <Trophy size={22} />
          <h3 className="font-bold text-lg">Ngôi sao hằng tuần</h3>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => changeWeek(-1)} className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 font-bold">‹</button>
          <span className="font-bold">{weekKey}</span>
          <button type="button" onClick={() => changeWeek(1)} className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 font-bold">›</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ranking.map((item, index) => (
          <Card key={item.student.id} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                index === 0 ? 'bg-happy-yellow text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-happy-orange text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <Avatar name={item.student.name} src={item.student.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-700 truncate">{item.student.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GROUP_COLORS[item.student.group]?.light}`}>
                  {item.student.group}
                </span>
              </div>
              <div className="flex items-center gap-1 font-extrabold text-happy-yellow text-lg">
                <Star size={18} fill="currentColor" /> {item.total}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.type}
                    type="button"
                    onClick={() => handleQuickAction(item.student.id, action)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${action.color} hover:opacity-90`}
                  >
                    <Icon size={12} />
                    {action.points > 0 ? `+${action.points}` : action.points}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCustomModalStudent(item.student)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <Plus size={12} /> Khác
              </button>
            </div>
          </Card>
        ))}
        {students.length === 0 && (
          <p className="text-gray-400 text-center col-span-full py-10">Chưa có học sinh trong lớp</p>
        )}
      </div>

      <Modal isOpen={!!customModalStudent} onClose={() => setCustomModalStudent(null)} title={`Chấm điểm: ${customModalStudent?.name || ''}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCustomPoints((p) => p - 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <Minus size={16} />
            </button>
            <span className={`text-3xl font-extrabold w-16 text-center ${customPoints >= 0 ? 'text-happy-green' : 'text-red-500'}`}>
              {customPoints > 0 ? `+${customPoints}` : customPoints}
            </span>
            <button
              type="button"
              onClick={() => setCustomPoints((p) => p + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Lý do (ví dụ: Giúp đỡ bạn bè)"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customReason.trim()}
            className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-40"
          >
            Ghi nhận điểm
          </button>
        </div>
      </Modal>
    </div>
  );
}