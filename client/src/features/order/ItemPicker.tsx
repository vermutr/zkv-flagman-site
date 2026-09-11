import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { OrderItem } from '../../content/types'
import { itemKey } from './schema'

type Props = {
  id: string
  items: OrderItem[]
  value: string[]
  onChange: (next: string[]) => void
  invalid?: boolean
  describedBy?: string
}

const GROUPS: { kind: OrderItem['kind']; label: string }[] = [
  { kind: 'package', label: 'Тарифы' },
  { kind: 'service', label: 'Услуги' },
]

/**
 * Выбор нескольких услуг: поле с плашками и раскрывающаяся панель с галочками.
 * Кнопка-поле получает имя от <label htmlFor={id}>, панель закрывается по Esc и клику вне.
 */
export function ItemPicker({ id, items, value, onChange, invalid = false, describedBy }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = `${id}-panel`
  const hintId = useId()
  const selected = items.filter((i) => value.includes(itemKey(i)))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const toggle = (key: string, checked: boolean) => {
    onChange(checked ? [...value, key] : value.filter((k) => k !== key))
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
          buttonRef.current?.focus()
        }
      }}
    >
      <div
        className={`flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border bg-white py-1.5 pl-2 pr-1 transition-[border-color,box-shadow] duration-200 hover:border-stone-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 ${
          invalid ? 'border-red-600 ring-red-100' : 'border-stone-300'
        }`}
      >
        {selected.map((item) => (
          <span
            key={itemKey(item)}
            className="animate-fade-in inline-flex items-center gap-1 rounded-full bg-gold-50 py-1 pl-3 pr-1 text-sm font-medium text-brand-900 ring-1 ring-gold-200"
          >
            {item.name}
            <button
              type="button"
              aria-label={`Убрать: ${item.name}`}
              onClick={() => {
                toggle(itemKey(item), false)
                // плашка исчезает вместе с фокусом — возвращаем его на поле
                buttonRef.current?.focus()
              }}
              className="grid h-6 w-6 place-items-center rounded-full text-stone-500 transition-colors duration-200 hover:bg-gold-200 hover:text-brand-900"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
        <button
          ref={buttonRef}
          type="button"
          id={id}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy ?? hintId}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-9 flex-1 items-center justify-between gap-2 rounded-lg px-2 text-left text-base text-stone-500 outline-none sm:text-sm"
        >
          <span>{selected.length === 0 ? 'Выберите одну или несколько' : selected.length === 1 ? 'Добавить ещё' : `Выбрано: ${selected.length}`}</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-gold-700 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      <p id={hintId} className="sr-only">
        Раскрывает список тарифов и услуг с флажками
      </p>
      {open && (
        <div
          id={panelId}
          className="animate-panel-in absolute left-0 right-0 z-10 mt-2 max-h-72 overflow-y-auto rounded-2xl bg-white p-2 shadow-card-hover ring-1 ring-stone-200"
        >
          {GROUPS.map((group) => {
            const groupItems = items.filter((i) => i.kind === group.kind)
            if (groupItems.length === 0) return null
            return (
              <fieldset key={group.kind} className="p-1">
                <legend className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-gold-700">{group.label}</legend>
                {groupItems.map((item) => {
                  const key = itemKey(item)
                  return (
                    <label
                      key={key}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-base text-stone-800 sm:text-sm transition-colors duration-150 hover:bg-gold-50 has-checked:bg-gold-50 has-checked:text-brand-900"
                    >
                      <input
                        type="checkbox"
                        value={key}
                        checked={value.includes(key)}
                        onChange={(e) => toggle(key, e.target.checked)}
                        className="h-4.5 w-4.5 shrink-0 accent-brand-600"
                      />
                      <span>{item.name}</span>
                    </label>
                  )
                })}
              </fieldset>
            )
          })}
        </div>
      )}
    </div>
  )
}
