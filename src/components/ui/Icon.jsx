/**
 * Inline SVG icon set — no icon dependency.
 *
 *   <Icon name="search" size={18} />
 *
 * Every icon is a 24×24 stroked path so it inherits `currentColor` and the
 * surrounding text colour in both themes.
 */

const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7V5.6A1.6 1.6 0 0 1 10.1 4h3.8a1.6 1.6 0 0 1 1.6 1.6V7" />
      <path d="M3 12.5h18" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-5.4 7-10a7 7 0 1 0-14 0c0 4.6 7 10 7 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5H17a1 1 0 0 1 1 1V8" />
      <path d="M3.5 7.5V18a2 2 0 0 0 2 2h13.6a1.4 1.4 0 0 0 1.4-1.4v-3.2" />
      <path d="M20.5 11.6v3.8h-3.7a1.9 1.9 0 0 1 0-3.8Z" />
    </>
  ),
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3 1.8" /></>,
  bookmark: <path d="M6.5 4h11v16l-5.5-3.8L6.5 20Z" />,
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h9M17 17h3" />
      <circle cx="15" cy="7" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="15" cy="17" r="2" />
    </>
  ),
  chevronDown: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  chevronUp: <path d="m6.5 14.5 5.5-5.5 5.5 5.5" />,
  chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  upload: (
    <>
      <path d="M12 16V4m0 0L8.2 7.8M12 4l3.8 3.8" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12m0 0 3.8-3.8M12 16l-3.8-3.8" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.8h5V7" />
      <path d="m6.5 7 1 12.2a1 1 0 0 0 1 .8h7a1 1 0 0 0 1-.8L17.5 7" />
    </>
  ),
  pencil: <path d="M4 20l4.4-1L20 7.4a2.1 2.1 0 0 0-3-3L4.9 16.6Z" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16.2 5.3a3.2 3.2 0 0 1 0 6M17.6 20a6 6 0 0 0-1.8-4.4" />
    </>
  ),
  bell: (
    <>
      <path d="M6.2 9.5a5.8 5.8 0 1 1 11.6 0c0 3.8 1.4 5.3 1.9 6.3H4.3c.5-1 1.9-2.5 1.9-6.3Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
      <path d="M15 9.5h3a2 2 0 0 1 2 2V21" />
      <path d="M2.5 21h19" />
      <path d="M8 7.5h3M8 11.5h3M8 15.5h3" />
    </>
  ),
  chart: <path d="M4 20V11M10 20V4M16 20v-6.5M22 20H2" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </>
  ),
  list: (
    <>
      <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" />
      <circle cx="4.4" cy="6.5" r="1.1" /><circle cx="4.4" cy="12" r="1.1" /><circle cx="4.4" cy="17.5" r="1.1" />
    </>
  ),
  arrowRight: <path d="M4 12h15m0 0-5.8-5.8M19 12l-5.8 5.8" />,
  arrowLeft: <path d="M20 12H5m0 0 5.8-5.8M5 12l5.8 5.8" />,
  logOut: (
    <>
      <path d="M10 4H6.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2H10" />
      <path d="M14.5 8.5 18 12l-3.5 3.5M18 12H9" />
    </>
  ),
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.6 20a7.4 7.4 0 0 1 14.8 0" /></>,
  star: <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8Z" />,
  eye: (
    <>
      <path d="M2.6 12S6.2 6.4 12 6.4 21.4 12 21.4 12 17.8 17.6 12 17.6 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.6 6.9A9.5 9.5 0 0 1 12 6.4c5.8 0 9.4 5.6 9.4 5.6a16 16 0 0 1-3 3.6" />
      <path d="M6.2 8.3A15.8 15.8 0 0 0 2.6 12S6.2 17.6 12 17.6a9 9 0 0 0 3.3-.6" />
      <path d="M10 10a2.7 2.7 0 0 0 3.8 3.8" />
    </>
  ),
  shield: <path d="M12 3.2 19 6v5.6c0 4.3-2.9 8.2-7 9.4-4.1-1.2-7-5.1-7-9.4V6Z" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.4" />
      <path d="M4 10.5h16M9 3.5v4M15 3.5v4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.9 20h18.2Z" />
      <path d="M12 10v4.2M12 17.3v.1" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13h4l1.6 3h4.8L16 13h4" />
      <path d="M4 13 6 5.4h12L20 13v4.6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3m14.4-6.4-1.6 1.6M8.2 15.8l-1.6 1.6m0-10.8 1.6 1.6m7.6 7.6 1.6 1.6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m3.8 7 8.2 5.8L20.2 7" />
    </>
  ),
  phone: <path d="M6 3.5h3l1.9 4.8-2.4 1.5a12 12 0 0 0 5.7 5.7l1.5-2.4 4.8 1.9v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4a13 13 0 0 1 0 17.2 13 13 0 0 1 0-17.2Z" />
    </>
  ),
  fileText: (
    <>
      <path d="M6 3.5h8l4 4v13H6Z" />
      <path d="M14 3.5v4h4" />
      <path d="M9 12.5h6M9 16h6" />
    </>
  ),
  send: <path d="M21 3 10.6 13.4M21 3l-6.9 18-3.5-7.6L3 9.9Z" />,
  filter: <path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.8v-7.4Z" />,
  layers: (
    <>
      <path d="m12 3.4 8.6 4.6-8.6 4.6-8.6-4.6Z" />
      <path d="m3.4 13 8.6 4.6 8.6-4.6" />
    </>
  ),
  trendingUp: (
    <>
      <path d="m3.5 17 5.8-5.8 4 4L20.5 8" />
      <path d="M15.5 8h5v5" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.6 13.4-1 7.2 4.4-2.6 4.4 2.6-1-7.2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  zap: <path d="M13 3 5.4 13.8H12l-1 7.2 7.6-10.8H12Z" />,
  moreVertical: (
    <>
      <circle cx="12" cy="6" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="18" r="1.4" />
    </>
  ),
  externalLink: (
    <>
      <path d="M14 4h6v6" /><path d="M20 4 11.2 12.8" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  info: <><circle cx="12" cy="12" r="8.6" /><path d="M12 11.2v5M12 7.8v.1" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.6" /><path d="m8.2 12.2 2.6 2.6 5-5.4" /></>,
  xCircle: <><circle cx="12" cy="12" r="8.6" /><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" /></>,
  loader: <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.4 6.4 4.9 4.9M19.1 19.1l-1.5-1.5M17.6 6.4l1.5-1.5M4.9 19.1l1.5-1.5" />,
  home: (
    <>
      <path d="m4 11 8-6.4 8 6.4" />
      <path d="M6 10v9.5h12V10" />
    </>
  ),
  sparkles: <path d="m12 4 1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6Z" />,
  pauseCircle: <><circle cx="12" cy="12" r="8.6" /><path d="M10.2 9.2v5.6M13.8 9.2v5.6" /></>,
  ban: <><circle cx="12" cy="12" r="8.6" /><path d="m6 6 12 12" /></>,
  image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.6-4 3 2.5 2.4-2 4 4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4.5V10h-5.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9m-3 0v3m-2.5-3v2" />
    </>
  ),
  clock3: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.6V12l3 1.8" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4.5V4.5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M18.5 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.8a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
      <path d="M14 10.2a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5" />
    </>
  ),
  facebook: <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2.5A4.5 4.5 0 0 0 10 7.5v1H7.5v2.5H10V21h4v-10h2.5l.5-2.5Z" />,
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V17M8 7.6v.1M12 17v-3.6a2 2 0 0 1 4 0V17" />
    </>
  ),
  twitter: <path d="M21 6.2a7 7 0 0 1-2 .6 3.5 3.5 0 0 0-6 2.4v.8A9.5 9.5 0 0 1 4.5 6.5s-3.5 7 2 11a9.5 9.5 0 0 1-6 1.5c7 4 15 0 15-8a3.4 3.4 0 0 0-.1-.8A4.9 4.9 0 0 0 21 6.2Z" />,
  whatsapp: (
    <>
      <path d="M20 11.8a8 8 0 0 1-11.9 7L4 20l1.3-3.9A8 8 0 1 1 20 11.8Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-1.8-.9-.9.9a5.4 5.4 0 0 1-2.3-2.3l.9-.9-.9-1.8Z" />
    </>
  ),
};

export function Icon({ name, size = 18, className = "", filled = false, strokeWidth = 1.7, ...rest }) {
  const shape = PATHS[name];
  if (!shape) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {shape}
    </svg>
  );
}

export default Icon;
