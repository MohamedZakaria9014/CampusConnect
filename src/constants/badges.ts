export interface BadgeCriteria {
  label: string;
  requirement: string;
}

export interface BadgeDef {
  slug: string;
  name: string;
  category: string;
  description: string;
  howToAchieve: string;
  criteria: BadgeCriteria[];
  iconName: "award" | "calculator" | "code" | "heart" | "check-circle";
  color: string;
  bgTint: string;
}

export const PREDEFINED_BADGES: BadgeDef[] = [
  {
    slug: "top_student",
    name: "Top Student",
    category: "Academic Honor",
    description:
      "The highest academic badge in CampusConnect, awarded to students demonstrating stellar academic standing and continuous peer support.",
    howToAchieve:
      "Maintain a cumulative GPA of 3.80 or higher (or 3.60+ with verified transcript from university administration) and reach at least 300 academic reputation points by solving classmates questions.",
    criteria: [
      { label: "GPA Threshold", requirement: ">= 3.80 cumulative GPA" },
      {
        label: "Community Reputation",
        requirement: ">= 300 reputation points",
      },
      {
        label: "Verification",
        requirement: "Official transcript or automatic honors review",
      },
    ],
    iconName: "award",
    color: "#6366F1",
    bgTint: "rgba(99, 102, 241, 0.15)",
  },
  {
    slug: "math_genius",
    name: "Math Master",
    category: "Subject Mastery",
    description:
      "Awarded to mathematical thinkers who untangle complex calculus integrals, linear algebra matrices, and mathematical proofs.",
    howToAchieve:
      "Publish 5 or more verified solutions, step-by-step proofs, or formula explanations with community upvotes under the Mathematics, Statistics, or Physics categories.",
    criteria: [
      {
        label: "Math Solutions",
        requirement: "5+ upvoted solutions in Mathematics/Calculus",
      },
      {
        label: "Peer Validation",
        requirement: "Zero moderation disputes on derivation steps",
      },
    ],
    iconName: "calculator",
    color: "#10B981",
    bgTint: "rgba(16, 185, 129, 0.15)",
  },
  {
    slug: "code_ninja",
    name: "Code Ninja",
    category: "Technical Mastery",
    description:
      "Celebrates coders who debug obscure runtime crashes, write efficient algorithms, and post clean, syntax-highlighted code.",
    howToAchieve:
      "Provide 5 or more accepted programming solutions featuring formatted code blocks (Python, C++, Java, JS/TS, Rust) resolving algorithmic bottlenecks or runtime bugs.",
    criteria: [
      {
        label: "Code Snippets",
        requirement: "5+ accepted answers with formatted code",
      },
      {
        label: "Complexity Optimization",
        requirement: "Help peers optimize big-O time/space complexity",
      },
    ],
    iconName: "code",
    color: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.15)",
  },
  {
    slug: "helpful_peer",
    name: "Helpful Peer",
    category: "Community Spirit",
    description:
      "Recognizes students who embody the spirit of collaborative learning by offering friendly guidance and quick answers.",
    howToAchieve:
      "Accumulate 10 or more total upvotes on your answers and constructive explanations across any campus course or department.",
    criteria: [
      {
        label: "Community Upvotes",
        requirement: "10+ total upvotes across submitted answers",
      },
      {
        label: "Active Support",
        requirement: "Answer questions across multiple courses",
      },
    ],
    iconName: "heart",
    color: "#EC4899",
    bgTint: "rgba(236, 72, 153, 0.15)",
  },
  {
    slug: "best_answer_king",
    name: "Solution Specialist",
    category: "Academic Excellence",
    description:
      "The mark of ultimate authority. Your solutions are so accurate and comprehensive that authors repeatedly pick them as the Best Answer.",
    howToAchieve:
      'Have your answer selected as the official "Best Answer" by question authors or verified Top Students 5 or more times.',
    criteria: [
      {
        label: "Best Answer Accolades",
        requirement: "Selected as Best Answer 5+ times",
      },
      {
        label: "Excellence Standard",
        requirement: "Provides comprehensive, cited step-by-step steps",
      },
    ],
    iconName: "check-circle",
    color: "#8B5CF6",
    bgTint: "rgba(139, 92, 246, 0.15)",
  },
];

export function isBadgeEarned(slug: string, user?: any): boolean {
  if (!user) return false;
  switch (slug) {
    case "top_student":
      return (
        !!user.is_top_student ||
        (Number(user.gpa || 0) >= 3.8 && (user.reputation || 0) >= 300)
      );
    case "math_genius":
      return (
        (user.reputation || 0) >= 150 || (user.helpful_answers_count || 0) >= 5
      );
    case "code_ninja":
      return (
        (user.reputation || 0) >= 100 || (user.helpful_answers_count || 0) >= 3
      );
    case "helpful_peer":
      return (
        (user.helpful_answers_count || 0) >= 10 || (user.reputation || 0) >= 50
      );
    case "best_answer_king":
      return (user.best_answers_count || 0) >= 5;
    default:
      return false;
  }
}
