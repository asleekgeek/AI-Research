import { DATE_OF_RECORD } from '../lib/data';
import { IconCalendar, IconFlask, IconScale } from './Icons';
import { Chip } from './Chip';

export function DateOfRecord() {
  return (
    <span class="pill pill-date" data-date-of-record title="Vendor defaults, prices and regulatory statuses as verified on these dates; re-check in a trial tenant before procurement (paper §0).">
      <IconCalendar />
      Date of record {DATE_OF_RECORD}
    </span>
  );
}

/** Marks the authors' own design. Wording is the paper's legend definition of PROP. */
export function PropNotice({ children }: { children?: any }) {
  return (
    <div class="notice notice-prop" data-prop-notice role="note">
      <IconFlask />
      <div>
        <Chip code="PROP" /> <strong>Authors' proposal.</strong> {children ?? 'A design, threshold, tier, KPI or rollout step the authors recommend; no external validation claimed.'}
      </div>
    </div>
  );
}

/** The paper's own disclaimer for section 7, verbatim. */
export function LegalNotice() {
  return (
    <div class="notice notice-legal" data-legal-notice role="note">
      <IconScale />
      <div>
        Nothing in this section is legal advice; the decision trees present regulator guidance, not an opinion on a specific incident, and the audit's instruction to obtain qualified legal review before publication stands.
      </div>
    </div>
  );
}
