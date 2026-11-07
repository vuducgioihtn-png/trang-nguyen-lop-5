import React, { useState, useEffect } from 'react';
import { X, Volume2, Printer, CheckCircle2, RotateCcw, Award, FileText, ArrowRight, Sparkles, BookOpen, Search } from 'lucide-react';
import { VOCAB_TEST_SETS } from '../data/vocabData';
import { speakEnglish } from '../utils/audioUtils';

interface KeyTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTestExam: (testId: number) => void;
  initialTestId?: number;
}

export const KeyTest1Modal: React.FC<KeyTestModalProps> = ({
  isOpen,
  onClose,
  onStartTestExam,
  initialTestId = 1,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<number>(initialTestId);
  const [activeTab, setActiveTab] = useState<'table' | 'en_to_vi' | 'vi_to_en' | 'print'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  // States for self-practice exercises
  const [enViInputs, setEnViInputs] = useState<Record<number, string>>({});
  const [viEnInputs, setViEnInputs] = useState<Record<number, string>>({});
  const [revealedEnVi, setRevealedEnVi] = useState<Record<number, boolean>>({});
  const [revealedViEn, setRevealedViEn] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (initialTestId) {
      setSelectedTestId(initialTestId);
    }
  }, [initialTestId, isOpen]);

  // Reset inputs when test changes
  const handleSelectTest = (testId: number) => {
    setSelectedTestId(testId);
    setEnViInputs({});
    setViEnInputs({});
    setRevealedEnVi({});
    setRevealedViEn({});
    setSearchQuery('');
  };

  const currentTestSet = VOCAB_TEST_SETS.find((t) => t.id === selectedTestId) || VOCAB_TEST_SETS[0];
  const words = currentTestSet ? currentTestSet.words : [];

  if (!isOpen) return null;

  const filteredWords = words.filter(
    (w) =>
      w.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(w.orderNumber || '').includes(searchQuery)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-amber-300 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Document Header banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                TÀI LIỆU IOE MRS DƯƠNG-MAI NGỌC 0358729337 - 0942252719 (2026-2027)
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight flex items-center gap-2">
                KEY TEST {selectedTestId} TỪ VỰNG IOE CẤP TỈNH KHỐI 5
                <span className="text-xs bg-yellow-400 text-amber-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  {words.length}/40 Từ
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 mt-0.5">
                {selectedTestId === 1
                  ? 'Test 1: Khám phá thế giới, Đời sống học đường, Nghề nghiệp & Sinh hoạt'
                  : selectedTestId === 2
                  ? 'Test 2: Thói quen hàng ngày, Phòng tránh tai nạn gia đình, Truyện cổ tích & Ngữ âm'
                  : selectedTestId === 3
                  ? 'Test 3: Lễ hội trường học, Thiện nguyện học đường, Thế giới động vật & So sánh hơn'
                  : selectedTestId === 4
                  ? 'Test 4: Thể thao, Sức khỏe, Lễ hội ngày Tết, Rùa & Thỏ và Thói quen tốt'
                  : selectedTestId === 5
                  ? 'Test 5: Khoa học, Trí tuệ nhân tạo (AI), Năng lượng tái tạo, Di sản & Thành ngữ IOE'
                  : selectedTestId === 6
                  ? 'Test 6: Đời sống học đường, Ngữ âm, Từ trái nghĩa (Opposite) & Đồng nghĩa (Same meaning)'
                  : selectedTestId === 7
                  ? 'Test 7: Vũ trụ, Khảo cổ, Trại hè, Trạng từ chỉ cách thức (-ly) & Từ vựng nâng cao'
                  : selectedTestId === 8
                  ? 'Test 8: Đô thị, Du lịch, Di tích Phố cổ, Cứu trợ y tế & Đời sống công cộng'
                  : selectedTestId === 9
                  ? 'Test 9: Sinh vật học, Kính hiển vi, Vườn bách thảo, Biến đổi khí hậu & Khu bảo tồn'
                  : 'Test 10: Xã hội, Hành khách, Hiệu thuốc, Sơ cứu, Giao thông & Áo phao cứu sinh'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Test Switcher (Key Test 1 -> 10) */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/20 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-amber-200 uppercase mr-1 whitespace-nowrap">Bộ Đề:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tId) => (
              <button
                key={tId}
                onClick={() => handleSelectTest(tId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedTestId === tId
                    ? 'bg-yellow-400 text-amber-950 shadow-md scale-102 ring-2 ring-white/50'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <span>⭐</span> KEY TEST {tId} (40 từ)
              </button>
            ))}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📋 Bảng Đáp Án Key Test {selectedTestId} (1 - 40)
            </button>

            <button
              onClick={() => setActiveTab('en_to_vi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'en_to_vi'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ✍️ Đề Luyện: Anh ➔ Việt
            </button>

            <button
              onClick={() => setActiveTab('vi_to_en')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'vi_to_en'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ✍️ Đề Luyện: Việt ➔ Anh
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'print'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🖨️ Bản In A4 & PDF
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: FULL TABLE KEY TEST */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Tìm kiếm trong Key Test ${selectedTestId}...`}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartTestExam(selectedTestId)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-xs shadow-xs hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Thi thử đúng 4 dạng bài Test {selectedTestId}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 bg-white border border-amber-300 text-amber-800 font-bold rounded-xl text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> In bảng từ
                  </button>
                </div>
              </div>

              {/* Responsive 40-word Table matching the original test document */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                        <th className="py-3 px-3 w-12 text-center">STT</th>
                        <th className="py-3 px-4 w-1/3">Tiếng Anh (English)</th>
                        <th className="py-3 px-4">Tiếng Việt (Vietnamese)</th>
                        <th className="py-3 px-3 text-center w-20">Nghe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredWords.map((word) => (
                        <tr
                          key={word.id}
                          className="hover:bg-amber-50/50 transition-colors group"
                        >
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                            {word.orderNumber}.
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900">
                            <div className="flex items-baseline gap-2">
                              <span>{word.english}</span>
                              {word.phonetic && (
                                <span className="text-[11px] font-normal text-amber-700">
                                  {word.phonetic}
                                </span>
                              )}
                            </div>
                            {word.exampleEn && (
                              <div className="text-[11px] text-slate-500 italic font-normal mt-0.5">
                                "{word.exampleEn}"
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            <span className="font-semibold text-slate-900">
                              {word.vietnamese}
                            </span>
                            {word.tip && (
                              <div className="text-[11px] text-amber-800 font-normal mt-0.5">
                                💡 {word.tip}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => speakEnglish(word.english)}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                              title="Nghe phát âm chuẩn"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXERCISE TIẾNG ANH DỊCH SANG TIẾNG VIỆT */}
          {activeTab === 'en_to_vi' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-blue-900">
                    TEST {selectedTestId}: TIẾNG ANH DỊCH SANG TIẾNG VIỆT (1 - 40)
                  </h3>
                  <p className="text-xs text-blue-700">
                    Hãy tự điền nghĩa tiếng Việt của từ vào ô trống hoặc nhấp "Xem đáp án" để ôn luyện.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allRev: Record<number, boolean> = {};
                    words.forEach((w) => {
                      if (w.orderNumber) allRev[w.orderNumber] = true;
                    });
                    setRevealedEnVi(allRev);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Hiện tất cả đáp án
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {words.map((word) => {
                  const num = word.orderNumber || 0;
                  const isRev = revealedEnVi[num];
                  return (
                    <div
                      key={word.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center font-bold text-slate-400 text-xs">
                          {num}.
                        </span>
                        <div className="font-extrabold text-slate-900 text-sm">
                          {word.english}
                        </div>
                        <button
                          onClick={() => speakEnglish(word.english)}
                          className="text-slate-400 hover:text-amber-600"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRev ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {word.vietnamese}
                          </span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Gõ nghĩa TV..."
                            value={enViInputs[num] || ''}
                            onChange={(e) =>
                              setEnViInputs({ ...enViInputs, [num]: e.target.value })
                            }
                            className="w-36 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-400"
                          />
                        )}

                        <button
                          onClick={() =>
                            setRevealedEnVi({ ...revealedEnVi, [num]: !isRev })
                          }
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          {isRev ? 'Ẩn' : 'Xem'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EXERCISE TIẾNG VIỆT DỊCH SANG TIẾNG ANH */}
          {activeTab === 'vi_to_en' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-orange-900">
                    TEST {selectedTestId}: TIẾNG VIỆT DỊCH SANG TIẾNG ANH (1 - 40)
                  </h3>
                  <p className="text-xs text-orange-700">
                    Gõ từ tiếng Anh tương ứng với nghĩa tiếng Việt cho sẵn để kiểm tra trí nhớ chính tả.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allRev: Record<number, boolean> = {};
                    words.forEach((w) => {
                      if (w.orderNumber) allRev[w.orderNumber] = true;
                    });
                    setRevealedViEn(allRev);
                  }}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
                >
                  Hiện tất cả đáp án
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {words.map((word) => {
                  const num = word.orderNumber || 0;
                  const isRev = revealedViEn[num];
                  const userInput = (viEnInputs[num] || '').trim().toLowerCase();
                  const isCorrectInput = userInput === word.english.trim().toLowerCase();

                  return (
                    <div
                      key={word.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center gap-2 max-w-[55%]">
                        <span className="w-6 text-center font-bold text-slate-400 text-xs shrink-0">
                          {num}.
                        </span>
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                          {word.vietnamese}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRev ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              {word.english}
                            </span>
                            <button
                              onClick={() => speakEnglish(word.english)}
                              className="text-slate-400 hover:text-amber-600"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Gõ tiếng Anh..."
                            value={viEnInputs[num] || ''}
                            onChange={(e) =>
                              setViEnInputs({ ...viEnInputs, [num]: e.target.value })
                            }
                            className={`w-32 px-2.5 py-1 text-xs border rounded-lg focus:outline-hidden ${
                              isCorrectInput
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                                : 'border-slate-200'
                            }`}
                          />
                        )}

                        <button
                          onClick={() =>
                            setRevealedViEn({ ...revealedViEn, [num]: !isRev })
                          }
                          className="text-[11px] text-orange-600 hover:underline font-semibold"
                        >
                          {isRev ? 'Ẩn' : 'Xem'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PRINTABLE DOCUMENT SHEET */}
          {activeTab === 'print' && (
            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Bản In Chuẩn A4 Tài Liệu Ôn Thi IOE Cấp Tỉnh Khối 5 (Key Test {selectedTestId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dùng để in ra giấy cho học sinh làm bài tập kiểm tra hoặc tài liệu học thuộc lòng.
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  In Ngay (Print to PDF)
                </button>
              </div>

              {/* Printable sheet preview */}
              <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-sm space-y-6 text-black print:p-0 print:border-none">
                <div className="text-center space-y-1 border-b pb-4">
                  <div className="text-xs font-bold tracking-widest text-slate-600">
                    TÀI LIỆU IOE MRS DƯƠNG-MAI NGỌC 0358729337 - 0942252719 2026-2027
                  </div>
                  <h2 className="text-xl font-black uppercase text-slate-900">
                    KEY TEST {selectedTestId} TỪ VỰNG IOE CẤP TỈNH KHỐI 5
                  </h2>
                  <p className="text-xs text-slate-500 italic">
                    Họ và tên thí sinh: ..................................................... Lớp: ............. Trường: .....................................................
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {words.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between border-b border-slate-100 py-1.5"
                    >
                      <span className="font-bold">
                        {w.orderNumber}. {w.english}
                      </span>
                      <span className="text-slate-700">{w.vietnamese}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Dữ liệu đối soát 100% khớp với KEY TEST {selectedTestId} Cấp Tỉnh Khối 5 (Mrs Dương & Mai Ngọc).
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartTestExam(selectedTestId)}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              Thi thử trắc nghiệm Test {selectedTestId}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
