import React, { useState } from 'react';
import {
  Plus, Trash2, FileQuestion, ListChecks, CheckCircle2, BookOpen,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import QuizRunner from '../quiz/QuizRunner';
import { sanitizeRichHtml } from '../../utils/helpers';

const EMPTY_QUESTION = () => ({ type: 'mc', question: '', options: ['', '', '', ''], correctIndex: 0 });
const EMPTY_ESSAY = () => ({ type: 'essay', question: '' });

// Giao diện cho học sinh: chỉ xem các bài kiểm tra đang mở và bấm vào để làm
function StudentQuizView({ currentStudent }) {
  const { quizzes, quizResults } = useAppData();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  if (selectedQuiz) {
    return (
      <QuizRunner
        quiz={selectedQuiz}
        currentStudent={currentStudent}
        onBack={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
        <BookOpen size={20} className="text-happy-blue" /> Bài kiểm tra đang mở
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const done = quizResults.some(
            (r) => r.quizId === quiz.id && r.studentId === currentStudent?.id,
          );
          return (
            <Card key={quiz.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-700 truncate">{quiz.title}</p>
                <p className="text-sm text-gray-400">
                  {quiz.questions.length} câu hỏi
                  {done && <span className="text-happy-green font-semibold"> • Đã làm ✓</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuiz(quiz)}
                className="flex items-center gap-2 bg-happy-pink text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-pink-600 shrink-0"
              >
                <ListChecks size={16} /> {done ? 'Làm lại' : 'Làm bài'}
              </button>
            </Card>
          );
        })}
        {quizzes.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-14 text-gray-400">
            <FileQuestion size={40} className="text-blue-200" />
            <p>Cô giáo chưa tạo bài trắc nghiệm nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizTab({ role = 'admin', currentStudent = null }) {
  const { quizzes, addQuiz, deleteQuiz, quizResults } = useAppData();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
  const [deletingQuiz, setDeletingQuiz] = useState(null);
  const [viewingResultsQuiz, setViewingResultsQuiz] = useState(null);
  const [expandedResultId, setExpandedResultId] = useState(null);

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
  const addEssayQuestion = () => setQuestions((prev) => [...prev, EMPTY_ESSAY()]);
  const removeQuestion = (index) => setQuestions((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle('');
    setQuestions([EMPTY_QUESTION()]);
  };

  const handleSubmit = async () => {
    const validQuestions = questions.filter((q) => {
      if (!q.question.trim()) return false;
      if (q.type === 'essay') return true;
      return q.options.every((o) => o.trim());
    });
    if (!title.trim() || validQuestions.length === 0) return;
    // Chuẩn hoá dữ liệu lưu: câu tự luận không có đáp án
    const normalized = validQuestions.map((q) => (q.type === 'essay'
      ? { type: 'essay', question: q.question.trim() }
      : {
        type: 'mc', question: q.question.trim(), options: q.options, correctIndex: q.correctIndex,
      }));
    await addQuiz({ title: title.trim(), questions: normalized });
    resetForm();
    setShowCreate(false);
  };

  // Học sinh chỉ thấy danh sách bài đang mở để làm, không xem/tạo/xoá được
  if (role === 'student') {
    return <StudentQuizView currentStudent={currentStudent} />;
  }

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
            <div key={qIndex} className="p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-happy-pink">
                  Câu {qIndex + 1}
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle ${q.type === 'essay' ? 'bg-purple-100 text-happy-purple' : 'bg-blue-100 text-happy-blue'}`}>
                    {q.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
                  </span>
                </p>
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
              {q.type === 'essay' ? (
                <p className="text-xs text-gray-400">
                  Câu tự luận: học sinh sẽ tự nhập câu trả lời bằng ô soạn thảo có định dạng.
                </p>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={addQuestion}
              className="py-2.5 rounded-xl border-2 border-dashed border-happy-blue text-happy-blue font-semibold hover:bg-blue-50"
            >
              + Câu trắc nghiệm
            </button>
            <button
              type="button"
              onClick={addEssayQuestion}
              className="py-2.5 rounded-xl border-2 border-dashed border-happy-purple text-happy-purple font-semibold hover:bg-purple-50"
            >
              + Câu tự luận
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-happy-blue text-white rounded-xl font-bold hover:bg-blue-600"
          >
            Lưu bài trắc nghiệm
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!viewingResultsQuiz} onClose={() => { setViewingResultsQuiz(null); setExpandedResultId(null); }} title={`Kết quả: ${viewingResultsQuiz?.title || ''}`}>
        <div className="space-y-2 max-h-[28rem] overflow-y-auto">
          {(() => {
            const essayQuestions = (viewingResultsQuiz?.questions || [])
              .map((q, idx) => ({ q, idx }))
              .filter(({ q }) => q.type === 'essay');
            const hasEssay = essayQuestions.length > 0;
            return quizResults.filter((r) => r.quizId === viewingResultsQuiz?.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((result) => {
                const expanded = expandedResultId === result.id;
                return (
                  <div key={result.id} className="rounded-xl bg-gray-50 overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <span className="font-semibold text-gray-700">{result.studentName}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-happy-blue">
                          {result.total > 0 ? `${result.score}/${result.total}` : 'Tự luận'}
                        </span>
                        {hasEssay && (
                          <button
                            type="button"
                            onClick={() => setExpandedResultId(expanded ? null : result.id)}
                            className="text-xs font-semibold text-happy-purple hover:underline"
                          >
                            {expanded ? 'Ẩn bài' : 'Xem bài tự luận'}
                          </button>
                        )}
                      </div>
                    </div>
                    {expanded && hasEssay && (
                      <div className="px-3 pb-3 space-y-3">
                        {essayQuestions.map(({ q, idx }) => (
                          <div key={idx} className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-sm font-semibold text-gray-600 mb-1">Câu {idx + 1}: {q.question}</p>
                            {result.answers && !['', undefined, null].includes(result.answers[idx]) ? (
                              // eslint-disable-next-line react/no-danger
                              <div className="rich-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(result.answers[idx]) }} />
                            ) : (
                              <p className="text-sm text-gray-400 italic">Học sinh chưa trả lời</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
          })()}
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