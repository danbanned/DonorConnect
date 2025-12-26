// lib/donorActivity.js
// Client-safe helpers that call API routes
// ❌ NO Prisma in this file

/**
 * Get recent donor activity
 */
export async function getDonorActivity({ donorId, limit = 25 } = {}) {
  const params = new URLSearchParams();

  if (donorId) params.append("donorId", donorId);
  if (limit) params.append("limit", limit);

  const res = await fetch(`/api/donor-activity?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load donor activity");
  }

  return res.json();
}
