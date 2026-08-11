import React, { useState, useRef } from 'react';
import {
  Download, Upload, ShieldAlert, ClipboardCheck, FileSpreadsheet, Trash2, Save,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import ConfirmDialog from '../common/ConfirmDialog';
import { exportToCSV } from '../../utils/csv';
import { downloadFile, todayISO } from '../../utils/helpers';

const RATINGS = ['Hoàn thành tốt', 'Hoàn thành', 'Chưa hoàn thành'];

export default function DataTab() {
  const {
    students, settings, evaluations, addEvaluation, attendance, emulation,
    backupAllData, restoreAllData, clearAllData,
  } = useAppData();

  const [evalForm, setEvalForm] = useState({
    studentId: '', subject: settings.subjects[0], rating: RATINGS[0], note: '',
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddEvaluation = async (e) => {
    e.preventDefault();
    if (!evalForm.studentId) return;
    await addEvaluation(evalForm.studentId, evalForm.subject, evalForm.rating, evalForm.note);
    setEvalForm((f) => ({ ...f, note: '' }));
  };

  const handleBackup = async () => {
    const data = await backupAllData();
    const filename = `saoluu_lophoc_${todayISO()}.json`;
    downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await restoreAllData(data);
      alert('Phục hồi dữ liệu thành công!');
    } catch (err) {
      alert('Tệp không hợp lệ hoặc bị lỗi. Vui lòng kiểm tra lại file sao lưu.');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportStudents = () => {
    const headers = ['STT', 'Họ và tên', 'Tổ', 'Giới tính'];
    const rows = students.map((s, i) => [i + 1, s.name, s.group, s.gender]);
    exportToCSV(`danhsach_hocsinh_${todayISO()}.csv`, headers, rows);
  };

  const handleExportEvaluations = () => {
    const headers = ['Họ và tên', 'Môn học', 'Mức đánh giá', 'Nhận xét', 'Ngày'];
    const rows = evaluations.map((ev) => {
      const student = students.find((s) => s.id === ev.studentId);
      return [student ? student.name : 'Không rõ', ev.subject, ev.rating, ev.note, ev.date];
    });
    exportToCSV(`danhgia_monhoc_${todayISO()}.csv`, headers, rows);
  };

  const handleExportAttendance = () => {
    const headers = ['Ngày', 'Họ và tên', 'Trạng thái', 'Nhận xét'];
    const rows = [];
    attendance.forEach((day) => {
      Object.entries(day.records || {}).forEach(([studentId, record]) => {
        const student = students.find((s) => s.id === studentId);
        rows.push([day.id, student ? student.name : 'Không rõ', record.present ? 'Có mặt' : 'Vắng', record.note || '']);
      });
    });
    exportToCSV(`diemdanh_${todayISO()}.csv`, headers, rows);
  };

  const handleExportEmulation = () => {
    const headers = ['Ngày', 'Họ và tên', 'Điểm', 'Lý do', 'Tuần'];
    const rows = emulation.map((e) => {
      const student = students.find((s) => s.id === e.studentId);
      return [e.date, student ? student.name : 'Không rõ', e.points, e.reason, e.week];
    });
    exportToCSV(`thidua_${todayISO()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-amber-50 border-2 border-amber-200 flex gap-3">
        <ShieldAlert size={24} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-bold mb-1">Lưu ý an toàn thông tin</p>
          <p>
            Dữ liệu học sinh (họ tên, hình ảnh, kết quả học tập) được lưu trên Firestore (Google Cloud)
            và hiển thị theo thời gian thực cho bất kỳ ai truy cập trang web này.
            Vui lòng không chia sẻ đường link web hoặc file sao lưu (.json) cho người không có trách nhiệm,
            và nên sao lưu định kỳ để phòng trường hợp thao tác nhầm hoặc mất kết nối mạng.
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ClipboardCheck size={20} className="text-happy-blue" /> Đánh giá môn học
        </h3>
        <form onSubmit={handleAddEvaluation} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            required
            value={evalForm.studentId}
            onChange={(e) => setEvalForm((f) => ({ ...f, studentId: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          >
            <option value="">-- Chọn học sinh --</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={evalForm.subject}
            onChange={(e) => setEvalForm((f) => ({ ...f, subject: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          >
            {settings.subjects.map((subj) => <option key={subj} value={subj}>{subj}</option>)}
          </select>
          <select
            value={evalForm.rating}
            onChange={(e) => setEvalForm((f) => ({ ...f, rating: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          >
            {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-happy-blue text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-600"
          >
            <Save size={16} /> Lưu đánh giá
          </button>
          <input
            type="text"
            value={evalForm.note}
            onChange={(e) => setEvalForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Nhận xét thêm (không bắt buộc)"
            className="md:col-span-4 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
          />
        </form>

        <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
          {evaluations.slice().reverse().slice(0, 20).map((ev) => {
            const student = students.find((s) => s.id === ev.studentId);
            return (
              <div key={ev.id} className="flex items-center justify-between text-sm p-2.5 rounded-xl bg-gray-50">
                <span className="font-semibold text-gray-700">{student ? student.name : 'Không rõ'}</span>
                <span className="text-gray-500">{ev.subject}</span>
                <span className={`font-semibold ${ev.rating === 'Hoàn thành tốt' ? 'text-happy-green' : ev.rating === 'Chưa hoàn thành' ? 'text-red-400' : 'text-happy-blue'}`}>
                  {ev.rating}
                </span>
                <span className="text-gray-400">{ev.date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Sao lưu & Phục hồi dữ liệu</h3>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleBackup}
              className="flex items-center gap-2 bg-happy-blue text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600"
            >
              <Download size={18} /> Sao lưu dữ liệu (.json)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              className="flex items-center gap-2 bg-happy-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              <Upload size={18} /> {restoring ? 'Đang phục hồi...' : 'Phục hồi từ file sao lưu'}
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleRestoreFile} />
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-3 rounded-xl font-semibold hover:bg-red-100"
            >
              <Trash2 size={18} /> Xoá toàn bộ dữ liệu
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-700 mb-4">Xuất báo cáo (.csv - Excel)</h3>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleExportStudents}
              className="flex items-center gap-2 bg-white border-2 border-happy-blue text-happy-blue px-4 py-3 rounded-xl font-semibold hover:bg-blue-50"
            >
              <FileSpreadsheet size={18} /> Danh sách học sinh
            </button>
            <button
              type="button"
              onClick={handleExportAttendance}
              className="flex items-center gap-2 bg-white border-2 border-happy-green text-happy-green px-4 py-3 rounded-xl font-semibold hover:bg-green-50"
            >
              <FileSpreadsheet size={18} /> Báo cáo điểm danh
            </button>
            <button
              type="button"
              onClick={handleExportEmulation}
              className="flex items-center gap-2 bg-white border-2 border-happy-purple text-happy-purple px-4 py-3 rounded-xl font-semibold hover:bg-purple-50"
            >
              <FileSpreadsheet size={18} /> Báo cáo thi đua
            </button>
            <button
              type="button"
              onClick={handleExportEvaluations}
              className="flex items-center gap-2 bg-white border-2 border-happy-orange text-happy-orange px-4 py-3 rounded-xl font-semibold hover:bg-orange-50"
            >
              <FileSpreadsheet size={18} /> Báo cáo đánh giá môn học
            </button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => clearAllData()}
        title="Xoá toàn bộ dữ liệu"
        message="Hành động này sẽ xoá vĩnh viễn toàn bộ dữ liệu học sinh, điểm danh, thi đua... trên Firestore. Bạn có chắc chắn không?"
        confirmText="Xoá toàn bộ"
        danger
      />
    </div>
  );
}