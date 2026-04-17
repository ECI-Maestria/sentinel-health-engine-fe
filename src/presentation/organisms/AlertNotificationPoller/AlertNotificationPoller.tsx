/**
 * AlertNotificationPoller
 *
 * Polls the alerts API every 30 s and fires browser Notification API
 * events whenever new alerts appear — regardless of which page is visible.
 *
 * Mount this component once at the app root (above the router).
 */
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { alertsRepository } from '@/infrastructure/http/AlertsApiRepository'
import { useMyPatients } from '@/application/caretaker/useMyPatients'
import { usePatients } from '@/application/patient/usePatients'
import { Role } from '@/core/domain/auth/User'
import type { AlertRecord } from '@/core/domain/alert/Alert'

const POLL_MS = 30_000

// ── In-app toast ──────────────────────────────────────────────────────────────

interface Toast {
  id: string
  message: string
  severity: string
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl p-4 shadow-lg max-w-sm ${
            t.severity === 'CRITICAL'
              ? 'border border-red-200 bg-red-50'
              : 'border border-amber-200 bg-amber-50'
          }`}
        >
          <span
            className={`mt-0.5 flex h-2 w-2 flex-shrink-0 rounded-full ${
              t.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-700">
              {t.severity === 'CRITICAL' ? 'Alerta crítica' : 'Advertencia'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{t.message}</p>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Per-patient poller ────────────────────────────────────────────────────────

function usePatientAlertPoller(
  patientId: string | null,
  onNewAlerts: (alerts: AlertRecord[]) => void,
) {
  const seenRef = useRef<Set<string>>(new Set())
  const initialized = useRef(false)

  const { data: alerts } = useQuery({
    queryKey: ['alerts-poll', patientId],
    queryFn: () => alertsRepository.getHistory(patientId!, undefined),
    enabled: patientId !== null,
    refetchInterval: POLL_MS,
    select: (data) => data.alerts,
  })

  useEffect(() => {
    if (!alerts) return

    if (!initialized.current) {
      // First load: mark all existing alerts as seen (don't fire notifications)
      alerts.forEach((a) => seenRef.current.add(a.id))
      initialized.current = true
      return
    }

    const newAlerts = alerts.filter((a) => !seenRef.current.has(a.id))
    if (newAlerts.length > 0) {
      newAlerts.forEach((a) => seenRef.current.add(a.id))
      onNewAlerts(newAlerts)
    }
  }, [alerts, onNewAlerts])
}

// ── Role-specific pollers ─────────────────────────────────────────────────────

function PatientPoller({ onNew }: { onNew: (alerts: AlertRecord[]) => void }) {
  const { user } = useAuthStore()
  usePatientAlertPoller(user?.id ?? null, onNew)
  return null
}

function CaretakerPoller({ onNew }: { onNew: (alerts: AlertRecord[]) => void }) {
  const { data } = useMyPatients()
  const patients = data?.patients ?? []
  // Poll for up to 3 patients to avoid request flood
  const ids = patients.slice(0, 3).map((p) => p.patientId)

  function useOnePoller(id: string | null) {
    usePatientAlertPoller(id, onNew)
  }
  useOnePoller(ids[0] ?? null)
  useOnePoller(ids[1] ?? null)
  useOnePoller(ids[2] ?? null)
  return null
}

function DoctorPoller({ onNew }: { onNew: (alerts: AlertRecord[]) => void }) {
  const { data: patients } = usePatients()
  const ids = (patients ?? []).slice(0, 3).map((p) => p.id)

  function useOnePoller(id: string | null) {
    usePatientAlertPoller(id, onNew)
  }
  useOnePoller(ids[0] ?? null)
  useOnePoller(ids[1] ?? null)
  useOnePoller(ids[2] ?? null)
  return null
}

// ── Root poller component ─────────────────────────────────────────────────────

export function AlertNotificationPoller() {
  const { user } = useAuthStore()
  const [toasts, setToasts] = useState<Toast[]>([])
  const permRef = useRef<NotificationPermission>('default')

  // Request browser notification permission once
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      permRef.current = 'granted'
    } else if (Notification.permission !== 'denied') {
      void Notification.requestPermission().then((p) => {
        permRef.current = p
      })
    } else {
      permRef.current = Notification.permission
    }
  }, [])

  function handleNewAlerts(alerts: AlertRecord[]) {
    // Browser notifications
    if (permRef.current === 'granted') {
      alerts.slice(0, 3).forEach((a) => {
        new Notification(
          a.severity === 'CRITICAL' ? '🔴 Alerta crítica — Sentinel Health' : '🟡 Advertencia — Sentinel Health',
          { body: a.message, icon: '/favicon.ico' },
        )
      })
    }

    // In-app toasts (auto-dismiss after 6 s)
    const newToasts: Toast[] = alerts.slice(0, 3).map((a) => ({
      id: a.id,
      message: a.message,
      severity: a.severity,
    }))
    setToasts((prev) => [...newToasts, ...prev].slice(0, 5))
    newToasts.forEach((t) => {
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 6000)
    })
  }

  if (!user) return <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

  return (
    <>
      {user.role === Role.PATIENT && <PatientPoller onNew={handleNewAlerts} />}
      {user.role === Role.CARETAKER && <CaretakerPoller onNew={handleNewAlerts} />}
      {user.role === Role.DOCTOR && <DoctorPoller onNew={handleNewAlerts} />}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </>
  )
}
