export type Code = 'CP' | 'VR' | 'RR' | 'PO' | 'INF' | 'PROP';

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'code'; v: string }
  | { t: 'tag'; v: Code }
  | { t: 'b' | 'i'; c: Inline[] }
  | { t: 'a'; href: string; c: Inline[] };

export type Block =
  | { t: 'p'; c: Inline[] }
  | { t: 'ol'; items: Inline[][] }
  | { t: 'table'; id: string }
  | { t: 'code'; lang: string; text: string };

export interface Section {
  id: string;
  level: number;
  title: string;
  number: string | null;
  parent: string | null;
  blocks: Block[];
}

export interface PaperTable {
  id: string;
  section: string;
  head: Inline[][];
  headPlain: string[];
  rows: Inline[][][];
  rowsPlain: string[][];
}

export interface Paper {
  title: string;
  lead: Inline[];
  sections: Section[];
  tables: Record<string, PaperTable>;
}

export interface KeyFigure {
  figure: string;
  value: string;
  unit_denominator: string;
  source_url: string;
  date: string;
  confidence: string;
  confidence_codes: Code[];
  confidence_labels: string[];
}

export interface Incident {
  date: string;
  incident: string;
  layer: string;
  capability_demonstrated: string;
  impact: string;
  remediation: string;
  confidence: string;
}

export interface Control {
  boundary: string;
  control: string;
  enforcement_locus: string;
  verdict: string;
  bypass_limitation: string;
  evidence_tier: string;
  confidence_codes: Code[];
}

export interface Phase {
  phase: string;
  name: string;
  window: string;
  key_actions: string;
  exit_criterion: string;
  owner: string;
  evidence: string;
}
