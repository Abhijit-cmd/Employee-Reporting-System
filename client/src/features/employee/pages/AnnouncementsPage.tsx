import { useState, useEffect } from 'react'
import { apiFetch } from '../../../lib/api'
import { relativeTime } from '../../../lib/utils'
import { IconMegaphone } from '../../shared/icons'

interface Announcement {
  id: number
  title: string
  body: string
  createdAt: string
  author: { name: string }
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiFetch<Announcement[]>('/api/admin/announcements')
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="page-content">
      <div className="card emp-page-card">
        <div className="emp-page-topbar">
          <div>
            <div className="emp-page-heading">Announcements</div>
            <div className="emp-page-sub">Company-wide updates from management.</div>
          </div>
        </div>

        {loading && <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading announcements…</p>}
        {error && !loading && <p style={{ padding: 24, color: '#ef4444' }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.3, fontSize: 48 }}>
              <IconMegaphone />
            </div>
            <p style={{ margin: 0, fontWeight: 600 }}>No announcements yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Check back later for company updates.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 20px 20px' }}>
            {items.map((a) => (
              <div
                key={a.id}
                style={{
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  background: 'var(--bg-card, #fff)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: '#fdecea', color: '#c62828', borderRadius: 8, padding: 6, display: 'flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconMegaphone />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{a.title}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {relativeTime(a.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.body}</p>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  Posted by <strong>{a.author?.name ?? 'Admin'}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
