import React, { useMemo } from 'react';
import { Users, UserCheck, Star, Trophy, Medal } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card, { StatCard } from '../common/Card';
import Avatar from '../common/Avatar';
import { todayISO, getWeekKey, formatDateVN, GROUP_COLORS } from '../../utils/helpers';

export default function DashboardTab() {
  const {
    students, getAttendanceForDate, emulation, getWeeklyRanking, getGroupRanking,
  } = useAppData();
  const today = todayISO();
  const weekKey = getWeekKey(new Date());

  const attendanceToday = getAttendanceForDate(today);

  const presentCount = useMemo(
    () => students.filter((s) => attendanceToday.records[s.id]?.present).length,
    [students, attendanceToday],
  );

  const totalEvaluationsToday = useMemo(
    () => emulation.filter((e) => e.date === today).length,
    [emulation, today],
  );

  const groupRanking = useMemo(() => getGroupRanking(weekKey), [getGroupRanking, weekKey]);
  const topStudents = useMemo(() => getWeeklyRanking(weekKey).slice(0, 5), [getWeeklyRanking, weekKey]);
  const maxGroupTotal = groupRanking[0]?.total || 1;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-happy-blue to-blue-400 text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-blue-100 font-medium">{formatDateVN(new Date())}</p>
          <h2 className="text-2xl font-extrabold mt-1">Chào mừng cô Linh quay lại! 🌞</h2>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Sĩ số lớp" value={students.length} color="bg-happy-blue" />
        <StatCard icon={UserCheck} label="Có mặt hôm nay" value={`${presentCount}/${students.length}`} color="bg-happy-green" />
        <StatCard icon={Star} label="Lượt đánh giá hôm nay" value={totalEvaluationsToday} color="bg-happy-yellow" />
        <StatCard icon={Trophy} label="Tuần thi đua" value={weekKey} color="bg-happy-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-happy-yellow" /> BXH Thi đua Tổ (tuần này)
          </h3>
          <div className="space-y-3">
            {groupRanking.map((item, index) => (
              <div key={item.group} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${index === 0 ? 'bg-happy-yellow' : 'bg-gray-300'}`}>
                  {index + 1}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${GROUP_COLORS[item.group]?.light}`}>
                  {item.group}
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${GROUP_COLORS[item.group]?.bg}`}
                    style={{ width: `${Math.min(100, Math.max(4, (item.total / maxGroupTotal) * 100))}%` }}
                  />
                </div>
                <span className="font-extrabold text-gray-700 w-10 text-right">{item.total}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Medal size={20} className="text-happy-orange" /> Top cá nhân xuất sắc
          </h3>
          <div className="space-y-3">
            {topStudents.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu thi đua tuần này</p>
            )}
            {topStudents.map((item, index) => (
              <div key={item.student.id} className="flex items-center gap-3">
                <span className={`w-6 text-center font-extrabold ${index === 0 ? 'text-happy-yellow' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-happy-orange' : 'text-gray-300'}`}>
                  {index + 1}
                </span>
                <Avatar name={item.student.name} src={item.student.avatar} size="sm" />
                <span className="flex-1 font-semibold text-gray-700 truncate">{item.student.name}</span>
                <span className="font-extrabold text-happy-blue">{item.total} ⭐</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}