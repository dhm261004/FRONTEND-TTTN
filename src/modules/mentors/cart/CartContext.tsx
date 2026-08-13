import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/modules/auth/AuthContext'

export interface CartItem {
  service_id: string
  mentor_id: string
  mentor_name: string
  mentor_avatar_url: string | null
  service_name: string
  price: number
  duration_minutes: number
  total_sessions: number
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  totalCount: number
  totalPrice: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (serviceId: string) => void
  setQuantity: (serviceId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// Không có giỏ hàng thương mại thật đứng sau (mua = ghi nhận paid ngay lập tức, không cổng thanh toán) —
// đây chỉ là nơi gom nhiều gói trước khi xác nhận mua hàng loạt, nên lưu ở localStorage là đủ, không cần
// model backend riêng. Namespace theo user id để đổi tài khoản trên cùng trình duyệt không lẫn giỏ hàng.
const STORAGE_PREFIX = 'skola:cart:'

function storageKey(userId: string | undefined) {
  return `${STORAGE_PREFIX}${userId ?? 'guest'}`
}

function loadCart(userId: string | undefined): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>(() => loadCart(user?.id))

  useEffect(() => {
    setItems(loadCart(user?.id))
  }, [user?.id])

  useEffect(() => {
    localStorage.setItem(storageKey(user?.id), JSON.stringify(items))
  }, [items, user?.id])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.service_id === item.service_id)
      if (existing) {
        return prev.map((i) => (i.service_id === item.service_id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (serviceId: string) => setItems((prev) => prev.filter((i) => i.service_id !== serviceId))

  const setQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(serviceId)
      return
    }
    setItems((prev) => prev.map((i) => (i.service_id === serviceId ? { ...i, quantity } : i)))
  }

  const clear = () => setItems([])

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, totalCount, totalPrice, addItem, removeItem, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải được dùng bên trong CartProvider')
  return ctx
}
