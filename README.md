DonorConnect
Smart CRM & Donor Relationship Platform
DonorConnect is an intelligent donor management platform designed to help nonprofits, schools, and philanthropic organizations build stronger donor relationships through automation, insights, and streamlined workflows.

✨ Overview
The Challenge
Nonprofit organizations like Green Street Friends School face significant challenges in donor management:

Difficulty maintaining consistent, strategic donor relationships

Disorganized or incorrect donor data in existing systems

No automated preparation for donor meetings

Inconsistent tracking of donor retention (LYBUNT/SYBUNT)

Time-consuming manual processes that divert staff from mission-critical work

Our Solution
DonorConnect transforms donor management by providing:

Human-first donor profiles with complete relationship history

AI-powered insights and meeting preparation briefs

Automated tracking of donor retention and engagement

Clean, intuitive interface that anyone can use

Seamless integration with existing workflows

🎯 Core Features
📋 Donor Management
Comprehensive Donor Profiles

Contact information with preferred communication methods

Complete donation history with year-by-year tracking

Personal interests, hobbies, and relationship notes

Volunteer involvement and custom fields

Visual pledge indicators with payment schedules

Smart Donor Discovery

"Know Your Donor" insights before every interaction

Relationship stage tracking

Personal details like "hobbies for kids" for meaningful connections

📊 Donor Insights & Analytics
AI-Powered Insights Engine

Engagement & Behavior Insights - Giving trends and patterns

Giving & Financial Insights - Lifetime value and capacity indicators

Relationship Insights - Communication effectiveness and sentiment

Data Quality Insights - Missing information and duplicate detection

Smart Recommendations - Next best actions and ask amounts

Real-time Dashboard

Donation totals and campaign progress

Year-over-year growth metrics

Data quality scoring system

Custom report generation for taxes and annual summaries

💰 Donation Tracking
Modern Donations Database

No spreadsheets, clean data structure

Soft credits and relationship tracking

OnTrend analysis for giving patterns

LYBUNT/SYBUNT Tracking

Automated "gave last year but not this year" filtering

Donor risk indicators and retention alerts

Staff reminders for follow-up

Smart Donation Forms

Suggested donation amounts based on past giving

One-time and recurring options

Personalized URLs and QR codes for campaigns

Automatic duplicate prevention

Multiple payment methods with instant receipts

📞 Communication Tools
Unified Communication Log

Track emails, calls, meetings, and thank-you notes

Multi-channel messaging (Email, SMS future-ready)

Calendar integration for follow-ups

Automated Appreciation Workflow

Yearly personalized appreciation reports

Template system for thank-you messages

Interest-based personalized touches

⚡ Automation Features
Donor Meeting Briefs

Automatically generated before scheduled meetings

Includes: giving history, recent gifts, relationship notes, interests

Risk flags, talking points, and LYBUNT status

Delivered one day before meetings

Daily Preparation Summary

Morning emails with: today's donor tasks, meeting briefs

At-risk donor alerts, new donations, data issues

🛠️ Technical Implementation
Frontend
React with Vite for fast development

Clean CSS with responsive design

Intuitive navigation with dropdown panel system

"Book Now" workflow for scheduling donor meetings

Backend
Node.js with modular architecture

REST API for all operations

Email.js integration for communications

Database & Storage
PostgreSQL for primary data storage

Local caching for fast data display

Secure payment data handling

Security & Compliance
Encrypted donor data at rest and in transit

Role-based access control (Admin, Staff)

Privacy-compliant data handling

Secure authentication system

🚀 Getting Started
Prerequisites
Node.js 18+

PostgreSQL 14+

npm or yarn

Installation
bash
# Clone repository
git clone https://github.com/yourorg/donorconnect.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Set up database
npm run db:setup

# Start development server
npm run dev
Configuration
Set up your organization profile

Configure payment processing (Stripe integration)

Import existing donor data (CSV/Excel support)

Set up email templates and automation rules

Invite team members with appropriate roles

📖 Usage Guide
For Development Teams
javascript
// Example: Creating a donor profile
const newDonor = await DonorConnect.createDonor({
  name: "Jane Smith",
  email: "jane@example.com",
  interests: ["education", "arts"],
  preferredContact: "email"
});

// Example: Generating meeting brief
const brief = await DonorConnect.generateBrief(donorId, meetingDate);
For Nonprofit Staff
Dashboard Overview - Start your day with the daily summary

Donor Profiles - Click any donor to see complete history

Schedule Meetings - Use "Book Now" to schedule and automatically generate briefs

Log Interactions - Track all communications in one place

Run Reports - Generate LYBUNT reports, tax receipts, and campaign analytics

🔧 API Reference
Key Endpoints
GET /api/donors - List donors with filtering

POST /api/donors - Create new donor

GET /api/donors/:id/insights - Get donor insights

GET /api/donors/:id/brief - Generate meeting brief

POST /api/donations - Record donation

GET /api/analytics/lybunt - LYBUNT report

Webhooks
donor.meeting_scheduled - Trigger meeting brief generation

donation.received - Update donor records and send receipts

data.quality_alert - Notify of data issues

🏗️ Project Structure
text
donorconnect/
├── client/                 # React frontend
│   ├── src/components/    # Reusable components
│   ├── src/pages/         # Page components
│   └── src/hooks/         # Custom React hooks
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── models/            # Database models
├── shared/                 # Shared utilities
└── docs/                  # Documentation
📈 Business Model (Future)
Subscription Tiers
Starter: Basic donor management for small organizations

Professional: Full automation and insights for growing nonprofits

Enterprise: Custom integrations and premium support

Add-on Services
Advanced analytics and forecasting

Premium email automation

Custom integration development

Training and implementation support

🤝 Contributing
We welcome contributions! Please see our Contributing Guidelines for details.

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Inspired by the needs of Green Street Friends School and similar nonprofits

Built with the support of the nonprofit technology community

Special thanks to all our beta testers and early adopters

📞 Support
For support, feature requests, or bug reports:

📧 Email: support@donorconnect.com

🐛 Issue Tracker

📚 Documentation

🧡 DonorConnect — Core Feature A: Donor Management
A1. Donor Profiles (Human-First Design)
Goal
Every donor profile should feel like:
“Oh, I understand this person.”
Not:
“I’m looking at a database record.”

🪪 Donor Profile Layout (Simple + Familiar)
Think Facebook profile meets contact card, not a spreadsheet.
Top Section (Always Visible)
Big. Clear. Friendly.
👤 Name


📞 Phone | 📧 Email


⭐ Preferred way to contact (Call / Email / Text)


🟢 Relationship stage (New / Active / Long-time / Major)


❤️ Last action taken (e.g. “Thank-you sent 2 days ago”)


This answers the grandma question:
 “Who is this person and what should I do next?”

💸 Donation History (Visual, Not Mathy)
Instead of tables → use cards + labels
Shows:
Total given (big number)


Gave this year? Yes / No (LYBUNT flagged clearly)


Year-by-year gifts (simple list)


Largest gift


🟡 LYBUNT Example:
⚠️ “Gave last year but not yet this year”
No acronyms shown unless explained.

🧠 Relationship & Notes (Story-Based)
Plain language sections:
What they care about


Past conversations


Personal notes


Examples:
“Loves education programs”


“Has two grandkids — mentions them often”


“Prefers handwritten thank-you notes”


✏️ Notes feel like a notebook, not a CRM form.

🤝 Involvement Snapshot
Visual icons instead of text walls:
🙋 Volunteer: Yes / No


🎟 Attends events: Often / Sometimes / Never


📬 Email engagement: High / Medium / Low


Hover or tap = explanation in simple words.

🧩 Custom Fields (Optional, Friendly)
Instead of “Custom Fields”, label it:
“Things I want to remember”
Examples:
“Hobbies for the kids”


“Prefers calls in the evening”


“Retired teacher”


No required fields. Nothing intimidating.

🧭 Relationship Stage (Very Simple)
Shown as a progress path:
New → Getting to Know → Supporter → Champion

Only one is highlighted.
 Tooltip explains each stage in one sentence.

🔔 Smart, Gentle Suggestions (Not Commands)
At the bottom of the profile:
Suggested Next Step
(Only 1–2 suggestions at a time)
Examples:
“Send a thank-you note”


“Schedule a check-in call”


“Invite to upcoming event”


Big buttons. Clear language.

🧓 Grandma-Proof UX Rules
Absolutely required for DonorConnect:
No dropdowns with 50 options


No CRM jargon without explanation


One main action per screen


Clear “Save” and “Cancel” buttons


Undo available


Nothing breaks if a field is empty



🔄 Multiple CRMs (Without Confusion)
Since different CRMs can be used, DonorConnect should:
Behind the scenes:
Sync with Salesforce, Bloomerang, Neon, etc.


Normalize data quietly


For the user:
They never see “which CRM”


It just says:


 “This donor is synced and up to date”



No imports. No mapping screens. No stress.

🧠 Design Principle (This is your thesis)
DonorConnect doesn’t manage data.
 It helps people remember people.
If you want next, I can:
Turn this into wireframe descriptions


Rewrite this as product documentation


Create user stories for investors


Simplify it even further for an MVP


Map this to database models (Prisma-friendly)


1️⃣ Engagement & Behavior Insights
Automatically generated from user activity.
Website & Platform Activity
Pages visited most often


Time spent on donation pages


Frequency of visits (daily / weekly / monthly)


Last activity date


Drop-off points (where they stop engaging)


Email Engagement
Email open rate (last 30 / 90 days)


Link click-through behavior


Engagement trend (increasing / decreasing)


Emails ignored consistently


Event Interaction
Event registrations vs attendance


Event attendance frequency


Event type preference (fundraisers, galas, webinars)


📌 Insight Example:
“Donor engagement has increased 35% in the last 60 days.”

2️⃣ Giving & Financial Insights
These help nonprofits understand who to focus on and how.
Donation Patterns
Giving frequency (one-time, recurring, seasonal)


Average donation amount


Preferred giving time (holidays, campaigns)


Payment method preference


Donor Lifetime Value (DLV)
Total donated since first contribution


Projected future giving value


Year-over-year giving comparison


Upgrade Potential
Likelihood to increase donation amount


Donors close to becoming major donors


Donors who downgraded giving


📌 Insight Example:
“This donor typically increases contributions during year-end campaigns.”

3️⃣ Relationship & Communication Insights
Focuses on human relationships, not just numbers.
Contact History
Last personal interaction date


Last thank-you sent


Number of touchpoints this year


Responsiveness
Responds quickly to emails


Prefers phone vs email


Most responsive day/time


Sentiment Indicators
Positive responses to outreach


Neutral or cold engagement trends


No response for X days


📌 Insight Example:
“No personal outreach in the last 90 days — recommend check-in.”

4️⃣ Data Quality & Health Insights
These keep your CRM clean and trustworthy.
Data Integrity
Missing email / phone / address


Invalid or bounced emails


Incomplete donor profiles


Duplicate Detection
Similar names + emails


Same payment methods


Shared addresses


Inconsistencies
Conflicting contact preferences


Multiple organizations tied incorrectly


Outdated job titles or affiliations


📌 Insight Example:
“Possible duplicate detected — review before next campaign.”

5️⃣ AI-Powered Recommendations
This is where your product becomes smart, not just functional.
Suggested Actions
“Send a thank-you note”


“Schedule a follow-up meeting”


“Invite to upcoming event”


“Ask for recurring donation”


“Re-engage with impact story”


Timing Suggestions
Best day to reach out


Best channel (email vs call)


Follow-up reminders


📌 Insight Example:
“Recommended: Send appreciation email within 48 hours of donation.”

6️⃣ Notifications & Alerts
Helps teams stay proactive, not reactive.
Automated Alerts
Meeting reminder (1 day before)


Donation anniversary reminders


Lapsed donor alert


Major donation alert


New engagement spike alert


Smart Notifications
“This donor just visited your donation page”


“High-value donor opened your email twice today”


“Donor hasn’t engaged in 120 days”


📌 Insight Example:
“High-priority donor re-engaged — follow up today.”

7️⃣ Campaign & Impact Insights
Useful for leadership and reporting.
Campaign Performance
Donor response by campaign


Conversion rate per campaign


Revenue generated per channel


Donor Attribution
What campaign first brought them in


What keeps them engaged


Impact Alignment
Donors aligned with specific causes


Program interest matching


📌 Insight Example:
“This donor consistently supports education-focused campaigns.”

8️⃣ Visual Insight Components (UI Ideas)
These make insights easy to understand:
Donor health score (0–100)


Engagement trend graphs


Donation heatmaps


Action priority badges


Timeline of interactions



9️⃣ Advanced / Future Insights (Roadmap-level)
Great for pitching your app’s potential.
Churn risk prediction


Major donor likelihood score


Suggested donation amount


Personalized message drafting


Automated follow-up sequences



🚀 Summary (Product-Level)
Your donor insights system should answer:
Who needs attention?


What should we do next?


When is the best time?


How valuable is this relationship long-term?


If you want, I can:
Turn this into product documentation


Design dashboard sections


Create user stories


Write feature descriptions for pitching


Help you define MVP vs advanced features
.

🎯 Donor Ask List (Smart Ask Amounts)
What it is
An automatically generated list that suggests personalized donation ask amounts for each donor based on:
Past donation history


Engagement level


Frequency of giving


Recency of interaction


Instead of guessing, fundraisers get clear, confidence-based ask recommendations.

🧠 How the Donor Ask List Works
Inputs used:
Average donation amount


Largest previous donation


Donation frequency


Engagement score (emails, site visits, events)


Time since last donation



💰 Ask Amount Tiers (Example)
Low Engagement / First-Time Donors
Suggested Ask: $10 – $25


Goal: Build habit, reduce friction


📌 Insight:
“First-time donor — recommend low-barrier ask.”

Recurring or Moderate Donors
Suggested Ask: $50 – $100


Based on their average donation


📌 Insight:
“Typically donates $50 — recommend $75 ask.”

Highly Engaged Donors
Suggested Ask: $150 – $250


Based on engagement + past increases


📌 Insight:
“High engagement and consistent giving — consider increased ask.”

Major Donor Prospects
Suggested Ask: $500 – $2,500+


Based on lifetime value + involvement


📌 Insight:
“High lifetime value donor — recommend personal outreach before ask.”

📊 Ask Amount Calculation (Simple Logic)
Example logic (non-technical explanation):
Suggested Ask = Average Donation × Engagement Multiplier
Where:
Low engagement → 1.1×


Medium engagement → 1.3×


High engagement → 1.5×


Example:
Average donation: $100


High engagement multiplier: 1.5


Suggested ask: $150



🧩 Donor Ask List Output (What staff sees)
Each donor row includes:
Donor name


Engagement score


Last donation amount


Suggested ask amount


Confidence level (Low / Medium / High)


Recommended action


Example row:
Taylor Smith
 Engagement: High
 Last Gift: $100
 💡 Suggested Ask: $150
 Action: Schedule personal outreach

🔔 Smart Ask Recommendations (AI-style)
The system can also say how to ask:
“Send personalized email with impact story”


“Schedule 1-on-1 meeting before asking”


“Invite to event, then follow up with ask”


“Convert to monthly donor at $25/month”



🔄 Ask List Triggers (When it updates)
After a donation


After major engagement (event, email click)


After 30 / 60 / 90 days of inactivity


Before major campaigns



🖥️ UI Ideas for Donor Ask List
Visual elements:
💵 Suggested ask badge


🔥 High-priority indicator


📈 Engagement trend arrow


⏰ Best time to ask


Example layout:
Donor Name | Engagement | Last Gift | Suggested Ask | Action
------------------------------------------------------------
Taylor     | High       | $100      | $150          | Follow up
Jordan     | Medium     | $50       | $75           | Email ask
Alex       | Low        | $25       | $25           | Thank-you first


🛡️ Ethical Guardrails (Important)
Include system rules like:
Never increase ask more than 50% at once


Require human approval for major asks


Flag donors showing fatigue


Respect communication preferences



🧠 Advanced / Future Enhancements
Perfect for roadmap slides:
Multiple ask options ($100 / $150 / $200)


Campaign-specific ask suggestions


Suggested messaging tone


Predictive ask success rate


Auto-generated email drafts



🚀 Why this feature is powerful
This turns your app into:
A decision assistant


A fundraising coach


A relationship-first CRM


It answers:
“What should I ask this donor for — right now?”
If you want, I can:
Turn this into user stories


Write product specs


Create UX copy


Help design the dashboard layout


Translate it into simple MVP logic


Just tell me what you need next.

Email & Donor Communication Engine



Hypothetical situations -

situation
Yearly-monthly Followups, thank you for your donation in 2022 we notice you didnt make a donation in 2023
situation
Hey linda we thank you for attending the giveback event heres how you contributed to the community
Situation
“Thank you for your support in 2022. We noticed you haven’t had a chance to give in 2023, and we wanted to share how your past generosity continues to make an impact.”
Situation
“Hi Linda, thank you for attending the Giveback Event. Your participation helped support students and strengthen our community—here’s what your involvement made possible.”
Situation
“Thank you for your generous gift. Your donation directly supports this year’s campaign and moves us closer to our goal.”
Situation
“Thanks to your support, we’ve reached 75% of our goal. Here’s how your contribution fits into the bigger picture.”
situation ;
“We’ve loved having you involved. Many volunteers choose to support our mission through a gift—here’s how you can help.”
situation
“We missed you at this year’s event and wanted to share how the community came together.”
situation
“Thank you for taking the time to meet. Here’s a recap of what we discussed and what’s coming next.”



1. Smart Donor Lists (Filtering & Queries)
Staff can create dynamic email lists using:
LYBUNT / SYBUNT status


Donation history (amounts, frequency, gift type)


Engagement signals (emails opened, links clicked, events attended)


Campaign participation


Custom queries and saved filters


Lists automatically update as donor data changes, ensuring messages are always sent to the right people.

2. Donation Summary Builder (Per Donor)
Each email can include a clear, auto-generated donation summary with editable sections:
Summary Columns (At-a-Glance):
Gift type (cash, in-kind, material, services)


Total amount donated


Campaign or fund supported


Impact Section (Expandable):
Description of in-kind or material contributions


How the donation contributed to the campaign goal


Current campaign status (progress bar or percentage)


Emotional, educational, or community impact explanation


Staff Controls:
Checkbox toggles to include/exclude sections


Inline editing for tone or clarity



3. AI-Powered Personalization (Optional, Assisted)
An AI assistant uses donor insights to:
Match donors to the correct email list


Generate personalized content based on:


Giving history


Interests and relationship stage


Recent engagement or meetings


Messages are categorized into selectable types:
Thank-you note


Follow-up message


Donation ask


Event or meeting invitation


Staff can edit everything manually—AI is assistive, never automatic.

4. Email Composer Experience (Grandma-Simple UX)
Dropdown to select message type


Live preview per donor


Plain-language controls (no technical setup)


One-click send or schedule


Automatic logging to the donor communication history



5. Post-Send Insights
After sending:
Open and click tracking


Donation responses tied to the email


AI suggestions (“Follow up with this donor”, “Send appreciation note”)



Copilot Prompt: Build DonorConnect Donor Management App
text
## Project Context
I'm building DonorConnect - a smart CRM and donor relationship management platform for nonprofit organizations. The app needs to help nonprofits like schools manage donor relationships, track donations, and automate communication. The target user is nonprofit staff who need a simple, intuitive system that reduces their workload while improving donor engagement.

## Tech Stack Requirements
- Frontend: React with Vite, modern CSS
- Backend: Node.js with Express or similar framework
- Database: PostgreSQL with local caching
- Key Integrations: Email.js for communications, calendar integration for scheduling
- Security: Encrypted data, role-based access (Admin, Staff), privacy compliance

## Core User Stories & Features to Implement

### 1. Donor Management Module
User Story: As a nonprofit staff member, I want to view complete donor profiles so I can understand their history and preferences without digging through multiple systems.

Requirements:

Create donor profile pages showing:

Basic info: name, contact, preferred communication method

Donation history with year-by-year breakdown

Personal interests/hobbies section

Relationship notes from past interactions

Visual pledge indicator (blue "Pledge" box) showing:

Total pledged amount

Payment schedule

Amount paid vs. remaining

Next payment due date

Implement "LYBUNT/SYBUNT" flagging (gave Last Year But Unfortunately Not This Year)

Allow custom fields like "hobbies for the kids"

Design must be intuitive, human-first, with key info visible at glance

text

### 2. Donation Tracking System
User Story: As a staff member, I want to log and track donations in a clean, spreadsheet-free system that automatically flags retention risks.

Requirements:

Modern donations database with soft credits & relationships

LYBUNT tracking with automated reminders

Donation form with:

Smart suggested amounts based on past giving

One-time and recurring options

Minimal required fields with plain-language labels

Automatic duplicate prevention

QR code generation for campaign-specific forms

Instant confirmation and receipts

Real-time sync to donor profiles

text

### 3. Donor Insights & Meeting Preparation
User Story: As a staff member, I want automated donor briefs before meetings so I'm properly prepared without hours of research.

Requirements:

AI-powered insights generating:

Engagement trends

Giving patterns

Relationship health scores

Data quality alerts (missing info, duplicates)

Smart ask amount recommendations

Automated meeting briefs (generated 1 day before meeting) containing:

All-time giving summary

Most recent gift details

Relationship notes and interests

Risk flags and LYBUNT status

Recommended talking points

Daily email summary with:

Today's donor tasks

Meeting briefs for scheduled meetings

At-risk donor alerts

text

### 4. Communication & Automation
User Story: As a staff member, I want to track all donor communications in one place and automate thank-yous and follow-ups.

Requirements:

Unified communication log (emails, calls, meetings, notes)

Multi-channel messaging (Email.js integration, future SMS)

Automated appreciation workflows:

Yearly personalized reports

Template system for thank-you messages

Interest-based personalization

Calendar integration for scheduling and reminders

text

### 5. Analytics & Dashboard
User Story: As an administrator, I want real-time analytics on donation trends and data quality so I can make informed decisions.

Requirements:

Dashboard showing:

Real-time donation totals

Campaign progress

Year-over-year growth

Data quality score (missing emails, duplicates, incomplete entries)

Custom report generator for:

Tax receipts

Annual summaries

Campaign performance

Donor retention metrics

Trend forecasting based on historical data

text

## UI/UX Requirements
- Clean React interface with smooth navigation
- Two-panel dropdown layout (similar to "Herbal page" reference)
- "Book Now / Calendar" workflow for scheduling
- Simple, intuitive forms with clear labels
- Mobile-responsive design
- Minimal learning curve for nonprofit staff

## Architecture Guidelines
Frontend Structure:
src/
├── components/
│ ├── donors/ # Donor-related components
│ ├── donations/ # Donation forms and tracking
│ ├── insights/ # Analytics and reporting
│ ├── communications/ # Messaging and logs
│ └── shared/ # Reusable UI components
├── pages/ # Main application pages
├── hooks/ # Custom React hooks
├── services/ # API service calls
└── utils/ # Helper functions

Backend Structure:
server/
├── routes/
│ ├── donors.js # Donor CRUD operations
│ ├── donations.js # Donation processing
│ ├── insights.js # Analytics and reporting
│ └── communications.js # Email and messaging
├── controllers/ # Business logic
├── models/ # Database models
├── middleware/ # Auth, validation, etc.
└── services/ # External service integrations

text

## Database Schema Hints
- Donors table with relationship tracking
- Donations table with soft credits
- Communications log table
- Campaigns/events table
- User roles and permissions table
- Pledges/payment schedules table

## Implementation Priority Order
1. **Week 1-2**: Set up project structure, basic donor profiles, donation logging
2. **Week 3-4**: Implement LYBUNT tracking, basic communications log
3. **Week 5-6**: Build insights engine, meeting brief automation
4. **Week 7-8**: Create dashboard, analytics, reporting
5. **Week 9-10**: Polish UI, add automation workflows, testing

## Security & Compliance Must-Haves
- Encrypt sensitive donor data (PII)
- Role-based access control (Admin vs Staff permissions)
- Secure payment processing integration
- GDPR/Privacy compliance for communications
- Audit logging for data changes

## Testing Requirements
- Unit tests for donation calculations and LYBUNT logic
- Integration tests for donor profile updates
- End-to-end tests for donation form workflow
- Performance testing for dashboard with large datasets

## Code Generation Instructions for Copilot
When generating code, please:
1. Use TypeScript for type safety where possible
2. Include comprehensive error handling
3. Add clear comments for complex business logic (especially LYBUNT calculations)
4. Follow React best practices (hooks, component composition)
5. Use PostgreSQL-optimized queries
6. Implement proper validation on all forms
7. Include loading states and error boundaries
8. Use environment variables for configuration

## Special Focus Areas
- The LYBUNT/SYBUNT logic must be 100% accurate
- Meeting brief generation should be fast and comprehensive
- Donor profiles should load instantly (consider local caching)
- The system must prevent duplicate donor records
- All automation should have manual override options

## Questions to Consider While Building
1. How can we make this so simple that even non-technical nonprofit staff can use it immediately?
2. How do we ensure data accuracy while minimizing manual data entry?
3. What's the most intuitive way to visualize donor relationship health?
4. How can we automate without losing the personal touch nonprofits need?
5. What safeguards prevent staff from missing critical donor communications?

Start by creating the basic project structure, then implement donor profiles first, as this is the foundation of the entire system.
