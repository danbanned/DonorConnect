export const donorTerms = {
  LYBUNT: {
    term: 'LYBUNT',
    fullName: 'Last Year But Unfortunately Not This',
    definition: 'Donors who gave in the previous fiscal year but have not yet given in the current fiscal year.',
    importance: 'High',
    action: 'These donors should be prioritized for re-engagement as they have shown commitment but may be at risk of lapsing.',
    calculation: 'Total number of donors who gave in previous fiscal year but not in current fiscal year.',
  },
  SYBUNT: {
    term: 'SYBUNT',
    fullName: 'Some Year But Unfortunately Not This',
    definition: 'Donors who gave in any previous year but have not given in the current fiscal year.',
    importance: 'Medium',
    action: 'These donors have a history of giving and may respond well to targeted re-engagement campaigns.',
    calculation: 'Total number of donors who gave in any previous year but not in current fiscal year.',
  },
  MAJOR_DONOR: {
    term: 'Major Donor',
    definition: 'A donor who makes significant contributions, typically defined by your organization\'s giving thresholds.',
    importance: 'High',
    action: 'Requires special stewardship and personalized attention. Often cultivated for larger gifts and legacy giving.',
    threshold: 'Typically $10,000+ annually or cumulative giving over $50,000',
  },
  PLEDGE: {
    term: 'Pledge',
    definition: 'A commitment to give a specific amount over a defined period, often paid in installments.',
    importance: 'High',
    action: 'Requires tracking of payments and regular updates to donors on pledge fulfillment.',
    types: 'Can be annual, multi-year, or campaign-specific',
  },
  SOFT_CREDIT: {
    term: 'Soft Credit',
    definition: 'Credit given to a donor for a gift made by someone else, such as a matching gift or spouse\'s donation.',
    importance: 'Medium',
    action: 'Important for recognizing total influence and engagement of major supporters.',
    examples: 'Matching gifts, tribute gifts, corporate matches',
  },
  RELATIONSHIP_STAGE: {
    term: 'Relationship Stage',
    definition: 'The current phase in the donor\'s journey with your organization.',
    stages: {
      NEW: 'First-time donor or new prospect',
      CULTIVATION: 'Building relationship, learning interests',
      ASK_READY: 'Prepared for a specific ask',
      STEWARDSHIP: 'Post-gift relationship building',
      MAJOR_GIFT: 'Major donor cultivation',
      LEGACY: 'Planned giving prospects'
    }
  },
  RECURRING_GIFT: {
    term: 'Recurring Gift',
    definition: 'Regular, automatic donations made on a set schedule (monthly, quarterly, annually).',
    importance: 'High',
    action: 'Provides predictable revenue. Requires excellent stewardship to maintain.',
    benefits: 'Higher retention rates, predictable income, lower acquisition costs',
  }
}

export const metricsTerms = {
  RETENTION_RATE: {
    term: 'Retention Rate',
    definition: 'Percentage of donors who continue to give from one period to the next.',
    calculation: '(Returning donors this period / Total donors last period) × 100',
    target: 'Nonprofit average: 45-50%',
    importance: 'Critical for sustainable fundraising',
  },
  DONOR_LIFETIME_VALUE: {
    term: 'Donor Lifetime Value',
    definition: 'Total amount a donor is expected to give over their entire relationship with your organization.',
    calculation: 'Average gift amount × Average gift frequency × Average donor lifespan',
    importance: 'Helps determine acquisition cost limits',
  },
  ACQUISITION_COST: {
    term: 'Acquisition Cost',
    definition: 'Total cost to acquire a new donor.',
    calculation: 'Total acquisition expenses / Number of new donors',
    importance: 'Should be less than first-year donor value',
  },
  UPGRADE_RATE: {
    term: 'Upgrade Rate',
    definition: 'Percentage of donors who increase their giving amount.',
    calculation: '(Donors who increased gift / Total donors) × 100',
    importance: 'Key metric for growth',
  }
}

export function explainTerm(term) {
  return donorTerms[term] || metricsTerms[term] || null
}

export function getGlossary() {
  return { ...donorTerms, ...metricsTerms }
}

export function formatTermForTooltip(term) {
  const definition = explainTerm(term)
  if (!definition) return ''

  return `
    <div class="p-2 max-w-xs">
      <strong class="block mb-1">${definition.term}</strong>
      ${definition.fullName ? `<em class="text-sm text-gray-600 block mb-2">${definition.fullName}</em>` : ''}
      <p class="text-sm mb-2">${definition.definition}</p>
      ${definition.importance ? `<p class="text-xs"><strong>Importance:</strong> ${definition.importance}</p>` : ''}
      ${definition.action ? `<p class="text-xs mt-1"><strong>Action:</strong> ${definition.action}</p>` : ''}
    </div>
  `
}