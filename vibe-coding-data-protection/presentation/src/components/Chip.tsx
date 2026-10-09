import { legend } from '../lib/data';
import type { Code } from '../lib/types';

/** Evidence-confidence chip. The code always shows; the meaning is in the accessible name and tooltip. */
export function Chip({ code, large }: { code: Code; large?: boolean }) {
  return (
    <abbr class={`chip chip-${code.toLowerCase()}${large ? ' chip-lg' : ''}`} title={`${code}: ${legend[code]}`} data-chip={code}>
      {code}
    </abbr>
  );
}

export function Chips({ codes }: { codes: Code[] }) {
  return (
    <span class="chips">
      {codes.map((c) => (
        <Chip key={c} code={c} />
      ))}
    </span>
  );
}

/** The incident ledger uses its own confidence scale (High / Medium / Low, paper §3.2). */
export function LedgerChip({ text }: { text: string }) {
  return (
    <span class="chip chip-ledger" title={`Ledger confidence (paper §3.2): ${text}`} data-chip="ledger">
      {text}
    </span>
  );
}
