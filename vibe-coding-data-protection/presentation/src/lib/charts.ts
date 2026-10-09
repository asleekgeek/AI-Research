// Every plotted value on every chart is declared here, next to the key figure it comes from.
// tests/data.test.ts checks that each `display` string appears verbatim in that figure's value
// (or unit/denominator) and that `value` is the number shown in `display`.
export interface BarSpec {
  /** Key figure row (1-based, appendix table (a)). */
  n: number;
  label: string;
  value: number;
  /** Text printed on the bar, verbatim from the key figure. */
  display: string;
  tone?: 'alt' | 'ghost';
}
