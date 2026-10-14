'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Phase = 'idle' | 'active' | 'done';

/** Thin bar at the top of every page. Starts when a visitor opens another page on this site. */
export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = `${pathname}?${searchParams.toString()}`;
  const [phase, setPhase] = useState<Phase>('idle');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPhase((current) => (current === 'active' ? 'done' : current));
    const hide = window.setTimeout(() => {
      setPhase((current) => (current === 'done' ? 'idle' : current));
    }, 280);
    return () => window.clearTimeout(hide);
  }, [route]);

  useEffect(() => {
    if (phase !== 'active') return;
    const giveUp = window.setTimeout(() => setPhase('idle'), 12000);
    return () => window.clearTimeout(giveUp);
  }, [phase]);

  useEffect(() => {
    const start = () => setPhase('active');

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (`${url.pathname}?${url.searchParams.toString()}` === route) return;
      start();
    };

    window.addEventListener('popstate', start);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('popstate', start);
      document.removeEventListener('click', onClick, true);
    };
  }, [route]);

  if (phase === 'idle') return null;

  return (
    <div
      className={`route-progress${phase === 'done' ? ' is-done' : ' is-active'}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading page"
    >
      <span />
    </div>
  );
}
