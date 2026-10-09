// Two-state theme switch (system, or the opposite of what is on screen), per the
// web.dev dark-mode-toggle pattern. The choice lives in data-theme on <html>, which the
// token blocks in tokens.css key off; with no stored choice the page follows the OS.
const KEY = 'vcdp-theme';

const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;

function stored(): 'light' | 'dark' | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function renderedScheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return systemDark() ? 'dark' : 'light';
}

export function toggleTheme() {
  const target = renderedScheme() === 'dark' ? 'light' : 'dark';
  const sys = systemDark() ? 'dark' : 'light';
  const root = document.documentElement;
  try {
    if (target === sys && stored()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, target);
  } catch {
    /* storage blocked: the switch still applies for this visit */
  }
  root.setAttribute('data-theme', target);
}

export function initThemeSync() {
  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const v = stored();
    if (v) document.documentElement.setAttribute('data-theme', v);
    else document.documentElement.removeAttribute('data-theme');
  });
}
