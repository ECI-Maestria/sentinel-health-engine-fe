export enum Role {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  CARETAKER = 'CARETAKER',
}

export const RoleLabels: Record<Role, string> = {
  [Role.DOCTOR]: 'Médico',
  [Role.PATIENT]: 'Paciente',
  [Role.CARETAKER]: 'Cuidador',
}

export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}
