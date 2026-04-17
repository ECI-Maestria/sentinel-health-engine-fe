import { useState, useEffect, useRef } from 'react'
import { X, UserPlus, UserMinus, Users, Mail, LinkIcon, Loader2 } from 'lucide-react'
import { usePatientCaretakers } from '@/application/caretaker/usePatientCaretakers'
import { useLinkCaretaker } from '@/application/caretaker/useLinkCaretaker'
import { useUnlinkCaretaker } from '@/application/caretaker/useUnlinkCaretaker'
import { Button } from '@/presentation/atoms/Button/Button'
import { Spinner } from '@/presentation/atoms/Spinner/Spinner'
import { cn } from '@/lib/cn'
import type { Patient } from '@/core/domain/patient/Patient'
import type { CaretakerRelationship } from '@/core/domain/caretaker/Caretaker'

// ── helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function initials(fullName: string) {
  const parts = fullName.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : fullName.slice(0, 2).toUpperCase()
}

// ── Caretaker card ────────────────────────────────────────────────────────────

interface CaretakerCardProps {
  caretaker: CaretakerRelationship
  patientId: string
}

function CaretakerCard({ caretaker, patientId }: CaretakerCardProps) {
  const [confirming, setConfirming] = useState(false)
  const { mutate: unlink, isPending } = useUnlinkCaretaker(patientId)

  function handleUnlink() {
    unlink(
      { patientId, caretakerId: caretaker.caretakerId },
      { onSuccess: () => setConfirming(false) },
    )
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-sm">
      {/* Avatar */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary-500 text-base font-bold text-white">
        {initials(caretaker.fullName)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-gray-900">{caretaker.fullName}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700">
            <LinkIcon className="h-2.5 w-2.5" />
            Vinculado
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span>{caretaker.email}</span>
        </div>

        <p className="mt-1 text-[11px] text-gray-400">
          Vinculado desde el {formatDate(caretaker.linkedAt)}
        </p>

        {/* Unlink section */}
        <div className="mt-3">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50 p-2.5">
              <p className="flex-1 text-xs text-red-700">
                ¿Desvincular a {caretaker.fullName}? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  disabled={isPending}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnlink}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Confirmar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <UserMinus className="h-3.5 w-3.5" />
              Desvincular
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Link caretaker form ───────────────────────────────────────────────────────

interface LinkCaretakerFormProps {
  patientId: string
}

function LinkCaretakerForm({ patientId }: LinkCaretakerFormProps) {
  const [email, setEmail] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutate, isPending, error, reset, isSuccess } = useLinkCaretaker(patientId)

  // Reset after success
  useEffect(() => {
    if (isSuccess) {
      setEmail('')
      reset()
      inputRef.current?.focus()
    }
  }, [isSuccess, reset])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    mutate({ patientId, caretakerEmail: trimmed })
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary-500" />
        <h3 className="text-sm font-bold text-gray-900">Vincular cuidador</h3>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        El cuidador debe tener una cuenta registrada en Sentinel Health Engine.
        Ingresa su correo para vincularlo a este paciente.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) reset()
              }}
              placeholder="correo@ejemplo.com"
              disabled={isPending}
              className={cn(
                'w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error ? 'border-red-400' : 'border-gray-200',
              )}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            isLoading={isPending}
            disabled={!isValidEmail}
            className="flex-shrink-0"
          >
            Vincular
          </Button>
        </div>

        {error && (
          <p className="text-xs text-red-600">{extractErrorMessage(error)}</p>
        )}

        {isSuccess && (
          <p className="text-xs font-medium text-primary-600">
            ✓ Cuidador vinculado exitosamente.
          </p>
        )}
      </form>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export interface PatientDetailModalProps {
  patient: Patient | null
  onClose: () => void
}

export function PatientDetailModal({ patient, onClose }: PatientDetailModalProps) {
  const open = patient !== null
  const { data: caretakers = [], isLoading } = usePatientCaretakers(
    patient?.id ?? null,
  )

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !patient) return null

  const patientInitials =
    `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase()

  const registeredAt = new Date(patient.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-detail-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary-100 text-lg font-bold text-primary-700">
              {patientInitials}
            </div>
            <div>
              <h2
                id="patient-detail-title"
                className="text-base font-bold text-gray-900"
              >
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-xs text-gray-500">{patient.email}</p>
              <p className="text-[11px] text-gray-400">
                Registrado el {registeredAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body (scrollable) ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                ¿Por qué vincular un cuidador?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-700">
                Al vincular un familiar o profesional como cuidador, podrán
                monitorear la salud del paciente y recibir alertas en tiempo
                real. El paciente puede revocar el acceso en cualquier momento.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  '✓ Monitoreo compartido de vitales',
                  '✓ Alertas enviadas al cuidador',
                  '✓ Seguimiento de medicamentos',
                  '✓ Control total de permisos',
                ].map((b) => (
                  <p key={b} className="text-[11px] text-blue-700">{b}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Caretaker list */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Cuidadores vinculados
              </h3>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
                {caretakers.length}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner size="lg" className="text-primary-500" />
              </div>
            ) : caretakers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                <Users className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">
                  Este paciente no tiene cuidadores vinculados
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {caretakers.map((c) => (
                  <CaretakerCard
                    key={c.caretakerId}
                    caretaker={c}
                    patientId={patient.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Link form */}
          <LinkCaretakerForm patientId={patient.id} />
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 px-6 py-4">
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
