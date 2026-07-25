'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thin progress bar that appears at the top of the page during navigation.
 * Uses pathname + searchParams changes to detect route transitions.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevRouteRef = useRef(`${pathname}${searchParams}`);

  useEffect(() => {
    const currentRoute = `${pathname}${searchParams}`;

    // Detect actual route change (ignore initial mount)
    if (prevRouteRef.current === currentRoute) return;
    prevRouteRef.current = currentRoute;

    // Clear any existing animation
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Instantly jump to 100% and fade out — route is already done
    setProgress(100);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => setProgress(0), 300);
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathname, searchParams]);

  // Also show a "loading" state while waiting for the route change to begin
  // by hooking into link click events
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
      if (target.getAttribute('target') === '_blank') return;

      // Start the progress bar immediately on click
      setVisible(true);
      setProgress(0);

      // Animate to ~85% quickly, then slow down (simulating loading)
      let prog = 0;
      const animate = () => {
        prog = prog < 50 ? prog + 8 : prog < 75 ? prog + 3 : prog < 85 ? prog + 0.5 : prog;
        setProgress(Math.min(prog, 85));
        if (prog < 85) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0
            ? 'none'
            : progress === 100
            ? 'width 0.1s ease-out'
            : 'width 0.4s ease-out',
          opacity: visible ? 1 : 0,
          transitionProperty: 'width, opacity',
          transitionDuration: visible ? '0.1s, 0s' : '0.1s, 0.3s',
        }}
      />
    </div>
  );
}
