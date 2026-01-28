// app/api/donors/bulk/route.js
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { verifyToken } from '../../../../lib/auth'
import { cookies } from 'next/headers'

// app/api/donors/bulk/route.js - ADD DEBUGGING
export async function POST(req) {
  console.log('🚀 BULK API CALLED')
  
  try {
    // Log headers for auth debugging
    const headers = Object.fromEntries(req.headers.entries())
    console.log('📨 Headers:', headers)
    
    const body = await req.json()
    console.log('📦 Request body received, donor count:', body.donors?.length || 0)
    
    // Log first donor
    if (body.donors && body.donors.length > 0) {
      console.log('👤 First donor:', JSON.stringify(body.donors[0], null, 2))
    }
    
    // Check authentication
    const token = cookies().get('auth_token')?.value
    console.log('🔐 Auth token exists:', !!token)
    
    if (!token) {
      console.error('❌ No auth token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token
    const user = await verifyToken(token)
    console.log('👤 User verified:', { 
      id: user?.id, 
      orgId: user?.organizationId 
    })
    
    if (!user) {
      console.error('❌ Token verification failed')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const organizationId = user.organizationId ?? null
    console.log('🏢 Organization ID:', organizationId)
    
    const { donors } = body

    if (!donors || !Array.isArray(donors) || donors.length === 0) {
      console.error('❌ No donors array in request')
      return NextResponse.json(
        { error: 'Missing or empty donors array' },
        { status: 400 }
      )
    }

    console.log(`🎯 Processing ${donors.length} donors`)

    const createdDonors = []
    const errors = []

    // Process each donor
    for (let i = 0; i < donors.length; i++) {
      const donor = donors[i]
      console.log(`🔄 Processing donor ${i + 1}/${donors.length}:`, donor.email)
      
      try {
        // Prepare data
        const donorData = {
          firstName: donor.firstName?.trim() || `Donor${i}`,
          lastName: donor.lastName?.trim() || 'Generated',
          email: donor.email?.trim()?.toLowerCase() || `donor${i}@example.com`,
          phone: donor.phone?.trim() || null,
          preferredContact: (donor.preferredContact || 'EMAIL').toUpperCase(),
          status: donor.status || 'ACTIVE',
          relationshipStage: donor.relationshipStage || 'NEW',
          organizationId,
        }

        // Add notes if present
        if (donor.notes) {
          donorData.personalNotes = {
            create: {
              notes: donor.notes
            }
          }
        }

        console.log('📝 Donor data prepared:', donorData)

        // Try to create donor
        const createdDonor = await prisma.donor.create({
          data: donorData,
        })

        console.log(`✅ Created donor ${i + 1}:`, createdDonor.id, createdDonor.email)
        createdDonors.push(createdDonor)

      } catch (donorError) {
        console.error(`❌ Failed to create donor ${donor.email}:`, donorError.message)
        errors.push({
          email: donor.email,
          name: `${donor.firstName} ${donor.lastName}`,
          error: donorError.message
        })
      }
    }

    const result = {
      success: true,
      created: createdDonors.length,
      totalAttempted: donors.length,
      errors: errors.length > 0 ? errors : null,
      donors: createdDonors.map(d => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`,
        email: d.email,
      })),
      message: `Successfully created ${createdDonors.length} out of ${donors.length} donors`
    }

    console.log('🏁 Bulk creation complete:', result)
    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('💥 Bulk API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create bulk donors',
        details: error.message 
      },
      { status: 500 }
    )
  }
}