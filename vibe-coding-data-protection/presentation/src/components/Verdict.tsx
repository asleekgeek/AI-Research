import { IconEye, IconGauge, IconLink, IconMinus, IconShield, IconX } from './Icons';

const ICON: Record<string, () => any> = {
  prevents: IconShield,
  detects: IconEye,
  limits: IconGauge,
  enables: IconLink,
  weak: IconMinus,
  'anti-pattern': IconX,
  none: IconX,
};

/** A verdict word with a glyph, so the class reads without relying on colour. */
export function Verdict({ kind, children }: { kind: string; children?: any }) {
  const k = kind.toLowerCase();
  const I = ICON[k] ?? IconMinus;
  return (
    <span class={`verdict v-${k}`}>
      <I />
      {children ?? kind}
    </span>
  );
}
