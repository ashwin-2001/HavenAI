// HPD Open Data API helper.
//
// NYC Housing Preservation & Development violation data is available at:
// https://data.cityofnewyork.us/resource/wvxf-dwi5.json
// No API key required (Socrata public endpoint, 1000 req/hour unauthenticated).
//
// We query by address and return open/closed violation counts.
// All HPD calls have a hard 5-second timeout — if exceeded or errored,
// we return a graceful fallback. This call must NEVER throw.
import type { HpdViolation } from "../types"

const HPD_BASE_URL = "https://data.cityofnewyork.us/resource/wvxf-dwi5.json"
const TIMEOUT_MS = 5000

export interface HpdLookupResult {
  violations: HpdViolation[]
  openCount: number
  closedCount: number
  source: "live" | "unavailable"
  warning?: string
}

const UNAVAILABLE_RESULT: HpdLookupResult = {
  violations: [],
  openCount: 0,
  closedCount: 0,
  source: "unavailable",
  warning: "Live property data unavailable. HPD lookup could not be completed.",
}

export async function lookupHpdViolations(
  address: string
): Promise<HpdLookupResult> {
  if (!address || address.trim().length === 0) {
    return UNAVAILABLE_RESULT
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    // Normalize address to uppercase to match HPD records
    const normalizedAddress = address.trim().toUpperCase()
    const params = new URLSearchParams({
      $where: `address='${normalizedAddress}'`,
      $limit: "50",
      $order: "inspectiondate DESC",
    })

    const response = await fetch(`${HPD_BASE_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return UNAVAILABLE_RESULT
    }

    const data = await response.json() as HpdViolation[]

    if (!Array.isArray(data)) {
      return UNAVAILABLE_RESULT
    }

    const openViolations = data.filter(
      (v) => v.currentstatus?.toLowerCase() === "open"
    )
    const closedCount = data.length - openViolations.length

    return {
      violations: data,
      openCount: openViolations.length,
      closedCount,
      source: "live",
    }
  } catch {
    clearTimeout(timeoutId)
    return UNAVAILABLE_RESULT
  }
}
