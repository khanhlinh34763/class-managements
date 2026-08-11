import React, { useState } from 'react';
import {
  Plus, Trash2, FileQuestion, CheckCircle2, GraduationCap, ListChecks, Award,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { fireBigConfetti } from '../../utils/confetti';
import { playSuccessSound } from '../../utils/sound';

const EMPTY_QUESTION = () => ({ question: '', options: ['', '', '', ''], correctIndex: 0 });

function TeacherView() {
  const { quizzes, addQuiz, deleteQuiz, quizResults } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
  const [deletingQuiz, setDeletingQuiz] = useState(null);
  const [viewingResultsQuiz, setViewingResultsQuiz] = useState(null);

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[oIndex] = value;
      return { ...q, options: newOptions };
    }));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, EMPTY_QUESTION()]);
  const removeQuestion = (index) => setQuestions((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle('');
    setQuestions([EMPTY_QUESTION()]);
  };

  const handleSubmit = async () => {
    const validQuestions = questions.filter((q) => q.question.trim() && q.options.every((o) => o.trim()));
    if (!title.trim() || validQuestions.length === 0) return;
    await addQuiz({ title: title.trim(), questions: validQuestions });
    resetForm();
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
          <FileQuestion size={20} className="text-happy-blue" /> Danh sách bài trắc nghiệm
        </h3>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-happy-blue text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600"
        >
          <Plus size={16} /> Tạo bài mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const results = quizResults.filter((r) => r.quizId === quiz.id);
          return (
            <Card key={quiz.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-700">{quiz.title}</p>
                  <p className="text-sm text-gray-400">{quiz.questions.length} câu hỏi • {results.length} lượt làm</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingQuiz(quiz)}
                  className="p-2 rounded-full bg-red-50 text-red-400 hover:bg-red-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setViewingResultsQuiz(quiz)}
                className="text-sm font-semibold text-happy-blue hover:underline text-left"
              >
                Xem kết quả ({results.length})
              </button>
            </Card>
          );
        })}
        {quizzes.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">Chưa có bài trắc nghiệm nào</p>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo bài trắc nghiệm mới" maxWidth="max-w-2xl">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-600">Tên bài trắc nghiệm</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kiểm tra 15 phút - Toán"
              className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
            />
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 rounded-2xl bg-blue-50/50 border-2 border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-happy-blue">Câu {qIndex + 1}</p>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="Nhập nội dung câu hỏi"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                      className={`w-8 h-8 shrink-0 rounded-full font-bold text-sm flex items-center justify-center ${
                        q.correctIndex === oIndex ? 'bg-happy-green text-white' : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {String.fromCharCode(65 + oIndex)}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Bấm vào chữ cái để chọn đáp án đúng</p>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-happy-blue text-happy-blue font-semibold hover:bg-blue-50"
          >
            + Thêm câu hỏi
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600"
          >
            Lưu bài trắc nghiệm
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!viewingResultsQuiz} onClose={() => setViewingResultsQuiz(null)} title={`Kết quả: ${viewingResultsQuiz?.title || ''}`}>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {quizResults.filter((r) => r.quizId === viewingResultsQuiz?.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <span className="font-semibold text-gray-700">{result.studentName}</span>
                <span className="font-bold text-happy-blue">{result.score}/{result.total}</span>
              </div>
            ))}
          {quizResults.filter((r) => r.quizId === viewingResultsQuiz?.id).length === 0 && (
            <p className="text-center text-gray-400 py-6">Chưa có học sinh nào làm bài</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingQuiz}
        onClose={() => setDeletingQuiz(null)}
        onConfirm={() => deletingQuiz && deleteQuiz(deletingQuiz.id)}
        title="Xoá bài trắc nghiệm"
        message={`Bạn có chắc muốn xoá bài "${deletingQuiz?.title}" không?`}
        confirmText="Xoá"
        danger
      />
    </div>
  );
}

function StudentView() {
  const { quizzes, submitQuizResult } = useAppData();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
    if (!studentName.trim() || !selectedQuiz) return;
    let correctCount = 0;
    selectedQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) correctCount += 1;
    });
    setScore(correctCount);
    setSubmitted(true);
    await submitQuizResult(selectedQuiz.id, studentName.trim(), correctCount, selectedQuiz.questions.length, answers);
    if (correctCount === selectedQuiz.questions.length) {
      fireBigConfetti();
    }
    playSuccessSound();
  };

  if (!selectedQuiz) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-700">{quiz.title}</p>
              <p className="text-sm text-gray-400">{quiz.questions.length} câu hỏi</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectQuiz(quiz)}
              className="flex items-center gap-2 bg-happy-blue text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-600"
            >
              <ListChecks size={16} /> Làm bài
            </button>
          </Card>
        ))}
        {quizzes.length === 0 && (
          <p className="text-gray-400 col-span-full text-center py-10">Cô giáo chưa tạo bài trắc nghiệm nào</p>
        )}
      </div>
    );
  }

  if (submitted) {
    const percent = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <Award size={56} className={percent >= 80 ? 'text-happy-yellow' : percent >= 50 ? 'text-happy-blue' : 'text-gray-400'} />
        <h3 className="text-2xl font-extrabold text-gray-700">Hoàn thành bài làm!</h3>
        <p className="text-gray-500">{studentName} đã trả lời đúng</p>
        <p className="text-5xl font-extrabold text-happy-blue">{score}/{selectedQuiz.questions.length}</p>
        <p className="text-gray-400">({percent}%)</p>
        <button
          type="button"
          onClick={() => setSelectedQuiz(null)}
          className="mt-4 px-6 py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600"
        >
          Quay lại danh sách
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <label className="text-sm font-semibold text-gray-600">Họ và tên học sinh</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Nhập tên của em"
          className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-happy-blue outline-none"
        />
      </Card>

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
                    ? 'border-happy-blue bg-blue-50 text-happy-blue'
                    : 'border-gray-100 hover:border-blue-200'
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
        disabled={!studentName.trim() || Object.keys(answers).length < selectedQuiz.questions.length}
        className="w-full py-3.5 bg-happy-green text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={20} /> Nộp bài
      </button>
    </div>
  );
}

export default function QuizTab() {
  const [mode, setMode] = useState('teacher');

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('teacher')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm ${mode === 'teacher' ? 'bg-happy-blue text-white' : 'bg-white text-gray-500'}`}
        >
          <FileQuestion size={16} /> Chế độ Giáo viên
        </button>
        <button
          type="button"
          onClick={() => setMode('student')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm ${mode === 'student' ? 'bg-happy-green text-white' : 'bg-white text-gray-500'}`}
        >
          <GraduationCap size={16} /> Chế độ Học sinh
        </button>
      </div>
      {mode === 'teacher' ? <TeacherView /> : <StudentView />}
    </div>
  );
}