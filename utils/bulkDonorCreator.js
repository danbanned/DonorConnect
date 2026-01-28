// utils/bulkDonorCreator.js
// utils/bulkDonorCreator.js - UPDATED
export async function bulkCreateDonors(donors, orgId, onProgress) {
  try {
    console.log('📦 Bulk creating donors:', donors)
    
    if (!donors || donors.length === 0) {
      throw new Error('No donors to create')
    }

    // Validate and prepare donor data matching API expectations
    const donorData = donors.map(donor => {
      // Check required fields
      const firstName = donor.firstName?.trim()
      const lastName = donor.lastName?.trim()
      const email = donor.email?.trim()?.toLowerCase()
      
      if (!firstName || !lastName || !email) {
        throw new Error(`Donor missing required fields: ${JSON.stringify({firstName, lastName, email})}`)
      }

      // API expects flat structure for address fields
      let address = null
      if (donor.address) {
        if (typeof donor.address === 'object') {
          // Convert object to flat structure
          address = donor.address.street || donor.address
        } else {
          // Already a string
          address = donor.address
        }
      }

      return {
        firstName,
        lastName,
        email,
        phone: donor.phone?.trim() || null,
        preferredContact: donor.preferredContact || 'EMAIL',
        status: donor.status || 'ACTIVE',
        relationshipStage: donor.relationshipStage || 'NEW',
        notes: donor.notes || donor.personalNotes?.notes || '',
        // Flat structure for address (API expects these as separate fields)
        address: address, // string for street
        city: donor.address?.city || donor.city || '',
        state: donor.address?.state || donor.state || '',
        postalCode: donor.address?.postalCode || donor.address?.zipCode || donor.postalCode || donor.zipCode || '',
        country: donor.address?.country || donor.country || 'USA',
        interests: donor.interests || [],
        tags: donor.tags || []
      }
    })

    console.log('📤 Sending donor data to API:', donorData)

    if (onProgress) onProgress({ status: 'preparing', total: donorData.length })
      // In bulkDonorCreator.js, before the fetch:
console.log('Request payload:', JSON.stringify({ donors: donorData }, null, 2))
    const response = await fetch('/api/donors/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ donors: donorData }),
    })

    console.log('📨 Response status:', response.status, response.statusText)
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = 'Failed to create donors'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        console.error('API Error response:', errorData)
      } catch (e) {
        const text = await response.text()
        console.error('API Error text:', text)
        errorMessage = `Server error: ${response.status} - ${text}`
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Bulk creation result:', result)
    
    if (onProgress) onProgress({ status: 'completed', total: donorData.length, created: result.created })
    
    return result
  } catch (error) {
    console.error('❌ Bulk creation failed:', error)
    if (onProgress) onProgress({ status: 'error', error: error.message })
    throw error
  }
}

export function prepareDonorsForBulk(donors) {
  return donors.map(donor => {
    // Ensure all required fields exist
    return {
      id: donor.id || `temp_${Date.now()}_${Math.random()}`,
      firstName: donor.firstName || `Donor${Math.floor(Math.random() * 1000)}`,
      lastName: donor.lastName || `Smith${Math.floor(Math.random() * 1000)}`,
      email: donor.email || `donor${Math.floor(Math.random() * 10000)}@example.com`,
      phone: donor.phone || '',
      preferredContact: donor.preferredContact || 'EMAIL',
      status: donor.status || 'ACTIVE',
      relationshipStage: donor.relationshipStage || 'NEW',
      notes: donor.notes || donor.personalNotes?.notes || '',
      address: donor.address || null,
      interests: donor.interests || [],
      tags: donor.tags || [],
      // Add generated donation history if missing
      donations: donor.donations || [],
      communications: donor.communications || []
    }
  })
}