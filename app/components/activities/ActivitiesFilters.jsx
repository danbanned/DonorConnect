'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ActivitiesFilters.module.css';

const TIME_FILTERS = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const TYPE_FILTERS = [
  { value: 'DONATION', label: 'Donations', icon: '💰' },
  { value: 'MEETING', label: 'Meetings', icon: '📅' },
  { value: 'COMMUNICATION', label: 'Communications', icon: '📧' },
  { value: 'NOTE', label: 'Notes', icon: '📝' },
  { value: 'STATUS', label: 'Status Changes', icon: '🔄' },
];

export default function ActivitiesFilters({ initialFilters, stats }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState(
    initialFilters.timeframe || '30days'
  );
  const [selectedTypes, setSelectedTypes] = useState(
    initialFilters.types ? initialFilters.types.split(',') : []
  );
  const [donorId, setDonorId] = useState(initialFilters.donorId || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedTimeframe && selectedTimeframe !== '30days') {
      params.set('timeframe', selectedTimeframe);
    }
    
    if (selectedTypes.length > 0) {
      params.set('types', selectedTypes.join(','));
    }
    
    if (donorId) {
      params.set('donorId', donorId);
    }
    
    params.set('page', '1'); // Reset to first page when filters change
    
    router.push(`/activities?${params.toString()}`);
  };

  const resetFilters = () => {
    setSelectedTimeframe('30days');
    setSelectedTypes([]);
    setDonorId('');
    router.push('/activities');
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Filters</h3>
      
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Time Period</h4>
        <div className={styles.timeFilters}>
          {TIME_FILTERS.map(filter => (
            <button
              key={filter.value}
              className={`${styles.timeFilter} ${
                selectedTimeframe === filter.value ? styles.active : ''
              }`}
              onClick={() => setSelectedTimeframe(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Activity Types</h4>
        <div className={styles.typeFilters}>
          {TYPE_FILTERS.map(type => {
            const count = stats?.byType?.[type.value] || 0;
            return (
              <button
                key={type.value}
                className={`${styles.typeFilter} ${
                  selectedTypes.includes(type.value) ? styles.active : ''
                }`}
                onClick={() => toggleType(type.value)}
                disabled={count === 0}
              >
                <span className={styles.typeIcon}>{type.icon}</span>
                <span className={styles.typeLabel}>{type.label}</span>
                <span className={styles.typeCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Specific Donor</h4>
        <div className={styles.donorFilter}>
          <input
            type="text"
            placeholder="Enter Donor ID"
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            className={styles.donorInput}
          />
          <p className={styles.helperText}>
            Leave empty to view all donors
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.applyButton}
          onClick={applyFilters}
        >
          Apply Filters
        </button>
        <button 
          className={styles.resetButton}
          onClick={resetFilters}
        >
          Reset All
        </button>
      </div>
    </div>
  );
}