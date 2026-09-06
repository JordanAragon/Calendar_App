import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  const base = 'px-3 py-1.5 text-sm rounded-md transition-colors font-medium'
  const variants = {
    primary: 'bg-ink text-white hover:bg-black',
    secondary: 'bg-surface text-ink hover:bg-hover border border-border',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
