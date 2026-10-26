import type { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Текст перед полем, например «+7» */
  prefix?: ReactNode;
  /** Иконка перед полем */
  icon?: ReactNode;
}

/** Поле формы с подписью, подсказкой и ошибкой. Стили — base.scss (.field). */
export function Field({ label, hint, error, prefix, icon, className, ...input }: FieldProps) {
  return (
    <label className={['field', error && 'field--error', className].filter(Boolean).join(' ')}>
      <span className="field__label">{label}</span>
      <span className="field__box">
        {icon}
        {prefix !== undefined && <span className="field__prefix">{prefix}</span>}
        <input {...input} aria-invalid={error ? true : undefined} />
      </span>
      {hint && <span className="field__hint">{hint}</span>}
      <span className="field__error" aria-live="polite">{error}</span>
    </label>
  );
}

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
  children: ReactNode;
}

/** Чекбокс с текстом (согласия). */
export function Check({ error, children, className, ...input }: CheckProps) {
  return (
    <label className={['check', error && 'check--error', className].filter(Boolean).join(' ')}>
      <input type="checkbox" {...input} aria-invalid={error || undefined} />
      <span className="check__box" />
      <span>{children}</span>
    </label>
  );
}
