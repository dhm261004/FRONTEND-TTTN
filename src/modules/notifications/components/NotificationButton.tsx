import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationsApi } from '@/modules/notifications/api/notifications.api'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import type { Notification } from '@/modules/notifications/types'

export function NotificationButton() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[] | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    void notificationsApi.listMine({ limit: 1 }).then((res) => setUnreadCount(res.unread_count))
  }, [])

  useEffect(() => {
    if (!open) return
    void notificationsApi.listMine({ limit: 10 }).then((res) => {
      setItems(res.items)
      setUnreadCount(res.unread_count)
    })
  }, [open])

  const handleOpenNotification = async (notification: Notification) => {
    setOpen(false)
    if (!notification.is_read) {
      try {
        await notificationsApi.markRead(notification.id)
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch {
        // Bỏ qua lỗi đánh dấu đã đọc — không chặn điều hướng của người dùng.
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setItems((prev) => (prev ? prev.map((n) => ({ ...n, is_read: true })) : prev))
      setUnreadCount(0)
    } catch {
      // no-op
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
        className="relative flex size-10 items-center justify-center rounded-full bg-slate-100 text-brand-ink-soft hover:bg-slate-200"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-bold text-brand-ink">Thông báo</p>
              {unreadCount > 0 && (
                <button type="button" onClick={() => void handleMarkAllRead()} className="text-xs font-medium text-brand-blue-600 hover:underline">
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>

            {items === null ? (
              <p className="px-1 py-4 text-center text-sm text-brand-ink-soft">Đang tải...</p>
            ) : items.length === 0 ? (
              <p className="px-1 py-4 text-center text-sm text-brand-ink-soft">Chưa có thông báo nào.</p>
            ) : (
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {items.map((n) => {
                  const content = (
                    <div className={cn('rounded-lg px-2 py-2 text-left', !n.is_read && 'bg-brand-blue-50/60')}>
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-blue-500" />}
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-sm', n.is_read ? 'font-medium text-brand-ink' : 'font-semibold text-brand-ink')}>{n.title}</p>
                          <p className="line-clamp-2 text-xs text-brand-ink-soft">{n.message}</p>
                          <p className="mt-0.5 text-[11px] text-brand-ink-soft">{formatDate(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )
                  return n.link ? (
                    <Link key={n.id} to={n.link} onClick={() => void handleOpenNotification(n)} className="block hover:bg-slate-50 rounded-lg">
                      {content}
                    </Link>
                  ) : (
                    <button key={n.id} type="button" onClick={() => void handleOpenNotification(n)} className="block w-full hover:bg-slate-50 rounded-lg">
                      {content}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
