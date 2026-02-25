// Landlord check — combines HPD open data with ACRIS mock.
// This route never throws. All errors return degraded-but-valid data.
import { NextRequest, NextResponse } from "next/server"
import { lookupHpdViolations } from "@/lib/hpd"
import { checkAcris } from "@/lib/acris-mock"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address") ?? ""
    // borough is accepted but HPD query currently uses address only
    // (borough filtering via boroid requires numeric mapping — deferred to post-demo)

    const [hpdResult, acrisResult] = await Promise.all([
      lookupHpdViolations(address),
      Promise.resolve(checkAcris(address)),
    ])

    return NextResponse.json({
      violations: hpdResult.violations,
      openCount: hpdResult.openCount,
      closedCount: hpdResult.closedCount,
      source: hpdResult.source,
      warning: hpdResult.warning,
      acrisOwner: acrisResult.acrisOwner,
      acrisMismatch: acrisResult.acrisMismatch,
      acrisMismatchDetail: acrisResult.acrisMismatchDetail,
    })
  } catch (error) {
    // This route degrades gracefully — never expose errors to client
    console.error("[landlord-check] Unexpected error:", error)
    return NextResponse.json({
      violations: [],
      openCount: 0,
      closedCount: 0,
      source: "unavailable",
      warning: "Property data temporarily unavailable.",
      acrisOwner: null,
      acrisMismatch: false,
    })
  }
}
