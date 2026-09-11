import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }

export function Modal({ open, onClose, title, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    // Модалка рендерится порталом в body, поэтому остальную страницу (#root) делаем inert.
    const appRoot = document.getElementById('root')
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    appRoot?.setAttribute('inert', '')
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      appRoot?.removeAttribute('inert')
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-brand-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-0 sm:p-8 sm:pb-0">
          <h2 id="modal-title" className="text-2xl font-bold text-brand-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-stone-600 hover:bg-stone-100 active:bg-stone-200"
          >
            <X size={22} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 sm:px-8 sm:pb-8">{children}</div>
        {footer && <div className="border-t border-stone-200 px-6 py-4 sm:px-8">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
