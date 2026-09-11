import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { OrderProvider } from '../features/order/OrderContext'
import { Root } from '../Root'

export function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OrderProvider>
        <Root />
      </OrderProvider>
    </MemoryRouter>,
  )
}
