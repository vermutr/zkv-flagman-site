import App from './App'
import { OrderModal } from './features/order/OrderModal'
import { useOrder } from './features/order/OrderContext'

export function Root() {
  const { open } = useOrder()
  return (
    <>
      <App onOrderClick={() => open()} />
      <OrderModal />
    </>
  )
}
