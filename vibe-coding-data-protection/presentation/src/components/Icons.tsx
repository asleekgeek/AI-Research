// Line icons drawn on a 24-unit grid; stroke colour follows currentColor.
const P = (d: string) => () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);
export const IconPrev = P('M15 5l-7 7 7 7');
export const IconNext = P('M9 5l7 7-7 7');
export const IconGrid = P('M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z');
export const IconDoc = P('M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6');
export const IconHelp = P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01');
export const IconKey = P('M5 7h14M5 12h14M5 17h9');
export const IconSun = P('M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4');
export const IconMoon = P('M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z');
export const IconCalendar = P('M4 6h16v14H4zM4 10h16M9 3v4M15 3v4');
export const IconFlask = P('M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 14h9');
export const IconScale = P('M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z');
export const IconExternal = P('M14 4h6v6M20 4l-9 9M18 14v6H4V6h6');
export const IconShield = P('M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z');
export const IconEye = P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z');
export const IconGauge = P('M4 18a8 8 0 1 1 16 0M12 18l4-6');
export const IconLink = P('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1');
export const IconMinus = P('M5 12h14');
export const IconX = P('M6 6l12 12M18 6L6 18');
