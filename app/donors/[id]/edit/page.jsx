'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import EditDonorForm from '@/app/components/donors/EditDonorForm'
import { getDonorById } from '@/lib/api/donors'

export default function EditDonorPage() {
  const { id } = useParams()
  const router = useRouter()
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDonor() {
      try {
        const donorData = await getDonorById(id)
        setDonor(donorData)
      } catch (error) {
        console.error('Failed to load donor', error)
      } finally {
        setLoading(false)
      }
    }
    loadDonor()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!donor) {
    return <div>Donor not found</div>
  }

  return (
    <div>
      <Link href={`/donors/${id}`} className="btn-primary">
        <ArrowLeftIcon /> Back to Donor
      </Link>
      <h1>Edit Donor</h1>
      <EditDonorForm donor={donor} onSuccess={() => router.push(`/donors/${id}`)} />
    </div>
  )
}