export async function getMarketingData() {
  const response = await fetch('/api/marketing', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const fallbackError = await response.json().catch(() => null)
    throw new Error(fallbackError?.error || 'Failed to fetch marketing data')
  }

  const data = await response.json()
  if (!data?.success) {
    throw new Error(data?.error || 'Failed to fetch marketing data')
  }

  return data
}

export function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPercent(value = 0) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`
}
