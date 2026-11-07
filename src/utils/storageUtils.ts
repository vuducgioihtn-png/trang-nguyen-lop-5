import { MockExam, UserStats } from '../types';
import { PRESET_MOCK_EXAMS } from '../data/presetExams';

const STATS_KEY = 'ioe_trang_nguyen_stats_v1';
const CUSTOM_EXAMS_KEY = 'ioe_custom_exams_v1';

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const today = new Date().toISOString().split('T')[0];
  return {
    points: 150,
    testsCompleted: 0,
    vocabLearned: ['t1-1', 't1-2', 't1-3', 't1-11'],
    streakDays: 3,
    lastActiveDate: today,
    achievements: ['Tân Thủ Trạng Nguyên', 'Chiến Binh Từ Vựng'],
    examHistory: [],
  };
}

export function saveUserStats(stats: UserStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function loadCustomExams(): MockExam[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EXAMS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function saveCustomExam(exam: MockExam) {
  const current = loadCustomExams();
  const updated = [exam, ...current.filter((e) => e.id !== exam.id)];
  try {
    localStorage.setItem(CUSTOM_EXAMS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getAllExams(): MockExam[] {
  const custom = loadCustomExams();
  return [...custom, ...PRESET_MOCK_EXAMS];
}
