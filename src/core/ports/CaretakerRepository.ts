import type {
  CaretakerListResponse,
  LinkCaretakerPayload,
  UnlinkCaretakerPayload,
  MyPatientsResponse,
} from '@/core/domain/caretaker/Caretaker'

export interface CaretakerRepository {
  listCaretakers(patientId: string): Promise<CaretakerListResponse>
  linkCaretaker(payload: LinkCaretakerPayload): Promise<void>
  unlinkCaretaker(payload: UnlinkCaretakerPayload): Promise<void>
  getMyPatients(): Promise<MyPatientsResponse>
}
