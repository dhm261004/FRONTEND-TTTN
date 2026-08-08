import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorServicesApi } from '@/modules/mentor/api/mentorServices.api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Checkbox } from '@/shared/components/ui/Checkbox'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'

interface FormState {
  name: string
  description: string
  duration_minutes: string
  total_sessions: string
  price: string
  benefits: string[]
  is_active: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  duration_minutes: '60',
  total_sessions: '1',
  price: '',
  benefits: [''],
  is_active: true,
}

export function ServiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notify } = useToast()
  const { profile, loading, refresh } = useMentorProfile()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [initialized, setInitialized] = useState(!isEdit)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const existingService = isEdit && profile ? profile.services.find((s) => s.id === id) : undefined

  useEffect(() => {
    if (!isEdit || loading || initialized) return
    if (existingService) {
      setForm({
        name: existingService.name,
        description: existingService.description ?? '',
        duration_minutes: String(existingService.duration_minutes),
        total_sessions: String(existingService.total_sessions),
        price: String(existingService.price),
        benefits: existingService.benefits.length > 0 ? existingService.benefits : [''],
        is_active: existingService.is_active,
      })
    }
    setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, loading, initialized, existingService])

  const updateBenefit = (index: number, value: string) =>
    setForm((f) => ({ ...f, benefits: f.benefits.map((b, i) => (i === index ? value : b)) }))
  const addBenefit = () => setForm((f) => ({ ...f, benefits: [...f.benefits, ''] }))
  const removeBenefit = (index: number) => setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== index) }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.duration_minutes || !form.price || !form.total_sessions) {
      setServerError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    setServerError(null)
    setSaving(true)
    try {
      const benefits = form.benefits.map((b) => b.trim()).filter(Boolean)
      if (isEdit && id) {
        await mentorServicesApi.update(id, {
          name: form.name,
          description: form.description || undefined,
          duration_minutes: Number(form.duration_minutes),
          price: Number(form.price),
          total_sessions: Number(form.total_sessions),
          benefits,
          is_active: form.is_active,
        })
        notify('Đã cập nhật gói dịch vụ.')
      } else {
        await mentorServicesApi.create({
          name: form.name,
          description: form.description || undefined,
          duration_minutes: Number(form.duration_minutes),
          price: Number(form.price),
          total_sessions: Number(form.total_sessions),
          benefits,
        })
        notify('Đã tạo gói dịch vụ mới.')
      }
      await refresh()
      navigate('/co-van/dich-vu')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu gói dịch vụ. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && loading) {
    return (
      <MentorLayout>
        <Spinner />
      </MentorLayout>
    )
  }

  if (isEdit && initialized && !existingService) {
    return (
      <MentorLayout>
        <EmptyState
          title="Không tìm thấy gói dịch vụ"
          description="Gói dịch vụ này có thể đã bị xoá."
          action={
            <Link to="/co-van/dich-vu">
              <Button size="sm">Quay lại danh sách</Button>
            </Link>
          }
        />
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <h1 className="mb-1 text-2xl font-bold text-brand-ink">{isEdit ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</h1>
      <p className="mb-6 text-sm text-brand-ink-soft">
        Vui lòng điền đầy đủ thông tin để {isEdit ? 'cập nhật' : 'tạo'} gói dịch vụ cố vấn của bạn.
      </p>

      <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">1. Thông tin gói dịch vụ</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Tên gói" required className="md:col-span-2">
              <Input
                placeholder="VD: Cố vấn hồ sơ du học 1-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Mô tả" className="md:col-span-2">
              <Textarea
                rows={4}
                placeholder="Mô tả nội dung, đối tượng phù hợp của gói dịch vụ..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">2. Thời lượng &amp; giá</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Thời lượng mỗi buổi (phút)" required>
              <Input
                type="number"
                min={1}
                max={1440}
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
              />
            </Field>
            <Field label="Số buổi trong gói" required>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.total_sessions}
                onChange={(e) => setForm((f) => ({ ...f, total_sessions: e.target.value }))}
              />
            </Field>
            <Field label="Giá (VNĐ)" required>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-brand-ink">3. Quyền lợi học viên</h2>
          <div className="space-y-3">
            {form.benefits.map((b, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="VD: Chỉnh sửa bài luận không giới hạn"
                  value={b}
                  onChange={(e) => updateBenefit(i, e.target.value)}
                />
                <Button type="button" variant="danger" size="sm" onClick={() => removeBenefit(i)}>
                  Xoá
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={addBenefit}>
            + Thêm quyền lợi
          </Button>
        </section>

        {isEdit && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-brand-ink">4. Trạng thái</h2>
            <Checkbox
              label="Đang mở bán"
              hint="Bỏ chọn để ngừng bán mà không mất lịch sử đã mua"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
          </section>
        )}

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="secondary" onClick={() => navigate('/co-van/dich-vu')}>
            Huỷ
          </Button>
          <Button type="button" loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo gói'}
          </Button>
        </div>
      </div>
    </MentorLayout>
  )
}
