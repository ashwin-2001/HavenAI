export type Language = "en" | "pt" | "hi" | "yo" | "es"

export interface Clause {
  id: string
  title: string
  originalText: string
  rating: "green" | "yellow" | "red"
  explanation: string
  legalBasis: string
  recommendedAction: string
}

export interface HpdViolation {
  violationid: string
  inspectiondate: string
  novdescription: string
  currentstatus: string
  class: string
}

export interface LandlordReport {
  acrisOwner: string | null
  acrisMismatch: boolean
  acrisMismatchDetail?: string
  hpdViolations: number
  hpdOpenViolations: HpdViolation[]
  source: "live" | "mock" | "unavailable"
  warning?: string
}

export interface LeaseAnalysisResult {
  summary: string
  immigrantNote: string
  clauses: Clause[]
  landlordReport: LandlordReport
  disclaimer: string
}

export interface EmergencyAnswers {
  hadWrittenNotice: boolean
  locksChanged: boolean
  belongingsRemoved: boolean
  outsideRightNow: boolean
  immigrationConcern: boolean | null
}

export interface Hotline {
  name: string
  number: string
  hours: string
}

export interface ActionStep {
  order: number
  title: string
  detail: string
  phoneNumber?: string
  isUrgent: boolean
}

export interface EmergencyPlanResult {
  situationType: "illegal_lockout" | "eviction_notice" | "harassment" | "belongings_removed"
  urgency: "immediate" | "urgent" | "standard"
  steps: ActionStep[]
  rightsCard: string
  policeScript: string
  hotlines: Hotline[]
  disclaimer: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    retryable: boolean
  }
}
