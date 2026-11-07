import React from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Volume2 } from 'lucide-react';
import { MockExam } from '../types';
import { speakEnglish } from '../utils/audioUtils';

interface ExamReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: MockExam | null;
  userAnswers: Record<string, unknown>;
  score: number;
}

export const ExamReviewModal: React.FC<ExamReviewModalProps> = ({
  isOpen,
  onClose,
  exam,
  userAnswers,
  score,
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Chi Tiết Bài Thi & Lời Giải Chuyên Gia
            </div>
            <h2 className="text-xl font-black">{exam.title}</h2>
            <div className="text-xs text-slate-300 mt-1">
              Điểm đạt được: <span className="text-amber-400 font-bold">{score}</span> / {exam.questions.length * 10} điểm
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Questions list */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {exam.questions.map((q, idx) => {
            const rawAns = userAnswers[q.id];
            let isCorrect = false;

            if (q.type === 'FILL_BLANK' || q.type === 'LISTEN_CHOICE') {
              const strAns = String(rawAns || '').trim().toLowerCase();
              const correctStr = q.correct_answer.trim().toLowerCase();
              isCorrect = strAns === correctStr || strAns.startsWith(correctStr.charAt(0));
            } else if (q.type === 'REARRANGE') {
              const sentence = ((rawAns as string[]) || []).join(' ').trim().toLowerCase();
              isCorrect = sentence === q.correct_answer.trim().toLowerCase();
            } else if (q.type === 'MATCHING' && q.pairs) {
              const userMatches = (rawAns as Record<string, string>) || {};
              const matchedRight = q.pairs.filter((p) => userMatches[p.left] === p.right).length;
              isCorrect = matchedRight === q.pairs.length;
            }

            return (
              <div key={q.id || idx} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                        isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {q.type} • {q.unit}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đúng (+10đ)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                      </>
                    )}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {q.question_text}
                </p>

                {/* Audio Script */}
                {q.type === 'LISTEN_CHOICE' && q.audio_script && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-emerald-900 font-medium italic">
                      🎧 Audio: "{q.audio_script}"
                    </span>
                    <button
                      onClick={() => speakEnglish(q.audio_script!)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg"
                      title="Nghe lại"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Answers comparison */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
                  <div>
                    <span className="font-semibold text-slate-500">Câu trả lời của em: </span>
                    <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                      {rawAns
                        ? Array.isArray(rawAns)
                          ? rawAns.join(' ')
                          : typeof rawAns === 'object'
                          ? JSON.stringify(rawAns)
                          : String(rawAns)
                        : '(Chưa trả lời)'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Đáp án chuẩn xác: </span>
                    <span className="text-emerald-800 font-bold">{q.correct_answer}</span>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Giải thích chi tiết:
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
