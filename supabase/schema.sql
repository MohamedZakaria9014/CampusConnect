-- ========================================================
-- CAMPUS CONNECT - PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. UNIVERSITIES TABLE
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    short_name TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, code)
);

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    major TEXT,
    program TEXT,
    year TEXT,
    semester INTEGER,
    gpa NUMERIC(3, 2) DEFAULT 0.00,
    bio TEXT,
    is_top_student BOOLEAN DEFAULT FALSE,
    reputation INTEGER DEFAULT 0,
    questions_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    helpful_answers_count INTEGER DEFAULT 0,
    best_answers_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POSTS (QUESTIONS) TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('Mathematics', 'Programming', 'Physics', 'Chemistry', 'Engineering', 'Business', 'Other')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    code_snippet TEXT,
    code_language TEXT,
    image_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    upvotes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMENTS (ANSWERS & REPLIES) TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    code_snippet TEXT,
    code_language TEXT,
    image_urls TEXT[] DEFAULT '{}',
    upvotes_count INTEGER DEFAULT 0,
    is_best_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. POST LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 7. COMMENT VOTES TABLE
CREATE TABLE IF NOT EXISTS public.comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- 8. SAVED POSTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 9. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT FALSE,
    name TEXT,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONVERSATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- 11. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    image_url TEXT,
    code_snippet TEXT,
    code_language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_answer', 'new_comment', 'answer_upvoted', 'answer_best', 'new_message', 'mention', 'new_follower', 'badge_earned')),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. USER BADGES TABLE
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 15. FOLLOWERS TABLE
CREATE TABLE IF NOT EXISTS public.followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- ========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_university ON public.posts(university_id);
CREATE INDEX IF NOT EXISTS idx_posts_course ON public.posts(course_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);

-- ========================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ========================================================

-- Trigger to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update post questions count on profile
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles SET questions_count = questions_count + 1 WHERE id = NEW.author_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles SET questions_count = GREATEST(0, questions_count - 1) WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_counts
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Trigger to update post answers count & user answers count
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET answers_count = answers_count + 1 WHERE id = NEW.post_id;
        UPDATE public.profiles SET answers_count = answers_count + 1 WHERE id = NEW.author_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET answers_count = GREATEST(0, answers_count - 1) WHERE id = OLD.post_id;
        UPDATE public.profiles SET answers_count = GREATEST(0, answers_count - 1) WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_counts
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- Trigger to handle post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET upvotes_count = upvotes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_likes_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger to handle comment votes & user reputation
CREATE OR REPLACE FUNCTION update_comment_votes_count()
RETURNS TRIGGER AS $$
DECLARE
    target_author_id UUID;
    delta INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        delta := NEW.vote_type;
        SELECT author_id INTO target_author_id FROM public.comments WHERE id = NEW.comment_id;
        UPDATE public.comments SET upvotes_count = upvotes_count + delta WHERE id = NEW.comment_id;
        IF delta > 0 THEN
            UPDATE public.profiles SET reputation = reputation + 10, helpful_answers_count = helpful_answers_count + 1 WHERE id = target_author_id;
        ELSE
            UPDATE public.profiles SET reputation = GREATEST(0, reputation - 5) WHERE id = target_author_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        delta := OLD.vote_type;
        SELECT author_id INTO target_author_id FROM public.comments WHERE id = OLD.comment_id;
        UPDATE public.comments SET upvotes_count = upvotes_count - delta WHERE id = OLD.comment_id;
        IF delta > 0 THEN
            UPDATE public.profiles SET reputation = GREATEST(0, reputation - 10), helpful_answers_count = GREATEST(0, helpful_answers_count - 1) WHERE id = target_author_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_votes_count
    AFTER INSERT OR DELETE ON public.comment_votes
    FOR EACH ROW EXECUTE FUNCTION update_comment_votes_count();

-- Trigger for followers count
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
        UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follower_counts
    AFTER INSERT OR DELETE ON public.followers
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to recalculate Top Student status
CREATE OR REPLACE FUNCTION check_top_student_status(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    user_rec RECORD;
BEGIN
    SELECT gpa, reputation, helpful_answers_count, best_answers_count INTO user_rec
    FROM public.profiles WHERE id = user_uuid;
    
    IF (user_rec.gpa >= 3.5 OR user_rec.reputation >= 100 OR user_rec.best_answers_count >= 3 OR user_rec.helpful_answers_count >= 10) THEN
        UPDATE public.profiles SET is_top_student = TRUE WHERE id = user_uuid;
    ELSE
        UPDATE public.profiles SET is_top_student = FALSE WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- UNIVERSITIES: Public read, admin write
CREATE POLICY "Public read universities" ON public.universities FOR SELECT USING (true);

-- COURSES: Public read, admin write
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

-- PROFILES: Public read, user self edit
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- POSTS: Public read, authenticated create, author edit/delete
CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated create post" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author update post" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Author delete post" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- COMMENTS: Public read, authenticated create, author edit/delete
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated create comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author update comment" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Author delete comment" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- POST LIKES: Public read, authenticated toggle
CREATE POLICY "Public read post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "User insert post like" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete post like" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENT VOTES: Public read, authenticated toggle
CREATE POLICY "Public read comment votes" ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "User insert comment vote" ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete comment vote" ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- SAVED POSTS: User only
CREATE POLICY "User read saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User insert saved post" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete saved post" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- CONVERSATIONS & MEMBERS: Only conversation members
CREATE POLICY "Member read conversations" ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated create conversation" ON public.conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Member read members" ON public.conversation_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Member insert member" ON public.conversation_members FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
));

-- MESSAGES: Only conversation members can read and send
CREATE POLICY "Member read messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Member insert message" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- NOTIFICATIONS: Recipient only
CREATE POLICY "User read notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert notification" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "User update notification" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- BADGES: Public read
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Public read user badges" ON public.user_badges FOR SELECT USING (true);

-- FOLLOWERS: Public read, user toggle
CREATE POLICY "Public read followers" ON public.followers FOR SELECT USING (true);
CREATE POLICY "User insert follower" ON public.followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "User delete follower" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- Enable Realtime for Chat Messages and Notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
