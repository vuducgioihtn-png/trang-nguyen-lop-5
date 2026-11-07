import React, { useState, useEffect, useRef } from 'react';
import { Timer, Award, CheckCircle2, ArrowRight, ArrowLeft, Volume2, RotateCcw, AlertCircle, Sparkles, Trophy, FileText, ChevronRight, Play } from 'lucide-react';
import { MockExam, Question, UserStats } from '../types';
import { getAllExams } from '../utils/storageUtils';
import { speakEnglish, playCorrectSound, playWrongSound, triggerExamVictoryConfetti } from '../utils/audioUtils';

interface ExamArenaProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onOpenReviewModal: (exam: MockExam, userAnswers: Record<string, unknown>, score: number) => void;
  presetExamToStart?: MockExam | null;
}

export const ExamArena: React.FC<ExamArenaProps> = ({
  userStats,
  onUpdateStats,
  onOpenReviewModal,
  presetExamToStart,
}) => {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Exam runtime state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [userAnswers, setUserAnswers] = useState<Record<string, unknown>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    correctCount: number;
    durationSeconds: number;
    percentage: number;
    awardTitle: string;
  } | null>(null);

  // Drag/click rearrange state for active question
  const [rearrangedSegments, setRearrangedSegments] = useState<string[]>([]);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);

  // Matching state for active question
  const [selectedLeftMatch, setSelectedLeftMatch] = useState<string | null>(null);
  const [currentMatchingPairs, setCurrentMatchingPairs] = useState<Record<string, string>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load all exams (preset + AI generated)
  useEffect(() => {
    const list = getAllExams();
    setExams(list);
    if (presetExamToStart) {
      handleSelectExam(presetExamToStart);
    }
  }, [presetExamToStart]);

  // Handle timer countdown
  useEffect(() => {
    if (isExamStarted && !isSubmitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, isSubmitted, timeLeft]);

  // Initialize interactive state when changing questions
  const currentQ: Question | undefined = activeExam?.questions[currentQuestionIndex];

  useEffect(() => {
    if (!currentQ) return;

    if (currentQ.type === 'REARRANGE' && currentQ.segments) {
      const existing = (userAnswers[currentQ.id] as string[]) || [];
      if (existing.length > 0) {
        setRearrangedSegments(existing);
        setAvailableSegments(currentQ.segments.filter((s) => !existing.includes(s)));
      } else {
        const shuffled = [...currentQ.segments].sort(() => Math.random() - 0.5);
        setAvailableSegments(shuffled);
        setRearrangedSegments([]);
      }
    }

    if (currentQ.type === 'MATCHING') {
      const existing = (userAnswers[currentQ.id] as Record<string, string>) || {};
      setCurrentMatchingPairs(existing);
      setSelectedLeftMatch(null);
    }

    if (currentQ.type === 'LISTEN_CHOICE' && currentQ.audio_script) {
      speakEnglish(currentQ.audio_script);
    }
  }, [currentQuestionIndex, currentQ]);

  const handleSelectExam = (exam: MockExam) => {
    setActiveExam(exam);
    setIsExamStarted(true);
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(exam.durationMinutes * 60);
    setExamResult(null);
  };

  const handleSelectOption = (questionId: string, opt: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: opt,
    }));
  };

  // Rearrange helper
  const handleAddSegment = (seg: string, idx: number) => {
    if (!currentQ) return;
    const nextRearranged = [...rearrangedSegments, seg];
    const nextAvailable = availableSegments.filter((_, i) => i !== idx);
    setRearrangedSegments(nextRearranged);
    setAvailableSegments(nextAvailable);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: nextRearranged,
    }));
  };

  const handleRemoveSegment = (seg: string, idx: number) => {
    if (!currentQ) return;
    const nextAvailable = [...availableSegments, seg];
    const nextRearranged = rearrangedSegments.filter((_, i) => i !== idx);
    setAvailableSegments(nextAvailable);
    setRearrangedSegments(nextRearranged);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: nextRearranged,
    }));
  };

  // Matching helper
  const handleMatchingLeft = (leftItem: string) => {
    if (currentMatchingPairs[leftItem]) return;
    setSelectedLeftMatch(leftItem);
  };

  const handleMatchingRight = (rightItem: string) => {
    if (!selectedLeftMatch || !currentQ) return;
    const updated = { ...currentMatchingPairs, [selectedLeftMatch]: rightItem };
    setCurrentMatchingPairs(updated);
    setSelectedLeftMatch(null);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));
  };

  const handleResetMatching = () => {
    if (!currentQ) return;
    setCurrentMatchingPairs({});
    setSelectedLeftMatch(null);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {},
    }));
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    const totalQuestions = activeExam.questions.length;

    activeExam.questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans) return;

      if (q.type === 'FILL_BLANK' || q.type === 'LISTEN_CHOICE') {
        const strAns = String(ans).trim().toLowerCase();
        const correctStr = q.correct_answer.trim().toLowerCase();
        if (strAns === correctStr || strAns.startsWith(correctStr.charAt(0))) {
          correctCount++;
        }
      } else if (q.type === 'REARRANGE') {
        const sentence = (ans as string[]).join(' ').trim().toLowerCase();
        if (sentence === q.correct_answer.trim().toLowerCase()) {
          correctCount++;
        }
      } else if (q.type === 'MATCHING' && q.pairs) {
        const userMatches = ans as Record<string, string>;
        const matchedRight = q.pairs.filter((p) => userMatches[p.left] === p.right).length;
        if (matchedRight === q.pairs.length) {
          correctCount++;
        }
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const score = correctCount * 10;
    const totalPossible = totalQuestions * 10;
    const durationSpent = activeExam.durationMinutes * 60 - timeLeft;

    let awardTitle = 'Hoàng Giáp Khuyến Khích';
    if (percentage === 100) awardTitle = 'TRẠNG NGUYÊN TIẾNG ANH CẤP TỈNH (Thủ Khoa)';
    else if (percentage >= 85) awardTitle = 'BẢNG NHÃN CẤP TỈNH (Giải Nhất)';
    else if (percentage >= 70) awardTitle = 'THÁM HOA CẤP TỈNH (Giải Nhì)';
    else if (percentage >= 50) awardTitle = 'HOÀNG GIÁP (Giải Ba)';

    setExamResult({
      score,
      total: totalPossible,
      correctCount,
      durationSeconds: durationSpent,
      percentage,
      awardTitle,
    });

    setIsSubmitted(true);

    // Confetti celebration if passed
    if (percentage >= 60) {
      triggerExamVictoryConfetti();
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Update stats
    const updatedHistory = [
      {
        examId: activeExam.id,
        title: activeExam.title,
        score,
        total: totalPossible,
        percentage,
        durationSeconds: durationSpent,
        date: new Date().toLocaleDateString('vi-VN'),
      },
      ...userStats.examHistory,
    ];

    onUpdateStats({
      ...userStats,
      points: userStats.points + score + 20, // 20 bonus points for finishing an exam
      testsCompleted: userStats.testsCompleted + 1,
      examHistory: updatedHistory,
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If no exam started or exam completed, show list or results
  if (!isExamStarted || !activeExam) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-yellow-300 inline-block">
              Đấu Trường Thi Thử IOE & Trạng Nguyên
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Kho Đề Thi Chuẩn Cấp Tỉnh Khối 5
            </h1>
            <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
              Trải nghiệm phòng thi IOE với đồng hồ đếm ngược, phân bổ 4 dạng bài chuẩn xác, phát âm audio bản ngữ và giải thích chi tiết từng câu.
            </p>
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                    {exam.difficulty}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    {exam.durationMinutes} phút
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {exam.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    {exam.questions.length} câu hỏi
                  </span>
                  <span>•</span>
                  <span>4 Dạng bài chuẩn</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectExam(exam)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Vào Thi Ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RESULT SCREEN AFTER SUBMISSION
  if (isSubmitted && examResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
          {/* Header Trophy */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-amber-600">
              Kết Quả Bài Thi IOE & Trạng Nguyên
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {examResult.awardTitle}
            </h2>
            <p className="text-sm text-slate-500">{activeExam.title}</p>
          </div>

          {/* Scores Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase block">Điểm số</span>
              <span className="text-2xl font-black text-amber-600">
                {examResult.score}/{examResult.total}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase block">Đúng</span>
              <span className="text-2xl font-black text-emerald-600">
                {examResult.correctCount}/{activeExam.questions.length}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase block">Tỷ lệ đúng</span>
              <span className="text-2xl font-black text-blue-600">
                {examResult.percentage}%
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-400 font-bold uppercase block">Thời gian</span>
              <span className="text-2xl font-black text-purple-600">
                {formatTimer(examResult.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenReviewModal(activeExam, userAnswers, examResult.score)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Xem Lời Giải Chi Tiết Từng Câu
            </button>

            <button
              onClick={() => handleSelectExam(activeExam)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại bài thi
            </button>

            <button
              onClick={() => {
                setIsExamStarted(false);
                setActiveExam(null);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all"
            >
              Chọn đề thi khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAM SCREEN
  return (
    <div className="space-y-6">
      {/* Top bar with Countdown Timer, Title & Submit Button */}
      <div className="sticky top-18 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            {activeExam.title}
          </span>
          <h2 className="text-base font-extrabold text-slate-900">
            Câu {currentQuestionIndex + 1} / {activeExam.questions.length}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg sm:text-xl tracking-tight border ${
              timeLeft < 180
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <Timer className="w-5 h-5 text-amber-600" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Bạn đã làm ${Object.keys(userAnswers).length}/${activeExam.questions.length} câu. Bạn có chắc chắn muốn nộp bài thi ngay không?`
                )
              ) {
                handleSubmitExam();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-600/20 transition-colors"
          >
            Nộp Bài Thi
          </button>
        </div>
      </div>

      {/* Main Content: Question Card + Right Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Active Question Renderer */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {currentQ ? (
            <div className="space-y-6">
              {/* Question header info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Dạng bài: {currentQ.type} • {currentQ.unit}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ID: {currentQ.id}
                </span>
              </div>

              {/* Question text */}
              <div className="space-y-4">
                <p className="text-lg font-bold text-slate-800 leading-relaxed">
                  {currentQ.question_text}
                </p>

                {/* Audio Player if Listen Choice */}
                {currentQ.type === 'LISTEN_CHOICE' && currentQ.audio_script && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase block">
                          Bấm loa nghe người bản ngữ đọc câu
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          Nghe kỹ để chọn 1 trong 4 đáp án A, B, C, D
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakEnglish(currentQ.audio_script!)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Phát âm thanh
                    </button>
                  </div>
                )}
              </div>

              {/* RENDER BY QUESTION TYPE */}

              {/* 1. FILL_BLANK & LISTEN_CHOICE Options */}
              {(currentQ.type === 'FILL_BLANK' || currentQ.type === 'LISTEN_CHOICE') &&
                currentQ.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = userAnswers[currentQ.id] === opt;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt)}
                          className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-amber-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              {/* 2. REARRANGE Words */}
              {currentQ.type === 'REARRANGE' && (
                <div className="space-y-4 pt-2">
                  <div className="min-h-[75px] p-4 bg-slate-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-wrap gap-2 items-center">
                    {rearrangedSegments.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        Nhấp các từ bên dưới theo thứ tự để ghép thành câu hoàn chỉnh...
                      </span>
                    ) : (
                      rearrangedSegments.map((seg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleRemoveSegment(seg, i)}
                          className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-red-500 transition-colors"
                          title="Gỡ từ này"
                        >
                          {seg}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Mảnh từ vựng cho trước:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableSegments.map((seg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddSegment(seg, i)}
                          className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 rounded-xl text-sm font-bold hover:bg-amber-50 hover:border-amber-400 transition-all shadow-xs"
                        >
                          {seg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MATCHING Pairs */}
              {currentQ.type === 'MATCHING' && currentQ.pairs && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500 italic">
                    (Nhấp 1 ô tiếng Anh bên trái, sau đó nhấp ô tiếng Việt bên phải để nối cặp)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cột Tiếng Anh (A)
                      </div>
                      {currentQ.pairs.map((p, idx) => {
                        const isSelected = selectedLeftMatch === p.left;
                        const isPaired = Boolean(currentMatchingPairs[p.left]);

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleMatchingLeft(p.left)}
                            className={`w-full p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                              isPaired
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                : isSelected
                                ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {p.left} {isPaired && `➔ ${currentMatchingPairs[p.left]}`}
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Cột Tiếng Việt (B)
                      </div>
                      {currentQ.pairs.map((p, idx) => {
                        const isUsed = Object.values(currentMatchingPairs).includes(p.right);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleMatchingRight(p.right)}
                            disabled={isUsed}
                            className={`w-full p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                              isUsed
                                ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300'
                            }`}
                          >
                            {p.right}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {Object.keys(currentMatchingPairs).length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetMatching}
                      className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Nối lại từ đầu
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Nav: Câu trước / Câu sau */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs sm:text-sm font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Câu trước
                </button>

                <button
                  type="button"
                  disabled={currentQuestionIndex === activeExam.questions.length - 1}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-colors"
                >
                  Câu tiếp theo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right 1 col: Question Palette Navigator */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800">
              Bảng Câu Hỏi
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              Đã làm: {Object.keys(userAnswers).length}/{activeExam.questions.length}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {activeExam.questions.map((q, idx) => {
              const hasAnswer = Boolean(userAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;

              let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200';
              if (hasAnswer) {
                btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-600 shadow-xs';
              }
              if (isCurrent) {
                btnStyle = 'ring-2 ring-amber-500 ring-offset-2 ' + btnStyle;
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span>
              <span>Đã hoàn thành</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300"></span>
              <span>Chưa trả lời</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
