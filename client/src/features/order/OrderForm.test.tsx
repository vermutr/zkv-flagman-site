import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OrderForm } from './OrderForm'

const items = [
  { kind: 'package' as const, slug: 'small', name: 'Малый бизнес' },
  { kind: 'service' as const, slug: 'payroll', name: 'Расчёт заработной платы' },
]

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

async function fillRequired() {
  await userEvent.type(screen.getByLabelText('Имя'), 'Иван')
  await userEvent.type(screen.getByLabelText('Телефон'), '+375 29 123-45-67')
  await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.com')
}

describe('OrderForm', () => {
  it('shows validation errors and does not submit', async () => {
    render(<OrderForm items={items} showItemSelect />)
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
    expect(screen.getByText('Введите корректный телефон')).toBeInTheDocument()
    expect(screen.getByText('Введите корректный email')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits the selected item and shows success', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    const onSuccess = vi.fn()
    render(<OrderForm items={items} initialItem={items[1]} showItemSelect onSuccess={onSuccess} />)
    expect(screen.getByLabelText('Услуга')).toHaveValue('service:payroll')
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Заявка отправлена')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/order')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ name: 'Иван', email: 'ivan@example.com', item: items[1] })
    expect(body).not.toHaveProperty('itemKey')
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('shows the server error message on failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, error: 'Не удалось отправить письмо' }),
    })
    render(<OrderForm items={items} />)
    expect(screen.queryByLabelText('Услуга')).not.toBeInTheDocument()
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отправить письмо')
  })
})
