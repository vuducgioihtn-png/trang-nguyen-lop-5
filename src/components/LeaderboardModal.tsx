import React from 'react';
import { X, Trophy, Award, Flame, Star, Calendar, Clock, CheckCircle } from 'lucide-react';
import { UserStats } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  userStats,
}) => {
  if (!isOpen) return null;

  const mockLeaderboard = [
    { rank: 1, name: 'Nguyễn Minh Quân (Hà Nội)', score: 3850, title: 'Trạng Nguyên Nhí', medal: '🥇' },
    { rank: 2, name: 'Trần Bảo Anh (Đà Nẵng)', score: 3420, title: 'Bảng Nhãn', medal: '🥈' },
    { rank: 3, name: 'Lê Hoàng Long (TP.HCM)', score: 3180, title: 'Thám Hoa', medal: '🥉' },
    { rank: 4, name: 'Em (Thí sinh Khối 5)', score: userStats.points, title: 'Hoàng Giáp Cấp Tỉnh', isUser: true },
    { rank: 5, name: 'Phạm Phương Thảo (Hải Phòng)', score: 1450, title: 'Tiến Sĩ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h2 className="text-xl font-black">Bảng Vàng Trạng Nguyên Tiếng Anh</h2>
              <p className="text-xs text-amber-100">
                Vinh danh thí sinh xuất sắc & Lịch sử thi đấu Cấp Tỉnh
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

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* User Achievement summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-1">
              <span className="text-xs text-amber-800 font-bold uppercase block">
                Điểm tích lũy
              </span>
              <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                {userStats.points}
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-center space-y-1">
              <span className="text-xs text-orange-800 font-bold uppercase block">
                Chuỗi ngày học
              </span>
              <div className="text-2xl font-black text-orange-900 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                {userStats.streakDays} ngày
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-1">
              <span className="text-xs text-blue-800 font-bold uppercase block">
                Đề thi đã làm
              </span>
              <div className="text-2xl font-black text-blue-900 flex items-center justify-center gap-1">
                <Award className="w-5 h-5 text-blue-500" />
                {userStats.testsCompleted} đề
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Bảng Xếp Hạng Vòng Cấp Tỉnh Tuần Này:
            </h3>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {mockLeaderboard.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 flex items-center justify-between text-xs sm:text-sm font-medium ${
                    item.isUser ? 'bg-amber-100/70 border-l-4 border-l-amber-500 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-slate-500">
                      {item.medal ? item.medal : `#${item.rank}`}
                    </span>
                    <div>
                      <div className="text-slate-800 font-bold flex items-center gap-1.5">
                        {item.name}
                        {item.isUser && (
                          <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-sm uppercase">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.title}</div>
                    </div>
                  </div>

                  <div className="text-amber-700 font-black">
                    {item.score} điểm
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Lịch Sử Thi Gần Đây Của Em:
            </h3>

            {userStats.examHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Em chưa làm bài thi nào. Hãy vào "Đấu Trường Thi Thử" để bắt đầu nhận huy hiệu nhé!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userStats.examHistory.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{item.title}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(item.durationSeconds / 60)} phút {item.durationSeconds % 60} giây
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-600 block">
                        {item.score}/{item.total}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600">
                        {item.percentage}% đúng
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
