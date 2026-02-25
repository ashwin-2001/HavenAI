// Demo-only ACRIS mock for one hardcoded address.
//
// ACRIS (Automated City Register Information System) is the NYC property records
// database. Real API access requires authentication and is complex to integrate.
// For the hackathon demo, we simulate one mismatch scenario:
//
// Demo address: 123 West 14th Street, Manhattan
// Registered owner: "East Village Properties LLC" (a corporation)
// Demo lease signatory: "John Smith" (an individual)
// → This triggers a "signatory mismatch" warning — an important red flag for tenants.
//   If an individual signs a lease on behalf of a corporation, the tenant should
//   verify the person is authorized to bind the LLC before signing.

export const ACRIS_DEMO_ADDRESS = "123 WEST 14TH ST"

export interface AcrisResult {
  acrisOwner: string | null
  acrisMismatch: boolean
  acrisMismatchDetail?: string
  source: "mock"
}

// Matches "14TH" anywhere in the address string (case-insensitive after normalization).
// This covers: "123 West 14th St", "123 W 14TH ST", "14th Street", etc.
export function checkAcris(address: string): AcrisResult {
  if (address.toUpperCase().includes("14TH")) {
    return {
      acrisOwner: "East Village Properties LLC",
      acrisMismatch: true,
      acrisMismatchDetail:
        "Lease was signed by an individual. Registered owner is a corporation. Verify authorization before signing.",
      source: "mock",
    }
  }

  return {
    acrisOwner: null,
    acrisMismatch: false,
    source: "mock",
  }
}
