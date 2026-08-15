import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { MentorCard } from '@/modules/mentors/components/MentorCard'
import { ScholarshipMiniCard } from '@/modules/scholarships/components/ScholarshipMiniCard'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
  IconArrowRight,
  IconAward,
  IconGraduationCap,
  IconMessageCircle,
  IconSearch,
  IconSparkle,
  IconUsers,
} from '@/modules/mentor/components/icons'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { majorsApi } from '@/modules/scholarships/api/majors.api'
import { partnersApi } from '@/modules/scholarships/api/partners.api'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { mentorsApi } from '@/modules/mentors/api/mentors.api'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import homeBanner from '@/assets/Frame 4895.png'
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

      {/* ================= HERO — banner Frame 4895 làm ảnh chính thay cho khối gradient + mascot
          cũ; tiêu đề/mô tả đã in sẵn trong ảnh nên bỏ hẳn khối H1/P coded riêng. Thanh tìm kiếm
          (không thể "in cứng" vào ảnh vì cần tương tác) xếp đè lên ảnh bằng absolute positioning ở
          màn hình >=lg, top/left tính theo % của khung ảnh gốc 1440x583 (top 345px, left 70px trong
          thiết kế gốc) để giữ đúng vị trí khi ảnh co giãn responsive theo chiều rộng. Dưới `lg`, ảnh
          co lại quá thấp để absolute-overlay còn vừa (top 59% của ảnh cao ~150px trên điện thoại chỉ
          còn vài chục px, đủ chỗ hiện input nhưng cắt mất hẳn hàng 3 pill bên dưới do section có
          overflow-hidden) — nên tại đây chuyển hẳn về flow bình thường, xếp ngay dưới ảnh (đè nhẹ lên
          rìa dưới bằng margin âm) thay vì absolute, để không mất phần tử nào. */}
      <section className="relative overflow-hidden bg-brand-blue-600">
        <img
          src={homeBanner}
          alt="Skola — Mở lối cơ hội, chạm tới tương lai. Khám phá học bổng phù hợp, kết nối mentor và tiến gần hơn đến mục tiêu học tập của bạn."
          className="h-auto w-full"
        />

        <div className="relative z-20 mx-auto -mt-10 w-[calc(100%-2.5rem)] max-w-md px-0 lg:absolute lg:left-[4.86%] lg:top-[59.17%] lg:mx-0 lg:mt-0 lg:w-[clamp(260px,38%,520px)] lg:max-w-none">
          <form onSubmit={handleHeroSearch}>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-100 focus-within:ring-4 focus-within:ring-brand-blue-400/30 transition-all">
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
      </section>

      {/* Stats Box - rộng hơn (max-w-6xl thay vì 4xl), thấp hơn (py-4 + layout ngang trong StatItem
          thay vì xếp dọc) để không chiếm quá nhiều khoảng trống đè lên Hero. */}
      <div className="relative z-10 mx-auto mt-8 w-full max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 rounded-2xl bg-white py-4 px-6 shadow-xl ring-1 ring-slate-100">
          <StatItem icon={<IconGraduationCap className="size-5" />} value={scholarshipCount} suffix="+" label="Học bổng đang mở" />
          <StatItem icon={<IconAward className="size-5" />} value={majors.length || null} label="Ngành học đa dạng" />
          <StatItem icon={<IconUsers className="size-5" />} value={mentorCount} suffix="+" label="Mentor đồng hành" />
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

        {/* 3 bước đơn giản - nền gradient xanh nhạt→trắng (thay cho khối trắng phẳng trước đó) và một
            đường nối chấm ngang giữa 3 icon để tạo cảm giác "luồng bước", vẫn cùng tông blue-50/slate
            đang dùng xuyên suốt trang thay vì màu tách biệt. */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-gradient-to-b from-brand-blue-50/70 to-white p-8 sm:p-14 shadow-sm">
          <SectionHeading eyebrow="Cách Skola hoạt động" title="Chỉ 3 bước để chạm tới học bổng" center />
          <div className="relative mt-12">
            <div className="pointer-events-none absolute inset-x-[16%] top-10 hidden border-t-2 border-dashed border-brand-blue-200 sm:block" />
            <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-3 lg:gap-14">
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

        {/* Lí do nên chọn Skola - trước đó là khối gradient xanh đậm/cocoa phủ toàn nền, lạc tông so với
            phần còn lại của trang (đều nền trắng/sáng, accent màu qua icon chứ không phủ cả khối). Đổi
            sang nền trắng viền mỏng, accent theo tone (blue/cocoa/yellow) ở icon từng ReasonCard, giữ
            mascot nhưng đặt trên nền blue-50 nhạt thay vì blue-800 tối. */}
        <section className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-blue-100 bg-brand-blue-50 px-3 py-1.5 text-xs font-bold text-brand-blue-600">
                <IconSparkle className="size-4 text-brand-yellow-500" />
                Vì sao chọn Skola
              </span>
              <h2 className="mt-4 text-3xl font-black text-brand-ink sm:text-4xl">Hành trình trọn vẹn,<br/>hỗ trợ tối đa</h2>
              <p className="mt-4 text-base text-slate-500 max-w-md leading-relaxed">
                Nền tảng duy nhất giúp bạn tìm kiếm học bổng, đo lường năng lực qua AI và kết nối trực tiếp với Mentor giàu kinh nghiệm.
              </p>

              <div className="mt-10 space-y-4">
                <ReasonCard
                  icon={<TargetIcon />}
                  title="AI Match thông minh"
                  description="Tự động phân tích CV và gợi ý học bổng có tỉ lệ đỗ cao nhất."
                  tone="blue"
                />
                <ReasonCard
                  icon={<ShieldIcon />}
                  title="Thông tin minh bạch"
                  description="Mọi thông tin học bổng đều được xác thực từ chính nhà tài trợ."
                  tone="cocoa"
                />
                <ReasonCard
                  icon={<IconUsers className="size-5" />}
                  title="Mạng lưới Mentor"
                  description="Sửa CV, luyện phỏng vấn 1:1 cùng các anh chị đi trước."
                  tone="yellow"
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

            {/* Ảnh Mascot bên phải - giữ nguyên vùng cắt ảnh đã canh đúng (object-position 90% để lấy
                đúng dải chứa nhân vật của ảnh dọc 352x872), chỉ đổi nền phía sau từ blue-800 tối sang
                blue-50 nhạt cho khớp tông sáng của section, bỏ luôn opacity-90 (không cần làm mờ ảnh
                trên nền sáng như từng cần trên nền tối). */}
            <div className="hidden lg:block h-full w-full bg-brand-blue-50 relative min-h-[420px]">
               <img
                  src={guideMascot}
                  alt="Guide Mascot"
                  className="absolute inset-0 w-full h-full object-cover"
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
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-brand-ink shadow-sm focus:border-brand-yellow-400 focus:ring-2 focus:ring-brand-yellow-300/50 focus:outline-none transition-all cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      {/* Custom arrow for select */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
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
  // Xếp kiểu "toả quạt": đối tác nhiều học bổng nhất (partners[0]) nằm giữa và to nhất, các đối tác
  // tiếp theo xen dần sang trái/phải theo thứ hạng, càng ra ngoài càng nhỏ dần.
  const fanned = partners
    .slice(0, 5)
    .map((partner, rank) => ({
      partner,
      offset: rank === 0 ? 0 : rank % 2 === 1 ? -Math.ceil(rank / 2) : Math.ceil(rank / 2),
    }))
    .sort((a, b) => a.offset - b.offset)

  return (
    <section>
      <SectionHeading eyebrow="Đối tác nổi bật" title="Đồng hành cùng các tập đoàn lớn" />

      <div className="flex items-center gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
        {fanned.map(({ partner, offset }) => (
          <PartnerFanCard key={partner.id} partner={partner} offset={offset} />
        ))}
      </div>
    </section>
  )
}

function PartnerFanCard({ partner, offset }: { partner: TopPartner; offset: number }) {
  const dist = Math.abs(offset)
  // Chỉ dùng ảnh bìa (cover_image_url) làm hình chính, không còn overlay logo góc trên nữa.
  const sizeClass =
    dist === 0
      ? 'z-30 h-96 w-56 sm:w-64'
      : dist === 1
        ? 'z-20 mt-8 h-80 w-48 opacity-95 sm:w-56'
        : 'z-10 mt-16 hidden h-64 w-40 opacity-85 sm:block sm:w-48'

  return (
    <Link
      to={`/nha-tai-tro/${partner.id}`}
      className={`group relative shrink-0 overflow-hidden rounded-3xl bg-slate-900 shadow-lg transition-all duration-300 hover:z-40 hover:-translate-y-2 hover:opacity-100 hover:shadow-2xl ${sizeClass}`}
    >
      {partner.cover_image_url ? (
        <img
          src={partner.cover_image_url}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-blue-700 to-brand-cocoa-600 text-5xl font-black text-white/20">
          {partner.company_name.charAt(0)}
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
        <div className="min-w-0">
          <p className="line-clamp-2 text-base font-bold leading-snug">{partner.company_name}</p>
          <p className="mt-1 text-xs text-slate-200">{partner.scholarship_count} học bổng</p>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <IconArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}

function StatItem({ icon, value, suffix, label }: { icon: ReactNode; value: number | null; suffix?: string; label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-3 px-4 py-2 text-center sm:justify-start sm:text-left">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-xl font-black leading-tight text-brand-ink">{value != null ? `${value}${suffix ?? ''}` : '—'}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function ReasonCard({
  icon,
  title,
  description,
  tone,
}: {
  icon: ReactNode
  title: string
  description: string
  tone: 'blue' | 'cocoa' | 'yellow'
}) {
  const toneClass =
    tone === 'blue'
      ? 'bg-brand-blue-50 text-brand-blue-600'
      : tone === 'cocoa'
        ? 'bg-brand-cocoa-100 text-brand-cocoa-500'
        : 'bg-brand-yellow-300/25 text-brand-yellow-500'

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-base font-bold text-brand-ink">{title}</p>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
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