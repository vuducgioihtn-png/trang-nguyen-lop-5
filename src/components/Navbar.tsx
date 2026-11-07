import React from 'react';
import { Award, BookOpen, Brain, Sparkles, Volume2, VolumeX, Flame, Trophy, PlayCircle } from 'lucide-react';
import { UserStats } from '../types';

interface NavbarProps {
  currentTab: 'vocab' | 'practice' | 'arena' | 'generator' | 'leaderboard';
  setCurrentTab: (tab: 'vocab' | 'practice' | 'arena' | 'generator' | 'leaderboard') => void;
  userStats: UserStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGenerator: () => void;
  onOpenKeyTest: (testId?: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userStats,
  isMuted,
  onToggleMute,
  onOpenGenerator,
  onOpenKeyTest,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('vocab')}
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-yellow-100" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  IOE & Trạng Nguyên
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs">
                  Cấp Tỉnh Lớp 5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Học từ vựng & Thi thử chuẩn GDPT 2018 Global Success
              </p>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setCurrentTab('vocab')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'vocab'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              Kho Từ Vựng (10 Test)
            </button>

            <button
              onClick={() => setCurrentTab('practice')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'practice'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Brain className="w-4 h-4 text-blue-500" />
              Luyện 4 Dạng Bài
            </button>

            <button
              onClick={() => setCurrentTab('arena')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                currentTab === 'arena'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-amber-200" />
              Đấu Trường Thi Thử
            </button>

            <div className="flex items-center gap-1 bg-amber-100/70 p-0.5 rounded-xl border border-amber-300">
              <button
                onClick={() => onOpenKeyTest(1)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-amber-900 bg-yellow-300 hover:bg-yellow-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 1"
              >
                <span>⭐</span> Test 1
              </button>
              <button
                onClick={() => onOpenKeyTest(2)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 2"
              >
                <span>⭐</span> Test 2
              </button>
              <button
                onClick={() => onOpenKeyTest(3)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-orange-950 bg-orange-400 hover:bg-orange-500 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 3"
              >
                <span>⭐</span> Test 3
              </button>
              <button
                onClick={() => onOpenKeyTest(4)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-rose-950 bg-rose-400 hover:bg-rose-500 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 4"
              >
                <span>⭐</span> Test 4
              </button>
              <button
                onClick={() => onOpenKeyTest(5)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-teal-950 bg-teal-400 hover:bg-teal-500 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 5"
              >
                <span>⭐</span> Test 5
              </button>
              <button
                onClick={() => onOpenKeyTest(6)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-indigo-950 bg-indigo-300 hover:bg-indigo-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 6"
              >
                <span>⭐</span> Test 6
              </button>
              <button
                onClick={() => onOpenKeyTest(7)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-violet-950 bg-violet-300 hover:bg-violet-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 7"
              >
                <span>⭐</span> Test 7
              </button>
              <button
                onClick={() => onOpenKeyTest(8)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-emerald-950 bg-emerald-300 hover:bg-emerald-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 8"
              >
                <span>⭐</span> Test 8
              </button>
              <button
                onClick={() => onOpenKeyTest(9)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-cyan-950 bg-cyan-300 hover:bg-cyan-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 9"
              >
                <span>⭐</span> Test 9
              </button>
              <button
                onClick={() => onOpenKeyTest(10)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-black text-pink-950 bg-pink-300 hover:bg-pink-400 shadow-xs transition-all"
                title="Xem trọn bộ 40 từ vựng Key Test 10"
              >
                <span>⭐</span> Test 10
              </button>
            </div>

            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold text-purple-700 hover:bg-purple-50 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Ra Đề
            </button>
          </nav>

          {/* User Score & Sound Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold" title="Chuỗi ngày luyện tập">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{userStats.streakDays} ngày</span>
            </div>

            {/* Points / Coins */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-black cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => setCurrentTab('leaderboard')}
              title="Điểm tích lũy Trạng Nguyên"
            >
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center text-xs shadow-xs font-black">
                ★
              </span>
              <span>{userStats.points}</span>
            </div>

            {/* Sound Mute Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-red-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            {/* Leaderboard icon */}
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
              title="Bảng vinh danh Trạng Nguyên"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Mobile Submenu tabs */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2">
          <button
            onClick={() => setCurrentTab('vocab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'vocab' ? 'bg-amber-500 text-white' : 'text-slate-600'
            }`}
          >
            Từ Vựng
          </button>
          <button
            onClick={() => setCurrentTab('practice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            Luyện Dạng Bài
          </button>
          <button
            onClick={() => setCurrentTab('arena')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              currentTab === 'arena' ? 'bg-orange-600 text-white' : 'text-slate-600'
            }`}
          >
            Thi Thử
          </button>
          <button
            onClick={() => onOpenKeyTest(1)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-amber-900 bg-yellow-300 whitespace-nowrap"
          >
            ⭐ Test 1
          </button>
          <button
            onClick={() => onOpenKeyTest(2)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-amber-950 bg-amber-400 whitespace-nowrap"
          >
            ⭐ Test 2
          </button>
          <button
            onClick={() => onOpenKeyTest(3)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-orange-950 bg-orange-400 whitespace-nowrap"
          >
            ⭐ Test 3
          </button>
          <button
            onClick={() => onOpenKeyTest(4)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-rose-950 bg-rose-400 whitespace-nowrap"
          >
            ⭐ Test 4
          </button>
          <button
            onClick={() => onOpenKeyTest(5)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-teal-950 bg-teal-400 whitespace-nowrap"
          >
            ⭐ Test 5
          </button>
          <button
            onClick={() => onOpenKeyTest(6)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-indigo-950 bg-indigo-300 whitespace-nowrap"
          >
            ⭐ Test 6
          </button>
          <button
            onClick={() => onOpenKeyTest(7)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-violet-950 bg-violet-300 whitespace-nowrap"
          >
            ⭐ Test 7
          </button>
          <button
            onClick={() => onOpenKeyTest(8)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-emerald-950 bg-emerald-300 whitespace-nowrap"
          >
            ⭐ Test 8
          </button>
          <button
            onClick={() => onOpenKeyTest(9)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-cyan-950 bg-cyan-300 whitespace-nowrap"
          >
            ⭐ Test 9
          </button>
          <button
            onClick={() => onOpenKeyTest(10)}
            className="px-2 py-1.5 rounded-lg text-xs font-black text-pink-950 bg-pink-300 whitespace-nowrap"
          >
            ⭐ Test 10
          </button>
          <button
            onClick={onOpenGenerator}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 whitespace-nowrap flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Ra Đề
          </button>
        </div>
      </div>
    </header>
  );
};
