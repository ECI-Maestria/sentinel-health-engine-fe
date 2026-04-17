import { AuthLayout } from '@/presentation/templates/AuthLayout/AuthLayout'
import { RegisterCaretakerForm } from '@/presentation/organisms/RegisterCaretakerForm/RegisterCaretakerForm'

export function RegisterCaretakerPage() {
  return (
    <AuthLayout>
      <RegisterCaretakerForm />
    </AuthLayout>
  )
}
