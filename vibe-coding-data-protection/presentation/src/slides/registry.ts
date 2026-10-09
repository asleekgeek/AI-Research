import type { SectionKey, SlideDef } from './types';
import { section } from '../lib/data';
import s00 from './s00';
import s01 from './s01';
import s02 from './s02';
import s03 from './s03';
import s04a from './s04a';
import s04b from './s04b';
import s04c from './s04c';
import s05 from './s05';
import s06 from './s06';
import s07 from './s07';
import s08 from './s08';
import s09 from './s09';
import s10 from './s10';
import s11 from './s11';
import s12 from './s12';
import appendix from './appendix';

export const slides: SlideDef[] = [...s00, ...s01, ...s02, ...s03, ...s04a, ...s04b, ...s04c, ...s05, ...s06, ...s07, ...s08, ...s09, ...s10, ...s11, ...s12, ...appendix];

export const SECTIONS: { key: SectionKey }[] = (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A'] as SectionKey[])
  .filter((k) => slides.some((s) => s.section === k))
  .map((key) => ({ key }));

/** Section names are the paper's own headings. */
export function sectionLabel(k: SectionKey): string {
  if (k === 'A') return 'Key figures and colophon';
  if (k === '0') return 'Thesis and how to read';
  return section(k).title;
}
