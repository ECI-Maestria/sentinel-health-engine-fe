import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'
import { Input } from '@/presentation/atoms/Input/Input'

describe('FormField', () => {
  it('renders the label text', () => {
    render(
      <FormField label="Correo electrónico">
        <Input />
      </FormField>,
    )
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <FormField label="Campo">
        <Input data-testid="input-child" />
      </FormField>,
    )
    expect(screen.getByTestId('input-child')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(
      <FormField label="Email" error="Correo inválido">
        <Input />
      </FormField>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido')
  })

  it('does not show error element when no error', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows required asterisk when required is true', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show asterisk when required is false', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })
})
