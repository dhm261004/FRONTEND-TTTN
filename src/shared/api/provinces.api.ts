const BASE_URL = 'https://provinces.open-api.vn/api/v2'

export interface Province {
  code: number
  name: string
}

export interface Ward {
  code: number
  name: string
  province_code: number
}

// API nguồn trả tỉnh/xã theo thứ tự mã hành chính, không phải a-z — sắp lại theo bảng chữ cái tiếng
// Việt (Intl.Collator, có xử lý dấu đúng chuẩn, khác localeCompare mặc định của JS dựa trên code point
// sẽ xếp sai thứ tự các chữ có dấu) trước khi trả về, để mọi dropdown dùng chung provincesApi hiển thị
// a-z mà không cần tự sắp lại ở từng nơi gọi.
const viCollator = new Intl.Collator('vi', { sensitivity: 'base' })
const sortByName = <T extends { name: string }>(items: T[]): T[] => [...items].sort((a, b) => viCollator.compare(a.name, b.name))

// Dùng fetch thuần thay vì instance `http` (axios) của app — tránh interceptor gắn kèm Bearer token
// của người dùng vào request sang domain bên thứ ba.
export const provincesApi = {
  listProvinces: (): Promise<Province[]> =>
    fetch(`${BASE_URL}/`)
      .then((r) => r.json())
      .then(sortByName),
  // Lấy phường/xã theo tỉnh qua depth=2 (chỉ ~14KB/tỉnh) thay vì tải toàn bộ /api/v2/w/ cả nước (~360KB)
  // rồi tự lọc theo province_code.
  listWardsByProvince: (provinceCode: number): Promise<Ward[]> =>
    fetch(`${BASE_URL}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((p: { wards: Ward[] }) => p.wards)
      .then(sortByName),
}
