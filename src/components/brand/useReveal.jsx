import { useEffect, useRef } from "react";

/**
 * Adds `.is-visible` to an element when it scrolls into view.
 *
 * `useReveal()` returns a ref you put on the element and a callback that
 * re-checks visibility (call it after data loads so a late-arriving list
 * still animates in).
 */
export function useReveal(options = {}) {
  const { threshold = 0.15, rootMargin = "0px 0px -8% 0px" } = options;
  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return undefined;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin },
    );

    observerRef.current.observe(node);
    return () => observerRef.current?.disconnect();
  }, [threshold, rootMargin]);

  const refresh = () => {
    const node = ref.current;
    if (!node) return;
    node.classList.remove("is-visible");
    observerRef.current?.observe(node);
  };

  return { ref, refresh };
}

/**
 * <Reveal> — scroll-reveal wrapper.
 *
 *   <Reveal delay={120}><Card /></Reveal>
 *   <Reveal immediate>...</Reveal>   // for above-the-fold content
 */
export function Reveal({ children, delay = 0, immediate = false, as: Tag = "div", className = "", ...rest }) {
  const { ref } = useReveal();

  useEffect(() => {
    if (!immediate) return;
    ref.current?.classList.add("is-visible");
  }, [immediate, ref]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
