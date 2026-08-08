import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Select } from '@/shared/components/ui/Select'
import { Checkbox } from '@/shared/components/ui/Checkbox'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import { majorsApi } from '@/modules/partner/api/majors.api'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import type { Major, ScholarshipCertificateRequirement } from '@/modules/partner/types'
import { dateInputToIso, dateInputToIsoStart, toDateInputValue } from '@/shared/lib/format'

const schema = z
  .object({
    title: z.string().min(1, 'Vui lòng nhập tên học bổng'),
    degree: z.string().min(1, 'Vui lòng chọn bậc học'),
    location_province_city: z.string().optional(),
    description: z.string().min(1, 'Vui lòng nhập mô tả'),
    value_type: z.string().min(1, 'Vui lòng chọn loại giá trị'),
    funding_percentage: z
      .string()
      .optional()
      .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 100), 'Từ 0 đến 100'),
    total_slots: z
      .string()
      .optional()
      .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), 'Phải là số nguyên không âm'),
    total_budget: z
      .string()
      .optional()
      .refine((v) => !v || Number(v) >= 0, 'Phải là số không âm'),
    min_gpa: z
      .string()
      .optional()
      .refine((v) => !v || (Number(v) >= 0 && Number(v) <= 9.99), 'Từ 0 đến 9.99'),
    is_no_essay: z.boolean(),
    start_date: z.string().optional(),
    deadline: z.string().min(1, 'Vui lòng chọn hạn nộp'),
    is_active: z.boolean(),
  })
  .refine((data) => !data.start_date || data.start_date < data.deadline, {
    message: 'Ngày bắt đầu phải trước hạn nộp',
    path: ['start_date'],
  })

type FormValues = z.infer<typeof schema>

const DEGREE_OPTIONS = [
  { value: 'undergraduate', label: 'Đại học' },
  { value: 'postgraduate', label: 'Sau đại học' },
  { value: 'vocational', label: 'Cao đẳng / Nghề' },
  { value: 'other', label: 'Khác' },
]

const VALUE_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Theo phần trăm học phí (%)' },
  { value: 'fixed_amount', label: 'Số tiền cố định' },
]

export function ScholarshipFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notify } = useToast()
  const { profile } = usePartnerProfile()

  const [provinces, setProvinces] = useState<Province[]>([])
  const [majorsCatalog, setMajorsCatalog] = useState<Major[]>([])
  const [selectedMajorIds, setSelectedMajorIds] = useState<number[]>([])
  const [majorBusy, setMajorBusy] = useState<number | null>(null)

  const [requirements, setRequirements] = useState<ScholarshipCertificateRequirement[]>([])
  const [requirementInput, setRequirementInput] = useState('')
  const [requirementBusy, setRequirementBusy] = useState(false)

  const [loadingScholarship, setLoadingScholarship] = useState(isEdit)
  const [serverError, setServerError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      degree: 'undergraduate',
      location_province_city: '',
      description: '',
      value_type: 'percentage',
      funding_percentage: '',
      total_slots: '',
      total_budget: '',
      min_gpa: '',
      is_no_essay: false,
      start_date: '',
      deadline: '',
      is_active: true,
    },
  })

  useEffect(() => {
    majorsApi.list().then(setMajorsCatalog)
    provincesApi.listProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (!id) return
    scholarshipsApi.get(id).then((s) => {
      reset({
        title: s.title,
        degree: s.degree,
        location_province_city: s.location_province_city ?? '',
        description: s.description,
        value_type: s.value_type,
        funding_percentage: s.funding_percentage != null ? String(s.funding_percentage) : '',
        total_slots: s.total_slots != null ? String(s.total_slots) : '',
        total_budget: s.total_budget != null ? String(s.total_budget) : '',
        min_gpa: s.min_gpa != null ? String(s.min_gpa) : '',
        is_no_essay: s.is_no_essay,
        start_date: toDateInputValue(s.start_date),
        deadline: toDateInputValue(s.deadline),
        is_active: s.is_active,
      })
      setSelectedMajorIds(s.majors.map((m) => m.id))
      setRequirements(s.required_certificates)
      setImagePreview(s.image_url)
      setLoadingScholarship(false)
    })
  }, [id, reset])

  const description = watch('description')
  const valueType = watch('value_type')

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const payload = {
      title: values.title,
      description: values.description,
      degree: values.degree,
      location_province_city: values.location_province_city || null,
      value_type: values.value_type,
      funding_percentage: values.value_type === 'percentage' && values.funding_percentage ? Number(values.funding_percentage) : null,
      total_slots: values.total_slots ? Number(values.total_slots) : null,
      total_budget: values.total_budget ? Number(values.total_budget) : null,
      min_gpa: values.min_gpa ? Number(values.min_gpa) : null,
      is_no_essay: values.is_no_essay,
      start_date: values.start_date ? dateInputToIsoStart(values.start_date) : null,
      deadline: dateInputToIso(values.deadline),
      is_active: values.is_active,
    }

    try {
      if (isEdit && id) {
        await scholarshipsApi.update(id, payload)
        notify('Đã cập nhật học bổng.')
      } else {
        const created = await scholarshipsApi.create({
          ...payload,
          major_ids: selectedMajorIds,
          required_certificates: requirements.map((r) => r.certificate_type),
        })
        if (pendingImageFile) {
          try {
            await scholarshipsApi.uploadImage(created.id, pendingImageFile)
          } catch {
            notify('Đã tạo học bổng nhưng không thể tải ảnh đại diện lên. Bạn có thể thử lại ở trang chỉnh sửa.', 'error')
          }
        }
        notify('Đã đăng học bổng mới.')
      }
      navigate('/doi-tac/hoc-bong')
    } catch {
      setServerError(
        profile?.approval_status !== 'approved'
          ? 'Hồ sơ nhà tài trợ của bạn chưa được Skola duyệt nên chưa thể đăng học bổng.'
          : 'Không thể lưu học bổng. Vui lòng kiểm tra lại thông tin.',
      )
    }
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isEdit && id) {
      setImageUploading(true)
      try {
        const updated = await scholarshipsApi.uploadImage(id, file)
        setImagePreview(updated.image_url)
        notify('Đã cập nhật ảnh đại diện.')
      } catch {
        notify('Không thể tải ảnh lên. Vui lòng thử lại.', 'error')
      } finally {
        setImageUploading(false)
        e.target.value = ''
      }
    } else {
      setPendingImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const toggleMajor = async (majorId: number) => {
    const checked = selectedMajorIds.includes(majorId)

    if (!isEdit || !id) {
      setSelectedMajorIds((prev) => (checked ? prev.filter((v) => v !== majorId) : [...prev, majorId]))
      return
    }

    setMajorBusy(majorId)
    setSelectedMajorIds((prev) => (checked ? prev.filter((v) => v !== majorId) : [...prev, majorId]))
    try {
      if (checked) {
        await scholarshipsApi.removeMajor(id, majorId)
      } else {
        await scholarshipsApi.addMajor(id, majorId)
      }
    } catch {
      setSelectedMajorIds((prev) => (checked ? [...prev, majorId] : prev.filter((v) => v !== majorId)))
      notify('Không thể cập nhật ngành học. Vui lòng thử lại.', 'error')
    } finally {
      setMajorBusy(null)
    }
  }

  const addRequirement = async () => {
    const certificateType = requirementInput.trim()
    if (!certificateType || requirements.some((r) => r.certificate_type.toLowerCase() === certificateType.toLowerCase())) return

    if (!isEdit || !id) {
      setRequirements((prev) => [...prev, { id: crypto.randomUUID(), certificate_type: certificateType }])
      setRequirementInput('')
      return
    }

    setRequirementBusy(true)
    try {
      const created = await scholarshipsApi.addRequirement(id, certificateType)
      setRequirements((prev) => [...prev, created])
      setRequirementInput('')
    } catch {
      notify('Không thể thêm yêu cầu chứng chỉ. Vui lòng thử lại.', 'error')
    } finally {
      setRequirementBusy(false)
    }
  }

  const removeRequirement = async (requirement: ScholarshipCertificateRequirement) => {
    if (!isEdit || !id) {
      setRequirements((prev) => prev.filter((r) => r.id !== requirement.id))
      return
    }

    try {
      await scholarshipsApi.removeRequirement(id, requirement.id)
      setRequirements((prev) => prev.filter((r) => r.id !== requirement.id))
    } catch {
      notify('Không thể gỡ yêu cầu chứng chỉ. Vui lòng thử lại.', 'error')
    }
  }

  if (loadingScholarship) {
    return (
      <PartnerLayout nav={MANAGEMENT_NAV}>
        <Spinner />
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">{isEdit ? 'Chỉnh sửa học bổng' : 'Tạo học bổng mới'}</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">Vui lòng điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} chương trình học bổng</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">1. Thông tin cơ bản</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tên học bổng" required error={errors.title?.message} className="md:col-span-2">
              <Input placeholder="Ví dụ: Samsung Talent Scholarship 2026" {...register('title')} error={Boolean(errors.title)} />
            </Field>

            <Field label="Bậc học" required error={errors.degree?.message}>
              <Select {...register('degree')}>
                {DEGREE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Khu vực áp dụng">
              <Select {...register('location_province_city')}>
                <option value="">-- Chọn tỉnh/thành phố --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Mô tả học bổng" required error={errors.description?.message} className="md:col-span-2">
              <Textarea rows={5} placeholder="Viết mô tả…" {...register('description')} error={Boolean(errors.description)} />
              <span className="mt-1 block text-right text-xs text-slate-400">{description.length} ký tự</span>
            </Field>

            <Field label="Ảnh đại diện học bổng" hint="Khuyến nghị 1200×630px, PNG/JPEG/WEBP" className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-32 w-56 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Ảnh đại diện học bổng" className="size-full object-cover" />
                  ) : (
                    <span className="px-3 text-center text-xs text-brand-ink-soft">Chưa có ảnh</span>
                  )}
                </div>
                <Button type="button" variant="secondary" loading={imageUploading} onClick={() => imageInputRef.current?.click()}>
                  {imagePreview ? 'Đổi ảnh' : 'Tải ảnh lên'}
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">2. Giá trị &amp; Ngân sách</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Loại giá trị học bổng" required error={errors.value_type?.message}>
              <Select {...register('value_type')}>
                {VALUE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            {valueType === 'percentage' && (
              <Field label="Tỷ lệ hỗ trợ học phí (%)" error={errors.funding_percentage?.message} hint="Để trống nếu không áp dụng">
                <Input inputMode="numeric" placeholder="100" {...register('funding_percentage')} error={Boolean(errors.funding_percentage)} />
              </Field>
            )}

            <Field label="Tổng số suất học bổng" error={errors.total_slots?.message} hint="Để trống nếu không giới hạn">
              <Input inputMode="numeric" placeholder="Ví dụ: 20" {...register('total_slots')} error={Boolean(errors.total_slots)} />
            </Field>

            <Field label="Tổng ngân sách (VNĐ)" error={errors.total_budget?.message} hint="Để trống nếu không công bố">
              <Input inputMode="numeric" placeholder="Ví dụ: 3000000000" {...register('total_budget')} error={Boolean(errors.total_budget)} />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">3. Điều kiện xét duyệt</h2>
          <div className="grid gap-5">
            <div className="md:col-span-1">
              <Checkbox label="Không yêu cầu bài luận" {...register('is_no_essay')} />
            </div>
            <Field label="GPA tối thiểu" error={errors.min_gpa?.message} hint="Thang điểm 10, để trống nếu không yêu cầu">
              <Input inputMode="decimal" placeholder="Ví dụ: 3.2" {...register('min_gpa')} error={Boolean(errors.min_gpa)} />
            </Field>
          </div>

          <div className="mt-5">
            <span className="mb-2 block text-sm font-medium text-brand-ink">Chứng chỉ yêu cầu</span>
            <p className="mb-2 text-xs text-brand-ink-soft">Tự nhập tên chứng chỉ mà ứng viên cần nộp (ví dụ: IELTS, TOEIC, chứng chỉ tin học…).</p>
            <div className="flex gap-2">
              <Input
                placeholder="Ví dụ: IELTS"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addRequirement()
                  }
                }}
              />
              <Button type="button" variant="secondary" loading={requirementBusy} onClick={addRequirement}>
                Thêm
              </Button>
            </div>
            {requirements.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {requirements.map((r) => (
                  <span key={r.id} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs">
                    {r.certificate_type}
                    <button type="button" onClick={() => removeRequirement(r)} className="text-slate-400 hover:text-red-500">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">4. Ngành học phù hợp</h2>
          <div className="flex flex-wrap gap-2">
            {majorsCatalog.map((major) => {
              const checked = selectedMajorIds.includes(major.id)
              return (
                <button
                  type="button"
                  key={major.id}
                  disabled={majorBusy === major.id}
                  onClick={() => toggleMajor(major.id)}
                  className={
                    checked
                      ? 'rounded-full bg-brand-blue-500 px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-60'
                      : 'rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-brand-ink-soft hover:bg-slate-50 disabled:opacity-60'
                  }
                >
                  {major.name}
                </button>
              )
            })}
            {majorsCatalog.length === 0 && <p className="text-sm text-brand-ink-soft">Chưa có ngành học nào trong danh mục.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">5. Thời gian &amp; hiển thị</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Ngày bắt đầu nhận hồ sơ" error={errors.start_date?.message} hint="Để trống nếu mở nhận hồ sơ ngay">
              <Input type="date" {...register('start_date')} error={Boolean(errors.start_date)} />
            </Field>
            <Field label="Hạn nộp hồ sơ" required error={errors.deadline?.message}>
              <Input type="date" {...register('deadline')} error={Boolean(errors.deadline)} />
            </Field>
          </div>
          <div className="mt-5">
            <Checkbox label="Mở đơn/Đóng đơn" {...register('is_active')} />
          </div>
        </section>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/doi-tac/hoc-bong')}>
            Huỷ
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Lưu thay đổi' : 'Đăng tải ngay'}
          </Button>
        </div>
      </form>
    </PartnerLayout>
  )
}
