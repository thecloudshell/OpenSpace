'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, ms?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', ms = 3000) => {
    const id = nextId++
    setToasts((current) => [...current.slice(-4), { id, message, type }])
    window.setTimeout(() => dismiss(id), ms)
  }, [dismiss])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className='fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 items-end' aria-live='polite'>
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast-item flex items-stretch gap-3 bg-forest text-white text-[13px] font-medium pl-0 pr-5 py-3 rounded-xl shadow-lg max-w-sm`}>
            <span
              className={`w-1 self-stretch rounded-full shrink-0 ${
                item.type === 'error'
                  ? 'bg-signal'
                  : item.type === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-stone-400'
              }`}
            />
            <span className='self-center'>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
