// components/insights/DonationChart.jsx
'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DonationChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip />
        <Line type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}