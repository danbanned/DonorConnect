import { Suspense } from 'react';
import ActivitiesList from '../components/activities/ActivitiesList';
import ActivitiesFilters from '../components/activities/ActivitiesFilters';
import ActivitiesStats from '../components/activities/ActivitiesStats';
import { fetchActivities } from './actions/fetchActivities';
import Link from 'next/link'
import styles from './page.module.css';

export const metadata = {
  title: 'Donor Activities | Dashboard',
  description: 'View all donor activities and interactions',
};

export default async function ActivitiesPage({ searchParams }) {
  // Initial data fetch on server side
  const initialData = await fetchActivities(searchParams);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
            <h1 className={styles.title}>Activity Dashboard</h1>
            <p className={styles.subtitle}>
            Monitor and analyze all donor interactions across your organization
            </p>
        </div>
        <div className={styles.headerActions}>
            <Link 
            href="/dashboard" 
            className={styles.backLink}
            >
            ← Back to Dashboard
            </Link>
        </div>
        </div>

      <div className={styles.layout}>
        {/* Sidebar with filters and stats */}
        <aside className={styles.sidebar}>
          <Suspense fallback={<div className={styles.filterSkeleton}>Loading filters...</div>}>
            <ActivitiesFilters 
              initialFilters={searchParams}
              stats={initialData?.summary?.stats}
            />
          </Suspense>
          
          <Suspense fallback={<div className={styles.statsSkeleton}>Loading stats...</div>}>
            <ActivitiesStats stats={initialData?.summary?.stats} />
          </Suspense>
        </aside>

        {/* Main content area */}
        <main className={styles.mainContent}>
          <Suspense 
            fallback={
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading activities...</p>
              </div>
            }
          >
            <ActivitiesList 
              initialData={initialData}
              searchParams={searchParams}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}