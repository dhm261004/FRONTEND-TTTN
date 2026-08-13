// Biểu đồ tròn (donut) hiển thị 1 điểm số 0-100 — dùng cho card "AI Match" (trước đây liệt kê hết 4
// tiêu chí ngay trên trang, giờ chỉ hiện số điểm tổng ở đây, bấm vào mới xem chi tiết qua modal).
const TONE_BY_SCORE = (score: number) => {
  if (score >= 80) return 'text-brand-blue-600'
  if (score >= 60) return 'text-brand-blue-500'
  if (score >= 40) return 'text-brand-yellow-500'
  return 'text-brand-cocoa-500'
}

export function ScoreDonut({
  score,
  size = 112,
  strokeWidth = 10,
  onClick,
  label,
}: {
  score: number
  size?: number
  strokeWidth?: number
  onClick?: () => void
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const tone = TONE_BY_SCORE(clamped)

  const content = (
    <>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${tone} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-brand-ink">{Math.round(clamped)}%</span>
        {label && <span className="text-[10px] text-brand-ink-soft">{label}</span>}
      </div>
    </>
  )

  if (!onClick) {
    return (
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative mx-auto flex cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-400"
      style={{ width: size, height: size }}
      aria-label="Xem chi tiết điểm phù hợp"
    >
      {content}
    </button>
  )
}
