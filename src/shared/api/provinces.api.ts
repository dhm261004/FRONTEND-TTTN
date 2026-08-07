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

// Dùng fetch thuần thay vì instance `http` (axios) của app — tránh interceptor gắn kèm Bearer token
// của người dùng vào request sang domain bên thứ ba.
export const provincesApi = {
  listProvinces: (): Promise<Province[]> => fetch(`${BASE_URL}/`).then((r) => r.json()),
  // Lấy phường/xã theo tỉnh qua depth=2 (chỉ ~14KB/tỉnh) thay vì tải toàn bộ /api/v2/w/ cả nước (~360KB)
  // rồi tự lọc theo province_code.
  listWardsByProvince: (provinceCode: number): Promise<Ward[]> =>
    fetch(`${BASE_URL}/p/${provinceCode}?depth=2`)
      .then((r) => r.json())
      .then((p: { wards: Ward[] }) => p.wards),
}
