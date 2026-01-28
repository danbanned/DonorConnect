// app/components/simulation/BulkDonorManager.jsx
'use client';

import { useState } from 'react';
import { 
  UserGroupIcon, 
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function BulkDonorManager({ 
  BulsimulatedDonors, 
  BulonBulkCreate,
  bulkCreating,
  bulkProgress 
}) {
  const [showPreview, setShowPreview] = useState(false);

  if (!BulsimulatedDonors || BulsimulatedDonors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserGroupIcon className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900">
              {BulsimulatedDonors.length} Simulated Donors Ready
            </h3>
            <p className="text-sm text-gray-600">
              AI-generated donors can be saved to your database
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            {showPreview ? 'Hide Preview' : 'Preview Donors'}
          </button>
          
          <button
            onClick={() => BulonBulkCreate(BulsimulatedDonors)}
            disabled={bulkCreating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {bulkCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-4 h-4" />
                Save All to Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      {bulkCreating && bulkProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {bulkProgress.status === 'preparing' && 'Preparing donors...'}
              {bulkProgress.status === 'creating' && 'Creating donors...'}
              {bulkProgress.status === 'completed' && 'Completed!'}
              {bulkProgress.status === 'error' && 'Error occurred'}
            </span>
            {bulkProgress.processed !== undefined && (
              <span className="text-sm text-gray-600">
                {bulkProgress.processed}/{bulkProgress.total}
              </span>
            )}
          </div>
          {bulkProgress.status === 'creating' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(bulkProgress.processed / bulkProgress.total) * 100}%` 
                }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Donor preview */}
      {showPreview && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Donor Preview (showing first 5)
              </span>
              <span className="text-xs text-gray-500">
                Total: {BulsimulatedDonors.length}
              </span>
            </div>
          </div>
          <div className="divide-y">
            {BulsimulatedDonors.slice(0, 5).map((donor, index) => (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {donor.firstName} {donor.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{donor.email}</p>
                    <div className="flex gap-2 mt-1">
                      {donor.city && donor.state && (
                        <span className="text-xs text-gray-500">
                          {donor.city}, {donor.state}
                        </span>
                      )}
                      {donor.type && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {donor.type}
                        </span>
                      )}
                    </div>
                  </div>
                  {donor.donations?.length > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        ${donor.donations.reduce((sum, d) => sum + d.amount, 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {donor.donations.length} donations
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}