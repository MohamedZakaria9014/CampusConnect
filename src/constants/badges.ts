export interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export const PREDEFINED_BADGES: BadgeDef[] = [
  {
    slug: 'top_student',
    name: 'Top Student',
    description: 'Awarded for maintaining high GPA and providing exceptional academic explanations.',
    iconName: 'award',
    color: '#6366F1',
  },
  {
    slug: 'math_genius',
    name: 'Math Master',
    description: 'Solves complex mathematical equations and proofs.',
    iconName: 'calculator',
    color: '#10B981',
  },
  {
    slug: 'code_ninja',
    name: 'Code Ninja',
    description: 'Provides clean, working code snippets and debugging help.',
    iconName: 'code',
    color: '#F59E0B',
  },
  {
    slug: 'helpful_peer',
    name: 'Helpful Peer',
    description: 'Earned 10+ upvoted explanations in the community.',
    iconName: 'heart',
    color: '#EC4899',
  },
  {
    slug: 'best_answer_king',
    name: 'Solution Specialist',
    description: 'Selected as Best Answer 5 or more times.',
    iconName: 'check-circle',
    color: '#8B5CF6',
  },
];
