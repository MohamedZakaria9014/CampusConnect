export interface CampusMajor {
  id: string;
  name: string;
  category: string;
}

export const CAMPUS_MAJORS: CampusMajor[] = [
  // Computer Science & Information Technology
  { id: 'cs', name: 'Computer Science', category: 'Engineering & Computing' },
  { id: 'se', name: 'Software Engineering', category: 'Engineering & Computing' },
  { id: 'ai', name: 'Artificial Intelligence & Data Science', category: 'Engineering & Computing' },
  { id: 'is', name: 'Information Systems', category: 'Engineering & Computing' },
  { id: 'cyber', name: 'Cybersecurity', category: 'Engineering & Computing' },
  { id: 'ce', name: 'Computer Engineering', category: 'Engineering & Computing' },

  // Engineering
  { id: 'ee', name: 'Electrical Engineering', category: 'Engineering & Computing' },
  { id: 'me', name: 'Mechanical Engineering', category: 'Engineering & Computing' },
  { id: 'cve', name: 'Civil & Architectural Engineering', category: 'Engineering & Computing' },
  { id: 'che', name: 'Chemical Engineering', category: 'Engineering & Computing' },
  { id: 'bme', name: 'Biomedical Engineering', category: 'Engineering & Computing' },

  // Sciences & Mathematics
  { id: 'math', name: 'Mathematics & Statistics', category: 'Sciences' },
  { id: 'phys', name: 'Physics & Astronomy', category: 'Sciences' },
  { id: 'chem', name: 'Chemistry', category: 'Sciences' },
  { id: 'bio', name: 'Biological Sciences & Genetics', category: 'Sciences' },

  // Health & Medicine
  { id: 'med', name: 'Medicine & Surgery', category: 'Health & Medical' },
  { id: 'pharm', name: 'Pharmacy & Drug Design', category: 'Health & Medical' },
  { id: 'dent', name: 'Dentistry', category: 'Health & Medical' },
  { id: 'nurs', name: 'Nursing', category: 'Health & Medical' },

  // Business & Social Sciences
  { id: 'bus', name: 'Business Administration & Management', category: 'Business & Economics' },
  { id: 'fin', name: 'Finance & Accounting', category: 'Business & Economics' },
  { id: 'econ', name: 'Economics', category: 'Business & Economics' },
  { id: 'mkt', name: 'Marketing & Digital Media', category: 'Business & Economics' },

  // Humanities & Law
  { id: 'law', name: 'Law & Legal Studies', category: 'Law & Humanities' },
  { id: 'comm', name: 'Mass Communication & Journalism', category: 'Law & Humanities' },
  { id: 'arts', name: 'Fine Arts & Architecture Design', category: 'Law & Humanities' },
  { id: 'lang', name: 'Languages & Translation', category: 'Law & Humanities' },
];
