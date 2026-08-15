import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Award, Star, PenLine } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../common/Card';
import RichTextEditor from '../common/RichTextEditor';
import { fireBigConfetti } from '../../utils/confetti';
import { playSuccessSound } from '../../utils/sound';

const QUIZ_STAR_REWARD = 5;

// Bỏ thẻ HTML để kiểm tra câu tự luận đã có nội dung chưa
function isEmptyHtml(html) {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
}

export default function QuizRunner({ quiz, currentStudent, onBack }) {
  const {
    submitQuizResult, addEmulationPoint, quizResults,
  } = useAppData();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [mcTotal, setMcTotal] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const isEssay = (q) => q.type === 'essay';

  const handleChoose = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleEssay = (qIndex, html) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: html }));
  };

  const isAnswered = (q, index) => {
    if (isEssay(q)) return !isEmptyHtml(answers[index]);
    return typeof answers[index] === 'number';
  };

  const allAnswered = quiz.questions.every((q, i) => isAnswered(q, i));

  const handleSubmit = async () => {
    if (!currentStudent || submitting) return;
    setSubmitting(true);

    let correctCount = 0;
    let mcCount = 0;
    quiz.questions.forEach((q, index) => {
      if (isEssay(q)) return;
      mcCount += 1;
      if (answers[index] === q.correctIndex) correctCount += 1;
    });

    await submitQuizResult({
      quizId: quiz.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      score: correctCount,
      total: mcCount,
      answers,
    });

    // Cộng 5 sao thi đua cho lần đầu hoàn thành mỗi bài
    const alreadyDone = quizResults.some(
      (r) => r.quizId === quiz.id && r.studentId === currentStudent.id,
    );
    if (!alreadyDone) {
      await addEmulationPoint(
        currentStudent.id,
        QUIZ_STAR_REWARD,
        `Hoàn thành bài trắc nghiệm: ${quiz.title}`,
        'quiz',
      );
    }
    setEarnedStars(alreadyDone ? 0 : QUIZ_STAR_REWARD);

    setScore(correctCount);
    setMcTotal(mcCount);
    setSubmitted(true);
    setSubmitting(false);
    if (mcCount > 0 && correctCount === mcCount) {
      fireBigConfetti();
    }
    playSuccessSound();
  };

  if (submitted) {
    const percent = mcTotal > 0 ? Math.round((score / mcTotal) * 100) : 0;
    return (
      <Card className="max-w-md mx-auto flex flex-col items-center gap-4 py-12 text-center">
        <Award size={56} className={mcTotal === 0 ? 'text-happy-pink' : percent >= 80 ? 'text-happy-yellow' : percent >= 50 ? 'text-happy-pink' : 'text-gray-400'} />
        <h3 className="text-2xl font-extrabold text-gray-700">Hoàn thành bài làm!</h3>
        {mcTotal > 0 ? (
          <>
            <p className="text-gray-500">{currentStudent.name} trả lời đúng phần trắc nghiệm</p>
            <p className="text-5xl font-extrabold text-happy-pink">{score}/{mcTotal}</p>
            <p className="text-gray-400">({percent}%)</p>
          </>
        ) : (
          <p className="text-gray-500">{currentStudent.name} đã nộp bài tự luận. Cô giáo sẽ xem và nhận xét nhé!</p>
        )}
        {earnedStars > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-600 font-bold px-4 py-2 rounded-2xl">
            <Star size={20} className="fill-happy-yellow text-happy-yellow" />
            +{earnedStars} sao thi đua!
          </div>
        )}
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-6 py-3 bg-happy-pink text-white rounded-xl font-bold hover:bg-pink-600"
        >
          Về danh sách bài
        </button>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <p className="font-bold text-gray-700">{quiz.title}</p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={16} /> Chọn bài khác
        </button>
      </div>

      {quiz.questions.map((q, qIndex) => (
        <Card key={qIndex}>
          <p className="font-bold text-gray-700 mb-3 flex items-start gap-2">
            <span>Câu {qIndex + 1}: {q.question}</span>
            {isEssay(q) && (
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-happy-purple flex items-center gap-1">
                <PenLine size={11} /> Tự luận
              </span>
            )}
          </p>

          {isEssay(q) ? (
            <RichTextEditor
              value={answers[qIndex] || ''}
              onChange={(html) => handleEssay(qIndex, html)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oIndex) => (
                <button
                  key={oIndex}
                  type="button"
                  onClick={() => handleChoose(qIndex, oIndex)}
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
          )}
        </Card>
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !allAnswered}
        className="w-full py-3.5 bg-happy-green text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={20} /> {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
      </button>
    </div>
  );
}
