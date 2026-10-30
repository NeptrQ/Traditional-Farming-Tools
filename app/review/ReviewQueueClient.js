'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client.js';
import StatusBadge from '../../components/StatusBadge.js';

export default function ReviewQueueClient({ initialEntries }) {
  const [entries, setEntries] = useState(initialEntries);
  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  async function handleDecision(entryId, decision) {
    setProcessingId(entryId);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const supabase = createClient();

      // RPC call - strictly calls review_entry (never updates entries directly!)
      const { data, error } = await supabase.rpc('review_entry', {
        entry_id: entryId,
        decision: decision
      });

      // Strict check: review_entry returns boolean true on success
      if (error || data !== true) {
        console.error('RPC review_entry failed:', error, 'data:', data);
        setErrorMessage('មិនអាចធ្វើការសម្រេចចិត្តបានទេ សូមព្យាយាមម្តងទៀត / Decision failed. Please try again.');
      } else {
        // Success: remove entry from queue
        setEntries((prev) => prev.filter((item) => item.id !== entryId));
        setFeedbackMessage(
          decision === 'published'
            ? 'បានផ្សព្វផ្សាយដោយជោគជ័យ / Entry published successfully.'
            : 'បានបញ្ជូនត្រឡប់ដោយជោគជ័យ / Entry returned for revision.'
        );
      }
    } catch (err) {
      console.error('Review exception:', err);
      setErrorMessage('មិនអាចធ្វើការសម្រេចចិត្តបានទេ សូមព្យាយាមម្តងទៀត / Decision failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#0C0A09',
        color: '#E7E3DF',
        padding: '24px 20px 80px 20px',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '450px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(234, 88, 12, 0.15) 0%, rgba(30, 16, 10, 0.6) 45%, transparent 75%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #281D17', paddingBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '9999px', backgroundColor: '#241610', border: '1px solid #522E1F', color: '#F59E0B', fontSize: '11px', fontFamily: 'monospace', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C' }}></span>
            <span>ជួរត្រួតពិនិត្យកំណត់ត្រា · CURATORIAL QUEUE</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px 0', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                Review Queue (បញ្ជីរង់ចាំការពិនិត្យ)
              </h1>
              <p style={{ fontSize: '14px', color: '#A8A29E', margin: 0, lineHeight: 1.5 }}>
                Reviewing pending agricultural tool submissions. Oldest submissions appear first.
              </p>
            </div>

            <div style={{ padding: '6px 14px', borderRadius: '12px', backgroundColor: '#1A1410', border: '1px solid #38251C', fontSize: '12px', fontFamily: 'monospace', color: '#F59E0B' }}>
              Pending: {entries.length}
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(21, 128, 61, 0.2)',
              border: '1px solid #16a34a',
              color: '#86efac',
              fontSize: '13px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(185, 28, 28, 0.2)',
              border: '1px solid #dc2626',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Empty Queue State */}
        {entries.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 24px',
              backgroundColor: '#15110E',
              border: '1px dashed #3D261C',
              borderRadius: '20px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#241610',
                border: '1px solid #522E1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: '20px',
                color: '#FFFFFF',
                margin: '0 0 8px 0',
                fontWeight: 500,
                fontFamily: 'var(--font-serif), Georgia, serif'
              }}
            >
              គ្មានកំណត់ត្រាកំពុងរង់ចាំការត្រួតពិនិត្យទេ
            </h2>
            <p style={{ fontSize: '14px', color: '#A8A29E', margin: '0 0 24px 0' }}>
              No pending entries in the queue.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '8px 22px',
                borderRadius: '9999px',
                backgroundColor: '#241610',
                border: '1px solid #522E1F',
                color: '#FED7AA',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Back to Archive
            </Link>
          </div>
        ) : (
          /* Queue Items List (Oldest First) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {entries.map((entry, idx) => (
              <QueueItem
                key={entry.id || idx}
                entry={entry}
                index={idx}
                isProcessing={processingId === entry.id}
                onPublish={() => handleDecision(entry.id, 'published')}
                onReturn={() => handleDecision(entry.id, 'returned')}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

function QueueItem({ entry, index, isProcessing, onPublish, onReturn }) {
  const [imgError, setImgError] = useState(false);
  const formattedDate = entry.created_at
    ? new Date(entry.created_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Unknown date';

  return (
    <div
      style={{
        backgroundColor: '#16120E',
        border: '1px solid rgba(82, 54, 42, 0.75)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Top Header: Catalog Tag, Submission Date & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #281D17', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#F59E0B', backgroundColor: '#241610', border: '1px solid #4D2D20', padding: '3px 8px', borderRadius: '6px' }}>
            QUEUE #{String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '12px', color: '#8C827A', fontFamily: 'monospace' }}>
            Submitted: {formattedDate}
          </span>
        </div>
        <StatusBadge status={entry.status || 'pending'} />
      </div>

      {/* Main Content Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Left: Photo / Woodcraft Fallback Plate */}
        <div
          style={{
            width: '100%',
            height: '210px',
            borderRadius: '14px',
            backgroundColor: '#0B0907',
            border: '1px solid #2B1D16',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {entry.photo_url && !imgError ? (
            <img
              src={entry.photo_url}
              alt={entry.title || 'Tool photo'}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, #221611 0%, #0F0C0A 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxSizing: 'border-box',
                textAlign: 'center'
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#8C827A', marginTop: '8px', letterSpacing: '1px' }}>
                SUBMITTED ARTIFACT
              </span>
            </div>
          )}
        </div>

        {/* Right: Implemement Lore Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '22px', color: '#FFFFFF', margin: '0 0 4px 0', fontWeight: 600, fontFamily: 'var(--font-serif), Georgia, serif' }}>
              {entry.title}
            </h2>
            {entry.english_name && (
              <div style={{ fontSize: '13px', color: '#F59E0B', fontStyle: 'italic', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                {entry.english_name}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {entry.category && (
              <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#EA580C', backgroundColor: 'rgba(234, 88, 12, 0.12)', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '3px 8px', borderRadius: '6px' }}>
                {entry.category}
              </span>
            )}
            {entry.place && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#A8A29E' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {entry.place}
              </span>
            )}
          </div>

          <p style={{ fontSize: '13.5px', color: '#D6D3D1', lineHeight: 1.6, margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>
            {entry.description || 'No description provided.'}
          </p>
        </div>

      </div>

      {/* Decision Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', borderTop: '1px solid #281D17', paddingTop: '16px' }}>
        
        {/* Return Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onReturn}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '9999px',
            backgroundColor: '#201310',
            border: '1px solid #7F1D1D',
            color: '#FCA5A5',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#2B1410';
              e.currentTarget.style.borderColor = '#DC2626';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#201310';
              e.currentTarget.style.borderColor = '#7F1D1D';
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
          <span>{isProcessing ? 'កំពុងដំណើរការ...' : 'បញ្ជូនត្រឡប់ / Return'}</span>
        </button>

        {/* Publish Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onPublish}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 20px',
            borderRadius: '9999px',
            backgroundColor: '#15803D',
            border: '1px solid #22c55e',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#16a34a';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(34, 197, 94, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = '#15803D';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.25)';
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{isProcessing ? 'កំពុងដំណើរការ...' : 'ផ្សព្វផ្សាយ / Publish'}</span>
        </button>

      </div>
    </div>
  );
}
