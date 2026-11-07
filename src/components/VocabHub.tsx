import React, { useState, useMemo } from 'react';
import { Volume2, Search, CheckCircle, RotateCcw, Shuffle, ChevronLeft, ChevronRight, Layers, Sparkles, Filter, BookmarkCheck, ArrowRight } from 'lucide-react';
import { VocabWord, UserStats } from '../types';
import { VOCAB_TEST_SETS, ALL_VOCAB_WORDS } from '../data/vocabData';
import { speakEnglish, playCorrectSound } from '../utils/audioUtils';

interface VocabHubProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onStartExamWithTest: (testSetId: number) => void;
  onOpenKeyTest: (testId?: number) => void;
}

export const VocabHub: React.FC<VocabHubProps> = ({
  userStats,
  onUpdateStats,
  onStartExamWithTest,
  onOpenKeyTest,
}) => {
  const [selectedTestId, setSelectedTestId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(true);

  // Filtered list
  const filteredWords = useMemo(() => {
    let list: VocabWord[] = [];
    if (selectedTestId === 'all') {
      list = ALL_VOCAB_WORDS;
    } else {
      const found = VOCAB_TEST_SETS.find((t) => t.id === selectedTestId);
      list = found ? found.words : [];
    }

    if (filterPos !== 'all') {
      list = list.filter((w) => w.partOfSpeech === filterPos);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.english.toLowerCase().includes(q) ||
          w.vietnamese.toLowerCase().includes(q) ||
          (w.exampleEn && w.exampleEn.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedTestId, filterPos, searchTerm]);

  const currentWord: VocabWord | undefined = filteredWords[currentCardIndex] || filteredWords[0];
  const isLearned = currentWord ? userStats.vocabLearned.includes(currentWord.id) : false;

  const handleNextCard = () => {
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    const nextIdx = (currentCardIndex + 1) % filteredWords.length;
    setCurrentCardIndex(nextIdx);
    if (autoPronounce && filteredWords[nextIdx]) {
      speakEnglish(filteredWords[nextIdx].english);
    }
  };

  const handlePrevCard = () => {
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    const prevIdx = (currentCardIndex - 1 + filteredWords.length) % filteredWords.length;
    setCurrentCardIndex(prevIdx);
    if (autoPronounce && filteredWords[prevIdx]) {
      speakEnglish(filteredWords[prevIdx].english);
    }
  };

  const handleShuffleCards = () => {
    if (filteredWords.length <= 1) return;
    setIsFlipped(false);
    const randomIdx = Math.floor(Math.random() * filteredWords.length);
    setCurrentCardIndex(randomIdx);
    if (autoPronounce && filteredWords[randomIdx]) {
      speakEnglish(filteredWords[randomIdx].english);
    }
  };

  const handleToggleLearned = (wordId: string) => {
    const exists = userStats.vocabLearned.includes(wordId);
    let updated: string[];
    let newPoints = userStats.points;

    if (exists) {
      updated = userStats.vocabLearned.filter((id) => id !== wordId);
    } else {
      updated = [...userStats.vocabLearned, wordId];
      newPoints += 5; // Reward 5 points for learning a new word
      playCorrectSound();
    }

    onUpdateStats({
      ...userStats,
      vocabLearned: updated,
      points: newPoints,
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner introduction */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Bộ Tài Liệu Chuẩn IOE Cấp Tỉnh 2026-2027
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Kho 400 Từ Vựng Trọng Tâm Khối 5
            </h1>
            <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
              Trọn bộ 10 đề thi từ vựng Cấp Tỉnh & Trạng Nguyên Tiếng Anh. Tích hợp Flashcard ghi nhớ nhanh, phát âm chuẩn bản ngữ và thi thử thực chiến.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center sm:text-left">
              <div className="text-xs text-amber-200 font-semibold uppercase">Tiến độ ghi nhớ</div>
              <div className="text-2xl font-black text-white">
                {userStats.vocabLearned.length} / {ALL_VOCAB_WORDS.length} từ
              </div>
            </div>
            <div className="w-full sm:w-28 bg-white/20 h-3 rounded-full overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((userStats.vocabLearned.length / ALL_VOCAB_WORDS.length) * 100))}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured: KEY TEST 1 -> 8 HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Key Test 1 Card */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 1
              </span>
              <span className="text-[11px] font-bold text-amber-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 1: Khám Phá
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              explore, architect, badminton, cinderella, ...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-amber-200/60">
            <button
              onClick={() => onOpenKeyTest(1)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(1)}
              className="py-1.5 px-2 bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 2 Card */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 2
              </span>
              <span className="text-[11px] font-bold text-orange-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 2: An Toàn
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              brush, stove, coach, dwarf, magic lamp, stress pattern...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-orange-200/60">
            <button
              onClick={() => onOpenKeyTest(2)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(2)}
              className="py-1.5 px-2 bg-white border border-orange-300 text-orange-950 font-bold text-xs rounded-xl hover:bg-orange-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 3 Card */}
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-400 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 3
              </span>
              <span className="text-[11px] font-bold text-amber-900">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 3: Lễ Hội & Voi
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              wrap, donate, knock, trunk, tusk, passport, chef, applause...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-yellow-300/60">
            <button
              onClick={() => onOpenKeyTest(3)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(3)}
              className="py-1.5 px-2 bg-white border border-yellow-400 text-amber-950 font-bold text-xs rounded-xl hover:bg-yellow-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 4 Card */}
        <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border-2 border-rose-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 4
              </span>
              <span className="text-[11px] font-bold text-rose-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 4: Thể Thao
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              happen, hometown, tortoise, rabbit, knight, lucky money...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-rose-200/60">
            <button
              onClick={() => onOpenKeyTest(4)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(4)}
              className="py-1.5 px-2 bg-white border border-rose-300 text-rose-950 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 5 Card */}
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 5
              </span>
              <span className="text-[11px] font-bold text-teal-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 5: Khoa Học
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              collaborate, AI, endangered species, take pride in...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-teal-200/60">
            <button
              onClick={() => onOpenKeyTest(5)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(5)}
              className="py-1.5 px-2 bg-white border border-teal-300 text-teal-950 font-bold text-xs rounded-xl hover:bg-teal-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 6 Card */}
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 border-2 border-indigo-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 6
              </span>
              <span className="text-[11px] font-bold text-indigo-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 6: Ngữ Âm
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              theatre, dolphin, prevent, opposite, same meaning, tiny...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-indigo-200/60">
            <button
              onClick={() => onOpenKeyTest(6)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(6)}
              className="py-1.5 px-2 bg-white border border-indigo-300 text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 7 Card */}
        <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-2 border-violet-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 7
              </span>
              <span className="text-[11px] font-bold text-violet-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 7: Vũ Trụ
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              astronaut, solar system, boarding school, fluently...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-violet-200/60">
            <button
              onClick={() => onOpenKeyTest(7)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(7)}
              className="py-1.5 px-2 bg-white border border-violet-300 text-violet-950 font-bold text-xs rounded-xl hover:bg-violet-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 8 Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border-2 border-emerald-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 8
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 8: Đô Thị
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              ancient town, cable car, first aid, national anthem...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-emerald-200/60">
            <button
              onClick={() => onOpenKeyTest(8)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(8)}
              className="py-1.5 px-2 bg-white border border-emerald-300 text-emerald-950 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 9 Card */}
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 border-2 border-cyan-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 9
              </span>
              <span className="text-[11px] font-bold text-cyan-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 9: Khí Hậu
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              biologist, microscope, botanical garden, climate change...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-cyan-200/60">
            <button
              onClick={() => onOpenKeyTest(9)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(9)}
              className="py-1.5 px-2 bg-white border border-cyan-300 text-cyan-950 font-bold text-xs rounded-xl hover:bg-cyan-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>

        {/* Key Test 10 Card */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 border-2 border-pink-300 rounded-3xl p-4 shadow-xs flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-600 text-white uppercase tracking-wider">
                Đề Cấp Tỉnh 10
              </span>
              <span className="text-[11px] font-bold text-pink-800">
                40/40 từ
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>⭐</span> KEY TEST 10: An Toàn
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              passenger, pharmacy, first aid, traffic light, life jacket...
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-pink-200/60">
            <button
              onClick={() => onOpenKeyTest(10)}
              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Chi Tiết
            </button>
            <button
              onClick={() => onStartExamWithTest(10)}
              className="py-1.5 px-2 bg-white border border-pink-300 text-pink-950 font-bold text-xs rounded-xl hover:bg-pink-100 transition-colors"
            >
              Thi thử
            </button>
          </div>
        </div>
      </div>

      {/* Select Test Set Chips (Test 1 -> Test 10) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            Chọn Bộ Đề Từ Vựng (10 Test Cấp Tỉnh):
          </h2>
          {selectedTestId !== 'all' && (
            <button
              onClick={() => onStartExamWithTest(selectedTestId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Thi thử ngay Test {selectedTestId}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => {
              setSelectedTestId('all');
              setCurrentCardIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedTestId === 'all'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả (400 từ)
          </button>
          {VOCAB_TEST_SETS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTestId(t.id);
                setCurrentCardIndex(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTestId === t.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Test {t.id} ({t.words.length} từ)
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar: Search, Filter POS, Switch Mode */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentCardIndex(0);
            }}
            placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* Filter part of speech */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Loại từ:
          </span>
          {['all', 'noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'].map((pos) => (
            <button
              key={pos}
              onClick={() => {
                setFilterPos(pos);
                setCurrentCardIndex(0);
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${
                filterPos === pos
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pos === 'all'
                ? 'Tất cả'
                : pos === 'noun'
                ? 'Danh từ'
                : pos === 'verb'
                ? 'Động từ'
                : pos === 'adjective'
                ? 'Tính từ'
                : pos === 'adverb'
                ? 'Trạng từ'
                : pos === 'phrase'
                ? 'Cụm từ'
                : 'Thành ngữ'}
            </button>
          ))}
        </div>

        {/* Toggle Flashcard vs List */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('flashcard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'flashcard'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thẻ Flashcard
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bảng Từ Điển
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: FLASHCARD 3D */}
      {viewMode === 'flashcard' && (
        <div className="flex flex-col items-center justify-center space-y-6">
          {filteredWords.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 w-full">
              <p className="text-slate-500 font-medium">Không tìm thấy từ vựng nào khớp với bộ lọc.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterPos('all');
                }}
                className="mt-3 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : currentWord ? (
            <div className="w-full max-w-xl flex flex-col items-center space-y-4">
              {/* Card Header Info */}
              <div className="w-full flex items-center justify-between px-2 text-xs font-bold text-slate-500">
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  Bộ đề {currentWord.testId} • Thẻ {currentCardIndex + 1}/{filteredWords.length}
                </span>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={autoPronounce}
                      onChange={(e) => setAutoPronounce(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Tự phát âm khi đổi thẻ</span>
                  </label>
                </div>
              </div>

              {/* The 3D Interactive Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[320px] bg-white rounded-3xl border-2 border-amber-200/80 shadow-lg hover:shadow-xl transition-all cursor-pointer p-8 flex flex-col items-center justify-between text-center relative group select-none"
              >
                {/* Top Corner Badges */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {currentWord.partOfSpeech}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLearned(currentWord.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isLearned
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    <CheckCircle className={`w-4 h-4 ${isLearned ? 'fill-emerald-500 text-white' : ''}`} />
                    {isLearned ? 'Đã thuộc từ này' : 'Chưa thuộc'}
                  </button>
                </div>

                {/* Card Center Content */}
                <div className="my-auto space-y-3">
                  {!isFlipped ? (
                    // Front: English
                    <>
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {currentWord.english}
                      </h3>
                      {currentWord.phonetic && (
                        <p className="text-base text-amber-600 font-semibold">
                          {currentWord.phonetic}
                        </p>
                      )}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglish(currentWord.english);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold border border-amber-200 shadow-xs transition-colors"
                        >
                          <Volume2 className="w-4 h-4 text-amber-600" />
                          Nghe phát âm chuẩn
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 italic pt-2">
                        (Nhấp vào thẻ để xem nghĩa tiếng Việt & câu ví dụ)
                      </p>
                    </>
                  ) : (
                    // Back: Vietnamese & Example
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                          Nghĩa Tiếng Việt
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                          {currentWord.vietnamese}
                        </div>
                      </div>

                      {currentWord.exampleEn && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Ví dụ ngữ cảnh IOE:</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speakEnglish(currentWord.exampleEn!);
                              }}
                              className="text-amber-600 hover:text-amber-800"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-slate-800">
                            "{currentWord.exampleEn}"
                          </p>
                          {currentWord.exampleVi && (
                            <p className="text-xs text-slate-500 italic">
                              "{currentWord.exampleVi}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom flip hint */}
                <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  {isFlipped ? 'Nhấp để lật lại mặt trước' : 'Nhấp để lật mặt sau'}
                </div>
              </div>

              {/* Card Controls */}
              <div className="w-full flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handlePrevCard}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 shadow-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Từ trước
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors"
                    title="Lật thẻ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleShuffleCards}
                    className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors"
                    title="Xáo trộn ngẫu nhiên"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleNextCard}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md shadow-amber-500/20 transition-colors"
                >
                  Từ tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* VIEW MODE 2: DICTIONARY TABLE */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Hiển thị {filteredWords.length} từ vựng</span>
            <span>Click vào biểu tượng loa để nghe đọc</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredWords.map((word, idx) => {
              const mastered = userStats.vocabLearned.includes(word.id);
              return (
                <div
                  key={word.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900">
                          {word.english}
                        </span>
                        {word.phonetic && (
                          <span className="text-xs font-medium text-amber-600">
                            {word.phonetic}
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                          {word.partOfSpeech}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          (Test {word.testId})
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-700">
                        = {word.vietnamese}
                      </div>

                      {word.exampleEn && (
                        <p className="text-xs text-slate-500 pt-1 italic">
                          "{word.exampleEn}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => speakEnglish(word.english)}
                      className="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleLearned(word.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        mastered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <BookmarkCheck className={`w-3.5 h-3.5 ${mastered ? 'text-emerald-600' : ''}`} />
                      {mastered ? 'Đã thuộc' : 'Ghi nhớ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
