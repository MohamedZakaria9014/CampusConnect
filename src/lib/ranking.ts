import { CommentAnswer } from '../types/models';

export interface RankingWeights {
  bestAnswerBonus: number;
  upvoteWeight: number;
  gpaWeight: number;
  reputationWeight: number;
  recencyDecayHours: number;
  topStudentBonus: number;
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  bestAnswerBonus: 100, // Best Answer gets huge priority
  upvoteWeight: 10,     // 10 pts per upvote
  gpaWeight: 5,         // 5 pts per GPA point (e.g. 4.0 * 5 = 20 pts)
  reputationWeight: 0.2,// 0.2 pts per rep point
  recencyDecayHours: 48, // 48h decay baseline
  topStudentBonus: 15,  // 15 pts bonus for top students
};

/**
 * Calculates a composite quality score for an answer.
 * Formula:
 * Score = (IsBestAnswer * 100) + (Upvotes * 10) + (GPA * 5) + (Reputation * 0.2) + (IsTopStudent * 15) - (HoursOld / 48)
 */
export function calculateAnswerScore(
  answer: CommentAnswer,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): number {
  let score = 0;

  // 1. Best Answer Selection (Highest priority)
  if (answer.is_best_answer) {
    score += weights.bestAnswerBonus;
  }

  // 2. Upvotes
  score += (answer.upvotes_count || 0) * weights.upvoteWeight;

  // 3. Author Credentials (GPA, Reputation, Top Student Status)
  if (answer.author) {
    const gpa = answer.author.gpa || 0;
    const rep = answer.author.reputation || 0;
    
    score += gpa * weights.gpaWeight;
    score += rep * weights.reputationWeight;

    if (answer.author.is_top_student) {
      score += weights.topStudentBonus;
    }
  }

  // 4. Recency penalty (subtle time decay)
  const createdDate = new Date(answer.created_at).getTime();
  const now = Date.now();
  const hoursOld = (now - createdDate) / (1000 * 60 * 60);
  const decayPenalty = hoursOld / weights.recencyDecayHours;
  
  score -= Math.min(decayPenalty, 15); // Cap penalty at 15 points

  return Math.round(score * 100) / 100;
}

/**
 * Sorts answers array based on selected sort option
 */
export function sortAnswers(
  answers: CommentAnswer[],
  sortBy: 'best' | 'upvoted' | 'top_students' | 'newest'
): CommentAnswer[] {
  const list = [...answers];

  switch (sortBy) {
    case 'best':
      return list.sort((a, b) => calculateAnswerScore(b) - calculateAnswerScore(a));

    case 'upvoted':
      return list.sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0));

    case 'top_students':
      return list.sort((a, b) => {
        const aTop = a.author?.is_top_student ? 1 : 0;
        const bTop = b.author?.is_top_student ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return (b.author?.gpa || 0) - (a.author?.gpa || 0);
      });

    case 'newest':
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    default:
      return list;
  }
}
