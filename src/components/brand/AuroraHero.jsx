import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * AuroraHero — a WebGL particle field behind the hero content.
 *
 *   <AuroraHero>
 *     <h1>...</h1>
 *     <p>...</p>
 *   </AuroraHero>
 *
 * Behaviour:
 *  - `three` is imported dynamically so it stays out of the initial bundle.
 *  - The CSS aurora blobs render immediately as the fallback; the canvas fades
 *    in once the scene is ready.
 *  - Skipped entirely on reduced-motion or when WebGL is unavailable.
 *  - The render loop pauses when the tab is hidden or the hero scrolls away.
 *  - Theme aware: reads the current theme and retunes opacity and colour.
 *
 * Requires `three` as a dependency: npm install three
 */
export function AuroraHero({ children, className = "", particleCount = 180, height = "clamp(22rem, 62vh, 40rem)" }) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        return; // No three.js installed — the CSS background still looks good.
      }
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      if (!renderer.getContext()) return;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
      camera.position.set(0, 0, 16);

      // Palette follows the theme: vivid in dark, pastel in light.
      const palette = isDark
        ? [0x6366f1, 0x22d3ee, 0xa855f7]
        : [0x818cf8, 0x38bdf8, 0xc084fc];

      const count = particleCount;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const seeds = new Float32Array(count * 3);
      const base = new THREE.Color();

      for (let i = 0; i < count; i += 1) {
        const radius = 4.5 + Math.random() * 6.5;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 2.4;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        base.set(palette[i % palette.length]);
        colors[i * 3] = base.r;
        colors[i * 3 + 1] = base.g;
        colors[i * 3 + 2] = base.b;

        seeds[i * 3] = angle;
        seeds[i * 3 + 1] = radius;
        seeds[i * 3 + 2] = Math.random() * Math.PI * 2;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: isDark ? 0.16 : 0.13,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.85 : 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      points.rotation.x = -0.42;
      scene.add(points);

      // A second, slower counter-rotating ring adds depth.
      const ringGeometry = new THREE.BufferGeometry();
      const ringCount = 90;
      const ringPositions = new Float32Array(ringCount * 3);
      const ringColors = new Float32Array(ringCount * 3);
      for (let i = 0; i < ringCount; i += 1) {
        const angle = (i / ringCount) * Math.PI * 2;
        const radius = 7.6 + Math.sin(i * 0.4) * 1.4;
        ringPositions[i * 3] = Math.cos(angle) * radius;
        ringPositions[i * 3 + 1] = Math.sin(angle * 2) * 1.1;
        ringPositions[i * 3 + 2] = Math.sin(angle) * radius;
        base.set(palette[(i + 1) % palette.length]);
        ringColors[i * 3] = base.r;
        ringColors[i * 3 + 1] = base.g;
        ringColors[i * 3 + 2] = base.b;
      }
      ringGeometry.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
      ringGeometry.setAttribute("color", new THREE.BufferAttribute(ringColors, 3));
      const ringMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.45 : 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Points(ringGeometry, ringMaterial);
      ring.rotation.x = 0.32;
      scene.add(ring);

      let pointerX = 0;
      let pointerY = 0;
      const onPointerMove = (event) => {
        const rect = container.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      container.addEventListener("pointermove", onPointerMove);

      const resize = () => {
        const { clientWidth, clientHeight } = container;
        if (!clientWidth || !clientHeight) return;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      let frame = 0;
      let running = true;
      const clock = new THREE.Clock();

      const tick = () => {
        if (!running) return;
        const elapsed = clock.getElapsedTime();
        points.rotation.y = elapsed * 0.08 + pointerX * 0.16;
        points.rotation.x = -0.42 + pointerY * 0.1;
        ring.rotation.y = -elapsed * 0.05;
        ring.rotation.z = elapsed * 0.03;
        material.opacity = (isDark ? 0.85 : 0.55) * (0.85 + Math.sin(elapsed * 0.8) * 0.15);
        renderer.render(scene, camera);
        frame = window.requestAnimationFrame(tick);
      };
      tick();
      setReady(true);

      const onVisibility = () => {
        if (document.hidden) {
          running = false;
          window.cancelAnimationFrame(frame);
        } else if (!running) {
          running = true;
          clock.getDelta();
          frame = window.requestAnimationFrame(tick);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      const intersection = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && running) {
            running = false;
            window.cancelAnimationFrame(frame);
          } else if (entry.isIntersecting && !running) {
            running = true;
            clock.getDelta();
            frame = window.requestAnimationFrame(tick);
          }
        },
        { threshold: 0 },
      );
      intersection.observe(container);

      cleanup = () => {
        running = false;
        window.cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", onVisibility);
        container.removeEventListener("pointermove", onPointerMove);
        observer.disconnect();
        intersection.disconnect();
        geometry.dispose();
        material.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [isDark, particleCount]);

  return (
    <div
      ref={containerRef}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ minHeight: height }}
    >
      {/* CSS fallback — always visible, the canvas fades in over it. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="aurora-blob" style={{ width: "42rem", height: "42rem", left: "-10%", top: "-25%", background: "var(--color-aurora-500)" }} />
        <div className="aurora-blob" style={{ width: "34rem", height: "34rem", right: "-8%", top: "-10%", background: "var(--color-cyan-glow)", animationDelay: "-6s" }} />
        <div className="aurora-blob" style={{ width: "30rem", height: "30rem", left: "38%", bottom: "-30%", background: "var(--color-violet-glow)", animationDelay: "-11s" }} />
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default AuroraHero;
