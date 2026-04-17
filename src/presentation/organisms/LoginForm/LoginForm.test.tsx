import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginForm } from './LoginForm'

// Mock the useLogin hook
const mockMutate = vi.fn()
vi.mock('@/application/auth/useLogin', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  }),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockClear()
    mockNavigate.mockClear()
  })

  it('renders the form with email and password fields', () => {
    renderLoginForm()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some((a) => a.textContent === 'Correo inválido')).toBe(true)
    })
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('La contraseña es requerida')
    })
  })

  it('calls mutate with correct credentials on valid submit', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.type(screen.getByLabelText(/correo electrónico/i), 'doctor@test.com')
    await user.type(screen.getByLabelText(/contraseña/i, { selector: 'input' }), 'mypassword')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { email: 'doctor@test.com', password: 'mypassword' },
        expect.any(Object),
      )
    })
  })

  it('renders forgot password link', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toBeInTheDocument()
  })

  it('renders register link for caretakers', () => {
    renderLoginForm()
    expect(screen.getByRole('link', { name: /regístrate aquí/i })).toBeInTheDocument()
  })
})
