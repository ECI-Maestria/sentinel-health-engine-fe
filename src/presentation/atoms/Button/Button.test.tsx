import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Iniciar sesión</Button>)
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('shows spinner when isLoading is true', () => {
    render(<Button isLoading>Guardar</Button>)
    const svg = document.querySelector('svg[role="status"]')
    expect(svg).toBeInTheDocument()
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Guardar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Guardar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies default variant classes', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-primary-500')
  })

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Eliminar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-red-600')
  })

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border-primary-500')
  })

  it('calls onClick when clicked and not loading', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
