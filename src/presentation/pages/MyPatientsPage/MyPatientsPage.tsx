import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { CaretakerLayout } from '@/presentation/templates/CaretakerLayout/CaretakerLayout'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function MyPatientsPage() {
  const { data, isLoading } = useMyPatients()
  const patients = data?.patients ?? []

  return (
    <CaretakerLayout
      title="Mis Pacientes"
      subtitle="Pacientes que tienes a tu cargo"
    >
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      ) : !data?.isLinked || patients.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
            <svg
              className="h-8 w-8 text-violet-400"
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
          </div>
          <div>
            <p className="font-semibold text-gray-700">No tienes pacientes asignados</p>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Un médico debe vincularte como cuidador a sus pacientes para que aparezcan aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          <p className="text-sm text-gray-500">
            Tienes{' '}
            <span className="font-semibold text-violet-700">{patients.length}</span>{' '}
            {patients.length === 1 ? 'paciente asignado' : 'pacientes asignados'}
          </p>

          {patients.map((p) => {
            const initials = p.fullName
              .split(' ')
              .slice(0, 2)
              .map((n) => n.charAt(0))
              .join('')
              .toUpperCase()

            return (
              <div
                key={p.patientId}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-base font-bold text-violet-600">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{p.fullName}</p>
                  <p className="text-sm text-gray-500">{p.email}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Vinculado desde {formatDate(p.linkedAt)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                    Activo
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CaretakerLayout>
  )
}
