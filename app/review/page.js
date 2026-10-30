import { createClient } from '../../utils/supabase/server.js';
import ReviewQueueClient from './ReviewQueueClient.js';

export const dynamic = 'force-dynamic';

export default async function ReviewPage() {
  const supabase = await createClient();

  // 1. Server-side reviewer check before loading any pending entries
  const { data: isReviewer, error: reviewerError } = await supabase.rpc('is_reviewer');

  if (reviewerError || isReviewer !== true) {
    return (
      <main
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          backgroundColor: '#0C0A09',
          color: '#E7E3DF'
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            padding: '40px 28px',
            backgroundColor: '#16120E',
            border: '1px solid #3E2419',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 18px',
              borderRadius: '50%',
              backgroundColor: '#261710',
              border: '1px solid #522E1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '22px',
              color: '#FFFFFF',
              margin: '0 0 10px',
              fontWeight: 600,
              fontFamily: 'var(--font-serif), Georgia, serif'
            }}
          >
            អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#A8A29E',
              margin: '0 0 24px',
              lineHeight: 1.6
            }}
          >
            You do not have permission to access the reviewer queue.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '9px 24px',
              borderRadius: '9999px',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
            }}
          >
            Back to Archive
          </a>
        </div>
      </main>
    );
  }

  // 2. Reviewer authorized: Load pending entries oldest first (created_at ascending)
  const { data: pendingEntries, error: entriesError } = await supabase
    .from('entries')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (entriesError) {
    console.error('Error fetching pending queue:', entriesError);
  }

  return <ReviewQueueClient initialEntries={pendingEntries || []} />;
}
