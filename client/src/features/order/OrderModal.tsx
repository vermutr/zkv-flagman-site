import { useEffect, useState } from 'react'
import { Modal } from '../../components/Modal'
import { allOrderItems } from '../../content/orderItems'
import { useOrder } from './OrderContext'
import { OrderForm } from './OrderForm'

export function OrderModal() {
  const { isOpen, item, close } = useOrder()
  const [sent, setSent] = useState(false)
  // При каждом открытии окно начинается с чистой формы.
  useEffect(() => {
    if (isOpen) setSent(false)
  }, [isOpen])
  const title = sent ? 'Заявка принята' : item ? `Заказать: ${item.name}` : 'Заказать услугу'
  return (
    <Modal open={isOpen} onClose={close} title={title}>
      <OrderForm items={allOrderItems()} initialItem={item} showItemSelect onSuccess={() => setSent(true)} onDone={close} />
    </Modal>
  )
}
