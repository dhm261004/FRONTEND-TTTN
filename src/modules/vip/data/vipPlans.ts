import type { VipSubject } from '@/modules/vip/types'

export interface VipPlanRow {
  label: string
  free: string
  vip: string
}

export interface VipPlan {
  subject: VipSubject
  title: string
  subtitle: string
  price: number
  rows: VipPlanRow[]
}

// Nội dung lấy từ "QUYỀN LỢI GÓI VIP SKOLA.docx" — giá do người dùng chốt (mỗi gói 1 năm).
export const VIP_PLANS: Record<VipSubject, VipPlan> = {
  candidate: {
    subject: 'candidate',
    title: 'Sinh viên',
    subtitle: 'Mở khoá toàn bộ tính năng để tối ưu hồ sơ săn học bổng',
    price: 99000,
    rows: [
      { label: 'Chatbot AI', free: 'Tối đa 5 lượt/ngày', vip: 'Không giới hạn' },
      { label: 'Quảng cáo', free: 'Thường gặp và bị chen ngang bởi quảng cáo', vip: 'Không gặp quảng cáo' },
      { label: 'Truy cập học bổng', free: 'Khoá một số học bổng độc quyền, lượt ứng tuyển lớn', vip: 'Không giới hạn truy cập học bổng' },
      { label: 'Gợi ý học bổng', free: 'Gợi ý cơ bản', vip: 'Gợi ý được cá nhân hoá bằng AI' },
      { label: 'Lưu học bổng', free: 'Giới hạn số lượng', vip: 'Không giới hạn' },
      { label: 'Huy hiệu hồ sơ', free: 'Không có', vip: 'Nhận huy hiệu VIP cho hồ sơ' },
    ],
  },
  partner: {
    subject: 'partner',
    title: 'Doanh nghiệp',
    subtitle: 'Tăng độ hiển thị và tiếp cận đúng ứng viên phù hợp',
    price: 499000,
    rows: [
      { label: 'Vị trí hiển thị', free: 'Sắp xếp ngẫu nhiên', vip: 'Ưu tiên hiển thị đầu trang' },
      { label: 'Đề xuất ứng viên', free: 'Sắp xếp ứng viên ngẫu nhiên', vip: 'Ưu tiên đề xuất ứng viên có độ phù hợp cao' },
      { label: 'Phí quảng bá thương hiệu', free: 'Giữ nguyên phí', vip: 'Giảm 30% phí quảng bá thương hiệu' },
      { label: 'Bộ nhớ lưu trữ', free: 'Giới hạn', vip: 'Không giới hạn (ảnh, tệp, sao lưu)' },
    ],
  },
  mentor: {
    subject: 'mentor',
    title: 'Mentor',
    subtitle: 'Nhận nhiều học viên hơn với chi phí nền tảng thấp hơn',
    price: 199000,
    rows: [
      { label: 'Số ứng viên mỗi tháng', free: 'Giới hạn 2 ứng viên', vip: 'Không giới hạn số lượng ứng viên' },
      { label: 'Vị trí hiển thị', free: 'Sắp xếp ngẫu nhiên', vip: 'Được đề xuất lên đầu danh sách' },
      { label: 'Phí nền tảng', free: 'Giữ nguyên phí', vip: 'Giảm 20% phí nền tảng' },
    ],
  },
}

export const VIP_SUBJECT_ORDER: VipSubject[] = ['candidate', 'partner', 'mentor']

export const VIP_PROFILE_PATH: Record<VipSubject, string> = {
  candidate: '/tai-khoan/ho-so',
  partner: '/doi-tac/ho-so',
  mentor: '/co-van/ho-so',
}
