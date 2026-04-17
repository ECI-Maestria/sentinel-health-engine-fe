import { describe, it, expect } from 'vitest'
import { Role, RoleLabels } from './User'

describe('Role', () => {
  it('has the expected values', () => {
    expect(Role.DOCTOR).toBe('DOCTOR')
    expect(Role.PATIENT).toBe('PATIENT')
    expect(Role.CARETAKER).toBe('CARETAKER')
  })
})

describe('RoleLabels', () => {
  it('returns Spanish label for DOCTOR', () => {
    expect(RoleLabels[Role.DOCTOR]).toBe('Médico')
  })

  it('returns Spanish label for PATIENT', () => {
    expect(RoleLabels[Role.PATIENT]).toBe('Paciente')
  })

  it('returns Spanish label for CARETAKER', () => {
    expect(RoleLabels[Role.CARETAKER]).toBe('Cuidador')
  })

  it('has a label for every role', () => {
    const roles = Object.values(Role)
    roles.forEach((role) => {
      expect(RoleLabels[role]).toBeDefined()
      expect(typeof RoleLabels[role]).toBe('string')
    })
  })
})
