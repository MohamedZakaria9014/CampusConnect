-- ========================================================
-- SEED AUTH USERS, PROFILES, & POSTS FOR LIVE SUPABASE DATABASE
-- ========================================================

-- Insert Auth Users
INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'omar@cairo.edu.eg',
    '$2a$10$abcdefghijklmnopqrstuu',
    NOW(),
    '{"full_name": "Omar Hassan", "username": "omar_cs"}'::jsonb,
    NOW(),
    NOW()
),
(
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'nour@cairo.edu.eg',
    '$2a$10$abcdefghijklmnopqrstuu',
    NOW(),
    '{"full_name": "Nour El-Din", "username": "nour_math"}'::jsonb,
    NOW(),
    NOW()
),
(
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sara@mit.edu',
    '$2a$10$abcdefghijklmnopqrstuu',
    NOW(),
    '{"full_name": "Sara Ahmed", "username": "sara_phys"}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Update profiles with rich academic metadata
UPDATE public.profiles SET
    university_id = '11111111-1111-1111-1111-111111111111',
    major = 'Computer Science',
    program = 'B.Sc. Software Engineering',
    year = 'Senior (Year 4)',
    semester = 2,
    gpa = 3.92,
    bio = 'Passionate about algorithms, distributed systems, and competitive programming. Top student helper!',
    is_top_student = TRUE,
    reputation = 480,
    avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
    university_id = '11111111-1111-1111-1111-111111111111',
    major = 'Applied Mathematics',
    program = 'B.Sc. Mathematics',
    year = 'Junior (Year 3)',
    semester = 1,
    gpa = 3.85,
    bio = 'Solving differential equations for fun. Ask me anything math related!',
    is_top_student = TRUE,
    reputation = 340,
    avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
    university_id = '22222222-2222-2222-2222-222222222222',
    major = 'Physics',
    program = 'B.Sc. Physics',
    year = 'Sophomore (Year 2)',
    semester = 2,
    gpa = 3.75,
    bio = 'Exploring quantum mechanics and wave physics.',
    is_top_student = FALSE,
    reputation = 150,
    avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
WHERE id = 'a0000000-0000-0000-0000-000000000003';

-- Insert Seed Posts
INSERT INTO public.posts (
    id, author_id, university_id, course_id, category, title, content, code_snippet, code_language, image_urls, tags, upvotes_count, answers_count, views_count, is_solved
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Programming',
    'How to optimize Dijkstra Algorithm for sparse graphs in O((V + E) log V)?',
    'I am implementing Dijkstra algorithm in C++ for my CS101 assignment. When I use an adjacency matrix it takes O(V^2), but how do I correctly structure a priority_queue with an adjacency list in C++ to achieve O((V+E) log V)? Here is my current snippet.',
    '#include <iostream>
#include <vector>
#include <queue>

using namespace std;

typedef pair<int, int> pii;

void dijkstra(int src, int V, vector<vector<pii>>& adj) {
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    vector<int> dist(V, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto& edge : adj[u]) {
            int v = edge.first;
            int weight = edge.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
}',
    'cpp',
    ARRAY['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800'],
    ARRAY['Algorithms', 'C++', 'DataStructures'],
    24,
    1,
    180,
    TRUE
),
(
    '00000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222',
    'Mathematics',
    'Evaluating surface integral using Stokes Theorem',
    'Stuck on problem 4 in MATH201 homework. We are asked to evaluate the curl of F = (y, -x, z) over the paraboloid z = 4 - x^2 - y^2 bounded by z >= 0. Should I integrate directly over the disk boundary in the xy-plane?',
    'Stokes Theorem Statement:
\oint_C \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S}

Boundary curve C: circle x^2 + y^2 = 4 in z = 0, counterclockwise.',
    'latex',
    ARRAY['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'],
    ARRAY['Calculus', 'LinearAlgebra', 'StokesTheorem'],
    38,
    0,
    310,
    FALSE
)
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Answer
INSERT INTO public.comments (
    id, post_id, author_id, content, code_snippet, code_language, upvotes_count, is_best_answer
) VALUES
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Your C++ implementation is already very close! The key optimization to avoid stale pairs in priority_queue is the `if (d > dist[u]) continue;` check, which you already included! Make sure your adjacency list representation uses `vector<vector<pair<int,int>>> adj(V)` where pair is `{neighbor, weight}`.',
    'void addEdge(vector<vector<pii>>& adj, int u, int v, int w) {
    adj[u].push_back({v, w});
    adj[v].push_back({u, w}); // Undirected graph
}',
    'cpp',
    18,
    TRUE
)
ON CONFLICT (id) DO NOTHING;
