'use client';

import { useState } from 'react';
import RichText from './RichText';
import type { Feature } from '@/lib/types';

export default function ProductTabs({
  overview,
  features,
}: {
  overview: string;
  features: Feature[];
}) {
  const tabs: { id: 'overview' | 'features'; label: string }[] = [];
  if (overview) tabs.push({ id: 'overview', label: 'Overview' });
  if (features.length) tabs.push({ id: 'features', label: 'Key Features' });

  const [active, setActive] = useState<'overview' | 'features'>(tabs[0]?.id ?? 'overview');
  if (tabs.length === 0) return null;

  return (
    <section className="tabs-section">
      <div className="container">
        <div className="tablist" role="tablist" aria-label="Product information">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls={`panel-${t.id}`}
              className={active === t.id ? 'tab active' : 'tab'}
              onClick={() => setActive(t.id)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {active === 'overview' && overview && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="tabpanel">
            <RichText text={overview} />
          </div>
        )}

        {active === 'features' && features.length > 0 && (
          <div role="tabpanel" id="panel-features" aria-labelledby="tab-features" className="tabpanel">
            <ul className="feature-list">
              {features.map((f, i) => (
                <li key={i}>
                  <span className="check" aria-hidden="true">
                    &#10003;
                  </span>
                  <div>
                    {f.title && <strong>{f.title}</strong>}
                    {f.text && <p>{f.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
