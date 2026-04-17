export interface CaretakerRelationship {
  patientId: string
  caretakerId: string
  fullName: string
  email: string
  linkedAt: string
}

export interface LinkCaretakerPayload {
  patientId: string
  caretakerEmail: string
}

export interface UnlinkCaretakerPayload {
  patientId: string
  caretakerId: string
}

export interface CaretakerListResponse {
  caretakers: CaretakerRelationship[]
}

export interface MyPatientResponse {
  patientId: string
  fullName: string
  email: string
  linkedAt: string
}

export interface MyPatientsResponse {
  patients: MyPatientResponse[]
  isLinked: boolean
}
