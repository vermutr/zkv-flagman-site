import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { OrderItem } from '../../content/types'

type OrderContextValue = {
  isOpen: boolean
  item?: OrderItem
  open: (item?: OrderItem) => void
  close: () => void
}

const OrderContext = createContext<OrderContextValue | null>(null)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [item, setItem] = useState<OrderItem | undefined>(undefined)

  const open = useCallback((next?: OrderItem) => {
    setItem(next)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(() => ({ isOpen, item, open, close }), [isOpen, item, open, close])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used within OrderProvider')
  return ctx
}
