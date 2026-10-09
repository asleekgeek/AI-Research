import { render } from 'preact';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/components.css';
import { App } from './App';
import { initThemeSync } from './lib/theme';

initThemeSync();
render(<App />, document.getElementById('app')!);

// Exposed for the screenshot script and end-to-end tests.
import { slides } from './slides/registry';
(window as any).__slugs = slides.map((s) => s.slug);
(window as any).__slides = slides.map(({ slug, section, paper, flags }) => ({ slug, section, paper, flags: flags ?? {} }));
