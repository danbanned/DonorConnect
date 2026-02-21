'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { formatCurrency, formatPercent, getMarketingData } from '../../lib/marketing'
import styles from './page.module.css'

export default function MarketingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const payload = await getMarketingData()
        setData(payload)
        setSelectedScenarioKey(payload?.scenario?.key || '')
      } catch (err) {
        setError(err.message || 'Failed to load marketing page')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const selectedScenario = useMemo(() => {
    if (!data?.segments?.length) return data?.scenario || null
    return data.segments.find((segment) => segment.key === selectedScenarioKey) || data.scenario
  }, [data, selectedScenarioKey])

  const totalSegmentUsers = useMemo(() => {
    return (data?.segments || []).reduce((sum, segment) => sum + (segment.count || 0), 0)
  }, [data])

  const engagementRate = Number(data?.summary?.engagementRate || 0)

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.state}>Loading marketing data...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.stateError}>{error || 'Unable to load marketing data.'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>CRM-Driven Marketing Experience</p>
          <h1>DonorConnect Marketing</h1>
          <p className={styles.subtitle}>
            This page adapts messaging, events, and CTAs based on donor behavior from your CRM data.
          </p>
        </header>

        <section className={styles.hero}>
          <div>
            <h2>{selectedScenario?.title}</h2>
            <p>{selectedScenario?.subtitle}</p>
            <div className={styles.heroActions}>
              <button type="button">{selectedScenario?.cta}</button>
              <button type="button" className={styles.secondaryBtn}>Register for Event</button>
            </div>
          </div>
          <div className={styles.scenarioPicker}>
            <label htmlFor="scenario">Behavior Scenario</label>
            <select
              id="scenario"
              value={selectedScenarioKey}
              onChange={(event) => setSelectedScenarioKey(event.target.value)}
            >
              {data.segments.map((segment) => (
                <option key={segment.key} value={segment.key}>
                  {segment.title} ({segment.count})
                </option>
              ))}
            </select>
            <p className={styles.smallText}>Powered by live CRM segments</p>
          </div>
        </section>

        <section className={styles.visualGrid}>
          <article className={styles.imagePanel}>
            <div className={styles.imageCard}>
              <Image src="/window.webp" alt="DonorConnect dashboard window visualization" width={560} height={320} />
              <p className={styles.imageCaption}>Live CRM dashboard view</p>
            </div>
            <div className={styles.imageCard}>
              <Image src="/globe.jpeg" alt="Community and supporter network visualization" width={560} height={320} />
              <p className={styles.imageCaption}>Community reach visualization</p>
            </div>
          </article>

          <article className={styles.insightPanel}>
            <h2>Behavior Visualization</h2>
            <div className={styles.donutWrap}>
              <div
                className={styles.donut}
                style={{
                  background: `conic-gradient(#0066b3 ${engagementRate}%, #dce6ef ${engagementRate}% 100%)`
                }}
              >
                <div className={styles.donutInner}>
                  <strong>{formatPercent(engagementRate)}</strong>
                  <span>Engagement</span>
                </div>
              </div>
            </div>

            <div className={styles.segmentBars}>
              {data.segments.map((segment) => {
                const ratio = totalSegmentUsers > 0
                  ? Math.round((segment.count / totalSegmentUsers) * 100)
                  : 0
                return (
                  <div key={segment.key} className={styles.segmentRow}>
                    <div className={styles.segmentLabel}>
                      <span>{segment.title}</span>
                      <span>{segment.count}</span>
                    </div>
                    <div className={styles.segmentTrack}>
                      <div className={styles.segmentFill} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className={styles.grid4}>
          <article className={styles.card}>
            <h3>Organizations</h3>
            <p>{data.summary.organizations}</p>
          </article>
          <article className={styles.card}>
            <h3>Total Raised</h3>
            <p>{formatCurrency(data.summary.totalRaised)}</p>
          </article>
          <article className={styles.card}>
            <h3>Active Campaigns</h3>
            <p>{data.summary.activeCampaigns}</p>
          </article>
          <article className={styles.card}>
            <h3>Engagement Rate</h3>
            <p>{formatPercent(data.summary.engagementRate)}</p>
          </article>
        </section>

        <section className={styles.section}>
          <h2>Events Section (Scenario-Triggered)</h2>
          <div className={styles.eventCard}>
            <h3>{selectedScenario?.event}</h3>
            <p>Why it matters: This event is auto-surfaced based on supporter behavior.</p>
            <p>Who it&apos;s for: {selectedScenario?.title}</p>
            <p>Next action: {selectedScenario?.cta}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Automation Triggers</h2>
          <ul className={styles.list}>
            {data.automationRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Giveaways & Incentives</h2>
          <div className={styles.eventCard}>
            <h3>{selectedScenario?.giveaway}</h3>
            <p>How to qualify: Take one of the recommended actions in this scenario.</p>
            <p>Reward: Supporter recognition + event/giveaway entry.</p>
            <p>Winner announcement: Included in monthly campaign update.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Accomplishments & Impact</h2>
          <div className={styles.impactGrid}>
            {data.accomplishments.map((item) => (
              <article key={item.title} className={styles.impactCard}>
                <h3>{item.title}</h3>
                <p>{formatCurrency(item.amountRaised || 0)}</p>
                <span className={styles.impactUse}>{item.whatDone}</span>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Campaign Progress</h2>
          <div className={styles.progressList}>
            {data.campaignProgress.map((campaign) => (
              <article key={campaign.id} className={styles.progressCard}>
                <div className={styles.progressHead}>
                  <h3>{campaign.name}</h3>
                  <span>{campaign.status}</span>
                </div>
                <p>{formatCurrency(campaign.raised)} raised of {formatCurrency(campaign.goal || 0)}</p>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${campaign.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Social Proof & Recognition</h2>
          <div className={styles.grid3}>
            <article className={styles.card}>
              <h3>Supporters</h3>
              <p>{data.socialProof.supporterCount}</p>
            </article>
            <article className={styles.card}>
              <h3>Upcoming Events</h3>
              <p>{data.socialProof.eventParticipation}</p>
            </article>
            <article className={styles.card}>
              <h3>Community Engagement</h3>
              <p>{formatPercent(data.socialProof.engagementRate)}</p>
            </article>
          </div>
        </section>

        <section className={styles.stickyCta}>
          {data.ctas.map((cta) => (
            <button type="button" key={cta.key}>{cta.label}</button>
          ))}
        </section>
      </div>
    </main>
  )
}
