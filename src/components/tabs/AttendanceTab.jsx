import React, { useState } from 'react';
import { Check, X, CalendarDays, MessageSquarePlus, CheckCheck } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import { todayISO, GROUP_COLORS } from '../../utils/helpers';

export default function AttendanceTab() {
  const {
    students, getAttendanceForDate, setAttendanceRecord, setBulkNote, markAllPresent,
  } = useAppData();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkNoteText, setBulkNoteText] = useState('');

  const attendanceData = getAttendanceForDate(selectedDate);
  const records = attendanceData.records || {};

  const presentCount = students.filter((s) => records[s.id]?.present).length;
  const absentCount = students.length - presentCount;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === students.length ? [] : students.map((s) => s.id));
  };

  const handleTogglePresent = async (studentId) => {
    const current = records[studentId]?.present;
    await setAttendanceRecord(selectedDate, studentId, !current);
  };

  const handleNoteChange = async (studentId, note) => {
    const current = records[studentId]?.present ?? true;
    await setAttendanceRecord(selectedDate, studentId, current, note);
  };

  const handleApplyBulkNote = async () => {
    if (selectedIds.length === 0 || !bulkNoteText.trim()) return;
    await setBulkNote(selectedDate, selectedIds, bulkNoteText.trim());
    setBulkNoteText('');
    setSelectedIds([]);
    setShowBulkModal(false);
  };

  const handleMarkAllPresent = async () => {
    await markAllPresent(selectedDate, students.map((s) => s.id));
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays size={22} className="text-happy-blue" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedIds([]); }}
            className="px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none font-semibold"
          />
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="text-happy-green">✔ Có mặt: {presentCount}</span>
          <span className="text-red-400">✘ Vắng: {absentCount}</span>
        </div>
        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="flex items-center gap-2 bg-happy-green text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-green-600"
        >
          <CheckCheck size={16} /> Điểm danh tất cả có mặt
        </button>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.length === students.length && students.length > 0}
              onChange={selectAll}
              className="w-4 h-4 accent-happy-blue"
            />
            Chọn tất cả ({selectedIds.length}/{students.length})
          </label>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 bg-happy-purple text-white px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-purple-600"
          >
            <MessageSquarePlus size={16} /> Nhận xét hàng loạt ({selectedIds.length})
          </button>
        </div>

        <div className="space-y-2">
          {students.map((student) => {
            const record = records[student.id] || { present: false, note: '' };
            return (
              <div
                key={student.id}
                className={`flex flex-wrap items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${
                  selectedIds.includes(student.id) ? 'border-happy-blue bg-blue-50/60' : 'border-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggleSelect(student.id)}
                  className="w-4 h-4 accent-happy-blue"
                />
                <Avatar name={student.name} src={student.avatar} size="sm" />
                <div className="min-w-[140px]">
                  <p className="font-semibold text-gray-700">{student.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GROUP_COLORS[student.group]?.light}`}>
                    {student.group}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePresent(student.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                    record.present ? 'bg-green-100 text-happy-green' : 'bg-red-100 text-red-500'
                  }`}
                >
                  {record.present ? <Check size={14} /> : <X size={14} />}
                  {record.present ? 'Có mặt' : 'Vắng'}
                </button>
                <input
                  type="text"
                  value={record.note || ''}
                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                  placeholder="Nhận xét..."
                  className="flex-1 min-w-[150px] px-3 py-1.5 rounded-xl border border-gray-100 focus:border-happy-blue outline-none text-sm"
                />
              </div>
            );
          })}
          {students.length === 0 && (
            <p className="text-center text-gray-400 py-8">Chưa có học sinh trong lớp</p>
          )}
        </div>
      </Card>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title={`Nhận xét chung cho ${selectedIds.length} học sinh`}>
        <div className="space-y-4">
          <textarea
            rows={4}
            value={bulkNoteText}
            onChange={(e) => setBulkNoteText(e.target.value)}
            placeholder="Ví dụ: Quên mang vở bài tập về nhà"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          />
          <button
            type="button"
            onClick={handleApplyBulkNote}
            className="w-full py-3 bg-happy-purple text-white rounded-xl font-bold hover:bg-purple-600"
          >
            Áp dụng nhận xét
          </button>
        </div>
      </Modal>
    </div>
  );
}