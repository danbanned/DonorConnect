'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserCircleIcon,
  ReceiptPercentIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Helper: Format currency (USD)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getDisplayName = (donor) => {
  if (!donor) return 'Unknown Donor';
  
  if (donor.name) return donor.name;
  if (donor.firstName || donor.lastName) {
    return [donor.firstName, donor.lastName].filter(Boolean).join(' ');
  }
  return 'Unknown Donor';
};

const getInitials = (donor) => {
  const name = getDisplayName(donor);
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getEmail = (donor) => {
  if (!donor) return 'No email';
  return donor.email || donor.emailAddress || 'No email';
};

export default function QuickActions({ donors = [], donations = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonorDropdown, setShowDonorDropdown] = useState(false);

  // Process donors with stats
  const processedDonors = useMemo(() => {
    if (!Array.isArray(donors) || donors.length === 0) return [];

    // Get last donation year per donor
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    return donors.map(donor => {
      const donorDonations = Array.isArray(donations) 
        ? donations.filter(d => d && d.donorId === donor.id)
        : [];
      
      const totalDonations = donorDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      
      const lastDonationYear = donorDonations.length 
        ? Math.max(...donorDonations.map(d => {
            try {
              return new Date(d.date).getFullYear();
            } catch {
              return 0;
            }
          }))
        : null;

      const isLYBUNT = lastDonationYear === lastYear;
      const isSYBUNT = !isLYBUNT && donorDonations.length > 0;

      return {
        ...donor,
        totalDonations,
        isLYBUNT,
        isSYBUNT,
        displayName: getDisplayName(donor),
        email: getEmail(donor)
      };
    });
  }, [donors, donations]);

  // LYBUNT / SYBUNT counts
  const donationStats = useMemo(() => {
    let lybunt = 0;
    let sybunt = 0;
    processedDonors.forEach(d => {
      if (d.isLYBUNT) lybunt++;
      if (d.isSYBUNT) sybunt++;
    });
    return { lybuntDonors: lybunt, sybuntDonors: sybunt };
  }, [processedDonors]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    let result = [...processedDonors];

    // Apply search
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.displayName.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query)
      );
    }

    // Apply filter
    if (filterType === 'highest') {
      result.sort((a, b) => b.totalDonations - a.totalDonations);
    } else if (filterType === 'lybunt') {
      result = result.filter(d => d.isLYBUNT);
    } else if (filterType === 'sybunt') {
      result = result.filter(d => d.isSYBUNT);
    }

    return result;
  }, [processedDonors, searchQuery, filterType]);

  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor);
    setShowDonorDropdown(false);
    setSearchQuery(donor.displayName);
  };

  const handleClearSelection = () => {
    setSelectedDonor(null);
    setSearchQuery('');
  };

  const handleQuickAction = (action) => {
    if (!selectedDonor) return;
    switch (action) {
      case 'record':
        window.location.href = `/recorddonorpage/${selectedDonor.id}`;
        break;
      case 'thank-you':
        window.location.href = `/communications?donorId=${selectedDonor.id}&tab=templates`;
        break;
      case 'meeting':
        window.location.href = `/communications?donorId=${selectedDonor.id}`;
        break;
      case 'view':
        window.location.href = `/donors/${selectedDonor.id}`;
        break;
      case 'communications':
        window.location.href = `/communications?donorId=${selectedDonor.id}`;
        break;
      default:
        break;
    }
  };

  // Compact quick action buttons
  const quickActions = [
    {
      id: 'record',
      label: 'Donation',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'thank-you',
      label: 'Thank You',
      icon: EnvelopeIcon,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'meeting',
      label: 'Meeting',
      icon: CalendarIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'communications',
      label: 'Message',
      icon: DocumentTextIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      id: 'view',
      label: 'Profile',
      icon: UserCircleIcon,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm w-full max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-800">Quick Actions</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {processedDonors.length} donors
        </span>
      </div>

      {/* Donor Selection Section */}
      <div className="mb-4">
        <div className="relative">
          <div className="flex items-center border rounded-md pr-1">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              placeholder={processedDonors.length > 0 ? "Search donors..." : "No donors"}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value && !showDonorDropdown) {
                  setShowDonorDropdown(true);
                }
              }}
              onFocus={() => processedDonors.length > 0 && setShowDonorDropdown(true)}
              className="flex-1 py-1.5 px-2 text-sm focus:outline-none"
              disabled={processedDonors.length === 0}
            />
            {selectedDonor && (
              <button 
                onClick={handleClearSelection} 
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Compact Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              type="button"
              className={`px-2 py-0.5 text-xs rounded ${filterType === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setFilterType('all')}
              disabled={processedDonors.length === 0}
            >
              All
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${filterType === 'highest' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setFilterType('highest')}
              disabled={processedDonors.length === 0}
            >
              <CurrencyDollarIcon className="w-3 h-3" />
              Top
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${filterType === 'lybunt' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setFilterType('lybunt')}
              disabled={processedDonors.length === 0}
            >
              <ExclamationTriangleIcon className="w-3 h-3" />
              LYBUNT ({donationStats.lybuntDonors})
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${filterType === 'sybunt' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setFilterType('sybunt')}
              disabled={processedDonors.length === 0}
            >
              <BellAlertIcon className="w-3 h-3" />
              SYBUNT ({donationStats.sybuntDonors})
            </button>
          </div>
        </div>

        {/* Selected Donor - Compact */}
        {selectedDonor && (
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium">
                {getInitials(selectedDonor)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedDonor.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-600 truncate">{selectedDonor.email}</span>
                  <span className="text-xs font-medium px-1 py-0.5 bg-gray-200 rounded">
                    {formatCurrency(selectedDonor.totalDonations)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donor Dropdown - Compact */}
        {showDonorDropdown && filteredDonors.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto text-sm">
            <div className="p-1 border-b flex justify-between items-center bg-gray-50">
              <span className="text-xs text-gray-600 px-2">
                {filteredDonors.length} found
              </span>
              <button 
                onClick={() => setShowDonorDropdown(false)} 
                className="p-0.5"
                type="button"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredDonors.map((donor) => (
              <button
                key={donor.id}
                className="w-full text-left p-2 hover:bg-gray-50 flex gap-2 items-center border-b last:border-b-0"
                onClick={() => handleDonorSelect(donor)}
                type="button"
              >
                <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs shrink-0">
                  {getInitials(donor)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{donor.displayName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 truncate">{donor.email}</span>
                    <span className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                      {formatCurrency(donor.totalDonations)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {processedDonors.length === 0 && (
          <div className="mt-4 text-center py-3 text-gray-500">
            <UserGroupIcon className="w-8 h-8 mx-auto text-gray-300" />
            <p className="mt-1 text-sm">No donors found</p>
            <Link href="/donors/new" className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">
              Add First Donor
            </Link>
          </div>
        )}
      </div>

      {/* Compact Quick Action Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              disabled={!selectedDonor}
              className={`${action.color} text-white px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 text-xs font-medium flex-1 min-w-[70px] justify-center`}
              type="button"
              title={`${action.label}${action.id === 'record' ? ' donation' : action.id === 'thank-you' ? ' email' : action.id === 'communications' ? '' : ''} for ${selectedDonor ? selectedDonor.displayName : 'donor'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Selection Hint */}
      {!selectedDonor && processedDonors.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded text-center">
          <p className="text-xs text-yellow-800">
            Select a donor to enable quick actions
          </p>
        </div>
      )}
    </div>
  );
}