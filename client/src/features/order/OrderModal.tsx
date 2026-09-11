import { Modal } from '../../components/Modal'
import { allOrderItems } from '../../content/orderItems'
import { useOrder } from './OrderContext'
import { OrderForm } from './OrderForm'

export function OrderModal() {
  const { isOpen, item, close } = useOrder()
  return (
    <Modal open={isOpen} onClose={close} title={item ? `Заказать: ${item.name}` : 'Заказать услугу'}>
      <OrderForm items={allOrderItems()} initialItem={item} showItemSelect />
    </Modal>
  )
}
