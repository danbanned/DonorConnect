import React, { useState, useEffect } from 'react'
import {
 CalendarIcon,
 EnvelopeIcon,
 PhoneIcon,
 CurrencyDollarIcon,
 ExclamationTriangleIcon,
 CheckCircleIcon,
 ClockIcon,
 UserGroupIcon,
 DocumentTextIcon,
 ArrowRightIcon
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/formatCurrency'
import './SuggestedActions.css'
import DonorBrief from '../DonorBrief.jsx'


export default function SuggestedActions({ donor, insights }) {
 // Add all state variables at the top
 const [creatingDonation, setCreatingDonation] = useState(false);
 const [donationError, setDonationError] = useState('');
 const [showDonationModal, setShowDonationModal] = useState(false);
 const [selectedAmount, setSelectedAmount] = useState(0);
 const [selectedAction, setSelectedAction] = useState(null);
 const [donationNotes, setDonationNotes] = useState('');
 const [organizationId, setOrganizationId] = useState(null);
 const [isBriefOpen, setIsBriefOpen] = useState(false);
 const [selectedDonor, setSelectedDonor] = useState(null);
 const [dismissedActions, setDismissedActions] = useState([]);
 const openBrief = (donor) => {
   setSelectedDonor(donor);
   setIsBriefOpen(true);
 };
   const [formData,setFormData] = useState({
     amount: 0,
     paymentMethod: 'CREDIT_CARD',
     notes: ''
   })


  




 // Get data from the actual structure
 console.log('📊 Donor data for SuggestedActions:', { donor, insights })


 // Extract donations from donor object based on console output structure
 const donorId = donor?.id || donor?.donorId || '';
 const donorDonations = donor?.donations || [];
 const donorSummary = donor?.summary || {};
 const donorMetrics = donor?.metrics || {};
  // Get insights from the correct structure
 const engagementLevel = insights?.engagementLevel || donor?.engagementLevel || 'Unknown';
 const engagementScore = insights?.engagementScore || donor?.engagementScore || 0;
 const givingFrequency = insights?.givingFrequency || donor?.givingFrequency || 'unknown';
 const suggestedAskAmount = insights?.suggestedAskAmount || donor?.suggestedAskAmount || 0;
 const nextBestAction = insights?.nextBestAction || donor?.nextBestAction || 'No action suggested';


  const paymentMethods = [
   { value: 'CREDIT_CARD', label: 'Credit Card' },
   { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
   { value: 'CHECK', label: 'Check' },
   { value: 'CASH', label: 'Cash' },
   { value: 'STOCK', label: 'Stock' },
 ]


 // Calculate derived values from actual data
 const giftsCount = donorDonations.length || 0;
 const lastGiftDate = donorDonations.length > 0
   ? new Date(donorDonations[0].date) // Assuming sorted by date
   : null;
  const totalGiven = donorDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
 const averageGift = giftsCount > 0 ? totalGiven / giftsCount : 0;
 const daysSinceLastGift = lastGiftDate
   ? Math.floor((new Date() - lastGiftDate) / (1000 * 60 * 60 * 24))
   : null;
  // Calculate if donor is LYBUNT (gave last year but not this year)
 const currentYear = new Date().getFullYear();
 const isLybunt = donorDonations.some(d => {
   const year = new Date(d.date).getFullYear();
   return year === currentYear - 1; // Gave last year
 }) && !donorDonations.some(d => {
   const year = new Date(d.date).getFullYear();
   return year === currentYear; // But not this year
 });


 const getPriorityClass = (priority) => {
   switch (priority) {
     case 'high': return 'action-item high'
     case 'medium': return 'action-item medium'
     case 'low': return 'action-item low'
     case 'info': return 'action-item info'
     default: return 'action-item default'
   }
 }


 const getIconContainerClass = (priority) => {
   switch (priority) {
     case 'high': return 'action-icon-container high'
     case 'medium': return 'action-icon-container medium'
     case 'low': return 'action-icon-container low'
     case 'info': return 'action-icon-container info'
     default: return 'action-icon-container default'
   }
 }


 const getIconClass = (priority) => {
   switch (priority) {
     case 'high': return 'action-icon high'
     case 'medium': return 'action-icon medium'
     case 'low': return 'action-icon low'
     case 'info': return 'action-icon info'
     default: return 'action-icon default'
   }
 }


 const getPriorityIcon = (priority) => {
   switch (priority) {
     case 'high': return <ExclamationTriangleIcon className="action-icon high" />
     case 'medium': return <ClockIcon className="action-icon medium" />
     case 'low': return <CheckCircleIcon className="action-icon low" />
     case 'info': return <CurrencyDollarIcon className="action-icon info" />
     default: return <CheckCircleIcon className="action-icon default" />
   }
 }


 const getNextAskDate = () => {
   if (!lastGiftDate) return new Date();
   const nextAsk = new Date(lastGiftDate);
  
   // Adjust based on giving frequency
   switch (givingFrequency) {
     case 'monthly':
       nextAsk.setMonth(nextAsk.getMonth() + 1);
       break;
     case 'quarterly':
       nextAsk.setMonth(nextAsk.getMonth() + 3);
       break;
     case 'annually':
       nextAsk.setFullYear(nextAsk.getFullYear() + 1);
       break;
     default: // one-time
       nextAsk.setMonth(nextAsk.getMonth() + 6);
   }
  
   return nextAsk;
 }


 // Build suggested actions based on actual data
 const suggestedActions = [];


 // 1. Always show suggested ask if available
 if (suggestedAskAmount > 0) {
   suggestedActions.push({
     id: 'ask-amount',
     title: 'Suggested Ask Amount',
     description: `Based on ${givingFrequency} giving pattern`,
     icon: CurrencyDollarIcon,
     priority: 'info',
     amount: suggestedAskAmount,
     reason: `Average gift: ${formatCurrency(averageGift)}`,
     action: 'requestDonation'
   });
 }


 // 2. LYBUNT follow-ups (highest priority)
 if (isLybunt) {
   suggestedActions.push({
     id: 'lybunt',
     title: 'LYBUNT Donor',
     description: 'Gave last year but not this year',
     icon: ExclamationTriangleIcon,
     priority: 'high',
     reason: 'High potential for re-engagement',
     action: 'sendReEngagementEmail'
   });
 }


 // 3. Next best action from insights
 if (nextBestAction && nextBestAction !== 'No action suggested') {
   let icon = EnvelopeIcon;
   let priority = 'medium';
   let actionType = 'sendEmail';
  
   switch (nextBestAction.toLowerCase()) {
     case 'send thank you note':
       icon = EnvelopeIcon;
       priority = 'medium';
       actionType = 'sendThankYou';
       break;
     case 'schedule call':
     case 'schedule meeting':
       icon = PhoneIcon;
       priority = 'high';
       actionType = 'scheduleCall';
       break;
     case 'send update':
       icon = DocumentTextIcon;
       priority = 'low';
       actionType = 'sendUpdate';
       break;
     case 'request meeting':
       icon = CalendarIcon;
       priority = 'high';
       actionType = 'scheduleMeeting';
       break;
   }
  
   suggestedActions.push({
     id: 'next-best',
     title: 'AI Recommended Action',
     description: nextBestAction,
     icon,
     priority,
     reason: `Based on ${engagementLevel.toLowerCase()} engagement`,
     action: actionType
   });
 }


 // 4. Engagement-based actions
 if (engagementLevel === 'Low' && giftsCount > 0) {
   suggestedActions.push({
     id: 'engagement-low',
     title: 'Increase Engagement',
     description: 'Donor has low engagement score',
     icon: UserGroupIcon,
     priority: 'medium',
     reason: `Engagement score: ${engagementScore}/100`,
     action: 'increaseEngagement'
   });
 }


 // 5. Time-based check-ins
 if (lastGiftDate) {
   const monthsSinceLastGift = daysSinceLastGift ? Math.floor(daysSinceLastGift / 30) : 0;
  
   if (monthsSinceLastGift >= 6 && givingFrequency === 'one-time') {
     suggestedActions.push({
       id: 'follow-up',
       title: 'Follow-up Check-in',
       description: `It's been ${monthsSinceLastGift} months since last gift`,
       icon: CalendarIcon,
       priority: 'medium',
       suggestedDate: getNextAskDate(),
       reason: 'Standard follow-up timing',
       action: 'followUp'
     });
   }
 } else if (giftsCount === 0) {
   // New donor without gifts
   suggestedActions.push({
     id: 'welcome',
     title: 'Welcome New Donor',
     description: 'This donor hasn\'t made a gift yet',
     icon: EnvelopeIcon,
     priority: 'high',
     reason: 'First impression opportunity',
     action: 'sendWelcome'
   });
 }


 // 6. Impact reporting (always good)
 suggestedActions.push({
   id: 'impact',
   title: 'Share Impact Report',
   description: `Show how donations are making a difference`,
   icon: DocumentTextIcon,
   priority: 'low',
   reason: 'Strengthens donor relationship',
   action: 'shareImpact'
 });


 // Format date for display
 const formatActionDate = (date) => {
   if (!(date instanceof Date)) return '';
   const today = new Date();
   const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  
   if (diffDays === 0) return 'Today';
   if (diffDays === 1) return 'Tomorrow';
   if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
   return `In ${diffDays} days`;
 };


 // Format last contact date
 const formatLastContact = () => {
   if (!donor?.lastContactDate) return 'No recent contact';
   const contactDate = new Date(donor.lastContactDate);
   const diffDays = Math.floor((new Date() - contactDate) / (1000 * 60 * 60 * 24));
  
   if (diffDays === 0) return 'Today';
   if (diffDays === 1) return 'Yesterday';
   if (diffDays < 30) return `${diffDays} days ago`;
   if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
   return `${Math.floor(diffDays / 365)} years ago`;
 };


 // Click handlers for buttons
 const handleActionClick = (actionType, actionData) => {
   console.log('Action clicked:', { actionType, actionData, donorId });
  
   // Set selected action for modal
   setSelectedAction(actionData);
  
   switch (actionType) {
     case 'requestDonation':
       // Set the amount and show modal
       setSelectedAmount(actionData.amount);
       setShowDonationModal(true);
       break;
      
     case 'sendReEngagementEmail':
       window.open(`/communications/new?donorId=${donorId}&template=reengagement`, '_blank');
       break;
      
     case 'sendThankYou':
       window.open(`/communications/new?donorId=${donorId}&template=thankyou`, '_blank');
       break;
      
     case 'scheduleCall':
       window.open(`/calendar/schedule?donorId=${donorId}`, '_blank');
       break;
      
     case 'sendUpdate':
       window.open(`/communications/new?donorId=${donorId}&template=update`, '_blank');
       break;
      
     case 'scheduleMeeting':
       window.open(`/calendar/schedule?donorId=${donorId}&type=meeting`, '_blank');
       break;
      
     case 'increaseEngagement':
       window.open(`/communications/new?donorId=${donorId}&template=engagement`, '_blank');
       break;
      
     case 'followUp':
       window.open(`/communications/new?donorId=${donorId}&template=followup`, '_blank');
       break;
      
     case 'sendWelcome':
       window.open(`/communications/new?donorId=${donorId}&template=welcome`, '_blank');
       break;
      
     case 'shareImpact':
       window.open(`/communications/new?donorId=${donorId}&template=impact`, '_blank');
       break;
      
     case 'generateBrief':
       window.open(`/components/DonorBrief`, '_blank');
       break;
      
     default:
       console.log('No action handler for:', actionType);
   }
 };

 // Filter out dismissed actions
  const availableActions = suggestedActions.filter(
    action => !dismissedActions.includes(action.id)
  );

const handleDismiss = (actionId) => {
    console.log('Dismiss action:', actionId);
    
    // Add to dismissed actions
    setDismissedActions(prev => [...prev, actionId]);
    
    // Optional: Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem('dismissedActions') || '[]');
      localStorage.setItem('dismissedActions', JSON.stringify([...stored, actionId]));
    } catch (error) {
      console.error('Error storing dismissed action:', error);
    }
  };

  // Load dismissed actions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissedActions');
      if (stored) {
        setDismissedActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading dismissed actions:', error);
    }
  }, []);


 const handleGenerateBrief = () => {
   handleActionClick('generateBrief');
 };


 // Helper function for direct donation creation
 const createDonationDirectly = async (amount) => {
   setCreatingDonation(true);
   setDonationError('');
  
   try {
     // Get organizationId from localStorage or context
     const organizationId = localStorage.getItem('currentOrgId') || 'default-org';
     console.log('Creating donation with organizationId:', organizationId);
    
     const response = await fetch('/api/donations', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         donorId: donorId,
         amount: amount,
         organizationId: organizationId,
         currency: 'USD',
         date: new Date().toISOString(),
         paymentMethod: formData.paymentMethod,
         notes: donationNotes || 'Donation created from Suggested Actions'
       })
     });
    
     const data = await response.json();
     setFormData(data)
     setOrganizationId(organizationId)
    
     if (!response.ok) {
       throw new Error(data.error || 'Failed to create donation');
     }
    
     // Show success message
     alert(`✅ Donation of ${formatCurrency(amount)} created successfully!`);
    
     // Close modal
     setShowDonationModal(false);
     setDonationNotes('');
    
     // Refresh the page or update data
     window.location.reload();
    
   } catch (error) {
     console.error('Error creating donation:', error);
     setDonationError(error.message);
   } finally {
     setCreatingDonation(false);
   }
 };


 const handleModalClose = () => {
   setShowDonationModal(false);
   setDonationError('');
   setDonationNotes('');
 };


 const handleCreateDonation = async () => {
   if (selectedAmount <= 0) {
     setDonationError('Please enter a valid amount');
     return;
   }
  
   await createDonationDirectly(selectedAmount);
 };


 return (
   <div className="suggested-actions-card">
     <div className="suggested-actions-header">
       <div>
         <h3 className="suggested-actions-title">Suggested Actions</h3>
         <p className="suggested-actions-subtitle">
           AI-powered recommendations based on donor behavior
         </p>
       </div>
       <span className="suggested-actions-badge">
         {availableActions.length} actions
       </span>
     </div>


     <div className="suggested-actions-list">
       {availableActions.map((action) => {
         const Icon = action.icon;
         return (
           <div
             key={action.id}
             className={getPriorityClass(action.priority)}
           >
             <div className="action-content">
               <div className="action-main">
                 <div className={getIconContainerClass(action.priority)}>
                   {action.amount ? (
                     <span className="amount-text">
                       {formatCurrency(action.amount, 0).replace('$', '')}
                     </span>
                   ) : (
                     <Icon className={getIconClass(action.priority)} />
                   )}
                 </div>
                 <div className="action-details">
                   <div className="action-header">
                     <h4 className="action-title">{action.title}</h4>
                     {getPriorityIcon(action.priority)}
                   </div>
                   <p className="action-description">{action.description}</p>
                  
                   {action.reason && (
                     <div className="action-reason">
                       <span className="action-reason-text">{action.reason}</span>
                     </div>
                   )}
                  
                   {action.suggestedDate && (
                     <div className="action-date">
                       <CalendarIcon className="action-date-icon" />
                       <span>{formatActionDate(action.suggestedDate)}</span>
                       <span className="action-divider">•</span>
                       <span>
                         {action.suggestedDate.toLocaleDateString('en-US', {
                           month: 'short',
                           day: 'numeric'
                         })}
                       </span>
                     </div>
                   )}
                 </div>
               </div>
             </div>


             <div className="action-buttons">
               <button
                 className="btn-primary"
                 onClick={() => handleActionClick(action.action, action)}
                 disabled={creatingDonation}
               >
                 {action.amount ? (
                   <>
                     Request ${formatCurrency(action.amount, 0).replace('$', '')}
                     <ArrowRightIcon className="btn-icon" />
                   </>
                 ) : (
                   <>
                     {action.title.includes('Donor') ? 'View Details' : 'Take Action'}
                     <ArrowRightIcon className="btn-icon" />
                   </>
                 )}
               </button>
               <button
                 className="btn-secondary"
                 onClick={() => handleDismiss(action.id)}
                 disabled={creatingDonation}
               >
                 Dismiss
               </button>
             </div>
           </div>
         );
       })}
     </div>


     <div className="quick-stats">
       <div className="stats-header">
         <h4>Donor Quick Stats</h4>
         <p className="stats-subtitle">Based on {giftsCount} gift{giftsCount !== 1 ? 's' : ''}</p>
       </div>
       <div className="stats-grid">
         <div className="stat-box">
           <p className="stat-value">{giftsCount}</p>
           <p className="stat-label">Total Gifts</p>
         </div>
         <div className="stat-box">
           <p className="stat-value">
             {formatCurrency(totalGiven)}
           </p>
           <p className="stat-label">Total Given</p>
         </div>
         <div className="stat-box">
           <p className="stat-value">
             {formatCurrency(averageGift)}
           </p>
           <p className="stat-label">Average Gift</p>
         </div>
         <div className="stat-box">
           <p className="stat-value">
             {daysSinceLastGift !== null ? `${daysSinceLastGift}d` : 'N/A'}
           </p>
           <p className="stat-label">Days Since Gift</p>
         </div>
         <div className="stat-box">
           <p className="stat-value">
             {engagementLevel}
           </p>
           <p className="stat-label">Engagement</p>
         </div>
         <div className="stat-box">
           <p className="stat-value">
             {formatLastContact()}
           </p>
           <p className="stat-label">Last Contact</p>
         </div>
       </div>
     </div>


     <div className="meeting-prep">
       <div className="meeting-prep-content">
         <div>
           <p className="meeting-prep-title">Generate Donor Brief</p>
           <p className="meeting-prep-description">
             AI-powered briefing for meetings or calls
           </p>
         </div>
         <button
           className="btn-primary"
           onClick={() => openBrief(donor)}
         >
           Generate Brief
           <ArrowRightIcon className="btn-icon" />
         </button>


         <DonorBrief
           donor={selectedDonor}
           isOpen={isBriefOpen && !!selectedDonor}
           onClose={() => {
             setIsBriefOpen(false);
             setSelectedDonor(null);
           }}
         />
       </div>
     </div>


     {/* Donation Modal */}
     {showDonationModal && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold">Create Donation</h3>
             <button
               onClick={handleModalClose}
               className="text-gray-500 hover:text-gray-700"
               disabled={creatingDonation}
             >
               ✕
             </button>
           </div>
          
           <p className="text-gray-600 mb-6">
             Creating a donation for donor ID: <span className="font-mono text-sm">{donorId}</span>
           </p>
          
           {donationError && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
               <p className="text-red-700">{donationError}</p>
             </div>
           )}


             <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
             {paymentMethods.map((method) => (
               <button
                 key={method.value}
                 type="button"
                 onClick={() => setFormData({...formData, paymentMethod: method.value})}
                 className={`p-3 rounded-lg border ${
                   formData.paymentMethod === method.value
                     ? 'bg-blue-600 text-white border-blue-600'
                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                 }`}
               >
                 {method.label}
               </button>
             ))}
           </div>
          
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Amount (USD)
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <span className="text-gray-500">$</span>
                 </div>
                 <input
                   type="number"
                   value={selectedAmount}
                   onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
                   className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded"
                   step="0.01"
                   min="0.01"
                   placeholder="0.00"
                   disabled={creatingDonation}
                 />
               </div>
               {selectedAction?.reason && (
                 <p className="mt-1 text-xs text-gray-500">{selectedAction.reason}</p>
               )}
             </div>
            
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Notes (Optional)
               </label>
               <textarea
                 value={donationNotes}
                 onChange={(e) => setDonationNotes(e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded"
                 rows={3}
                 placeholder="Add notes about this donation..."
                 disabled={creatingDonation}
               />
             </div>
           </div>
          
           <div className="flex justify-end space-x-3 mt-6">
             <button
               onClick={handleModalClose}
               className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
               disabled={creatingDonation}
             >
               Cancel
             </button>
             <button
               onClick={handleCreateDonation}
               disabled={creatingDonation || selectedAmount <= 0}
               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {creatingDonation ? (
                 <span className="flex items-center">
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                   </svg>
                   Creating...
                 </span>
               ) : (
                 `Create $${selectedAmount.toFixed(2)} Donation`
               )}
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}
