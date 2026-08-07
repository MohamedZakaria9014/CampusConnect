import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const completeProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  universityId: z.string().min(1, 'Please select your university'),
  major: z.string().min(2, 'Major is required (e.g. Computer Science)'),
  program: z.string().optional(),
  year: z.string().min(1, 'Year of study is required'),
  semester: z.string().optional(),
  gpa: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.0 && num <= 4.0;
    },
    { message: 'GPA must be between 0.00 and 4.00' }
  ),
  bio: z.string().max(250, 'Bio must be under 250 characters').optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(5, 'Question title must be at least 5 characters'),
  content: z.string().min(10, 'Explanation/details must be at least 10 characters'),
  category: z.enum(['Mathematics', 'Programming', 'Physics', 'Chemistry', 'Engineering', 'Business', 'Other']),
  courseId: z.string().optional(),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createAnswerSchema = z.object({
  content: z.string().min(5, 'Answer text must be at least 5 characters'),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type CreateAnswerFormData = z.infer<typeof createAnswerSchema>;
