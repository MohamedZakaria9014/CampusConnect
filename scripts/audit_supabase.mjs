import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const envVars: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim();
    envVars[key] = val;
  }
}

const supabaseUrl = envVars.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuditResult {
  tableOrFeature: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  count?: number;
  sample?: any;
}

async function runAudit() {
  console.log('🔍 Starting CampusConnect Supabase Live Audit...\n');
  console.log(`Connecting to: ${supabaseUrl}\n`);

  const results: AuditResult[] = [];

  // 1. Universities
  try {
    const { data, error } = await supabase.from('universities').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'universities', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'universities',
        status: 'PASS',
        message: `Successfully queried table. Found ${data.length} records in sample.`,
        count: data.length,
        sample: data.map(u => ({ id: u.id, name: u.name, short: u.short_name }))
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'universities', status: 'FAIL', message: err.message });
  }

  // 2. Majors
  try {
    const { data, error } = await supabase.from('majors').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'majors', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'majors',
        status: 'PASS',
        message: `Successfully queried table. Found ${data.length} records in sample.`,
        count: data.length,
        sample: data.map(m => ({ id: m.id, name: m.name, category: m.category }))
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'majors', status: 'FAIL', message: err.message });
  }

  // 3. Courses (check if courses table exists)
  try {
    const { data, error } = await supabase.from('courses').select('*').limit(5);
    if (error) {
      results.push({
        tableOrFeature: 'courses (table)',
        status: 'WARN',
        message: `Table does not exist or cannot be queried: ${error.message} (expected if dropped in migration 6)`
      });
    } else {
      results.push({
        tableOrFeature: 'courses (table)',
        status: 'PASS',
        message: `Found ${data.length} courses.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'courses (table)', status: 'WARN', message: err.message });
  }

  // 4. Profiles
  try {
    const { data, error } = await supabase.from('profiles').select('*, university:universities(*)').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'profiles', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'profiles',
        status: 'PASS',
        message: `Queried profiles with university join. Found ${data.length} records.`,
        count: data.length,
        sample: data.map(p => ({ id: p.id, full_name: p.full_name, username: p.username, major: p.major, uni: p.university?.name }))
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'profiles', status: 'FAIL', message: err.message });
  }

  // 5. Posts with joins
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(*, university:universities(*)), university:universities(*)')
      .limit(5);
    if (error) {
      results.push({ tableOrFeature: 'posts', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'posts',
        status: 'PASS',
        message: `Queried posts with author & university joins. Found ${data.length} records.`,
        count: data.length,
        sample: data.map(p => ({ id: p.id, title: p.title, course_code: p.course_code, author: p.author?.full_name }))
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'posts', status: 'FAIL', message: err.message });
  }

  // 6. Comments (Answers) with joins
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:profiles(*, university:universities(*))')
      .limit(5);
    if (error) {
      results.push({ tableOrFeature: 'comments (answers)', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'comments (answers)',
        status: 'PASS',
        message: `Queried comments with author join. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'comments (answers)', status: 'FAIL', message: err.message });
  }

  // 7. Post Likes
  try {
    const { data, error } = await supabase.from('post_likes').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'post_likes', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'post_likes',
        status: 'PASS',
        message: `Queried post_likes. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'post_likes', status: 'FAIL', message: err.message });
  }

  // 8. Saved Posts
  try {
    const { data, error } = await supabase.from('saved_posts').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'saved_posts', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'saved_posts',
        status: 'PASS',
        message: `Queried saved_posts. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'saved_posts', status: 'FAIL', message: err.message });
  }

  // 9. Comment Votes
  try {
    const { data, error } = await supabase.from('comment_votes').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'comment_votes', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'comment_votes',
        status: 'PASS',
        message: `Queried comment_votes. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'comment_votes', status: 'FAIL', message: err.message });
  }

  // 10. Followers
  try {
    const { data, error } = await supabase.from('followers').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'followers', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'followers',
        status: 'PASS',
        message: `Queried followers. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'followers', status: 'FAIL', message: err.message });
  }

  // 11. Conversations & Members
  try {
    const { data, error } = await supabase.from('conversations').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'conversations', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'conversations',
        status: 'PASS',
        message: `Queried conversations. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'conversations', status: 'FAIL', message: err.message });
  }

  // 12. Messages
  try {
    const { data, error } = await supabase.from('messages').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'messages', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'messages',
        status: 'PASS',
        message: `Queried messages. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'messages', status: 'FAIL', message: err.message });
  }

  // 13. Notifications
  try {
    const { data, error } = await supabase.from('notifications').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'notifications', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'notifications',
        status: 'PASS',
        message: `Queried notifications. Found ${data.length} records.`,
        count: data.length
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'notifications', status: 'FAIL', message: err.message });
  }

  // 14. Badges
  try {
    const { data, error } = await supabase.from('badges').select('*').limit(5);
    if (error) {
      results.push({ tableOrFeature: 'badges', status: 'FAIL', message: error.message });
    } else {
      results.push({
        tableOrFeature: 'badges',
        status: 'PASS',
        message: `Queried badges. Found ${data.length} records.`,
        count: data.length,
        sample: data.map(b => ({ name: b.name, slug: b.slug }))
      });
    }
  } catch (err: any) {
    results.push({ tableOrFeature: 'badges', status: 'FAIL', message: err.message });
  }

  // 15. Storage Buckets
  for (const bucket of ['avatars', 'posts', 'messages']) {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', { limit: 5 });
      if (error) {
        results.push({ tableOrFeature: `storage:${bucket}`, status: 'FAIL', message: error.message });
      } else {
        results.push({
          tableOrFeature: `storage:${bucket}`,
          status: 'PASS',
          message: `Storage bucket '${bucket}' is accessible. Found ${data.length} objects.`,
          count: data.length
        });
      }
    } catch (err: any) {
      results.push({ tableOrFeature: `storage:${bucket}`, status: 'FAIL', message: err.message });
    }
  }

  // Print Summary Table
  console.log('\n=================== AUDIT RESULTS ===================');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} [${r.status}] ${r.tableOrFeature.padEnd(25)} : ${r.message}`);
    if (r.sample) {
      console.log('   Sample:', JSON.stringify(r.sample, null, 2));
    }
  }
  console.log('=====================================================\n');
}

runAudit();
