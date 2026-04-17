import { useState, useRef, useEffect } from 'react'
import { UserMinus, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { usePatientCaretakers } from '@/application/caretaker/usePatientCaretakers'
import { useLinkCaretaker } from '@/application/caretaker/useLinkCaretaker'
import { useUnlinkCaretaker } from '@/application/caretaker/useUnlinkCaretaker'
import { PatientLayout } from '@/presentation/templates/PatientLayout/PatientLayout'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { cn } from '@/lib/cn'
import type { CaretakerRelationship } from '@/core/domain/caretaker/Caretaker'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function extractErrorMessage(error: unknown): string {
  if (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return 'Ha ocurrido un error. Intenta de nuevo.'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CaretakerCard({
  caretaker,
  patientId,
}: {
  caretaker: CaretakerRelationship
  patientId: string
}) {
  const [confirmUnlink, setConfirmUnlink] = useState(false)
  const { mutate: unlink, isPending } = useUnlinkCaretaker(patientId)

  const initials = caretaker.fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()

  function handleUnlink() {
    unlink(
      { patientId, caretakerId: caretaker.caretakerId },
      { onSuccess: () => setConfirmUnlink(false) },
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{caretaker.fullName}</p>
        <p className="text-sm text-gray-500">{caretaker.email}</p>
        <p className="mt-0.5 text-xs text-gray-400">Vinculado el {formatDate(caretaker.linkedAt)}</p>
      </div>
      <div className="flex-shrink-0">
        {confirmUnlink ? (
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-xs font-medium text-red-600">¿Confirmar desvinculación?</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnlink(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleUnlink}
                isLoading={isPending}
              >
                Desvincular
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setConfirmUnlink(true)}
          >
            <UserMinus className="h-4 w-4" aria-hidden="true" />
            Desvincular
          </Button>
        )}
      </div>
    </div>
  )
}

function LinkCaretakerForm({ patientId }: { patientId: string }) {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const { mutate: link, isPending, error, reset } = useLinkCaretaker(patientId)
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidEmail = EMAIL_RE.test(email)

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(t)
    }
  }, [success])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail) return
    reset()
    link(
      { patientId, caretakerEmail: email },
      {
        onSuccess: () => {
          setEmail('')
          setSuccess(true)
          inputRef.current?.focus()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 font-semibold text-gray-900">Vincular nuevo cuidador</h3>
      <p className="mb-4 text-sm text-gray-500">
        Ingresa el correo electrónico del cuidador que deseas vincular.
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); reset() }}
            placeholder="correo@ejemplo.com"
            className={cn(
              'w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-400 focus:ring-blue-100',
            )}
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={!isValidEmail}
          isLoading={isPending}
        >
          Vincular
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{extractErrorMessage(error)}</p>
      )}
      {success && (
        <p className="mt-2 text-xs font-medium text-green-600">
          Cuidador vinculado correctamente.
        </p>
      )}
    </form>
  )
}

export function MyCaretakersPage() {
  const { user } = useAuthStore()
  const patientId = user?.id ?? null
  const { data: caretakers, isLoading } = usePatientCaretakers(patientId)

  return (
    <PatientLayout
      title="Mis Cuidadores"
      subtitle="Gestiona quién puede monitorear tu salud"
    >
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" className="text-blue-500" />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Info banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800 mb-1">¿Para qué sirven los cuidadores?</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Pueden ver tus signos vitales y recibir alertas</li>
              <li>• Te ayudan a gestionar tu medicación diaria</li>
              <li>• Reciben notificaciones de tus citas médicas</li>
              <li>• Pueden coordinar con tu médico en caso de emergencia</li>
            </ul>
          </div>

          {/* Link form */}
          {patientId && <LinkCaretakerForm patientId={patientId} />}

          {/* Caretaker list */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Cuidadores vinculados
              {caretakers && caretakers.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {caretakers.length}
                </span>
              )}
            </h3>

            {!caretakers || caretakers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                <svg
                  className="h-10 w-10 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-sm text-gray-500">No tienes cuidadores vinculados aún</p>
                <p className="text-xs text-gray-400">
                  Usa el formulario de arriba para vincular tu primer cuidador
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientId &&
                  caretakers.map((c) => (
                    <CaretakerCard key={c.caretakerId} caretaker={c} patientId={patientId} />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PatientLayout>
  )
}
