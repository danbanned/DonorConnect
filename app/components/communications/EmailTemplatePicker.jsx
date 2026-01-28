'use client';

import { useState } from 'react';

const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Send to new users after signup',
    previewText: 'Welcome to our platform!',
    variables: ['firstName', 'lastName'],
    example: { firstName: 'John', lastName: 'Doe' }
  },
  {
    id: 'newsletter',
    name: 'Weekly Newsletter',
    description: 'Weekly updates and announcements',
    previewText: 'Here are this week\'s updates...',
    variables: ['firstName'],
    example: { firstName: 'John' }
  },
  {
    id: 'promotion',
    name: 'Promotional Offer',
    description: 'Special offers and discounts',
    previewText: 'Enjoy 20% off your next purchase!',
    variables: ['firstName'],
    example: { firstName: 'John' }
  },
  {
    id: 'custom',
    name: 'Custom HTML',
    description: 'Write your own HTML content',
    previewText: 'Your custom content here...',
    variables: [],
    isCustom: true
  }
];

export default function EmailTemplatePicker({ onTemplateSelect, selectedTemplate }) {
  const [showVariables, setShowVariables] = useState(false);

  const handleTemplateClick = (template) => {
    onTemplateSelect(template);
    setShowVariables(!!template.variables?.length);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select a Template</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {emailTemplates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              {template.isCustom && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Custom
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <div className="text-sm text-gray-500">
              <p className="truncate">Preview: {template.previewText}</p>
              {template.variables?.length > 0 && (
                <p className="mt-1 text-xs">
                  Variables: {template.variables.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showVariables && selectedTemplate?.variables?.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            Required Variables for {selectedTemplate.name}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            These variables will be replaced in your email template:
          </p>
          <ul className="space-y-2">
            {selectedTemplate.variables.map((variable) => (
              <li key={variable} className="flex items-center">
                <span className="inline-block w-32 text-sm font-medium text-gray-700">
                  {variable}:
                </span>
                <input
                  type="text"
                  placeholder={`Enter ${variable}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onChange={(e) => {
                    const value = e.target.value;
                    onTemplateSelect({
                      ...selectedTemplate,
                      variablesData: {
                        ...selectedTemplate.variablesData,
                        [variable]: value
                      }
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}