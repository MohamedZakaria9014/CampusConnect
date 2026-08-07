-- ========================================================
-- CAMPUS CONNECT - COMPREHENSIVE SEED DATA MIGRATION
-- ========================================================

-- Seed Universities
INSERT INTO public.universities (id, name, short_name, location, logo_url, banner_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Cairo University', 'CU', 'Giza, Egypt', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200', 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'),
('22222222-2222-2222-2222-222222222222', 'Massachusetts Institute of Technology', 'MIT', 'Cambridge, MA, USA', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800'),
('33333333-3333-3333-3333-333333333333', 'Stanford University', 'Stanford', 'Stanford, CA, USA', 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=200', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800'),
('44444444-4444-4444-4444-444444444444', 'University of Oxford', 'Oxford', 'Oxford, UK', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800')
ON CONFLICT (id) DO NOTHING;

-- Seed Courses
INSERT INTO public.courses (id, university_id, code, name, department) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'CS101', 'Data Structures & Algorithms', 'Computer Science'),
('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'MATH201', 'Multivariable Calculus & Linear Algebra', 'Mathematics'),
('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'PHYS102', 'Electromagnetism & Wave Physics', 'Physics'),
('c4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '6.006', 'Introduction to Algorithms', 'EECS'),
('c5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'CS229', 'Machine Learning', 'Computer Science')
ON CONFLICT (id) DO NOTHING;

-- Seed Badges
INSERT INTO public.badges (id, slug, name, description, icon_name, color) VALUES
('b1111111-1111-1111-1111-111111111111', 'top_student', 'Top Student', 'Earned by maintaining high GPA and providing exceptional academic solutions.', 'award', '#6366F1'),
('b2222222-2222-2222-2222-222222222222', 'math_genius', 'Math Master', 'Solves complex mathematical equations and proofs.', 'calculator', '#10B981'),
('b3333333-3333-3333-3333-333333333333', 'code_ninja', 'Code Ninja', 'Provides clean, working code snippets and debugging help.', 'code', '#F59E0B'),
('b4444444-4444-4444-4444-444444444444', 'helpful_peer', 'Helpful Peer', 'Earned 10+ upvoted explanations in the community.', 'heart', '#EC4899'),
('b5555555-5555-5555-5555-555555555555', 'best_answer_king', 'Solution Specialist', 'Selected as Best Answer 5 or more times.', 'check-circle', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;
