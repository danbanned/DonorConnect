import Link from 'next/link'
import { ArrowRightIcon, ChartBarIcon, UserGroupIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'
import './HomePage.css'

export default function HomePage() {
  const features = [
    {
      name: 'Smart Donor Profiles',
      description: 'Complete donor history with AI-powered insights and relationship tracking.',
      icon: UserGroupIcon,
    },
    {
      name: 'LYBUNT Tracking',
      description: 'Automatically identify donors who gave last year but not this year.',
      icon: ChartBarIcon,
    },
    {
      name: 'Automated Briefs',
      description: 'Get prepared for meetings with automatically generated donor summaries.',
      icon: ClockIcon,
    },
    {
      name: 'Donation Management',
      description: 'Track gifts, pledges, and recurring donations in one clean interface.',
      icon: CurrencyDollarIcon,
    },
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          Build Stronger
          <span className="hero-title-highlight"> Donor Relationships</span>
        </h1>
        <p className="hero-description">
          DonorConnect helps nonprofits cultivate meaningful relationships with smart insights, 
          automated workflows, and intuitive donor management tools.
        </p>
        <div className="hero-buttons">
          <Link
            href="/dashboard"
            className="btn-primary btn-large"
          >
            Get Started
            <ArrowRightIcon className="icon-inline icon-small" />
          </Link>
          <Link
            href="/donors"
            className="demo-link"
          >
            View Demo <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-subtitle">
              Everything you need
            </h2>
            <p className="features-title">
              Smart donor management made simple
            </p>
            <p className="features-description">
              Designed specifically for nonprofits to save time, improve donor retention, 
              and focus on what matters most—building relationships.
            </p>
          </div>
          <div className="features-grid">
            <dl className="features-list">
              {features.map((feature) => (
                <div key={feature.name} className="feature-item">
                  <dt className="feature-title">
                    <feature.icon className="feature-icon" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="feature-description">
                    <p className="feature-text">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2 className="cta-title">
          Ready to transform your donor relationships?
        </h2>
        <p className="cta-description">
          Join organizations like Green Street Friends School who are already using DonorConnect 
          to build stronger, more meaningful connections with their supporters.
        </p>
        <Link
          href="/dashboard"
          className="cta-button"
        >
          Start Free Trial
          <ArrowRightIcon className="icon-inline icon-small" />
        </Link>
      </div>
    </div>
  )
}