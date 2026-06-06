'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

export default function FAQ() {
  const faqs = [
    {
      q: 'How do I create a store?',
      a: 'Creating a store is simple. Just sign up for an account, choose your custom store subdomain, enter your branding info, upload your products, and go live! You can manage everything directly from your centralized Creator Dashboard.'
    },
    {
      q: 'Is coding required?',
      a: 'Absolutely not! LaunchCart is designed as a complete no-code platform. You can customize your storefront headers, layout sections, pricing rules, shipping options, and product inventories using our intuitive, highly visual UI panel.'
    },
    {
      q: 'Can I customize my store?',
      a: 'Yes! You have full control over your branding identity. You can set color palettes, edit hero descriptions, categorize products, publish featured collections, and toggle custom payment methods (Credit Cards, UPI, Cash on Delivery) in clicks.'
    },
    {
      q: 'How do payments work?',
      a: 'You can enable multiple payment integrations (Stripe, Razorpay, or custom Cash on Delivery) in your Payments settings. LaunchCart automatically calculates taxes, flats, and shipping costs at checkout, giving your clients a seamless buying flow.'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);
  console.log('[FAQ] Rendered. activeIndex:', activeIndex);

  const toggleFAQ = (index) => {
    console.log('[FAQ] Toggle index:', index, 'current activeIndex:', activeIndex);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Got Questions?</span>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.description}>
            Everything you need to know about our e-commerce SaaS platform.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className={styles.accordion}>
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx} 
                className={`${styles.item} ${isOpen ? styles.openItem : ''} dashboard-card`}
              >
                <button 
                  className={styles.questionRow} 
                  onClick={() => toggleFAQ(idx)}
                >
                  <span className={styles.questionText}>{faq.q}</span>
                  <span className={styles.icon}>{isOpen ? '−' : '+'}</span>
                </button>

                <div className={`${styles.answerPanel} ${isOpen ? styles.openPanel : ''}`}>
                  <p className={styles.answerText}>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
