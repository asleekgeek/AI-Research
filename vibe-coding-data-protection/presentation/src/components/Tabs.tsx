import { useRef, useState } from 'react';

let uid = 0;

/**
 * WAI-ARIA tabs. Inactive panels stay in the DOM with `hidden`, so the no-new-numbers test
 * checks every panel, not only the visible one. Arrow keys move between tabs.
 */
export function Tabs({ tabs, label }: { tabs: { id: string; label: any; panel: any }[]; label: string }) {
  const [active, setActive] = useState(0);
  const base = useRef(`tabs-${++uid}`).current;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'Home' ? -active : e.key === 'End' ? tabs.length - 1 - active : 0;
    if (!d) return;
    e.preventDefault();
    const n = (active + d + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  return (
    <div class="stack">
      <div class="tabs" role="tablist" aria-label={label} onKeyDown={onKey as any}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${base}-${t.id}-tab`}
            aria-selected={i === active}
            aria-controls={`${base}-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-${t.id}`} aria-labelledby={`${base}-${t.id}-tab`} hidden={i !== active} tabIndex={0}>
          {t.panel}
        </div>
      ))}
    </div>
  );
}
