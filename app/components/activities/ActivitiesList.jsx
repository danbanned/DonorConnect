'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActivityCard from './ActivityCard';
import Pagination from './Pagination';
import SearchBar from './SearchBar';
import styles from './ActivitiesList.module.css';
import LoadingSkeleton from './LoadingSkeleton';


export default function ActivitiesList({ initialData, searchParams }) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [activities, setActivities] = useState(initialData?.data?.activities || []);
  const [summary, setSummary] = useState(initialData?.data?.summary || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  // Update activities when searchParams change
  useEffect(() => {
    async function loadActivities() {
      setLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`/api/donor-activity?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data.data.activities);
        setSummary(data.data.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (Object.keys(searchParams).length > 0) {
      loadActivities();
    }
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('page', newPage);
    router.push(`/activities?${params.toString()}`);
  };

  const handleSearch = (query) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to first page on search
    router.push(`/activities?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Activities</h3>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3>No Activities Found</h3>
        <p>Try adjusting your filters or check back later for new activities.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SearchBar onSearch={handleSearch} initialValue={searchParams.search || ''} />
        <div className={styles.resultInfo}>
          <span>
            Showing <strong>{activities.length}</strong> of{' '}
            <strong>{summary.totalActivities}</strong> activities
          </span>
        </div>
      </div>

      <div className={styles.activitiesGrid}>
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {summary.totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={summary.currentPage || 1}
            totalPages={summary.totalPages || 1}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}