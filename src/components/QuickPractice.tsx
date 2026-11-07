import React, { useState } from 'react';
import { Volume2, CheckCircle2, XCircle, RotateCcw, Sparkles, HelpCircle, ArrowRight, Trophy } from 'lucide-react';
import { Question, QuestionType, UserStats } from '../types';
import { PRESET_MOCK_EXAMS } from '../data/presetExams';
import { speakEnglish, playCorrectSound, playWrongSound, triggerExamVictoryConfetti } from '../utils/audioUtils';

interface QuickPracticeProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onGoToArena: () => void;
}

export const QuickPractice: React.FC<QuickPracticeProps> = ({
  userStats,
  onUpdateStats,
  onGoToArena,
}) => {
  const [activeType, setActiveType] = useState<QuestionType>('FILL_BLANK');

  // Collect all questions of this type from all preset exams
  const questionsOfType = React.useMemo(() => {
    return PRESET_MOCK_EXAMS.flatMap((exam) => exam.questions).filter(
      (q) => q.type === activeType
    );
  }, [activeType]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion: Question | undefined = questionsOfType[currentIndex];

  // Specific state for question types
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [rearrangedTokens, setRearrangedTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  
  // Matching states
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});

  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset when question changes
  React.useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedLeft(null);
    setMatchedPairs({});

    if (currentQuestion?.type === 'REARRANGE' && currentQuestion.segments) {
      // Shuffle segments for display
      const shuffled = [...currentQuestion.segments].sort(() => Math.random() - 0.5);
      setAvailableTokens(shuffled);
      setRearrangedTokens([]);
    }

    if (currentQuestion?.type === 'LISTEN_CHOICE' && currentQuestion.audio_script) {
      speakEnglish(currentQuestion.audio_script);
    }
  }, [currentIndex, currentQuestion]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
  };

  const handleAddToken = (token: string, index: number) => {
    if (isAnswered) return;
    setRearrangedTokens([...rearrangedTokens, token]);
    setAvailableTokens(availableTokens.filter((_, i) => i !== index));
  };

  const handleRemoveToken = (token: string, index: number) => {
    if (isAnswered) return;
    setAvailableTokens([...availableTokens, token]);
    setRearrangedTokens(rearrangedTokens.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || isAnswered) return;

    let correct = false;

    if (currentQuestion.type === 'FILL_BLANK' || currentQuestion.type === 'LISTEN_CHOICE') {
      if (!selectedOption) return;
      correct = selectedOption.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase() ||
                selectedOption.startsWith(currentQuestion.correct_answer.charAt(0));
    } else if (currentQuestion.type === 'REARRANGE') {
      const sentence = rearrangedTokens.join(' ').trim();
      correct = sentence.toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase();
    } else if (currentQuestion.type === 'MATCHING' && currentQuestion.pairs) {
      const totalPairs = currentQuestion.pairs.length;
      const correctMatches = currentQuestion.pairs.filter(
        (p) => matchedPairs[p.left] === p.right
      ).length;
      correct = correctMatches === totalPairs;
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      playCorrectSound();
      onUpdateStats({
        ...userStats,
        points: userStats.points + 10,
      });
    } else {
      playWrongSound();
    }
  };

  const handleNext = () => {
    if (currentIndex < questionsOfType.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      triggerExamVictoryConfetti();
      setCurrentIndex(0);
    }
  };

  const handleMatchLeft = (item: string) => {
    if (isAnswered || matchedPairs[item]) return;
    setSelectedLeft(item);
  };

  const handleMatchRight = (item: string) => {
    if (isAnswered || !selectedLeft) return;
    const updated = { ...matchedPairs, [selectedLeft]: item };
    setMatchedPairs(updated);
    setSelectedLeft(null);

    // If all pairs matched, automatically check
    if (currentQuestion?.pairs && Object.keys(updated).length === currentQuestion.pairs.length) {
      playCorrectSound();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Type Selector Tabs */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <button
          onClick={() => {
            setActiveType('FILL_BLANK');
            setCurrentIndex(0);
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
            activeType === 'FILL_BLANK'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          1. Điền Khuyết (Fill)
        </button>

        <button
          onClick={() => {
            setActiveType('REARRANGE');
            setCurrentIndex(0);
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
            activeType === 'REARRANGE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          2. Sắp Xếp Câu (Order)
        </button>

        <button
          onClick={() => {
            setActiveType('LISTEN_CHOICE');
            setCurrentIndex(0);
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
            activeType === 'LISTEN_CHOICE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          3. Nghe Hiểu (Listen)
        </button>

        <button
          onClick={() => {
            setActiveType('MATCHING');
            setCurrentIndex(0);
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
            activeType === 'MATCHING'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. Nối Thẻ (Matching)
        </button>
      </div>

      {/* Main Question Practice Card */}
      {currentQuestion ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {currentIndex + 1}
              </span>
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  {currentQuestion.unit}
                </span>
                <h3 className="text-sm text-slate-500 font-semibold">
                  Câu hỏi {currentIndex + 1} / {questionsOfType.length}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Lớp {currentQuestion.grade}
              </span>
              <button
                onClick={onGoToArena}
                className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
              >
                Vào thi thử tính giờ
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question text & instructions */}
          <div className="space-y-3">
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
              {currentQuestion.question_text}
            </p>

            {/* Audio Script Player for Listen questions */}
            {currentQuestion.type === 'LISTEN_CHOICE' && currentQuestion.audio_script && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Audio phát âm chuẩn IOE
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      Nhấp loa để nghe lại người bản ngữ đọc
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => speakEnglish(currentQuestion.audio_script!)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Nghe lại (Replay)
                </button>
              </div>
            )}
          </div>

          {/* INTERACTIVE QUESTION BODY BY TYPE */}

          {/* Type 1 & 3: Multiple Choice (Options) */}
          {(currentQuestion.type === 'FILL_BLANK' || currentQuestion.type === 'LISTEN_CHOICE') &&
            currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  let btnColor = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';

                  if (isAnswered) {
                    const isRight =
                      opt === currentQuestion.correct_answer ||
                      opt.startsWith(currentQuestion.correct_answer.charAt(0));
                    if (isRight) {
                      btnColor = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    } else if (isSelected && !isRight) {
                      btnColor = 'bg-red-100 border-red-400 text-red-900';
                    }
                  } else if (isSelected) {
                    btnColor = 'bg-amber-100 border-amber-500 text-amber-900 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all flex items-center justify-between ${btnColor}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && (
                        <span>
                          {opt === currentQuestion.correct_answer || opt.startsWith(currentQuestion.correct_answer.charAt(0)) ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          {/* Type 2: Rearrange Question */}
          {currentQuestion.type === 'REARRANGE' && (
            <div className="space-y-4 pt-2">
              {/* Drop area */}
              <div className="min-h-[70px] p-4 bg-slate-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-wrap gap-2 items-center">
                {rearrangedTokens.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Nhấp vào các mảnh từ vựng bên dưới theo đúng thứ tự để ghép thành câu hoàn chỉnh...
                  </span>
                ) : (
                  rearrangedTokens.map((token, i) => (
                    <button
                      key={i}
                      onClick={() => handleRemoveToken(token, i)}
                      disabled={isAnswered}
                      className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xs hover:bg-red-500 transition-colors"
                      title="Nhấp để gỡ mảnh từ này"
                    >
                      {token}
                    </button>
                  ))
                )}
              </div>

              {/* Word segments available to click */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mảnh từ cho trước (Click để chọn):
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableTokens.map((token, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddToken(token, i)}
                      disabled={isAnswered}
                      className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 rounded-xl text-sm font-bold hover:bg-amber-50 hover:border-amber-400 transition-all shadow-xs"
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Type 4: Matching Pairs */}
          {currentQuestion.type === 'MATCHING' && currentQuestion.pairs && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500 italic">
                (Nhấp vào 1 ô bên trái, sau đó nhấp vào ô tương ứng bên phải để nối cặp)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cột Tiếng Anh (A)
                  </div>
                  {currentQuestion.pairs.map((p, idx) => {
                    const isLeftSelected = selectedLeft === p.left;
                    const isPaired = Boolean(matchedPairs[p.left]);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleMatchLeft(p.left)}
                        disabled={isAnswered || isPaired}
                        className={`w-full p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                          isPaired
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                            : isLeftSelected
                            ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p.left} {isPaired && `➔ ${matchedPairs[p.left]}`}
                      </button>
                    );
                  })}
                </div>

                {/* Right column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cột Tiếng Việt (B)
                  </div>
                  {currentQuestion.pairs.map((p, idx) => {
                    const isUsed = Object.values(matchedPairs).includes(p.right);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleMatchRight(p.right)}
                        disabled={isAnswered || isUsed}
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

              {Object.keys(matchedPairs).length > 0 && !isAnswered && (
                <button
                  onClick={() => setMatchedPairs({})}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Nối lại từ đầu
                </button>
              )}
            </div>
          )}

          {/* Action buttons (Kiểm tra / Tiếp theo) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md shadow-amber-500/25 transition-colors"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chính xác (+10
                      điểm)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" /> Chưa chính xác
                    </>
                  )}
                </span>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  Câu tiếp theo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                const nextIdx = (currentIndex + 1) % questionsOfType.length;
                setCurrentIndex(nextIdx);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Bỏ qua
            </button>
          </div>

          {/* Explanation Card when answered */}
          {isAnswered && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs sm:text-sm space-y-2 animate-in fade-in duration-200">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Lời giải thích chi tiết từ Chuyên gia IOE:
              </div>
              <p className="text-slate-700 leading-relaxed font-medium">
                {currentQuestion.explanation}
              </p>
              {currentQuestion.type === 'REARRANGE' && (
                <div className="text-xs font-bold text-emerald-700 pt-1">
                  Đáp án chuẩn: {currentQuestion.correct_answer}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
