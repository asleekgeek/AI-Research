import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { slides, SECTIONS, sectionLabel } from './slides/registry';
import { CODES, paper } from './lib/data';
import { Chip } from './components/Chip';
import { DateOfRecord, LegalNotice, PropNotice } from './components/Notices';
import { PaperText } from './components/PaperText';
import { Inline } from './components/Inline';
import { Dialog, useDialog } from './components/Dialog';
import { IconDoc, IconGrid, IconHelp, IconKey, IconMoon, IconNext, IconPrev, IconSun } from './components/Icons';
import { toggleTheme } from './lib/theme';

const indexFromHash = () => {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  const i = slides.findIndex((s) => s.slug === h);
  return i >= 0 ? i : 0;
};

/** Elements that own the arrow keys or text entry; deck shortcuts stay out of their way. */
const ownsKeys = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.closest('[role="tablist"],[role="listbox"],[role="slider"],[role="grid"]') !== null);

/** True when a horizontal swipe should scroll this element instead of changing slides. */
const scrollsSideways = (el: EventTarget | null) => {
  for (let n = el as HTMLElement | null; n && n !== document.body; n = n.parentElement)
    if (n.scrollWidth > n.clientWidth + 2 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) return true;
  return false;
};

export function App() {
  const [index, setIndex] = useState(indexFromHash);
  const settle = useRef<(() => void) | null>(null);
  const slideRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  const overview = useDialog();
  const source = useDialog();
  const legendDlg = useDialog();
  const help = useDialog();
  const slide = slides[index];

  const indexRef = useRef(index);
  indexRef.current = index;

  const go = useCallback((to: number, push = true) => {
    const cur = indexRef.current;
    const next = Math.max(0, Math.min(slides.length - 1, to));
    if (next === cur) return;
    if (push) history.pushState(null, '', `#${slides[next].slug}`);
    const startVT = (document as any).startViewTransition?.bind(document);
    if (!startVT || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIndex(next);
      return;
    }
    // Resolve the transition's update promise once the new slide has rendered (see layout effect).
    const update = () =>
      new Promise<void>((resolve) => {
        settle.current = resolve;
        setIndex(next);
        setTimeout(resolve, 400);
      });
    try {
      startVT({ update, types: [next > cur ? 'forward' : 'backward'] });
    } catch {
      startVT(update);
    }
  }, []);

  // After each slide change: resolve the view transition, reset scroll, move focus, update title.
  useLayoutEffect(() => {
    settle.current?.();
    settle.current = null;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    slideRef.current?.focus({ preventScroll: true });
  }, [index]);
  useEffect(() => {
    document.title = index === 0 ? 'Boundaries, Not Prompts' : `${slide.short ?? slide.title} · Boundaries, Not Prompts`;
  }, [index]);

  useEffect(() => {
    const onHash = () => go(indexFromHash(), false);
    addEventListener('hashchange', onHash);
    addEventListener('popstate', onHash);
    return () => {
      removeEventListener('hashchange', onHash);
      removeEventListener('popstate', onHash);
    };
  }, [go]);

  const sectionStarts = useMemo(() => SECTIONS.map((s) => slides.findIndex((x) => x.section === s.key)), []);
  const jumpSection = (delta: number) => {
    const cur = SECTIONS.findIndex((s) => s.key === slide.section);
    const target = sectionStarts[Math.max(0, Math.min(SECTIONS.length - 1, cur + delta))];
    if (delta < 0 && index !== sectionStarts[cur]) go(sectionStarts[cur]);
    else go(target);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (ownsKeys(e.target)) return;
      const onButton = e.target instanceof HTMLElement && e.target.closest('button, a, summary');
      const k = e.key;
      let handled = true;
      if ((k === 'ArrowRight' || k === 'ArrowLeft') && e.shiftKey) jumpSection(k === 'ArrowRight' ? 1 : -1);
      else if (k === 'ArrowRight' || k === 'PageDown') go(index + 1);
      else if (k === 'ArrowLeft' || k === 'PageUp') go(index - 1);
      else if (k === ' ' && !onButton) go(index + (e.shiftKey ? -1 : 1));
      else if (k === 'Home') go(0);
      else if (k === 'End') go(slides.length - 1);
      else if (k === 'o' || k === 'O') overview.open();
      else if (k === 's' || k === 'S') source.open();
      else if (k === 'l' || k === 'L') legendDlg.open();
      else if (k === 't' || k === 'T') toggleTheme();
      else if (k === '?') help.open();
      else handled = false;
      if (handled) e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Swipe left/right on touch screens, ignoring gestures that start inside sideways-scrolling frames.
  useEffect(() => {
    let x0 = 0, y0 = 0, t0 = 0, armed = false;
    const down = (e: PointerEvent) => {
      armed = e.pointerType === 'touch' && !scrollsSideways(e.target);
      x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (!armed) return;
      armed = false;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy) && e.timeStamp - t0 < 600) go(index + (dx < 0 ? 1 : -1));
    };
    const main = document.getElementById('content');
    main?.addEventListener('pointerdown', down);
    main?.addEventListener('pointerup', up);
    return () => {
      main?.removeEventListener('pointerdown', down);
      main?.removeEventListener('pointerup', up);
    };
  });

  const secIdx = SECTIONS.findIndex((s) => s.key === slide.section);
  const Body = slide.Body;

  return (
    <>
      <a class="skip-link visually-hidden" href="#content">
        Skip to slide
      </a>
      <header class="topbar">
        <div class="brand">
          <span class="brand-name">Boundaries, not prompts</span>
          <span class="brand-where">Vibe-coded apps and coding agents · practitioner paper</span>
        </div>
        <nav class="toolbar" aria-label="Presentation tools">
          <button class="tool" type="button" onClick={overview.open} aria-haspopup="dialog">
            <IconGrid />
            <span class="tool-label">Slides</span>
            <kbd>O</kbd>
          </button>
          <button class="tool" type="button" onClick={source.open} aria-haspopup="dialog">
            <IconDoc />
            <span class="tool-label">Paper text</span>
            <kbd>S</kbd>
          </button>
          <button class="tool" type="button" onClick={legendDlg.open} aria-haspopup="dialog">
            <IconKey />
            <span class="tool-label">Evidence codes</span>
            <kbd>L</kbd>
          </button>
          <button class="tool" type="button" onClick={toggleTheme} aria-label="Switch light or dark theme" title="Switch theme (T)">
            <span class="theme-icon-light">
              <IconMoon />
            </span>
            <span class="theme-icon-dark">
              <IconSun />
            </span>
          </button>
          <button class="tool" type="button" onClick={help.open} aria-label="Keyboard shortcuts" aria-haspopup="dialog">
            <IconHelp />
          </button>
        </nav>
      </header>

      <main id="content" class="deck" tabIndex={-1}>
        <article class="slide" ref={slideRef} tabIndex={-1} aria-labelledby="slide-title" data-slug={slide.slug} key={slide.slug}>
          <header class="slide-head">
            <div class="kicker" data-chrome>
              <span class="sec">{slide.section === 'A' ? 'Appendix' : `§${slide.section}`}</span>
              <span>{sectionLabel(slide.section)}</span>
            </div>
            <h1 id="slide-title">{slide.title}</h1>
            {slide.dek && <p class="dek">{slide.dek}</p>}
            {(slide.flags?.dated || slide.flags?.prop || slide.flags?.legal) && (
              <div class="flags">
                {slide.flags?.dated && <DateOfRecord />}
              </div>
            )}
            {slide.flags?.prop && <PropNotice>{typeof slide.flags.prop === 'string' ? slide.flags.prop : undefined}</PropNotice>}
            {slide.flags?.legal && <LegalNotice />}
          </header>
          <Body />
        </article>
        <p class="visually-hidden" aria-live="polite">
          {`Slide ${index + 1} of ${slides.length}: ${slide.title}`}
        </p>
      </main>

      <footer class="bottombar">
        <button class="navbtn" type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          <IconPrev />
          <span class="nav-label">Previous</span>
        </button>
        <div class="rail" data-chrome>
          <div class="rail-track">
            {SECTIONS.map((s, si) => {
              const own = slides.map((x, i) => [x, i] as const).filter(([x]) => x.section === s.key);
              return (
                <button
                  type="button"
                  class="rail-seg"
                  key={s.key}
                  style={{ flex: own.length }}
                  onClick={() => go(sectionStarts[si])}
                  aria-label={`${s.key === 'A' ? 'Appendix' : `Section ${s.key}`}: ${sectionLabel(s.key)}`}
                  aria-current={si === secIdx ? 'step' : undefined}
                  title={`${s.key === 'A' ? 'Appendix' : `§${s.key}`} ${sectionLabel(s.key)}`}
                >
                  {own.map(([, i]) => (
                    <span key={i} class={i === index ? 'here' : i < index ? 'done' : undefined} />
                  ))}
                </button>
              );
            })}
          </div>
          <div class="rail-meta">
            <span class="rail-title">{slide.short ?? slide.title}</span>
            <span>
              {index + 1} / {slides.length}
            </span>
          </div>
        </div>
        <button class="navbtn" type="button" onClick={() => go(index + 1)} disabled={index === slides.length - 1}>
          <span class="nav-label">Next</span>
          <IconNext />
        </button>
      </footer>

      <Dialog ctl={overview} title="All slides">
        <div class="overview" data-chrome>
          {SECTIONS.map((s) => (
            <div class="overview-sec" key={s.key}>
              <h3>
                {s.key === 'A' ? 'Appendix' : `§${s.key}`} · {sectionLabel(s.key)}
              </h3>
              <ol>
                {slides.map((x, i) =>
                  x.section === s.key ? (
                    <li key={x.slug}>
                      <button
                        type="button"
                        aria-current={i === index ? 'true' : undefined}
                        onClick={() => {
                          overview.close();
                          go(i);
                        }}
                      >
                        {x.short ?? x.title}
                      </button>
                    </li>
                  ) : null,
                )}
              </ol>
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog ctl={source} title={`Paper text: ${slide.paper.map((p) => (/^\d/.test(p) ? `§${p}` : p)).join(', ')}`} drawer>
        <p class="muted small">
          Verbatim from the paper, including its evidence tags and source links. Slides condense this text; where they differ in emphasis, this text governs.
        </p>
        {slide.slug === 'title' && (
          <p class="lead">
            <Inline nodes={paper.lead} />
          </p>
        )}
        <PaperText ids={slide.paper} />
      </Dialog>

      <Dialog ctl={legendDlg} title="Evidence-confidence codes">
        <p>Every quantitative claim and every control verdict in the paper carries one of six codes (paper §0).</p>
        <dl class="keys">
          {CODES.map((c) => (
            <Fragment key={c}>
              <dt>
                <Chip code={c} large />
              </dt>
              <dd style={{ margin: 0 }}>
                <Inline nodes={paper.tables['0#1'].rows[CODES.indexOf(c)][1]} />
              </dd>
            </Fragment>
          ))}
        </dl>
        <p class="muted small">
          The incident timeline also uses the ledger's own scale: <strong>High</strong> = first-party or primary researcher source read directly; <strong>Medium</strong> = reputable press quoting a named party, primary not located; <strong>Low</strong> = secondary or single-user forum report (paper §3.2).
        </p>
      </Dialog>

      <Dialog ctl={help} title="Keyboard shortcuts">
        <dl class="keys">
          <dt><kbd>→</kbd> <kbd>PageDown</kbd> <kbd>Space</kbd></dt><dd style={{ margin: 0 }}>Next slide</dd>
          <dt><kbd>←</kbd> <kbd>PageUp</kbd> <kbd>Shift</kbd>+<kbd>Space</kbd></dt><dd style={{ margin: 0 }}>Previous slide</dd>
          <dt><kbd>Shift</kbd>+<kbd>→</kbd> / <kbd>←</kbd></dt><dd style={{ margin: 0 }}>Next / previous section</dd>
          <dt><kbd>Home</kbd> <kbd>End</kbd></dt><dd style={{ margin: 0 }}>First / last slide</dd>
          <dt><kbd>O</kbd></dt><dd style={{ margin: 0 }}>All slides</dd>
          <dt><kbd>S</kbd></dt><dd style={{ margin: 0 }}>Paper text for this slide</dd>
          <dt><kbd>L</kbd></dt><dd style={{ margin: 0 }}>Evidence-confidence codes</dd>
          <dt><kbd>T</kbd></dt><dd style={{ margin: 0 }}>Switch light / dark theme</dd>
          <dt><kbd>Esc</kbd></dt><dd style={{ margin: 0 }}>Close a panel</dd>
        </dl>
        <p class="muted small">Every slide has its own link: the address bar shows it (for example <code>#s04-controls</code>). On a touch screen, swipe left or right.</p>
      </Dialog>
    </>
  );
}
