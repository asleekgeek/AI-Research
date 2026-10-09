import type { JSX } from 'preact';

export type SectionKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'A';

export interface SlideDef {
  /** Deep-link token: letters, digits and hyphens only (the Artifact viewer passes nothing else). */
  slug: string;
  section: SectionKey;
  title: string;
  /** Shorter label for the overview and progress rail. */
  short?: string;
  dek?: string;
  /** Paper section ids whose verbatim text the "Paper text" panel shows. */
  paper: string[];
  /** prop: authors' proposal banner; dated: date-of-record badge; legal: §7 notice. */
  flags?: { prop?: boolean | string; dated?: boolean; legal?: boolean };
  Body: () => JSX.Element;
}
