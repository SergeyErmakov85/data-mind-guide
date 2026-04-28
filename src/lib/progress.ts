import { createSafeStorage } from '@/lib/safeStorage';

// Progress tracking via localStorage
const PROGRESS_KEY = 'matstat-progress';

const storage = createSafeStorage(typeof localStorage !== 'undefined' ? localStorage : undefined);

export interface ProgressData {
  completedLabs: string[];
  completedQuizzes: Record<string, number>; // quizId -> best score %
  completedCourseTopics: Record<string, string[]>; // courseId -> topicIds
  lastActivity: string; // ISO date
}

const getDefaultProgress = (): ProgressData => ({
  completedLabs: [],
  completedQuizzes: {},
  completedCourseTopics: {},
  lastActivity: new Date().toISOString(),
});

export const getProgress = (): ProgressData => {
  try {
    const stored = storage.getItem(PROGRESS_KEY);
    if (!stored) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(stored) };
  } catch {
    return getDefaultProgress();
  }
};

const saveProgress = (data: ProgressData) => {
  data.lastActivity = new Date().toISOString();
  storage.setItem(PROGRESS_KEY, JSON.stringify(data));
};

export const markLabCompleted = (labId: string) => {
  const p = getProgress();
  if (!p.completedLabs.includes(labId)) {
    p.completedLabs.push(labId);
    saveProgress(p);
  }
};

export const saveQuizScore = (quizId: string, scorePercent: number) => {
  const p = getProgress();
  const prev = p.completedQuizzes[quizId] || 0;
  if (scorePercent > prev) {
    p.completedQuizzes[quizId] = scorePercent;
    saveProgress(p);
  }
};

export const markTopicCompleted = (courseId: string, topicId: string) => {
  const p = getProgress();
  if (!p.completedCourseTopics[courseId]) {
    p.completedCourseTopics[courseId] = [];
  }
  if (!p.completedCourseTopics[courseId].includes(topicId)) {
    p.completedCourseTopics[courseId].push(topicId);
    saveProgress(p);
  }
};

export const getLabProgress = (labId: string): boolean => {
  return getProgress().completedLabs.includes(labId);
};

export const getCourseProgress = (courseId: string, totalTopics: number): number => {
  const p = getProgress();
  const completed = p.completedCourseTopics[courseId]?.length || 0;
  return totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
};

export const getTotalProgress = (): { labs: number; quizzes: number; topics: number } => {
  const p = getProgress();
  return {
    labs: p.completedLabs.length,
    quizzes: Object.keys(p.completedQuizzes).length,
    topics: Object.values(p.completedCourseTopics).reduce((sum, arr) => sum + arr.length, 0),
  };
};

export const resetProgress = () => {
  storage.removeItem(PROGRESS_KEY);
};
