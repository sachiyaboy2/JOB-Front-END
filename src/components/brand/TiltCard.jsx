import { useCallback, useRef } from "react";

/**
 * TiltCard — a card that rotates in 3D as the pointer moves over it.
 *
 *   <TiltCard className="card-3d p-6"> ... </TiltCard>
 *
 * Writes --rx / --ry on the element; `.tilt` in motion.css turns those into a
 * perspective transform. Set `max={8}` for a subtler effect.
 * Disabled entirely when the user prefers reduced motion.
 */
export function TiltCard({ children, className = "", max = 8, ...rest }) {
  const ref = useRef(null);

  const onPointerMove = useCallback(
    (event) => {
      const node = ref.current;
      if (!node) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      node.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
      node.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
      node.classList.add("is-tilting");
    },
    [max],
  );

  const onPointerLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
    node.classList.remove("is-tilting");
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      {children}
    </div>
  );
}

export default TiltCard;
