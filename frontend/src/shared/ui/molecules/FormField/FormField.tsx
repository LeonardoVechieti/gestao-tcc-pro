import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  counter?: { current: number; max: number }
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, counter, children }: FormFieldProps) {
  return (
    <div className="field-group">
      <label htmlFor={htmlFor}>{label}</label>
      {hint && <span className="muted-text">{hint}</span>}
      {children}
      {counter ? (
        <div className="field-footer">
          <small>{error}</small>
          <span className="muted-text">
            {counter.current}/{counter.max}
          </span>
        </div>
      ) : (
        error && <small>{error}</small>
      )}
    </div>
  )
}
