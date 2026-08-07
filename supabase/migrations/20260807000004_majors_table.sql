-- ========================================================
-- MAJORS TABLE & SEED DATA MIGRATION
-- ========================================================

CREATE TABLE IF NOT EXISTS public.majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read majors" ON public.majors FOR SELECT USING (true);

INSERT INTO public.majors (name, category) VALUES
-- Computer & Information Technology
('Computer Science', 'Technology'),
('Software Engineering', 'Technology'),
('Artificial Intelligence & Machine Learning', 'Technology'),
('Cybersecurity & Information Security', 'Technology'),
('Data Science & Analytics', 'Technology'),
('Information Systems', 'Technology'),
('Computer Engineering', 'Technology'),
('Bioinformatics', 'Technology'),
('Game Development & Multimedia', 'Technology'),

-- Engineering & Technology
('Civil Engineering', 'Engineering'),
('Mechanical Engineering', 'Engineering'),
('Electrical & Electronics Engineering', 'Engineering'),
('Architectural Engineering', 'Engineering'),
('Mechatronics & Robotics Engineering', 'Engineering'),
('Biomedical Engineering', 'Engineering'),
('Chemical Engineering', 'Engineering'),
('Petroleum & Mining Engineering', 'Engineering'),
('Aerospace Engineering', 'Engineering'),
('Industrial Engineering', 'Engineering'),

-- Medical & Health Sciences
('Medicine & Surgery (MBBS)', 'Medical'),
('Dentistry', 'Medical'),
('Pharmacy (PharmD)', 'Medical'),
('Physical Therapy', 'Medical'),
('Nursing', 'Medical'),
('Veterinary Medicine', 'Medical'),
('Medical Laboratory Sciences', 'Medical'),
('Radiology & Medical Imaging', 'Medical'),

-- Business & Management
('Business Administration', 'Business'),
('Accounting & Finance', 'Business'),
('Marketing & Digital Media', 'Business'),
('Economics & Political Science', 'Business'),
('Management Information Systems (MIS)', 'Business'),
('Supply Chain & Logistics', 'Business'),
('Entrepreneurship & Innovation', 'Business'),

-- Natural Sciences
('Applied Mathematics', 'Sciences'),
('Physics & Quantum Science', 'Sciences'),
('Chemistry', 'Sciences'),
('Biotechnology', 'Sciences'),
('Geology & Earth Sciences', 'Sciences'),
('Environmental Science', 'Sciences'),

-- Arts, Humanities & Law
('Law & Legal Studies', 'Humanities'),
('Mass Communication & Journalism', 'Humanities'),
('Graphic Design & Digital Arts', 'Arts'),
('Fine Arts & Sculpture', 'Arts'),
('Interior Architecture & Design', 'Arts'),
('English Language & Literature', 'Humanities'),
('Translation & Linguistics', 'Humanities'),
('Psychology', 'Humanities')
ON CONFLICT (name) DO NOTHING;
