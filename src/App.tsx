/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VocabHub } from './components/VocabHub';
import { QuickPractice } from './components/QuickPractice';
import { ExamArena } from './components/ExamArena';
import { AIExamGeneratorModal } from './components/AIExamGeneratorModal';
import { ExamReviewModal } from './components/ExamReviewModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { KeyTest1Modal } from './components/KeyTest1Modal';
import { MockExam, UserStats } from './types';
import { loadUserStats, saveUserStats, getAllExams } from './utils/storageUtils';
import { getMuted, setMuted } from './utils/audioUtils';
import { Sparkles, Trophy, BookOpen, Brain, PlayCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'vocab' | 'practice' | 'arena' | 'generator' | 'leaderboard'>('vocab');
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats());
  const [isMutedState, setIsMutedState] = useState<boolean>(getMuted());

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isKeyTest1Open, setIsKeyTest1Open] = useState(false);
  const [activeKeyTestId, setActiveKeyTestId] = useState<number>(1);

  const handleOpenKeyTest = (testId: number = 1) => {
    setActiveKeyTestId(testId);
    setIsKeyTest1Open(true);
  };
  const [reviewExam, setReviewExam] = useState<MockExam | null>(null);
  const [reviewUserAnswers, setReviewUserAnswers] = useState<Record<string, unknown>>({});
  const [reviewScore, setReviewScore] = useState<number>(0);

  // Auto-start exam trigger
  const [examToStart, setExamToStart] = useState<MockExam | null>(null);

  useEffect(() => {
    saveUserStats(userStats);
  }, [userStats]);

  const handleToggleMute = () => {
    const next = !isMutedState;
    setIsMutedState(next);
    setMuted(next);
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  const handleStartExamFromTest = (testSetId: number) => {
    const all = getAllExams();
    const matched = all.find((e) => e.testSetNumber === testSetId) || all[0];
    setExamToStart(matched);
    setCurrentTab('arena');
  };

  const handleStartExamDirect = (exam: MockExam) => {
    setExamToStart(exam);
    setCurrentTab('arena');
  };

  const handleOpenReviewModal = (exam: MockExam, userAnswers: Record<string, unknown>, score: number) => {
    setReviewExam(exam);
    setReviewUserAnswers(userAnswers);
    setReviewScore(score);
    setIsReviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'generator') {
            setIsGeneratorOpen(true);
          } else if (tab === 'leaderboard') {
            setIsLeaderboardOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        userStats={userStats}
        isMuted={isMutedState}
        onToggleMute={handleToggleMute}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenKeyTest={handleOpenKeyTest}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'vocab' && (
          <VocabHub
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onStartExamWithTest={handleStartExamFromTest}
            onOpenKeyTest={handleOpenKeyTest}
          />
        )}

        {currentTab === 'practice' && (
          <QuickPractice
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onGoToArena={() => setCurrentTab('arena')}
          />
        )}

        {currentTab === 'arena' && (
          <ExamArena
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            onOpenReviewModal={handleOpenReviewModal}
            presetExamToStart={examToStart}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Hệ Thống Luyện Thi IOE & Trạng Nguyên Tiếng Anh Cấp Tỉnh Khối 5</span>
        </div>
        <p>
          Bám sát chương trình GDPT 2018 (Global Success). Tích hợp 10 bộ đề 400 từ vựng trọng tâm cấp Tỉnh & Chuyên gia ra đề AI.
        </p>
      </footer>

      {/* MODALS */}
      <AIExamGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onStartExam={handleStartExamDirect}
      />

      <ExamReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        exam={reviewExam}
        userAnswers={reviewUserAnswers}
        score={reviewScore}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        userStats={userStats}
      />

      <KeyTest1Modal
        isOpen={isKeyTest1Open}
        onClose={() => setIsKeyTest1Open(false)}
        initialTestId={activeKeyTestId}
        onStartTestExam={(testId: number) => {
          setIsKeyTest1Open(false);
          handleStartExamFromTest(testId);
        }}
      />
    </div>
  );
}
