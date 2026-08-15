import React, { useState, useMemo } from 'react';
import {
  CalendarCheck, ClipboardList, Sparkles, Trash2, Save, CheckCircle2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import {
  EVAL_PERIODS, EVAL_LEVELS, SAMPLE_COMMENTS, levelInfo,
} from '../../utils/evaluationTemplates';

export default function PeriodicEvalTab() {
  const {
    students, settings, periodicEvals, savePeriodicEval, deletePeriodicEval,
  } = useAppData();

  const [period, setPeriod] = useState(EVAL_PERIODS[0].key);
  const [subject, setSubject] = useState(settings.subjects[0]);
  const [editing, setEditing] = useState(null); // student đang đánh giá
  const [formLevel, setFormLevel] = useState('HTT');
  const [formComment, setFormComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Bản đánh giá của kì + môn hiện tại, tra theo studentId
  const evalMap = useMemo(() => {
    const map = {};
    periodicEvals
      .filter((p) => p.period === period && p.subject === subject)
      .forEach((p) => { map[p.studentId] = p; });
    return map;
  }, [periodicEvals, period, subject]);

  const doneCount = students.filter((s) => evalMap[s.id]).length;

  const openEditor = (student) => {
    const existing = evalMap[student.id];
    setEditing(student);
    setFormLevel(existing?.level || 'HTT');
    setFormComment(existing?.comment || '');
  };

  const closeEditor = () => {
    setEditing(null);
    setFormComment('');
    setFormLevel('HTT');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await savePeriodicEval({
      studentId: editing.id,
      period,
      subject,
      level: formLevel,
      comment: formComment.trim(),
    });
    setSaving(false);
    closeEditor();
  };

  const handleDelete = async () => {
    const existing = editing && evalMap[editing.id];
    if (!existing) { closeEditor(); return; }
    await deletePeriodicEval(existing.id);
    closeEditor();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-happy-blue to-blue-400 text-white flex items-center gap-3">
        <CalendarCheck size={24} />
        <div>
          <h3 className="font-bold text-lg">Đánh giá định kì học sinh</h3>
          <p className="text-sm text-white/80">
            Đánh giá theo 3 mức Hoàn thành tốt (HTT), Hoàn thành (HT), Chưa hoàn thành (CHT) — có nhận xét mẫu sẵn.
          </p>
        </div>
      </Card>

      {/* Chọn kì đánh giá */}
      <div className="flex flex-wrap gap-2">
        {EVAL_PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              period === p.key ? 'bg-happy-blue text-white shadow' : 'bg-white text-gray-500 hover:bg-blue-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chọn môn học + tiến độ */}
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-happy-blue" />
          <span className="text-sm font-semibold text-gray-600">Môn học:</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none font-semibold"
          >
            {settings.subjects.map((subj) => <option key={subj} value={subj}>{subj}</option>)}
          </select>
        </div>
        <span className="text-sm font-semibold text-gray-500">
          Đã đánh giá {doneCount}/{students.length} học sinh
        </span>
      </Card>

      {/* Danh sách học sinh */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {students.map((student) => {
          const ev = evalMap[student.id];
          const info = ev ? levelInfo(ev.level) : null;
          return (
            <Card key={student.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={student.name} src={student.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-700 truncate">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.group}</p>
                </div>
                {info ? (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${info.badge}`}>{ev.level}</span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">Chưa có</span>
                )}
              </div>
              {ev?.comment && (
                <p className="text-sm text-gray-500 line-clamp-2 bg-gray-50 rounded-xl p-2.5">{ev.comment}</p>
              )}
              <button
                type="button"
                onClick={() => openEditor(student)}
                className={`text-sm font-semibold rounded-xl py-2 transition-colors ${
                  ev ? 'bg-blue-50 text-happy-blue hover:bg-blue-100' : 'bg-happy-blue text-white hover:bg-blue-600'
                }`}
              >
                {ev ? 'Chỉnh sửa đánh giá' : 'Đánh giá ngay'}
              </button>
            </Card>
          );
        })}
        {students.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">Chưa có học sinh nào trong lớp</p>
        )}
      </div>

      {/* Modal đánh giá */}
      <Modal
        isOpen={!!editing}
        onClose={closeEditor}
        title={editing ? `Đánh giá: ${editing.name}` : ''}
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-400">
            {EVAL_PERIODS.find((p) => p.key === period)?.label} • Môn {subject}
          </p>

          {/* Chọn mức */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Mức đánh giá</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {EVAL_LEVELS.map((lvl) => (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => setFormLevel(lvl.key)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors ${
                    formLevel === lvl.key
                      ? 'border-happy-blue bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  {formLevel === lvl.key && <CheckCircle2 size={16} className="text-happy-blue" />}
                  <span className={lvl.color}>{lvl.key}</span>
                  <span className="text-[10px] font-medium text-gray-400">{lvl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nhận xét mẫu */}
          <div>
            <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <Sparkles size={15} className="text-happy-yellow" /> Nhận xét mẫu (bấm để chọn)
            </label>
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {(SAMPLE_COMMENTS[formLevel] || []).map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setFormComment(sample)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-colors ${
                    formComment === sample
                      ? 'border-happy-blue bg-blue-50 text-gray-700'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200'
                  }`}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Nhận xét chi tiết */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Nhận xét</label>
            <textarea
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              rows={3}
              placeholder="Chọn nhận xét mẫu ở trên hoặc tự nhập nhận xét cho học sinh..."
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu đánh giá'}
            </button>
            {editing && evalMap[editing.id] && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
