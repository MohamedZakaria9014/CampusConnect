import { Profile } from '../types/models';

export interface TopStudentCriteria {
  minGPA: number;
  minReputation: number;
  minHelpfulAnswers: number;
  minBestAnswers: number;
}

export const DEFAULT_TOP_STUDENT_CRITERIA: TopStudentCriteria = {
  minGPA: 3.6,
  minReputation: 100,
  minHelpfulAnswers: 10,
  minBestAnswers: 3,
};

export interface QualificationResult {
  isTopStudent: boolean;
  qualifyingReasons: string[];
  progressToNext: {
    gpaProgress: number; // 0..100
    repProgress: number;
    helpfulProgress: number;
    bestAnswersProgress: number;
  };
}

/**
 * Reusable dynamic Top Student qualification engine.
 * A student qualifies if they meet ANY of the primary excellence tiers (e.g. high GPA OR high reputation OR best answers).
 */
export function evaluateTopStudentStatus(
  profile: Partial<Profile>,
  criteria: TopStudentCriteria = DEFAULT_TOP_STUDENT_CRITERIA
): QualificationResult {
  const gpa = profile.gpa || 0;
  const reputation = profile.reputation || 0;
  const helpfulAnswers = profile.helpful_answers_count || 0;
  const bestAnswers = profile.best_answers_count || 0;

  const qualifyingReasons: string[] = [];

  if (gpa >= criteria.minGPA) {
    qualifyingReasons.push(`Academic Excellence (GPA: ${gpa.toFixed(2)} / 4.0)`);
  }

  if (reputation >= criteria.minReputation) {
    qualifyingReasons.push(`Community Reputation (${reputation} Points)`);
  }

  if (helpfulAnswers >= criteria.minHelpfulAnswers) {
    qualifyingReasons.push(`Helpful Answers (${helpfulAnswers} Upvoted Solutions)`);
  }

  if (bestAnswers >= criteria.minBestAnswers) {
    qualifyingReasons.push(`Solution Specialist (${bestAnswers} Best Answers)`);
  }

  const isTopStudent = qualifyingReasons.length > 0 || !!profile.is_top_student;

  return {
    isTopStudent,
    qualifyingReasons,
    progressToNext: {
      gpaProgress: Math.min(100, Math.round((gpa / criteria.minGPA) * 100)),
      repProgress: Math.min(100, Math.round((reputation / criteria.minReputation) * 100)),
      helpfulProgress: Math.min(100, Math.round((helpfulAnswers / criteria.minHelpfulAnswers) * 100)),
      bestAnswersProgress: Math.min(100, Math.round((bestAnswers / criteria.minBestAnswers) * 100)),
    },
  };
}
