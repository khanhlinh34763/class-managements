import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, GraduationCap, ListChecks, CheckCircle2, Award, LogOut, LogIn,
} from 'lucide-react';
import { subscribe, saveItem } from '../../services/storage';
import { generateId } from '../../utils/helpers';
import { hashPassword } from '../../utils/auth';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { fireBigConfetti } from '../../utils/confetti';
import { playSuccessSound } from '../../utils/sound';
import FloatingStickers from '../common/FloatingStickers';
import ClassActivityFeed from '../common/ClassActivityFeed';

const SESSION_KEY = 'studentSessionId';

export default function StudentPortal({ onBack }) {
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [restored, setRestored] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubStudents = subscribe('students', setStudents);
    const unsubQuizzes = subscribe('quizzes', setQuizzes);
    return () => {
      unsubStudents && unsubStudents();
      unsubQuizzes && unsubQuizzes();
    };
  }, []);

  useEffect(() => {
    if (restored || students.length === 0) return;
    const savedId = localStorage.getItem(SESSION_KEY);
    if (savedId) {
      const found = students.find((s) => s.id === savedId);
      if (found) setSelectedStudent(found);
    }
    setRestored(true);
  }, [students, restored]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const uname = username.trim().toLowerCase();
    if (!uname || !password) return;
    setLoggingIn(true);
    const found = students.find((s) => s.username && s.username.toLowerCase() === uname);
    if (!found) {
      setLoginError('Tên đăng nhập không tồn tại.');
      setLoggingIn(false);
      return;
    }
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) {
      setLoginError('Sai mật khẩu. Hãy thử lại.');
      setLoggingIn(false);
      return;
    }
    localStorage.setItem(SESSION_KEY, found.id);
    setSelectedStudent(found);
    setUsername('');
    setPassword('');
    setLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSelectedStudent(null);
    onBack();
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedQuiz) return;
    setSubmitting(true);
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) correctCount += 1;
    });
    const id = generateId('qr');
    await saveItem('quizResults', id, {
      quizId: selectedQuiz.id,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      score: correctCount,
      total: selectedQuiz.questions.length,
      answers,
      date: new Date().toISOString(),
    });
    setScore(correctCount);
    setSubmitted(true);
    setSubmitting(false);
    if (correctCount === selectedQuiz.questions.length) {
      fireBigConfetti();
    }
    playSuccessSound();
  };

  if (!selectedStudent) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6 relative overflow-hidden">
        <FloatingStickers />
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="text-center space-y-2">
            <GraduationCap size={40} className="mx-auto text-happy-pink" />
            <h1 className="text-2xl font-extrabold text-gray-800">Đăng nhập học sinh</h1>
            <p className="text-gray-400">Nhập tên đăng nhập và mật khẩu cô giáo đã cấp cho em</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-3xl card-shadow p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vd: an123"
                autoComplete="username"
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full mt-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-happy-pink outline-none"
              />
            </div>
            {loginError && <p className="text-sm text-red-500 font-medium">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-2 py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50"
            >
              <LogIn size={18} /> {loggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!selectedQuiz) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name={selectedStudent.name} src={selectedStudent.avatar} size="xl" />
            <p className="font-extrabold text-gray-800 text-lg">Chào {selectedStudent.name}!</p>
            <p className="text-gray-400">Trang chủ lớp học của em</p>
          </div>

          <ClassActivityFeed />

          <p className="font-bold text-gray-700">Bài trắc nghiệm</p>
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-700">{quiz.title}</p>
                  <p className="text-sm text-gray-400">{quiz.questions.length} câu hỏi</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectQuiz(quiz)}
                  className="flex items-center gap-2 bg-happy-pink text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-pink-600"
                >
                  <ListChecks size={16} /> Làm bài
                </button>
              </Card>
            ))}
            {quizzes.length === 0 && (
              <p className="text-center text-gray-400 py-10">Cô giáo chưa tạo bài trắc nghiệm nào</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percent = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6">
        <Card className="max-w-sm w-full flex flex-col items-center gap-4 py-12 text-center">
          <Award size={56} className={percent >= 80 ? 'text-happy-yellow' : percent >= 50 ? 'text-happy-pink' : 'text-gray-400'} />
          <h3 className="text-2xl font-extrabold text-gray-700">Hoàn thành bài làm!</h3>
          <p className="text-gray-500">{selectedStudent.name} đã trả lời đúng</p>
          <p className="text-5xl font-extrabold text-happy-pink">{score}/{selectedQuiz.questions.length}</p>
          <p className="text-gray-400">({percent}%)</p>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setSelectedQuiz(null)}
              className="px-5 py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600"
            >
              Bài khác
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200"
            >
              Thoát
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-700">{selectedQuiz.title}</p>
          <button
            type="button"
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft size={16} /> Chọn bài khác
          </button>
        </div>

        {selectedQuiz.questions.map((q, qIndex) => (
          <Card key={qIndex}>
            <p className="font-bold text-gray-700 mb-3">Câu {qIndex + 1}: {q.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oIndex) => (
                <button
                  key={oIndex}
                  type="button"
                  onClick={() => handleAnswer(qIndex, oIndex)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-left transition-colors ${
                    answers[qIndex] === oIndex
                      ? 'border-happy-pink bg-pink-50 text-happy-pink'
                      : 'border-gray-100 hover:border-pink-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < selectedQuiz.questions.length}
          className="w-full py-3.5 bg-happy-green text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} /> {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
        </button>
      </div>
    </div>
  );
}