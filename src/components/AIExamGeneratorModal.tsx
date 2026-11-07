import React, { useState } from 'react';
import { X, Sparkles, Loader2, Play, Download, Copy, Check, BookOpen, Layers, Award, Printer } from 'lucide-react';
import { MockExam, Question } from '../types';
import { saveCustomExam } from '../utils/storageUtils';

interface AIExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (exam: MockExam) => void;
}

const GLOBAL_SUCCESS_GRADE_5_UNITS = [
  'Unit 1: All about me & My address',
  'Unit 2: Our homes and daily routines',
  'Unit 3: My foreign friends & nationalities',
  'Unit 4: Our free-time activities & hobbies',
  'Unit 5: My future job & dream occupations',
  'Unit 6: Our school festival & music show',
  'Unit 7: Our timetables & favorite subjects',
  'Unit 8: Stories and folk tales we love',
  'Unit 9: Our sports day and competitions',
  'Unit 10: Our school trips & excursions',
  'Unit 11: Health problems & stay healthy',
  'Unit 12: Safety at home & preventing accidents',
  'Unit 13: What do you do in your free time?',
  'Unit 14: What happened in the story?',
  'Unit 15: What would you like to be in the future?',
  'Unit 16: Where’s the post office & giving directions',
  'Unit 17: How much is this T-shirt & shopping',
  'Unit 18: What will the weather be like tomorrow?',
  'Unit 19: Which place would you like to visit?',
  'Unit 20: Which one is more attractive?',
  'Đề Tuyển Chọn 400 Từ Vựng IOE Cấp Tỉnh 2026-2027',
  'Đề Thi Hội & Thi Đình Trạng Nguyên Tiếng Anh Cấp Tỉnh',
];

export const AIExamGeneratorModal: React.FC<AIExamGeneratorModalProps> = ({
  isOpen,
  onClose,
  onStartExam,
}) => {
  const [grade, setGrade] = useState<number>(5);
  const [unit, setUnit] = useState<string>('Đề Tuyển Chọn 400 Từ Vựng IOE Cấp Tỉnh 2026-2027');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(12);
  const [difficulty, setDifficulty] = useState<'Cơ Bản' | 'Cấp Huyện' | 'Cấp Tỉnh' | 'Cấp Quốc Gia'>('Cấp Tỉnh');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedQuestions(null);

    const selectedTopic = customUnit.trim() ? customUnit.trim() : unit;

    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          unit: selectedTopic,
          count: questionCount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Lỗi không xác định khi sinh đề thi');
      }

      setGeneratedQuestions(data.questions);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi kết nối API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndStart = () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const topicName = customUnit.trim() ? customUnit.trim() : unit;
    const newExam: MockExam = {
      id: 'ai-exam-' + Date.now(),
      title: `Đề Thi AI Trạng Nguyên Khối ${grade} - ${difficulty}`,
      subtitle: `${topicName} • GDPT 2018 (${generatedQuestions.length} câu)`,
      grade,
      totalQuestions: generatedQuestions.length,
      durationMinutes: Math.max(15, Math.round(generatedQuestions.length * 1.5)),
      questions: generatedQuestions,
      difficulty,
      isAiGenerated: true,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    saveCustomExam(newExam);
    onStartExam(newExam);
    onClose();
  };

  const handleCopyJson = () => {
    if (!generatedQuestions) return;
    navigator.clipboard.writeText(JSON.stringify(generatedQuestions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-black">
                Chuyên Gia Ra Đề Thi IOE & Trạng Nguyên AI
              </h2>
              <p className="text-xs text-purple-200">
                Tự động tạo bộ câu hỏi phân bổ đều 4 dạng bài chuẩn GDPT 2018 (Global Success)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Khối lớp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Khối Lớp (Grade)
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Khối {g} {g === 5 ? '(Mặc định - Cấp Tỉnh)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng câu */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Số Lượng Câu
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              >
                <option value={8}>8 câu (Luyện nhanh)</option>
                <option value={12}>12 câu (Chuẩn đề ngắn)</option>
                <option value={16}>16 câu (Đề Cấp Tỉnh)</option>
                <option value={20}>20 câu (Toàn diện)</option>
              </select>
            </div>

            {/* Độ khó */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Cấp Độ Thi
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
              >
                <option value="Cơ Bản">Cơ Bản (Cấp Trường)</option>
                <option value="Cấp Huyện">Thi Hương (Cấp Huyện)</option>
                <option value="Cấp Tỉnh">Thi Hội (Cấp Tỉnh)</option>
                <option value="Cấp Quốc Gia">Thi Đình (Cấp Quốc Gia)</option>
              </select>
            </div>

            {/* Button Sinh Đề */}
            <div className="flex items-end">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white text-sm font-extrabold rounded-xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang Soạn Đề...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Sinh Bộ Đề Mới
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chọn chủ đề / Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Chủ Đề / Unit SGK Global Success GDPT 2018:
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
            >
              {GLOBAL_SUCCESS_GRADE_5_UNITS.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <div className="pt-1">
              <input
                type="text"
                placeholder="Hoặc tự nhập chủ đề theo ý muốn (ví dụ: 10 đề thi cấp tỉnh, thì quá khứ đơn, động từ bất quy tắc...)"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Loading status details */}
          {isLoading && (
            <div className="p-8 text-center space-y-3 bg-purple-50/60 rounded-2xl border border-purple-200">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <div className="text-sm font-bold text-purple-900">
                Chuyên gia AI đang biên soạn bộ câu hỏi...
              </div>
              <p className="text-xs text-purple-600 max-w-md mx-auto">
                Đang phân bổ đều 4 dạng bài: FILL_BLANK, REARRANGE, LISTEN_CHOICE, MATCHING và viết lời giải thích chi tiết bằng tiếng Việt.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Generated Questions Preview */}
          {generatedQuestions && generatedQuestions.length > 0 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-900">
                    Đã tạo thành công {generatedQuestions.length} câu hỏi chuẩn IOE & Trạng Nguyên!
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Đã sao chép JSON' : 'Sao chép JSON'}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In đề thi
                  </button>
                </div>
              </div>

              {/* Questions list preview */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-700">
                        Câu {idx + 1} ({q.type})
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{q.unit}</span>
                    </div>

                    <p className="font-bold text-slate-800">{q.question_text}</p>

                    {q.audio_script && (
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-xs italic">
                        🎧 Audio script: "{q.audio_script}"
                      </div>
                    )}

                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600 text-xs">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.segments && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.segments.map((seg, si) => (
                          <span
                            key={si}
                            className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-semibold"
                          >
                            {seg}
                          </span>
                        ))}
                      </div>
                    )}

                    {q.pairs && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                        {q.pairs.map((p, pi) => (
                          <div key={pi} className="p-1.5 bg-purple-50 text-purple-900 rounded-md">
                            <strong>{p.left}</strong> ➔ {p.right}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
                      <div className="text-emerald-700 font-bold">
                        Đáp án đúng: {q.correct_answer}
                      </div>
                      <div className="text-slate-600 italic">
                        Giải thích: {q.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-colors"
          >
            Đóng lại
          </button>

          {generatedQuestions && generatedQuestions.length > 0 && (
            <button
              onClick={handleCreateAndStart}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Làm bài thi thử này ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
