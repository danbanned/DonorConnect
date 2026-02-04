'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TemplatesSection from '../../components/communications/TemplatesSection'


export default function Page() {
  const [donors, setDonors] = useState([
    { firstName: '', lastName: '', email: '' },
  ]);

  const searchParams = useSearchParams();

  const donorId = searchParams.get('donorId');
  const tab = searchParams.get('tab');

  return (
    <main style={{ padding: 24 }}>
      <TemplatesSection/>
      <p style={{ marginBottom: 12 }}>
        Pick a donor and schedule a meeting or call.
      </p>
    </main>
  );
}
