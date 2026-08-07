import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { useCandidateProfile } from '@/modules/candidate/CandidateProfileContext'
import { candidateProfileApi } from '@/modules/candidate/api/candidateProfile.api'
import { majorsApi } from '@/modules/scholarships/api/majors.api'
import { provincesApi, type Province, type Ward } from '@/shared/api/provinces.api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Checkbox } from '@/shared/components/ui/Checkbox'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { Major } from '@/modules/scholarships/types'
import type { CandidateCertificate } from '@/modules/candidate/types'

const schema = z.object({
  current_school: z.string().trim().optional(),
  gpa: z.string().trim().optional(),
  financial_need_level: z.string().trim().optional(),
  is_first_generation: z.boolean().optional(),
  extracurriculars: z.string().trim().optional(),
  awards: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { profile, loading, setProfile } = useCandidateProfile()
  const { notify } = useToast()
  const [majors, setMajors] = useState<Major[]>([])
  const [targetMajors, setTargetMajors] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [provinceCity, setProvinceCity] = useState('')
  const [ward, setWard] = useState('')

  const [certificates, setCertificates] = useState<CandidateCertificate[]>([])
  const [certForm, setCertForm] = useState({ certificate_type: '', certificate_score: '' })
  const [savingCert, setSavingCert] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          current_school: profile.current_school ?? '',
          gpa: profile.gpa != null ? String(profile.gpa) : '',
          financial_need_level: profile.financial_need_level ?? '',
          is_first_generation: profile.is_first_generation,
          extracurriculars: profile.extracurriculars ?? '',
          awards: profile.awards ?? '',
        }
      : undefined,
  })

  useEffect(() => {
    void majorsApi.list().then(setMajors)
    void candidateProfileApi.listCertificates().then(setCertificates)
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
        province_city: provinceCity || null,
        ward: ward || null,
        current_school: values.current_school || null,
        gpa: values.gpa ? Number(values.gpa) : null,
        financial_need_level: values.financial_need_level || null,
        is_first_generation: values.is_first_generation,
        extracurriculars: values.extracurriculars || null,
        awards: values.awards || null,
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

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await candidateProfileApi.uploadAvatar(file)
      setProfile(updated)
      notify('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên ảnh đại diện.', 'error')
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
            <h2 className="mb-3 font-bold text-brand-ink">Học vấn</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Trường đang theo học">
                <Input placeholder="VD: Đại học Bách Khoa Hà Nội" {...register('current_school')} />
              </Field>
              <Field label="GPA (thang 4.0)">
                <Input type="number" step="0.01" min={0} max={4} placeholder="VD: 3.2" {...register('gpa')} />
              </Field>
            </div>
            <div className="mt-4">
              <span className="mb-1.5 block text-sm font-medium text-brand-ink">Ngành mục tiêu</span>
              <div className="flex flex-wrap gap-2">
                {majors.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMajor(m.code)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      targetMajors.includes(m.code)
                        ? 'border-brand-blue-500 bg-brand-blue-50 text-brand-blue-600'
                        : 'border-slate-200 text-brand-ink-soft hover:bg-slate-50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
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
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Hoàn cảnh tài chính" hint="Tự mô tả, VD: Khó khăn, Trung bình...">
                <Input placeholder="VD: Khó khăn" {...register('financial_need_level')} />
              </Field>
              <div className="flex items-end">
                <Checkbox label="Là thế hệ đầu tiên trong gia đình học đại học" {...register('is_first_generation')} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-bold text-brand-ink">Hoạt động & thành tích</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Hoạt động ngoại khoá">
                <Textarea rows={3} {...register('extracurriculars')} />
              </Field>
              <Field label="Giải thưởng, thành tích">
                <Textarea rows={3} {...register('awards')} />
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
      </div>
    </CandidateLayout>
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
