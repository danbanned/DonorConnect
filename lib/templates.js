export const templates = [
  {
    id: 'thank-you-basic',
    name: 'Thank You – General',
    subject: 'Thank you for your support',
    category: 'THANK_YOU',
    content: `
Hi {{firstName}},

Thank you so much for your generous donation{{amount}}.
Your support makes a real difference.

Warm regards,
The Team
    `.trim(),
  },
  {
    id: 'follow-up-checkin',
    name: 'Follow Up – Check In',
    subject: 'Just checking in',
    category: 'FOLLOW_UP',
    content: `
Hi {{firstName}},

I just wanted to follow up and see how things are going.
Let me know if you have any questions.

Best,
The Team
    `.trim(),
  },
  {
    id: 'year-end',
    name: 'Year End Giving',
    subject: 'End of year appreciation',
    category: 'YEAR_END',
    content: `
Hi {{firstName}},

As the year comes to a close, we want to thank you for your continued support.

Gratefully,
The Team
    `.trim(),
  },
]
