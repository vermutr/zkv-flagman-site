import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { OrderProvider } from './features/order/OrderContext'
import { Root } from './Root'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <OrderProvider>
        <Root />
      </OrderProvider>
    </BrowserRouter>
  </StrictMode>,
)
