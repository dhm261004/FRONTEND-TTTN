import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { useCandidateProfile } from '@/modules/candidate/CandidateProfileContext'
import { candidateProfileApi } from '@/modules/candidate/api/candidateProfile.api'
import { majorGroupsApi, majorsApi } from '@/modules/scholarships/api/majors.api'
import { provincesApi, type Province, type Ward } from '@/shared/api/provinces.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Modal } from '@/shared/components/ui/Modal'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { dateInputToIso, toDateInputValue } from '@/shared/lib/format'
import { IconAward, IconPlusCircle, IconX } from '@/modules/candidate/components/icons'
import type { Major, MajorGroup } from '@/modules/scholarships/types'
import type { CandidateActivity, CandidateAward, CandidateCertificate } from '@/modules/candidate/types'
import type { UserRole } from '@/modules/auth/types'

const schema = z.object({
  full_name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(8, 'Số điện thoại quá ngắn')
    .max(20)
    .or(z.literal(''))
    .optional(),
  date_of_birth: z.string().optional(),
  current_school: z.string().trim().optional(),
  current_degree_level: z.string().trim().optional(),
  gpa: z.string().trim().optional(),
  financial_need_level: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Sinh viên',
  partner: 'Nhà tài trợ',
  mentor: 'Mentor',
  admin: 'Quản trị viên',
}

// Cùng bộ giá trị với DEGREE_OPTIONS ở partner/pages/ScholarshipFormPage.tsx — Scholarship.degree
// dùng đúng các code này, và RecommendationService so khớp currentDegreeLevel với scholarship.degree
// bằng so sánh chuỗi (không phải suy luận ngữ nghĩa), nên phải cùng bộ giá trị mới khớp được.
const DEGREE_OPTIONS = [
  { value: 'undergraduate', label: 'Đại học' },
  { value: 'postgraduate', label: 'Sau đại học' },
  { value: 'vocational', label: 'Cao đẳng / Nghề' },
  { value: 'other', label: 'Khác' },
]

export function ProfilePage() {
  const { profile, loading, setProfile } = useCandidateProfile()
  const { user } = useAuth()
  const { notify } = useToast()
  const [majors, setMajors] = useState<Major[]>([])
  const [majorGroups, setMajorGroups] = useState<MajorGroup[]>([])
  const [targetMajors, setTargetMajors] = useState<string[]>([])
  const [majorGroupToAdd, setMajorGroupToAdd] = useState('')
  const [majorToAdd, setMajorToAdd] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [provinceCity, setProvinceCity] = useState('')
  const [ward, setWard] = useState('')

  const [certificates, setCertificates] = useState<CandidateCertificate[]>([])
  const [certForm, setCertForm] = useState({ certificate_type: '', certificate_score: '' })
  const [savingCert, setSavingCert] = useState(false)

  const [activities, setActivities] = useState<CandidateActivity[]>([])
  const [awards, setAwards] = useState<CandidateAward[]>([])
  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [awardModalOpen, setAwardModalOpen] = useState(false)

  const cvInputRef = useRef<HTMLInputElement>(null)
  const [uploadingCv, setUploadingCv] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          full_name: profile.full_name ?? '',
          phone: profile.phone ?? '',
          date_of_birth: toDateInputValue(profile.date_of_birth),
          current_school: profile.current_school ?? '',
          current_degree_level: profile.current_degree_level ?? '',
          gpa: profile.gpa != null ? String(profile.gpa) : '',
          financial_need_level: profile.financial_need_level ?? '',
        }
      : undefined,
  })

  useEffect(() => {
    void majorsApi.list().then(setMajors)
    void majorGroupsApi.list().then(setMajorGroups)
    void candidateProfileApi.listCertificates().then(setCertificates)
    void candidateProfileApi.listActivities().then(setActivities)
    void candidateProfileApi.listAwards().then(setAwards)
    void provincesApi.listProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (profile) {
      setTargetMajors(profile.target_majors)
      setProvinceCity(profile.province_city ?? '')
      setWard(profile.ward ?? '')
    }
  }, [profile])

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name.toLowerCase() === provinceCity.trim().toLowerCase()),
    [provinces, provinceCity],
  )

  useEffect(() => {
    if (!selectedProvince) {
      setWards([])
      return
    }
    void provincesApi.listWardsByProvince(selectedProvince.code).then(setWards)
  }, [selectedProvince])

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const updated = await candidateProfileApi.updateMe({
        full_name: values.full_name,
        phone: values.phone || null,
        date_of_birth: values.date_of_birth ? dateInputToIso(values.date_of_birth) : null,
        province_city: provinceCity || null,
        ward: ward || null,
        current_school: values.current_school || null,
        current_degree_level: values.current_degree_level || null,
        gpa: values.gpa ? Number(values.gpa) : null,
        financial_need_level: values.financial_need_level || null,
        target_majors: targetMajors,
      })
      setProfile(updated)
      notify('Đã lưu hồ sơ của bạn.')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.')
    }
  }

  const toggleMajor = (code: string) => {
    setTargetMajors((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  const majorsAvailableInSelectedGroup = majorGroupToAdd
    ? majors.filter((m) => String(m.group_id) === majorGroupToAdd && !targetMajors.includes(m.code))
    : []

  const addSelectedMajor = () => {
    if (!majorToAdd) return
    const major = majors.find((m) => String(m.id) === majorToAdd)
    if (major && !targetMajors.includes(major.code)) toggleMajor(major.code)
    setMajorToAdd('')
  }

  const addAllMajorsInGroup = () => {
    if (majorsAvailableInSelectedGroup.length === 0) return
    const codesToAdd = majorsAvailableInSelectedGroup.map((m) => m.code)
    setTargetMajors((prev) => [...prev, ...codesToAdd])
  }

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await candidateProfileApi.uploadAvatar(file)
      setProfile(updated)
      notify('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên ảnh đại diện.', 'error')
    }
  }

  const handleCvFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCv(true)
    try {
      const updated = await candidateProfileApi.uploadCv(file)
      setProfile(updated)
      notify('Đã tải lên và phân tích CV bằng AI.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên CV. Đảm bảo file là PDF có nội dung chữ.', 'error')
    } finally {
      setUploadingCv(false)
      e.target.value = ''
    }
  }

  const handleAddCertificate = async () => {
    if (!certForm.certificate_type.trim() || !certForm.certificate_score.trim()) return
    setSavingCert(true)
    try {
      const created = await candidateProfileApi.createCertificate(certForm)
      setCertificates((prev) => [...prev, created])
      setCertForm({ certificate_type: '', certificate_score: '' })
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm chứng chỉ.', 'error')
    } finally {
      setSavingCert(false)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    try {
      await candidateProfileApi.deleteCertificate(id)
      setCertificates((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá chứng chỉ.', 'error')
    }
  }

  const handleUploadCertAttachment = async (id: string, file: File) => {
    try {
      const updated = await candidateProfileApi.uploadCertificateAttachment(id, file)
      setCertificates((prev) => prev.map((c) => (c.id === id ? updated : c)))
      notify('Đã tải lên minh chứng chứng chỉ.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên file.', 'error')
    }
  }

  const handleDeleteActivity = async (id: string) => {
    try {
      await candidateProfileApi.deleteActivity(id)
      setActivities((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá hoạt động.', 'error')
    }
  }

  const handleDeleteAward = async (id: string) => {
    try {
      await candidateProfileApi.deleteAward(id)
      setAwards((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá giải thưởng.', 'error')
    }
  }

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-ink">Hồ sơ của tôi</h1>

        <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-5">
            <AvatarUpload url={profile?.avatar_url} onUpload={handleUploadAvatar} alt="Ảnh đại diện" label="Đổi ảnh đại diện" />
            <div>
              <p className="font-semibold text-brand-ink">{profile?.full_name || 'Ứng viên'}</p>
              <p className="text-xs text-brand-ink-soft">Ảnh PNG/JPEG/WEBP, tối đa 4MB.</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-brand-ink">Thông tin tài khoản</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Họ và tên" required error={errors.full_name?.message} className="sm:col-span-2">
                <Input placeholder="Nhập họ và tên" {...register('full_name')} error={Boolean(errors.full_name)} />
              </Field>
              <Field label="Số điện thoại" error={errors.phone?.message}>
                <Input type="tel" placeholder="Nhập số điện thoại" {...register('phone')} error={Boolean(errors.phone)} />
              </Field>
              <Field label="Ngày sinh" error={errors.date_of_birth?.message}>
                <Input type="date" {...register('date_of_birth')} error={Boolean(errors.date_of_birth)} />
              </Field>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-brand-ink">Học vấn</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Trường đang theo học">
                <Input placeholder="VD: Đại học Bách Khoa Hà Nội" {...register('current_school')} />
              </Field>
              <Field label="Bậc học hiện tại" hint="Dùng để so khớp với bậc học của học bổng khi tính độ phù hợp.">
                <Select {...register('current_degree_level')}>
                  <option value="">-- Chọn bậc học --</option>
                  {DEGREE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="GPA (thang 4.0)">
                <Input type="number" step="0.01" min={0} max={4} placeholder="VD: 3.2" {...register('gpa')} />
              </Field>
            </div>
            <div className="mt-4">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">Ngành mục tiêu</span>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft">Nhóm ngành</label>
                    <Select
                      value={majorGroupToAdd}
                      onChange={(e) => {
                        setMajorGroupToAdd(e.target.value)
                        setMajorToAdd('')
                      }}
                    >
                      <option value="">-- Chọn nhóm ngành --</option>
                      {majorGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft">Ngành</label>
                    <Select value={majorToAdd} onChange={(e) => setMajorToAdd(e.target.value)} disabled={!majorGroupToAdd}>
                      <option value="">-- Chọn ngành để thêm --</option>
                      {majorsAvailableInSelectedGroup.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" disabled={!majorToAdd} onClick={addSelectedMajor}>
                    + Thêm ngành đã chọn
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!majorGroupToAdd || majorsAvailableInSelectedGroup.length === 0}
                    onClick={addAllMajorsInGroup}
                  >
                    Thêm tất cả ngành trong nhóm này
                  </Button>
                </div>
              </div>

              {targetMajors.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {majorGroups.map((group) => {
                    const majorsInGroup = majors.filter((m) => m.group_id === group.id && targetMajors.includes(m.code))
                    if (majorsInGroup.length === 0) return null
                    return (
                      <div key={group.id}>
                        <p className="mb-1 text-xs font-medium text-brand-ink-soft">{group.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {majorsInGroup.map((m) => (
                            <span
                              key={m.id}
                              className="flex items-center gap-1.5 rounded-full bg-brand-blue-50 px-3 py-1.5 text-xs font-medium text-brand-blue-600"
                            >
                              {m.name}
                              <button type="button" onClick={() => toggleMajor(m.code)} className="text-brand-blue-400 hover:text-red-500">
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs text-brand-ink-soft">Chưa chọn ngành mục tiêu nào.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-brand-ink">Khu vực & hoàn cảnh</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Tỉnh/Thành phố">
                <Select
                  value={provinceCity}
                  onChange={(e) => {
                    setProvinceCity(e.target.value)
                    setWard('')
                  }}
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Phường/Xã">
                <Select value={ward} onChange={(e) => setWard(e.target.value)} disabled={!selectedProvince}>
                  <option value="">{selectedProvince ? '-- Chọn phường/xã --' : 'Chọn tỉnh/thành phố trước'}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Hoàn cảnh tài chính" hint="Tự mô tả, VD: Khó khăn, Trung bình..." className="sm:max-w-xs">
                <Input placeholder="VD: Khó khăn" {...register('financial_need_level')} />
              </Field>
            </div>
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" loading={isSubmitting}>
            Lưu hồ sơ
          </Button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Chứng chỉ</h2>
          <div className="space-y-3">
            {certificates.map((c) => (
              <CertificateRow key={c.id} certificate={c} onDelete={handleDeleteCertificate} onUpload={handleUploadCertAttachment} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Field label="Loại chứng chỉ" className="w-40">
              <Input
                placeholder="VD: IELTS"
                value={certForm.certificate_type}
                onChange={(e) => setCertForm((f) => ({ ...f, certificate_type: e.target.value }))}
              />
            </Field>
            <Field label="Điểm số" className="w-32">
              <Input
                placeholder="VD: 7.0"
                value={certForm.certificate_score}
                onChange={(e) => setCertForm((f) => ({ ...f, certificate_score: e.target.value }))}
              />
            </Field>
            <Button size="sm" loading={savingCert} onClick={handleAddCertificate}>
              Thêm chứng chỉ
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-brand-ink">Hoạt động ngoại khoá</h2>
            <Button size="sm" variant="ghost" icon={<IconPlusCircle className="size-4" />} onClick={() => setActivityModalOpen(true)}>
              Thêm
            </Button>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có hoạt động nào.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activities.map((a) => (
                <KeyValueCard key={a.id} item={a} onDelete={handleDeleteActivity} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-brand-ink">Giải thưởng, thành tích</h2>
            <Button size="sm" variant="ghost" icon={<IconPlusCircle className="size-4" />} onClick={() => setAwardModalOpen(true)}>
              Thêm
            </Button>
          </div>
          {awards.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có giải thưởng nào.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {awards.map((a) => (
                <KeyValueCard key={a.id} item={a} onDelete={handleDeleteAward} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-3 font-bold text-brand-ink">CV & Phân tích AI</h2>
          <p className="mb-4 text-xs text-brand-ink-soft">
            Tải CV (chỉ nhận PDF) để hệ thống phân tích và tính độ phù hợp học bổng chính xác hơn (Phù hợp lĩnh vực, Hoạt động xã hội,
            Khớp ưu tiên học bổng). Có thể mất vài giây để xử lý.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input ref={cvInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => void handleCvFileChange(e)} />
            <Button type="button" size="sm" loading={uploadingCv} onClick={() => cvInputRef.current?.click()}>
              {profile?.cv_url ? 'Tải CV mới' : 'Tải CV lên'}
            </Button>
            {profile?.cv_url && (
              <a href={profile.cv_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
                Xem CV hiện tại
              </a>
            )}
          </div>
          {profile?.cv_url && (
            <p className="mt-4 text-xs text-brand-ink-soft">
              Đã tiếp nhận CV{profile.cv_analyzed_at && ` lúc ${new Date(profile.cv_analyzed_at).toLocaleString('vi-VN')}`}. Xem điểm phù
              hợp chi tiết khi vào từng học bổng cụ thể.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Thông tin đăng nhập</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">
                {user ? user.roles.map((role) => ROLE_LABELS[role]).join(', ') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-ink-soft">
            Đổi email đăng nhập chưa được hệ thống hỗ trợ. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </p>
        </div>
      </div>

      <AddKeyValueModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title="Thêm hoạt động ngoại khoá"
        titlePlaceholder="VD: Chủ nhiệm CLB Lập trình"
        submitLabel="Thêm hoạt động"
        onSubmit={(input) => candidateProfileApi.createActivity(input)}
        onCreated={(item) => setActivities((prev) => [item, ...prev])}
      />
      <AddKeyValueModal
        open={awardModalOpen}
        onClose={() => setAwardModalOpen(false)}
        title="Thêm giải thưởng, thành tích"
        titlePlaceholder="VD: Giải Nhì Olympic Tin học"
        submitLabel="Thêm giải thưởng"
        onSubmit={(input) => candidateProfileApi.createAward(input)}
        onCreated={(item) => setAwards((prev) => [item, ...prev])}
      />
    </CandidateLayout>
  )
}

function KeyValueCard({
  item,
  onDelete,
}: {
  item: CandidateActivity | CandidateAward
  onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <IconAward className="mt-0.5 size-5 shrink-0 text-brand-yellow-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-ink">{item.title}</p>
        {item.description && <p className="text-xs text-brand-ink-soft">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        aria-label="Xoá"
        className="shrink-0 rounded-full p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <IconX className="size-4" />
      </button>
    </div>
  )
}

function AddKeyValueModal({
  open,
  onClose,
  title,
  titlePlaceholder,
  submitLabel,
  onSubmit,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  title: string
  titlePlaceholder: string
  submitLabel: string
  onSubmit: (input: { title: string; description?: string }) => Promise<CandidateActivity | CandidateAward>
  onCreated: (item: CandidateActivity | CandidateAward) => void
}) {
  const { notify } = useToast()
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const created = await onSubmit({ title: form.title, description: form.description || undefined })
      onCreated(created)
      setForm({ title: '', description: '' })
      onClose()
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm mục này.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <Field label="Tiêu đề">
          <Input placeholder={titlePlaceholder} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Chú thích">
          <Input
            placeholder="VD: Cấp quốc gia, năm 2023"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <Button loading={saving} onClick={() => void handleSubmit()}>
          {submitLabel}
        </Button>
      </div>
    </Modal>
  )
}

function CertificateRow({
  certificate,
  onDelete,
  onUpload,
}: {
  certificate: CandidateCertificate
  onDelete: (id: string) => void
  onUpload: (id: string, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-brand-ink">
          {certificate.certificate_type} — {certificate.certificate_score}
        </p>
        {certificate.attachment_url ? (
          <a href={certificate.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
            Xem minh chứng
          </a>
        ) : (
          <p className="text-xs text-brand-ink-soft">Chưa có minh chứng.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(certificate.id, e.target.files[0])}
        />
        <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
          Tải minh chứng
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(certificate.id)}>
          Xoá
        </Button>
      </div>
    </div>
  )
}
