import React, { useState, useEffect } from 'react';
import {
  Plus, Upload, Trash2, Pencil, Users as UsersIcon, Camera, ClipboardList, Shuffle, KeyRound, Copy, Check,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { parsePastedStudentList, resizeImageFile, todayISO, GROUP_COLORS } from '../../utils/helpers';
import { hashPassword, suggestUsername, generatePin } from '../../utils/auth';
const GROUPS = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];

export default function StudentsTab() {
  const {
    students, addStudent, addStudentsBulk, updateStudent, deleteStudent, setStudentAvatar,
    dutyState, assignDutyForDate, rerollDutyForDate,
  } = useAppData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [accountStudent, setAccountStudent] = useState(null);
  const [accountForm, setAccountForm] = useState({ username: '', password: '' });
  const [savedPassword, setSavedPassword] = useState(null);
  const [copied, setCopied] = useState(false);
  const [filterGroup, setFilterGroup] = useState('Tất cả');
  const [todayDuty, setTodayDuty] = useState(null);
  const [loadingDuty, setLoadingDuty] = useState(false);

  const [form, setForm] = useState({ name: '', group: 'Tổ 1', gender: 'Nam', avatar: '', username: '', password: '' });
  const [addError, setAddError] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);

  const today = todayISO();

  useEffect(() => {
    let active = true;
    setLoadingDuty(true);
    assignDutyForDate(today).then((assigned) => {
      if (active) {
        setTodayDuty(assigned);
        setLoadingDuty(false);
      }
    });
    return () => { active = false; };
  }, [today, students.length]);

  const handleOpenAdd = () => {
    setForm({ name: '', group: 'Tổ 1', gender: 'Nam', avatar: '', username: '', password: generatePin() });
    setAddError('');
    setShowAddModal(true);
  };

  const handleSuggestUsernameForAdd = () => {
    const existing = students.map((s) => s.username).filter(Boolean);
    setForm((f) => ({ ...f, username: suggestUsername(f.name || 'hoc sinh', existing) }));
  };

  const handleGeneratePasswordForAdd = () => {
    setForm((f) => ({ ...f, password: generatePin() }));
  };

    const handleAvatarPick = async (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 300, 0.75);
    callback(resized);
    };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!form.name.trim()) return;
    const username = form.username.trim().toLowerCase();
    if (!username) {
      setAddError('Hãy nhập tên đăng nhập cho học sinh.');
      return;
    }
    if (!form.password.trim()) {
      setAddError('Hãy đặt mật khẩu cho học sinh.');
      return;
    }
    const duplicate = students.some((s) => s.username?.toLowerCase() === username);
    if (duplicate) {
      setAddError('Tên đăng nhập này đã được dùng cho học sinh khác. Hãy chọn tên khác.');
      return;
    }
    const passwordHash = await hashPassword(form.password.trim());
    const id = await addStudent({
      name: form.name.trim(), group: form.group, gender: form.gender, username, passwordHash,
    });
    if (form.avatar) {
      await setStudentAvatar(id, form.avatar);
    }
    setShowAddModal(false);
    setAccountStudent({ id, name: form.name.trim() });
    setAccountForm({ username, password: form.password.trim() });
    setSavedPassword(form.password.trim());
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({ name: student.name, group: student.group, gender: student.gender, avatar: student.avatar });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    await updateStudent(editingStudent.id, { name: form.name.trim(), group: form.group, gender: form.gender });
    if (form.avatar && form.avatar !== editingStudent.avatar) {
      await setStudentAvatar(editingStudent.id, form.avatar);
    }
    setEditingStudent(null);
  };

  const handleBulkTextChange = (value) => {
    setBulkText(value);
    setBulkPreview(parsePastedStudentList(value));
  };

  const handleSubmitBulk = async () => {
    if (bulkPreview.length === 0) return;
    await addStudentsBulk(bulkPreview, students.length);
    setBulkText('');
    setBulkPreview([]);
    setShowBulkModal(false);
  };

  const handleReroll = async () => {
    setLoadingDuty(true);
    const assigned = await rerollDutyForDate(today);
    setTodayDuty(assigned);
    setLoadingDuty(false);
  };

  const handleOpenAccount = (student) => {
    setAccountStudent(student);
    setAccountForm({ username: student.username || '', password: '' });
    setSavedPassword(null);
    setCopied(false);
  };

  const handleSuggestUsername = () => {
    if (!accountStudent) return;
    const existing = students.filter((s) => s.id !== accountStudent.id).map((s) => s.username).filter(Boolean);
    setAccountForm((f) => ({ ...f, username: suggestUsername(accountStudent.name, existing) }));
  };

  const handleGeneratePassword = () => {
    setAccountForm((f) => ({ ...f, password: generatePin() }));
  };

  const handleSaveAccount = async () => {
    if (!accountStudent || !accountForm.username.trim()) return;
    const username = accountForm.username.trim().toLowerCase();
    const duplicate = students.some((s) => s.id !== accountStudent.id && s.username?.toLowerCase() === username);
    if (duplicate) {
      alert('Tên đăng nhập này đã được dùng cho học sinh khác. Hãy chọn tên khác.');
      return;
    }
    if (!accountStudent.passwordHash && !accountForm.password.trim()) {
      alert('Hãy đặt mật khẩu cho tài khoản mới này.');
      return;
    }
    const update = { username };
    if (accountForm.password.trim()) {
      update.passwordHash = await hashPassword(accountForm.password.trim());
    }
    await updateStudent(accountStudent.id, update);
    if (accountForm.password.trim()) {
      setSavedPassword(accountForm.password.trim());
    } else {
      setAccountStudent(null);
    }
  };

  const handleCopyAccountInfo = async () => {
    if (!accountStudent || !savedPassword) return;
    const text = `Tên đăng nhập: ${accountForm.username}\nMật khẩu: ${savedPassword}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  const filteredStudents = filterGroup === 'Tất cả'
    ? students
    : students.filter((s) => s.group === filterGroup);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-happy-green to-green-400 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={22} />
            <h3 className="font-bold text-lg">Trực nhật hôm nay</h3>
          </div>
          <button
            type="button"
            onClick={handleReroll}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            <Shuffle size={16} /> Random lại
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {loadingDuty && <p className="text-white/80">Đang tạo phân công...</p>}
          {!loadingDuty && todayDuty && todayDuty.length === 0 && (
            <p className="text-white/80">Lớp chưa có học sinh để phân công</p>
          )}
          {!loadingDuty && todayDuty && todayDuty.map((sid) => {
            const s = students.find((st) => st.id === sid);
            if (!s) return null;
            return (
              <div key={sid} className="flex items-center gap-2 bg-white/20 rounded-full pl-1 pr-4 py-1">
                <Avatar name={s.name} src={s.avatar} size="sm" />
                <span className="font-semibold text-sm">{s.name}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-white/70 mt-3">
          Chu kỳ hiện tại: #{dutyState.cycleNumber || 1} • Còn {dutyState.queue?.length || 0} bạn chưa trực trong chu kỳ này
        </p>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterGroup('Tất cả')}
            className={`px-4 py-2 rounded-full font-semibold text-sm ${filterGroup === 'Tất cả' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500'}`}
          >
            Tất cả ({students.length})
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setFilterGroup(g)}
              className={`px-4 py-2 rounded-full font-semibold text-sm ${filterGroup === g ? `${GROUP_COLORS[g].bg} text-white` : 'bg-white text-gray-500'}`}
            >
              {g} ({students.filter((s) => s.group === g).length})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-white border-2 border-happy-blue text-happy-blue px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50"
          >
            <Upload size={16} /> Nhập hàng loạt
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-happy-blue text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600"
          >
            <Plus size={16} /> Thêm học sinh
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <Card className="text-center py-12 text-gray-400">
          <UsersIcon size={40} className="mx-auto mb-3 opacity-40" />
          Chưa có học sinh nào. Hãy thêm mới hoặc nhập hàng loạt!
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="flex flex-col items-center text-center gap-2 relative group">
            <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${GROUP_COLORS[student.group]?.light}`}>
              {student.group}
            </div>
            <div className="flex gap-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleOpenAccount(student)}
                className="p-1.5 bg-happy-pink/20 text-happy-pink rounded-full hover:bg-happy-pink/30"
                title="Tài khoản đăng nhập"
              >
                <KeyRound size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(student)}
                className="p-1.5 bg-blue-100 text-happy-blue rounded-full hover:bg-blue-200"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => setDeletingStudent(student)}
                className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <Avatar name={student.name} src={student.avatar} size="lg" className="mt-6" />
            <p className="font-bold text-gray-700 mt-1">{student.name}</p>
            <p className="text-xs text-gray-400">
              {student.username ? `🔑 ${student.username}` : 'Chưa có tài khoản'}
            </p>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Thêm học sinh mới">
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <Avatar name={form.name || '?'} src={form.avatar} size="xl" />
              <div className="absolute bottom-0 right-0 bg-happy-blue text-white p-2 rounded-full">
                <Camera size={14} />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarPick(e, (b64) => setForm((f) => ({ ...f, avatar: b64 })))}
              />
            </label>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Họ và tên</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tổ</label>
              <select
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              >
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <p className="text-sm font-bold text-happy-pink">Tài khoản đăng nhập cho học sinh</p>
            <div>
              <label className="text-sm font-semibold text-gray-600">Tên đăng nhập</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="vd: an123"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
                />
                <button
                  type="button"
                  onClick={handleSuggestUsernameForAdd}
                  className="px-3 rounded-xl bg-pink-50 text-happy-pink font-semibold text-sm hover:bg-pink-100 whitespace-nowrap"
                >
                  Gợi ý
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Mật khẩu</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mật khẩu"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleGeneratePasswordForAdd}
                  className="px-3 rounded-xl bg-pink-50 text-happy-pink font-semibold text-sm hover:bg-pink-100 whitespace-nowrap"
                >
                  Tạo mã
                </button>
              </div>
            </div>
          </div>

          {addError && <p className="text-sm text-red-500 font-medium">{addError}</p>}
          <button type="submit" className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600">
            Thêm học sinh
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!editingStudent} onClose={() => setEditingStudent(null)} title="Chỉnh sửa học sinh">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="flex justify-center">
            <label className="relative cursor-pointer">
              <Avatar name={form.name || '?'} src={form.avatar} size="xl" />
              <div className="absolute bottom-0 right-0 bg-happy-blue text-white p-2 rounded-full">
                <Camera size={14} />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarPick(e, (b64) => setForm((f) => ({ ...f, avatar: b64 })))}
              />
            </label>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Họ và tên</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tổ</label>
              <select
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              >
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600">
            Lưu thay đổi
          </button>
        </form>
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Nhập danh sách hàng loạt" maxWidth="max-w-xl">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Dán danh sách học sinh, mỗi em một dòng. Hệ thống tự động loại bỏ số thứ tự dạng "1.", "2)", "3-" ở đầu dòng.
          </p>
          <textarea
            rows={8}
            value={bulkText}
            onChange={(e) => handleBulkTextChange(e.target.value)}
            placeholder={'1. Nguyễn Văn An\n2) Trần Thị Bích\n3. Lê Văn Cường'}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none font-mono text-sm"
          />
          {bulkPreview.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Xem trước ({bulkPreview.length} học sinh):
              </p>
              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-2">
                {bulkPreview.map((name, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-happy-blue rounded-full text-sm font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmitBulk}
            disabled={bulkPreview.length === 0}
            className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-40"
          >
            Nhập {bulkPreview.length} học sinh vào lớp
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!accountStudent}
        onClose={() => setAccountStudent(null)}
        title={`Tài khoản đăng nhập: ${accountStudent?.name || ''}`}
      >
        {savedPassword ? (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check size={28} className="text-happy-green" />
            </div>
            <p className="text-gray-600">Đã lưu tài khoản! Hãy ghi lại thông tin dưới đây để cung cấp cho học sinh — hệ thống sẽ không hiển thị lại mật khẩu này.</p>
            <div className="bg-pink-50 rounded-2xl p-4 text-left space-y-1">
              <p className="font-semibold text-gray-700">Tên đăng nhập: <span className="font-mono">{accountForm.username}</span></p>
              <p className="font-semibold text-gray-700">Mật khẩu: <span className="font-mono">{savedPassword}</span></p>
            </div>
            <button
              type="button"
              onClick={handleCopyAccountInfo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Đã sao chép' : 'Sao chép thông tin'}
            </button>
            <button
              type="button"
              onClick={() => setAccountStudent(null)}
              className="w-full py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600"
            >
              Xong
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tên đăng nhập</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="vd: an123"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
                />
                <button
                  type="button"
                  onClick={handleSuggestUsername}
                  className="px-3 rounded-xl bg-pink-50 text-happy-pink font-semibold text-sm hover:bg-pink-100 whitespace-nowrap"
                >
                  Gợi ý
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">
                {accountStudent?.passwordHash ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'}
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={accountForm.password}
                  onChange={(e) => setAccountForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mật khẩu"
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="px-3 rounded-xl bg-pink-50 text-happy-pink font-semibold text-sm hover:bg-pink-100 whitespace-nowrap"
                >
                  Tạo mã
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveAccount}
              disabled={!accountForm.username.trim()}
              className="w-full py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-40"
            >
              Lưu tài khoản
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={() => deletingStudent && deleteStudent(deletingStudent.id)}
        title="Xoá học sinh"
        message={`Bạn có chắc muốn xoá học sinh "${deletingStudent?.name}" khỏi lớp không?`}
        confirmText="Xoá"
        danger
      />
    </div>
  );
}