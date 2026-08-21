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
import { majorGroupsApi, majorsApi } from '@/modules/partner/api/majors.api'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import type { Major, MajorGroup, Scholarship, ScholarshipCertificateRequirement } from '@/modules/partner/types'
import { dateInputToIso, dateInputToIsoStart, toDateInputValue } from '@/shared/lib/format'

const schema = z
  .object({
    title: z.string().min(1, 'Vui lòng nhập tên học bổng'),
    degree: z.string().min(1, 'Vui lòng chọn bậc học'),
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
    is_vip_exclusive: z.boolean(),
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
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([])
  const [provinceToAdd, setProvinceToAdd] = useState('')
  const [majorsCatalog, setMajorsCatalog] = useState<Major[]>([])
  const [majorGroupsCatalog, setMajorGroupsCatalog] = useState<MajorGroup[]>([])
  const [selectedMajorIds, setSelectedMajorIds] = useState<number[]>([])
  const [majorBusy, setMajorBusy] = useState<number | null>(null)
  const [majorGroupToAdd, setMajorGroupToAdd] = useState('')
  const [majorToAdd, setMajorToAdd] = useState('')

  const [requirements, setRequirements] = useState<ScholarshipCertificateRequirement[]>([])
  const [requirementInput, setRequirementInput] = useState('')
  const [requirementBusy, setRequirementBusy] = useState(false)

  const [loadingScholarship, setLoadingScholarship] = useState(isEdit)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<Scholarship['review_status']>('approved')
  const [reviewReason, setReviewReason] = useState<string | null>(null)
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
      description: '',
      value_type: 'percentage',
      funding_percentage: '',
      total_slots: '',
      total_budget: '',
      min_gpa: '',
      is_no_essay: false,
      is_vip_exclusive: false,
      start_date: '',
      deadline: '',
      is_active: true,
    },
  })

  useEffect(() => {
    majorsApi.list().then(setMajorsCatalog)
    majorGroupsApi.list().then(setMajorGroupsCatalog)
    provincesApi.listProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (!id) return
    scholarshipsApi.get(id).then((s) => {
      reset({
        title: s.title,
        degree: s.degree,
        description: s.description,
        value_type: s.value_type,
        funding_percentage: s.funding_percentage != null ? String(s.funding_percentage) : '',
        total_slots: s.total_slots != null ? String(s.total_slots) : '',
        total_budget: s.total_budget != null ? String(s.total_budget) : '',
        min_gpa: s.min_gpa != null ? String(s.min_gpa) : '',
        is_no_essay: s.is_no_essay,
        is_vip_exclusive: s.is_vip_exclusive,
        start_date: toDateInputValue(s.start_date),
        deadline: toDateInputValue(s.deadline),
        is_active: s.is_active,
      })
      setSelectedMajorIds(s.majors.map((m) => m.id))
      setSelectedProvinces(s.location_province_cities)
      setRequirements(s.required_certificates)
      setImagePreview(s.image_url)
      setIsHidden(s.is_hidden)
      setReviewStatus(s.review_status)
      setReviewReason(s.review_reason)
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
      location_province_cities: selectedProvinces,
      value_type: values.value_type,
      funding_percentage: values.value_type === 'percentage' && values.funding_percentage ? Number(values.funding_percentage) : null,
      total_slots: values.total_slots ? Number(values.total_slots) : null,
      total_budget: values.total_budget ? Number(values.total_budget) : null,
      min_gpa: values.min_gpa ? Number(values.min_gpa) : null,
      is_no_essay: values.is_no_essay,
      is_vip_exclusive: values.is_vip_exclusive,
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

  const addProvince = () => {
    if (!provinceToAdd) return
    setSelectedProvinces((prev) => (prev.includes(provinceToAdd) ? prev : [...prev, provinceToAdd]))
    setProvinceToAdd('')
  }

  const removeProvince = (name: string) => {
    setSelectedProvinces((prev) => prev.filter((v) => v !== name))
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

  const [bulkAddingMajors, setBulkAddingMajors] = useState(false)
  const majorsAvailableInSelectedGroup = majorGroupToAdd
    ? majorsCatalog.filter((m) => String(m.group_id) === majorGroupToAdd && !selectedMajorIds.includes(m.id))
    : []

  const addSelectedMajor = () => {
    if (!majorToAdd) return
    void toggleMajor(Number(majorToAdd))
    setMajorToAdd('')
  }

  const addAllMajorsInGroup = async () => {
    setBulkAddingMajors(true)
    try {
      for (const m of majorsAvailableInSelectedGroup) await toggleMajor(m.id)
    } finally {
      setBulkAddingMajors(false)
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

      {isHidden && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span aria-hidden>⚠</span>
          <span>
            Học bổng này đã bị <strong>quản trị viên ẩn</strong> khỏi trang công khai (không hiển thị trong danh sách/chi
            tiết học bổng với ứng viên). Bạn vẫn có thể xem và chỉnh sửa bình thường. Nếu cho rằng đây là nhầm lẫn, vui
            lòng liên hệ quản trị viên để được mở lại.
          </span>
        </div>
      )}

      {/* review_status là vòng đời kiểm duyệt nội dung, khác hẳn is_hidden ở trên — xem ghi chú tại
          ScholarshipStatusBadge.tsx#getReviewStatusInfo. Chỉ hiện khi sửa học bổng đã có (isEdit), vì học
          bổng mới tạo luôn mặc định 'pending' — không cần cảnh báo ngay khi vừa bấm "Tạo học bổng". */}
      {isEdit && reviewStatus === 'pending' && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span aria-hidden>⏳</span>
          <span>Học bổng này đang <strong>chờ quản trị viên duyệt</strong> — chưa hiển thị công khai với ứng viên cho tới khi được duyệt.</span>
        </div>
      )}
      {isEdit && reviewStatus === 'rejected' && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span aria-hidden>✕</span>
          <span>
            Học bổng này đã bị <strong>quản trị viên từ chối</strong>.
            {reviewReason && (
              <>
                {' '}Lý do: <span className="italic">&ldquo;{reviewReason}&rdquo;</span>.
              </>
            )}{' '}
            Sửa lại nội dung và lưu để gửi duyệt lại.
          </span>
        </div>
      )}
      {isEdit && reviewStatus === 'changes_requested' && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span aria-hidden>✎</span>
          <span>
            Quản trị viên <strong>yêu cầu chỉnh sửa</strong> học bổng này trước khi duyệt.
            {reviewReason && (
              <>
                {' '}Chi tiết: <span className="italic">&ldquo;{reviewReason}&rdquo;</span>.
              </>
            )}{' '}
            Cập nhật nội dung và lưu để gửi lại cho quản trị viên xem xét.
          </span>
        </div>
      )}
      {isEdit && reviewStatus === 'approved' && (
        <p className="mb-6 text-xs text-brand-ink-soft">
          Lưu ý: sửa bất kỳ thông tin nào bên dưới (trừ nút Mở đơn/Đóng đơn) sẽ đưa học bổng về trạng thái{' '}
          <strong>chờ duyệt lại</strong> và tạm ẩn khỏi trang công khai cho tới khi quản trị viên duyệt.
        </p>
      )}

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

            <Field
              label="Khu vực áp dụng"
              hint="Không chọn tỉnh/thành nào nghĩa là học bổng áp dụng Toàn quốc"
              className="md:col-span-2"
            >
              <div className="flex gap-2">
                <Select value={provinceToAdd} onChange={(e) => setProvinceToAdd(e.target.value)}>
                  <option value="">-- Chọn tỉnh/thành để thêm --</option>
                  {provinces
                    .filter((p) => !selectedProvinces.includes(p.name))
                    .map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                </Select>
                <Button type="button" variant="secondary" disabled={!provinceToAdd} onClick={addProvince}>
                  Thêm
                </Button>
              </div>
              {selectedProvinces.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {selectedProvinces.map((name) => (
                    <span
                      key={name}
                      className="flex items-center gap-1.5 rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-medium text-brand-blue-600"
                    >
                      {name}
                      <button type="button" onClick={() => removeProvince(name)} className="text-brand-blue-400 hover:text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedProvinces([])}
                    className="text-xs text-brand-ink-soft underline hover:text-red-500"
                  >
                    Xoá tất cả (Toàn quốc)
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-brand-ink-soft">Chưa chọn tỉnh/thành nào — học bổng áp dụng Toàn quốc.</p>
              )}
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
            <div className="md:col-span-1">
              <Checkbox label="Học bổng độc quyền Skola VIP" {...register('is_vip_exclusive')} />
              <p className="mt-1 text-xs text-brand-ink-soft">Chỉ ứng viên đã nâng cấp Skola VIP mới nộp đơn được — vẫn xem được chi tiết học bổng bình thường.</p>
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
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft">Nhóm ngành</label>
                <Select
                  value={majorGroupToAdd}
                  disabled={bulkAddingMajors}
                  onChange={(e) => {
                    setMajorGroupToAdd(e.target.value)
                    setMajorToAdd('')
                  }}
                >
                  <option value="">-- Chọn nhóm ngành --</option>
                  {majorGroupsCatalog.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-brand-ink-soft">Ngành</label>
                <Select value={majorToAdd} onChange={(e) => setMajorToAdd(e.target.value)} disabled={!majorGroupToAdd || bulkAddingMajors}>
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
              <Button type="button" size="sm" variant="secondary" disabled={!majorToAdd || majorBusy != null || bulkAddingMajors} onClick={addSelectedMajor}>
                + Thêm ngành đã chọn
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                loading={bulkAddingMajors}
                disabled={!majorGroupToAdd || majorsAvailableInSelectedGroup.length === 0 || majorBusy != null}
                onClick={addAllMajorsInGroup}
              >
                Thêm tất cả ngành trong nhóm này
              </Button>
            </div>
          </div>

          {selectedMajorIds.length > 0 ? (
            <div className="mt-3 space-y-3">
              {majorGroupsCatalog.map((group) => {
                const majorsInGroup = majorsCatalog.filter((m) => m.group_id === group.id && selectedMajorIds.includes(m.id))
                if (majorsInGroup.length === 0) return null
                return (
                  <div key={group.id}>
                    <p className="mb-1 text-xs font-medium text-brand-ink-soft">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {majorsInGroup.map((major) => (
                        <span
                          key={major.id}
                          className="flex items-center gap-1.5 rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-medium text-brand-blue-600"
                        >
                          {major.name}
                          <button
                            type="button"
                            disabled={majorBusy === major.id}
                            onClick={() => toggleMajor(major.id)}
                            className="text-brand-blue-400 hover:text-red-500 disabled:opacity-60"
                          >
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
            <p className="mt-2 text-xs text-brand-ink-soft">
              {majorsCatalog.length === 0 ? 'Chưa có ngành học nào trong danh mục.' : 'Chưa chọn ngành học nào phù hợp.'}
            </p>
          )}
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
