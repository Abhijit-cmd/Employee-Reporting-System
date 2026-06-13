import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../../lib/api'
import { showToast } from '../../../lib/feedback'
import { relativeTime } from '../../../lib/utils'
import { IconMegaphone, IconPlus, IconX } from '../../shared/icons'

interface Announcement {
  id: number
  title: string
  body: string
  createdAt: string
  author: { name: string }
}

// ── Compose Modal ──────────────────────────────────────────────────────────────
function ComposeModal({
  onClose,
  onPosted,
}: {
  onClose: () => void
  onPosted: (a: Announcement) => void
}) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      showToast('Title and message are required', 'error')
      return
    }
    setSubmitting(true)
    try {
      const created = await apiFetch<Announcement>('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      })
      onPosted(created)
      showToast('Announcement posted to all employees', 'success')
      onClose()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to post', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const TITLE_MAX = 120
  const BODY_MAX = 1000

  return (
    <>
      <div className="ann-modal-backdrop" onClick={onClose} />
      <div className="ann-modal">
        {/* Header */}
        <div className="ann-modal-header">
          <div className="ann-modal-header-left">
            <div className="ann-modal-icon">
              <IconMegaphone />
            </div>
            <div>
              <div className="ann-modal-title">New Announcement</div>
              <div className="ann-modal-sub">Will be visible to all employees immediately</div>
            </div>
          </div>
          <button className="ann-modal-close" type="button" onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="ann-modal-body">
          <div className="ann-field">
            <div className="ann-field-header">
              <label className="ann-label">Title</label>
              <span className="ann-char-count">{title.length} / {TITLE_MAX}</span>
            </div>
            <input
              ref={titleRef}
              className="ann-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="e.g. Office Closed on Friday"
              required
            />
          </div>

          <div className="ann-field">
            <div className="ann-field-header">
              <label className="ann-label">Message</label>
              <span className="ann-char-count">{body.length} / {BODY_MAX}</span>
            </div>
            <textarea
              className="ann-textarea"
              value={body}
              onChange={e => setBody(e.target.value.slice(0, BODY_MAX))}
              placeholder="Write your full announcement here. Be clear and concise…"
              rows={5}
              required
            />
          </div>

          <div className="ann-modal-footer">
            <button type="button" className="ann-btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="ann-btn-post"
              disabled={submitting || !title.trim() || !body.trim()}
            >
              {submitting ? 'Posting…' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

// ── Announcement card ──────────────────────────────────────────────────────────
function AnnouncementCard({
  item,
  isLast,
  onDelete,
  deleting,
}: {
  item: Announcement
  isLast: boolean
  onDelete: (id: number) => void
  deleting: boolean
}) {
  return (
    <div className={`ann-item${isLast ? ' last' : ''}`}>
      <div className="ann-item-icon">
        <IconMegaphone />
      </div>
      <div className="ann-item-body">
        <div className="ann-item-top">
          <span className="ann-item-title">{item.title}</span>
          <span className="ann-item-time">{relativeTime(item.createdAt)}</span>
        </div>
        <p className="ann-item-text">{item.body}</p>
        <div className="ann-item-meta">
          Posted by <strong>{item.author?.name ?? 'Manager'}</strong>
        </div>
      </div>
      <button
        type="button"
        title="Delete announcement"
        className="ann-item-delete"
        disabled={deleting}
        onClick={() => onDelete(item.id)}
      >
        <IconX />
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  useEffect(() => {
    setLoading(true)
    apiFetch<Announcement[]>('/api/admin/announcements')
      .then(data => { if (mountedRef.current) setItems(Array.isArray(data) ? data : []) })
      .catch(err => { if (mountedRef.current) showToast(err instanceof Error ? err.message : 'Failed to load', 'error') })
      .finally(() => { if (mountedRef.current) setLoading(false) })
  }, [])

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this announcement?')) return
    setDeletingId(id)
    try {
      await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(a => a.id !== id))
      showToast('Announcement deleted', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      if (mountedRef.current) setDeletingId(null)
    }
  }

  return (
    <main className="page-content">
      <div className="card ann-card">

        {/* Header */}
        <div className="ann-header">
          <div>
            <div className="emp-page-heading">Announcements</div>
            <div className="emp-page-sub">
              {loading ? 'Loading…' : `${items.length} announcement${items.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          <button className="ann-new-btn" type="button" onClick={() => setShowCompose(true)}>
            <IconPlus /> New Announcement
          </button>
        </div>

        {/* List */}
        {loading && (
          <p style={{ padding: '24px 24px', color: 'var(--text-muted)' }}>Loading announcements…</p>
        )}

        {!loading && items.length === 0 && (
          <div className="ann-empty">
            <div className="ann-empty-icon">📢</div>
            <div className="ann-empty-title">No announcements yet</div>
            <div className="ann-empty-sub">Click "New Announcement" to post one to all employees.</div>
            <button className="ann-new-btn" type="button" style={{ marginTop: 16 }} onClick={() => setShowCompose(true)}>
              <IconPlus /> New Announcement
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="ann-list">
            {items.map((a, i) => (
              <AnnouncementCard
                key={a.id}
                item={a}
                isLast={i === items.length - 1}
                onDelete={handleDelete}
                deleting={deletingId === a.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onPosted={created => setItems(prev => [created, ...prev])}
        />
      )}
    </main>
  )
}
