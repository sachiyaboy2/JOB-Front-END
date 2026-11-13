import TiltCard from "../brand/TiltCard.jsx";
import CountUp from "./CountUp.jsx";
import Icon from "./Icon.jsx";

/**
 * A 3D stat tile. The number counts up when it scrolls into view.
 */
export function StatCard({ label, value, icon = "chart", hint = "", suffix = "", prefix = "", tone = "aurora", className = "" }) {
  const tones = {
    aurora: "from-aurora-500 to-violet-glow",
    cyan: "from-cyan-glow to-aurora-500",
    violet: "from-violet-glow to-aurora-600",
    success: "from-success to-cyan-glow",
    warning: "from-warning to-aurora-500",
    danger: "from-danger to-violet-glow",
  };

  return (
    <TiltCard className={`card-3d card-glow p-5 ${className}`} max={6}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">
            <CountUp value={value} suffix={suffix} prefix={prefix} />
          </p>
          {hint ? <p className="mt-1 truncate text-xs text-ink-muted">{hint}</p> : null}
        </div>
        <span
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-e2 ${tones[tone] || tones.aurora}`}
        >
          <Icon name={icon} size={20} />
        </span>
      </div>
    </TiltCard>
  );
}

export default StatCard;
