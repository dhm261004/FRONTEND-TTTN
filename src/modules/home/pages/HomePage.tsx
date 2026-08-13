import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { MentorCard } from '@/modules/mentors/components/MentorCard'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
  IconArrowRight,
  IconAward,
  IconCalendarClock,
  IconGraduationCap,
  IconMessageCircle,
  IconSearch,
  IconSparkle,
  IconUsers,
  IconWallet,
} from '@/modules/mentor/components/icons'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { scholarshipLocationLabel, scholarshipValueLabel } from '@/modules/scholarships/components/badges'
import { majorsApi } from '@/modules/scholarships/api/majors.api'
import { partnersApi } from '@/modules/scholarships/api/partners.api'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { mentorsApi } from '@/modules/mentors/api/mentors.api'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import heroMascot from '@/assets/hero-mascot.png'
import guideMascot from '@/assets/guide-mascot.png'
import type { Major, PartnerProfile, Scholarship } from '@/modules/scholarships/types'
import type { MentorProfile } from '@/modules/mentor/types'

interface TopPartner extends PartnerProfile {
  scholarship_count: number
}

interface PartnerBadge {
  company_name: string
  logo_url: string | null
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const isCandidate = Boolean(user?.roles.includes('candidate'))

  const [majors, setMajors] = useState<Major[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [heroQ, setHeroQ] = useState('')
  const [heroMajor, setHeroMajor] = useState('')
  const [heroProvince, setHeroProvince] = useState('')
  const [heroDegree, setHeroDegree] = useState('')

  const [scholarshipCount, setScholarshipCount] = useState<number | null>(null)
  const [mentorCount, setMentorCount] = useState<number | null>(null)

  const [newest, setNewest] = useState<Scholarship[] | null>(null)
  const [topPartners, setTopPartners] = useState<TopPartner[] | null>(null)
  const [topMentors, setTopMentors] = useState<MentorProfile[] | null>(null)
  const [partnersById, setPartnersById] = useState<Record<string, PartnerBadge>>({})
  const [savedIds, setSavedIds] = useState<Record<string, string>>({})

  useEffect(() => {
    void majorsApi.list().then(setMajors)
    void provincesApi.listProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    void scholarshipsApi.list({ is_active: true, page: 1, limit: 8 }).then((res) => {
      setNewest(res.items)
      setScholarshipCount(res.pagination.total)
    })
  }, [])

  // Card học bổng ở trang chủ hiện logo đối tác thay vì ảnh banner — danh sách "newest" không kèm sẵn
  // logo (Scholarship không embed partner), nên tra cứu riêng theo từng partner_profile_id xuất hiện.
  useEffect(() => {
    if (!newest || newest.length === 0) return
    const ids = [...new Set(newest.map((s) => s.partner_profile_id).filter((id): id is string => Boolean(id)))]
    const missing = ids.filter((id) => !partnersById[id])
    if (missing.length === 0) return
    void Promise.all(
      missing.map((id) =>
        partnersApi
          .getById(id)
          .then((p): readonly [string, PartnerBadge] => [id, { company_name: p.company_name, logo_url: p.logo_url }])
          .catch(() => null),
      ),
    ).then((results) => {
      const entries = results.filter((r): r is readonly [string, PartnerBadge] => r !== null)
      if (entries.length === 0) return
      setPartnersById((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy lại khi danh sách newest đổi, không phụ thuộc partnersById để tránh vòng lặp fetch
  }, [newest])

  useEffect(() => {
    if (!isCandidate) {
      setSavedIds({})
      return
    }
    void interactionsApi
      .listMine('saved')
      .then((list) => setSavedIds(Object.fromEntries(list.map((i) => [i.scholarship_id, i.id]))))
      .catch(() => setSavedIds({}))
  }, [isCandidate])

  useEffect(() => {
    void mentorsApi.list({ page: 1, limit: 20 }).then((res) => {
      setMentorCount(res.pagination.total)
      const sorted = [...res.items].sort((a, b) => (b.average_rating ?? -1) - (a.average_rating ?? -1))
      setTopMentors(sorted.slice(0, 4))
    })
  }, [])

  useEffect(() => {
    void scholarshipsApi.list({ is_active: true, page: 1, limit: 50 }).then(async (res) => {
      const counts = new Map<string, number>()
      for (const s of res.items) {
        if (!s.partner_profile_id) continue
        counts.set(s.partner_profile_id, (counts.get(s.partner_profile_id) ?? 0) + 1)
      }
      const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
      const partners = await Promise.all(
        topIds.map(async ([partnerId, count]) => {
          try {
            const partner = await partnersApi.getById(partnerId)
            return { ...partner, scholarship_count: count }
          } catch {
            return null
          }
        }),
      )
      setTopPartners(partners.filter((p): p is TopPartner => p !== null))
    })
  }, [])

  const toggleSave = async (scholarshipId: string) => {
    if (!isCandidate) {
      navigate('/dang-nhap', { state: { from: '/' } })
      return
    }
    const existingId = savedIds[scholarshipId]
    if (existingId) {
      setSavedIds((prev) => {
        const next = { ...prev }
        delete next[scholarshipId]
        return next
      })
      try {
        await interactionsApi.remove(existingId)
      } catch (err) {
        setSavedIds((prev) => ({ ...prev, [scholarshipId]: existingId }))
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    } else {
      const placeholderId = `pending-${scholarshipId}`
      setSavedIds((prev) => ({ ...prev, [scholarshipId]: placeholderId }))
      try {
        const interaction = await interactionsApi.create(scholarshipId, 'saved')
        setSavedIds((prev) => (prev[scholarshipId] === placeholderId ? { ...prev, [scholarshipId]: interaction.id } : prev))
      } catch (err) {
        setSavedIds((prev) => {
          if (prev[scholarshipId] !== placeholderId) return prev
          const next = { ...prev }
          delete next[scholarshipId]
          return next
        })
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    }
  }

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (heroQ) params.set('q', heroQ)
    if (heroMajor) params.set('major_id', heroMajor)
    if (heroProvince) params.set('location_province_city', heroProvince)
    if (heroDegree) params.set('degree', heroDegree)
    navigate(`/hoc-bong${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <PublicHeader />

      {/* ================= HERO (Đã fix UI, gọn gàng, hết lỗi đè) ================= */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-blue-700 via-brand-blue-600 to-brand-blue-500 pb-20 pt-16 lg:pb-32 lg:pt-24">
        {/* Hoạ tiết trang trí tự vẽ bằng CSS thay vì tải ảnh noise từ URL ngoài (tránh phụ thuộc mạng
            ngoài cho một chi tiết thuần trang trí) — vài khối tròn mờ + 1 điểm nhấn màu cocoa ấm. */}
        <div className="pointer-events-none absolute -left-16 top-0 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/3 size-96 rounded-full bg-brand-cocoa-400/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-10 size-3 rounded-full bg-brand-yellow-300" />

        <div className="relative mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Cột trái: Text & Search */}
          <div className="w-full max-w-xl text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
              <IconSparkle className="size-3.5 text-brand-yellow-300" />
              Chấm độ phù hợp học bổng bằng AI
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl tracking-tight">
              Mở lối cơ hội, <br />
              chạm tới <span className="text-brand-yellow-300">tương lai.</span>
            </h1>
            <p className="mt-4 text-base text-brand-blue-100/90 leading-relaxed max-w-md">
              Khám phá học bổng phù hợp, kết nối mentor và tiến gần hơn đến mục tiêu học tập của bạn cùng Skola.
            </p>

            <form onSubmit={handleHeroSearch} className="mt-10 relative z-20">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl focus-within:ring-4 focus-within:ring-brand-blue-400/30 transition-all">
                <div className="flex flex-1 items-center px-3">
                  <IconSearch className="size-5 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={heroQ}
                    onChange={(e) => setHeroQ(e.target.value)}
                    placeholder="Tìm học bổng, ngành học..."
                    className="h-10 w-full bg-transparent px-3 text-sm text-brand-ink placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-brand-blue-700 shadow-md"
                >
                  <span>Tìm kiếm</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <HeroPillSelect value={heroMajor} onChange={setHeroMajor} placeholder="Ngành học">
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </HeroPillSelect>
                <HeroPillSelect value={heroProvince} onChange={setHeroProvince} placeholder="Khu vực">
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </HeroPillSelect>
                <HeroPillSelect value={heroDegree} onChange={setHeroDegree} placeholder="Bậc học">
                  <option value="undergraduate">Đại học</option>
                  <option value="postgraduate">Sau đại học</option>
                  <option value="vocational">Cao đẳng / Nghề</option>
                  <option value="other">Khác</option>
                </HeroPillSelect>
              </div>
            </form>
          </div>

          {/* Cột phải: Mascot - không dùng absolute nữa.
              hero-mascot.png là ảnh banner ngang 1440x583, nhân vật nằm ở khoảng 1/3 bên phải ảnh —
              object-position phải lệch hẳn về phải (100%) mới thấy được nhân vật, để mặc định (center)
              sẽ chỉ thấy nền mây/sóng trống. Dùng khung bo góc mềm thay vì hình tròn tuyệt đối vì ảnh
              ngang cắt vào hình tròn sẽ mất thêm phần đầu/nón của nhân vật ở 4 góc. */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative size-80 xl:size-96 rounded-[2.5rem] bg-brand-blue-500/30 border border-white/20 p-3 shadow-2xl backdrop-blur-sm">
              <div className="size-full overflow-hidden rounded-4xl">
                <img
                  src={heroMascot}
                  alt="Skola Mascot"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '100% 50%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Box - Chuyển xuống đây, dùng margin âm để đè nửa trên nửa dưới mượt mà */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20 w-full">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
          <StatItem icon={<IconGraduationCap className="size-6" />} value={scholarshipCount} suffix="+" label="Học bổng đang mở" />
          <StatItem icon={<IconAward className="size-6" />} value={majors.length || null} label="Ngành học đa dạng" />
          <StatItem icon={<IconUsers className="size-6" />} value={mentorCount} suffix="+" label="Mentor đồng hành" />
        </div>
      </div>

      {/* ================= MAIN BODY ================= */}
      <div className="mx-auto w-full max-w-7xl space-y-24 px-6 pb-20 pt-16">
        
        {/* Đối tác nổi bật */}
        {topPartners && topPartners.length > 0 && <PartnerSlideshow partners={topPartners} />}

        {/* Học bổng mới cập nhật */}
        <section>
          <SectionHeading eyebrow="Cơ hội mới" title="Học bổng nổi bật" linkTo="/hoc-bong" linkLabel="Xem tất cả" />
          {newest === null ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : newest.length === 0 ? (
            <EmptyState
              icon={<IconGraduationCap className="size-6" />}
              title="Chưa có học bổng nào đang mở"
              description="Các học bổng mới sẽ xuất hiện tại đây ngay khi nhà tài trợ đăng tải."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newest.map((s) => (
                <ScholarshipMiniCard
                  key={s.id}
                  scholarship={s}
                  partner={s.partner_profile_id ? partnersById[s.partner_profile_id] : undefined}
                  saved={Boolean(savedIds[s.id])}
                  onToggleSave={() => void toggleSave(s.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 3 bước đơn giản - Bỏ blur tròn lộn xộn, đổi thành nền sạch sẽ */}
        <section className="rounded-[2.5rem] bg-white p-8 sm:p-14 shadow-sm border border-slate-100">
          <SectionHeading eyebrow="Cách Skola hoạt động" title="Chỉ 3 bước để chạm tới học bổng" center />
          <div className="mt-12 grid grid-cols-1 gap-10 lg:gap-14 sm:grid-cols-3">
            <StepCard
              index="01"
              icon={<IconSearch className="size-6" />}
              title="Tìm học bổng phù hợp"
              description="Lọc theo ngành học, khu vực và bậc học chỉ trong vài giây, từ hàng loạt học bổng đang mở."
            />
            <StepCard
              index="02"
              icon={<IconSparkle className="size-6" />}
              title="Để AI chấm độ phù hợp"
              description="Tải CV lên, hệ thống AI phân tích và chấm điểm độ match giữa hồ sơ của bạn với học bổng."
              accent
            />
            <StepCard
              index="03"
              icon={<IconMessageCircle className="size-6" />}
              title="Kết nối mentor"
              description="Nhận tư vấn 1:1 từ mentor đi trước, hoàn thiện hồ sơ và nộp đơn tự tin hơn."
            />
          </div>
        </section>

        {/* Top Mentor */}
        {topMentors && topMentors.length > 0 && (
          <section>
            <SectionHeading eyebrow="Đồng hành cùng bạn" title="Mentor được đánh giá cao" linkTo="/mentor" linkLabel="Xem tất cả mentor" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {topMentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>
          </section>
        )}

        {/* Lí do nên chọn Skola - Đã fix lại layout Grid tránh méo ảnh.
            bg-brand-blue-900 trước đó không tồn tại trong theme (chỉ khai báo tới 800) nên class này
            không render màu gì cả — chữ trắng nằm trên nền trong suốt, gần như vô hình. Đổi sang
            gradient xanh đậm pha cocoa (đã thêm brand-blue-900 vào theme + phối cùng cocoa cho ấm hơn,
            đỡ "toàn xanh" một màu). */}
        <section className="rounded-[2.5rem] bg-linear-to-br from-brand-blue-900 via-brand-blue-800 to-brand-cocoa-700 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-brand-yellow-300">
                <IconSparkle className="size-4" />
                Vì sao chọn Skola
              </span>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Hành trình trọn vẹn,<br/>hỗ trợ tối đa</h2>
              <p className="mt-4 text-base text-brand-blue-100/80 max-w-md leading-relaxed">
                Nền tảng duy nhất giúp bạn tìm kiếm học bổng, đo lường năng lực qua AI và kết nối trực tiếp với Mentor giàu kinh nghiệm.
              </p>

              <div className="mt-10 space-y-4">
                <ReasonCard
                  icon={<TargetIcon />}
                  title="AI Match thông minh"
                  description="Tự động phân tích CV và gợi ý học bổng có tỉ lệ đỗ cao nhất."
                />
                <ReasonCard
                  icon={<ShieldIcon />}
                  title="Thông tin minh bạch"
                  description="Mọi thông tin học bổng đều được xác thực từ chính nhà tài trợ."
                />
                <ReasonCard
                  icon={<IconUsers className="size-5" />}
                  title="Mạng lưới Mentor"
                  description="Sửa CV, luyện phỏng vấn 1:1 cùng các anh chị đi trước."
                />
              </div>

              <div className="mt-10">
                <Link to="/dang-ky">
                  <Button  className="bg-brand-yellow-400 font-bold text-brand-ink hover:bg-brand-yellow-500 w-full sm:w-auto">
                    Tạo hồ sơ ngay →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ảnh Mascot bên phải - gọn gàng, không tràn/méo.
                guide-mascot.png là ảnh dọc 352x872: chữ minh hoạ nằm ở khoảng 20% trên cùng, còn nhân
                vật đứng ở khoảng 55-95% phía dưới. Cột này lại là khung ngang (nửa hàng lưới rộng hơn
                cao), object-cover sẽ chỉ lộ ra một dải ngang mỏng của ảnh — objectPosition 20% trước đó
                lấy đúng dải chữ (thừa vì đã có H2/mô tả riêng), không thấy nhân vật đâu cả. Đổi xuống
                90% để lấy đúng dải chứa nhân vật. */}
            <div className="hidden lg:block h-full w-full bg-brand-blue-800 relative">
               <img
                  src={guideMascot}
                  alt="Guide Mascot"
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                  style={{ objectPosition: 'center 90%' }}
                />
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}

function HeroPillSelect({ value, onChange, placeholder, children }: { value: string; onChange: (value: string) => void; placeholder: string; children: ReactNode }) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md focus:border-brand-yellow-300 focus:bg-white/20 focus:outline-none transition-all cursor-pointer"
      >
        <option value="" className="text-slate-800">{placeholder}</option>
        {children}
      </select>
      {/* Custom arrow for select */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, linkTo, linkLabel, center }: { eyebrow: string; title: string; linkTo?: string; linkLabel?: string; center?: boolean }) {
  return (
    <div className={`mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${center ? 'sm:flex-col sm:items-center text-center' : ''}`}>
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-blue-600">{eyebrow}</p>
        <h2 className="text-3xl font-black text-brand-ink">{title}</h2>
      </div>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="text-sm font-bold text-brand-blue-600 hover:text-brand-blue-700 transition-colors inline-flex items-center gap-1 group">
          {linkLabel} <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      )}
    </div>
  )
}

function StepCard({ index, icon, title, description, accent }: { index: string; icon: ReactNode; title: string; description: string; accent?: boolean }) {
  return (
    <div className="group relative flex flex-col items-center text-center gap-4">
      <div className={`relative flex size-20 items-center justify-center rounded-3xl shadow-sm transition-transform group-hover:-translate-y-2 ${accent ? 'bg-brand-cocoa-500 text-white' : 'bg-brand-blue-50 text-brand-blue-600 border border-brand-blue-100'}`}>
        {icon}
        <span className={`absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full text-xs font-black shadow-sm ${accent ? 'bg-brand-yellow-400 text-brand-ink' : 'bg-white text-slate-400 border border-slate-100'}`}>
          {index}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function PartnerSlideshow({ partners }: { partners: TopPartner[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollByCard = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-blue-600">Đối tác nổi bật</p>
          <h2 className="text-3xl font-black text-brand-ink">Đồng hành cùng các tập đoàn lớn</h2>
        </div>
        {partners.length > 1 && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Xem đối tác trước"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-ink shadow-sm transition-colors hover:bg-slate-50"
            >
              <IconArrowRight className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Xem đối tác tiếp theo"
              className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-brand-ink shadow-sm transition-colors hover:bg-slate-50"
            >
              <IconArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scroll-smooth scrollbar-none"
      >
        {partners.map((p) => (
          <Link
            key={p.id}
            to={`/nha-tai-tro/${p.id}`}
            className="group relative h-80 w-56 shrink-0 snap-start overflow-hidden rounded-3xl bg-slate-900 shadow-md transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:w-64"
          >
            {p.cover_image_url ? (
              <img
                src={p.cover_image_url}
                alt=""
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-blue-700 to-brand-cocoa-600 text-5xl font-black text-white/20">
                {p.company_name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

            <div className="absolute left-4 top-4 flex size-11 items-center justify-center overflow-hidden rounded-xl bg-brand-yellow-400 shadow-md">
              {p.logo_url ? (
                <img src={p.logo_url} alt="" className="size-7 object-contain" />
              ) : (
                <IconGraduationCap className="size-5 text-brand-ink" />
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
              <div className="min-w-0">
                <p className="line-clamp-2 text-base font-bold leading-snug">{p.company_name}</p>
                <p className="mt-1 text-xs text-slate-200">{p.scholarship_count} học bổng</p>
              </div>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink shadow-sm transition-transform group-hover:translate-x-0.5">
                <IconArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ScholarshipMiniCard({
  scholarship,
  partner,
  saved,
  onToggleSave,
}: {
  scholarship: Scholarship
  partner?: PartnerBadge
  saved: boolean
  onToggleSave: () => void
}) {
  const majorTag = scholarship.majors[0]?.name

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-blue-200">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Link to={`/hoc-bong/${scholarship.id}`} className="flex h-8 max-w-[65%] items-center">
          {partner?.logo_url ? (
            <img src={partner.logo_url} alt={partner.company_name} className="h-8 max-w-full object-contain object-left" />
          ) : (
            <span className="truncate text-sm font-bold text-brand-blue-600">{partner?.company_name ?? 'Skola'}</span>
          )}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleSave()
          }}
          aria-label={saved ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-brand-blue-500 transition-colors hover:bg-brand-blue-50"
        >
          <MiniBookmarkIcon filled={saved} />
        </button>
      </div>

      <Link to={`/hoc-bong/${scholarship.id}`} className="mb-3 block">
        <h3 className="line-clamp-2 min-h-12 text-base font-bold text-brand-ink group-hover:text-brand-blue-600 transition-colors">{scholarship.title}</h3>
      </Link>

      <div className="mb-4 flex flex-col gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <IconCalendarClock className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">{formatDate(scholarship.start_date)} - {formatDate(scholarship.deadline)}</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-brand-blue-600">
          <IconWallet className="size-4 shrink-0" />
          <span>{formatCurrencyVnd(scholarship.total_budget)}</span>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {scholarship.value_type && <MiniTag>{scholarshipValueLabel(scholarship)}</MiniTag>}
        <MiniTag>{scholarshipLocationLabel(scholarship)}</MiniTag>
        {majorTag && <MiniTag>{majorTag}</MiniTag>}
      </div>

      <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`} className="mt-auto block">
        <Button size="sm" className="w-full">
          Đăng kí ngay
        </Button>
      </Link>
    </div>
  )
}

function MiniBookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M6 4h12v17l-6-4-6 4V4Z" strokeLinejoin="round" />
    </svg>
  )
}

function MiniTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  )
}

function StatItem({ icon, value, suffix, label }: { icon: ReactNode; value: number | null; suffix?: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center p-4 text-center">
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-600">
        {icon}
      </div>
      <p className="text-2xl font-black text-brand-ink">{value != null ? `${value}${suffix ?? ''}` : '—'}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

function ReasonCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white/10 p-5 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-brand-yellow-300">
        {icon}
      </div>
      <div>
        <p className="text-base font-bold">{title}</p>
        <p className="mt-1 text-sm text-brand-blue-100 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-4xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm text-slate-400">{icon}</div>
      <div>
        <p className="text-lg font-bold text-brand-ink">{title}</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3 4 6v6c0 4.5 3.4 7.6 8 9 4.6-1.4 8-4.5 8-9V6l-8-3Z" strokeLinejoin="round" />
      <path d="m8.5 12 2.3 2.3L15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}