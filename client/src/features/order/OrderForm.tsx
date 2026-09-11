import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import type { OrderItem } from '../../content/types'
import { Button } from '../../components/Button'
import { itemKey, orderFormSchema, toPayload, type OrderFormValues } from './schema'
import { OrderError, submitOrder } from './api'
import { ItemPicker } from './ItemPicker'

type Props = {
  items: OrderItem[]
  initialItem?: OrderItem
  showItemSelect?: boolean
  onSuccess?: () => void
  /** Кнопка «Закрыть» на экране успеха (в модальном окне). */
  onDone?: () => void
}

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 placeholder:text-stone-500 transition-[border-color,box-shadow] duration-200 hover:border-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 aria-invalid:border-red-600 aria-invalid:ring-red-100'

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

/** aria-атрибуты, связывающие поле с текстом ошибки, который печатает Field. */
function errorProps(id: string, error?: string) {
  return { 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined }
}

export function OrderForm({ items, initialItem, showItemSelect = false, onSuccess, onDone }: Props) {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { itemKeys: initialItem ? [itemKey(initialItem)] : [], website: '' },
  })

  const onSubmit = async (values: OrderFormValues) => {
    setServerError(null)
    try {
      await submitOrder(toPayload(values, items))
      setSent(true)
      onSuccess?.()
    } catch (err) {
      if (err instanceof OrderError) {
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (field in values) setError(field as keyof OrderFormValues, { message })
        }
        setServerError(err.message)
      } else {
        setServerError('Нет соединения с сервером. Проверьте интернет и попробуйте снова.')
      }
    }
  }

  if (sent) {
    return (
      <div className="animate-panel-in rounded-2xl bg-gold-50 p-6 text-center ring-1 ring-gold-200">
        <CheckCircle2 className="mx-auto text-gold-700" size={40} aria-hidden="true" />
        <h3 className="mt-3 text-xl font-bold text-brand-900">Заявка отправлена</h3>
        <p className="mt-2 text-sm text-stone-700">
          Мы получили ваши данные и свяжемся с вами в рабочее время. Копия заявки ушла на вашу почту.
        </p>
        {onDone && (
          <Button type="button" className="mt-6 w-full sm:w-auto" onClick={onDone} autoFocus>
            Готово
          </Button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {showItemSelect && (
        <Field id="order-items" label="Услуги" error={errors.itemKeys?.message}>
          <Controller
            name="itemKeys"
            control={control}
            render={({ field }) => (
              <ItemPicker
                id="order-items"
                items={items}
                value={field.value ?? []}
                onChange={field.onChange}
                invalid={Boolean(errors.itemKeys)}
                describedBy={errors.itemKeys ? 'order-items-error' : undefined}
              />
            )}
          />
        </Field>
      )}
      <Field id="order-name" label="Имя" error={errors.name?.message}>
        <input id="order-name" className={inputClass} placeholder="Как к вам обращаться" autoComplete="name" {...errorProps('order-name', errors.name?.message)} {...register('name')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="order-phone" label="Телефон" error={errors.phone?.message}>
          <input id="order-phone" className={inputClass} placeholder="+375 29 000-00-00" autoComplete="tel" inputMode="tel" {...errorProps('order-phone', errors.phone?.message)} {...register('phone')} />
        </Field>
        <Field id="order-email" label="Email" error={errors.email?.message}>
          <input id="order-email" className={inputClass} placeholder="you@company.by" autoComplete="email" inputMode="email" {...errorProps('order-email', errors.email?.message)} {...register('email')} />
        </Field>
      </div>
      <Field id="order-company" label="Компания или ИП" error={errors.company?.message}>
        <input id="order-company" className={inputClass} placeholder="Необязательно" autoComplete="organization" {...errorProps('order-company', errors.company?.message)} {...register('company')} />
      </Field>
      <Field id="order-message" label="Комментарий" error={errors.message?.message}>
        <textarea id="order-message" rows={3} className={inputClass} placeholder="Расскажите о задаче: вид деятельности, количество сотрудников, система налогообложения" {...errorProps('order-message', errors.message?.message)} {...register('message')} />
      </Field>
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="order-website">Website</label>
        <input id="order-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
      <p className="text-center text-xs text-stone-500">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
    </form>
  )
}
