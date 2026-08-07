import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { CoverImageUpload } from '@/shared/components/ui/CoverImageUpload'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import type { PartnerProfilePayload } from '@/modules/partner/api/partnerProfile.api'

const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+']

const schema = z.object({
  company_name: z.string().min(1, 'Vui lòng nhập tên nhà tài trợ'),
  industry_sector: z.string().optional(),
  website_url: z.string().url('Đường dẫn không hợp lệ').or(z.literal('')).optional(),
  description: z.string().max(1500, 'Tối đa 1500 ký tự').optional(),
  founding_year: z.string().optional(),
  company_size: z.string().optional(),
  headquarters_address: z.string().optional(),
  province_city: z.string().optional(),
  linkedin_url: z.string().url('Đường dẫn không hợp lệ').or(z.literal('')).optional(),
  facebook_url: z.string().url('Đường dẫn không hợp lệ').or(z.literal('')).optional(),
})

export type PartnerProfileFormValues = z.infer<typeof schema>

interface PartnerProfileFormProps {
  initialValues?: Partial<PartnerProfileFormValues>
  logoUrl?: string | null
  coverImageUrl?: string | null
  onSubmit: (payload: PartnerProfilePayload) => Promise<void>
  onLogoSelected?: (file: File) => Promise<void>
  onCoverImageSelected?: (file: File) => Promise<void>
  submitLabel: string
}

export function PartnerProfileForm({
  initialValues,
  logoUrl,
  coverImageUrl,
  onSubmit,
  onLogoSelected,
  onCoverImageSelected,
  submitLabel,
}: PartnerProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])

  useEffect(() => {
    void provincesApi.listProvinces().then(setProvinces)
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PartnerProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: initialValues?.company_name ?? '',
      industry_sector: initialValues?.industry_sector ?? '',
      website_url: initialValues?.website_url ?? '',
      description: initialValues?.description ?? '',
      founding_year: initialValues?.founding_year ?? '',
      company_size: initialValues?.company_size ?? '',
      headquarters_address: initialValues?.headquarters_address ?? '',
      province_city: initialValues?.province_city ?? '',
      linkedin_url: initialValues?.linkedin_url ?? '',
      facebook_url: initialValues?.facebook_url ?? '',
    },
  })

  const descriptionValue = watch('description') ?? ''

  const submit = async (values: PartnerProfileFormValues) => {
    setServerError(null)
    try {
      await onSubmit({
        company_name: values.company_name,
        industry_sector: values.industry_sector || undefined,
        website_url: values.website_url || undefined,
        description: values.description || undefined,
        founding_year: values.founding_year ? Number(values.founding_year) : undefined,
        company_size: values.company_size || undefined,
        headquarters_address: values.headquarters_address || undefined,
        province_city: values.province_city || undefined,
        linkedin_url: values.linkedin_url || undefined,
        facebook_url: values.facebook_url || undefined,
      })
    } catch {
      setServerError('Không thể lưu hồ sơ. Vui lòng thử lại.')
    }
  }

  return (
    <form className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit(submit)}>
      <h2 className="text-lg font-bold text-brand-ink">Thông tin nhà tài trợ</h2>

      {onCoverImageSelected && <CoverImageUpload url={coverImageUrl} onUpload={onCoverImageSelected} />}

      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div>
          {onLogoSelected ? (
            <AvatarUpload url={logoUrl} onUpload={onLogoSelected} alt="Logo" label="Đổi logo" />
          ) : (
            <div className="mx-auto size-32 overflow-hidden rounded-full bg-slate-200 md:mx-0">
              {logoUrl && <img src={logoUrl} alt="Logo" className="size-full object-cover" />}
            </div>
          )}

          <Field label="Giới thiệu về nhà tài trợ" className="mt-6 block" error={errors.description?.message}>
            <Textarea rows={7} placeholder="Giới thiệu về nhà tài trợ…" {...register('description')} />
            <span className="mt-1 block text-right text-xs text-slate-400">{descriptionValue.length}/1500</span>
          </Field>
        </div>

        <div className="space-y-5">
          <p className="text-xs text-red-500">(*) Các thông tin bắt buộc</p>

          <Field label="Tên nhà tài trợ" required error={errors.company_name?.message}>
            <Input placeholder="Tên nhà tài trợ" {...register('company_name')} error={Boolean(errors.company_name)} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lĩnh vực hoạt động" error={errors.industry_sector?.message}>
              <Input placeholder="Ví dụ: Công nghệ thông tin" {...register('industry_sector')} />
            </Field>
            <Field label="Website" error={errors.website_url?.message}>
              <Input placeholder="https://congty.com" {...register('website_url')} error={Boolean(errors.website_url)} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Năm thành lập" error={errors.founding_year?.message}>
              <Input type="number" placeholder="Ví dụ: 2015" {...register('founding_year')} />
            </Field>
            <Field label="Quy mô nhân sự" error={errors.company_size?.message}>
              <Select {...register('company_size')}>
                <option value="">-- Chọn quy mô --</option>
                {COMPANY_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} nhân sự
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tỉnh/Thành phố (trụ sở)" error={errors.province_city?.message}>
              <Select {...register('province_city')}>
                <option value="">-- Chọn tỉnh/thành phố --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Địa chỉ trụ sở chính" error={errors.headquarters_address?.message}>
              <Input placeholder="Số nhà, đường..." {...register('headquarters_address')} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="LinkedIn" error={errors.linkedin_url?.message}>
              <Input placeholder="https://linkedin.com/company/..." {...register('linkedin_url')} error={Boolean(errors.linkedin_url)} />
            </Field>
            <Field label="Facebook" error={errors.facebook_url?.message}>
              <Input placeholder="https://facebook.com/..." {...register('facebook_url')} error={Boolean(errors.facebook_url)} />
            </Field>
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" variant="yellow" loading={isSubmitting} className="w-full md:w-auto">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
