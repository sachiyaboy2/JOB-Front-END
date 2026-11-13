import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../utils/hooks.js";

/**
 * Count a number up when it scrolls into view.
 *
 *   <CountUp value={1240} suffix="+" />
 *
 * With reduced motion the final value is rendered immediately.
 */
export function CountUp({ value = 0, duration = 1600, decimals = 0, suffix = "", prefix = "", className = "" }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? Number(value) || 0 : 0);
  const started = useRef(false);

  useEffect(() => {
    setDisplay(reduced ? Number(value) || 0 : 0);
  }, [value, reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const target = Number(value) || 0;

    const animate = () => {
      if (started.current) return;
      started.current = true;

      if (reduced) {
        setDisplay(target);
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplay(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      animate();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, reduced]);

  const shown = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString("en-LK");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

export default CountUp;
