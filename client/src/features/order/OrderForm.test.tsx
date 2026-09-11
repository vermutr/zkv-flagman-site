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
    const name = screen.getByLabelText('Имя')
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Введите имя')
    expect(document.getElementById(name.getAttribute('aria-describedby')!)).toHaveTextContent('Введите имя')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits every selected item and shows success', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    const onSuccess = vi.fn()
    render(<OrderForm items={items} initialItem={items[1]} showItemSelect onSuccess={onSuccess} />)
    expect(screen.getByRole('button', { name: `Убрать: ${items[1].name}` })).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Услуги'))
    await userEvent.click(screen.getByRole('checkbox', { name: items[0].name }))
    expect(screen.getByRole('checkbox', { name: items[1].name })).toBeChecked()
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Заявка отправлена')).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/order')
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({ name: 'Иван', email: 'ivan@example.com', items: [items[0], items[1]] })
    expect(body).not.toHaveProperty('itemKeys')
    expect(body).not.toHaveProperty('item')
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('offers a close button after success only when onDone is given', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
    const onDone = vi.fn()
    const { unmount } = render(<OrderForm items={items} onDone={onDone} />)
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Готово' }))
    expect(onDone).toHaveBeenCalledTimes(1)
    unmount()

    render(<OrderForm items={items} />)
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByText('Заявка отправлена')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Готово' })).not.toBeInTheDocument()
  })

  it('removes an item with its chip and closes the panel with Escape', async () => {
    render(<OrderForm items={items} initialItem={items[1]} showItemSelect />)
    const field = screen.getByLabelText('Услуги')
    await userEvent.click(field)
    expect(field).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('checkbox', { name: items[1].name })).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: `Убрать: ${items[1].name}` }))
    expect(screen.getByRole('checkbox', { name: items[1].name })).not.toBeChecked()
    expect(screen.queryByRole('button', { name: `Убрать: ${items[1].name}` })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(field).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('checkbox', { name: items[1].name })).not.toBeInTheDocument()
    expect(screen.getByText('Выберите одну или несколько')).toBeInTheDocument()
  })

  it('shows the server error message on failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ ok: false, error: 'Не удалось отправить письмо' }),
    })
    render(<OrderForm items={items} />)
    expect(screen.queryByLabelText('Услуги')).not.toBeInTheDocument()
    await fillRequired()
    await userEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отправить письмо')
  })
})
