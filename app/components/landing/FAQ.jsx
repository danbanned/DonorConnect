'use client';

import { useState } from 'react';
import Container from './ui/Container';
import Button from './ui/Button';
import styles from './FAQ.module.css';

const items = [
  {
    q: 'How does DonorConnect use AI for fundraising?',
    a: 'We use AI to suggest ask amounts, summarize donor histories, and automate stewardship follow-ups.'
  },
  {
    q: 'What\'s included in the free trial?',
    a: 'You get full access to core CRM features, automation, and reporting during your evaluation period.'
  },
  {
    q: 'Can I import data from Excel or other CRMs?',
    a: 'Yes. Our migration team supports spreadsheets and common CRM exports with validation.'
  },
  {
    q: 'Does DonorConnect integrate with QuickBooks?',
    a: 'Yes. DonorConnect supports financial integrations including QuickBooks workflows.'
  },
  {
    q: 'Is my donor data secure?',
    a: 'Data is encrypted in transit and at rest, with role-based permissions and audit logging support.'
  },
  {
    q: 'What support options are available?',
    a: 'Email support, onboarding guidance, migration support, and premium response tiers are available.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className={styles.section}>
      <Container>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        <div className={styles.list}>
          {items.map((item, index) => (
            <article key={item.q} className={styles.item}>
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className={styles.question}>
                <span>➕ {item.q}</span>
              </button>
              {openIndex === index && <p className={styles.answer}>{item.a}</p>}
            </article>
          ))}
        </div>
        <div className={styles.actions}>
          <Button href="#solution" variant="secondary">BACK TO OVERVIEW ➔</Button>
        </div>
      </Container>
    </section>
  );
}
