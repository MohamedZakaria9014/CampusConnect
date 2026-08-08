export const CATEGORIES = [
  { id: 'All', label: 'All Subjects', icon: 'compass' },
  { id: 'Mathematics', label: 'Mathematics', icon: 'calculator' },
  { id: 'Programming', label: 'Programming', icon: 'code' },
  { id: 'Physics', label: 'Physics', icon: 'zap' },
  { id: 'Chemistry', label: 'Chemistry', icon: 'flask-conical' },
  { id: 'Engineering', label: 'Engineering', icon: 'cpu' },
  { id: 'Medicine', label: 'Medicine', icon: 'stethoscope' },
  { id: 'Business', label: 'Business', icon: 'briefcase' },
  { id: 'Other', label: 'Other', icon: 'more-horizontal' },
] as const;

export type CategoryType = (typeof CATEGORIES)[number]['id'];
