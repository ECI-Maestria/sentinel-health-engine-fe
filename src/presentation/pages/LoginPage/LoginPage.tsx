import { AuthLayout } from '@/presentation/templates/AuthLayout/AuthLayout'
import { LoginForm } from '@/presentation/organisms/LoginForm/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
