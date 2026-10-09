import type { ComponentChildren } from 'preact';

/**
 * A decision tree drawn as a vertical spine of steps. It is an ordered list, so a screen reader
 * hears it as a numbered sequence: each step names its legal test, then its outcomes as a nested
 * list ("No: …", "Yes: …"), then which answer continues down the spine. Off-spine outcomes hang
 * from the step on an elbow connector; guidance notes sit in a margin column on wide screens and
 * under the step on narrow ones.
 */
export type StepKind = 'q' | 'act' | 'always';
export type Tone = 'stop' | 'act' | 'flag';

export interface FlowBranch {
  ans: string;
  tone: Tone;
  body: ComponentChildren;
}

export interface FlowStep {
  kind: StepKind;
  /** Small mono line above the step: the article or test it applies. */
  tag?: ComponentChildren;
  title?: ComponentChildren;
  body?: ComponentChildren;
  branches?: FlowBranch[];
  /** The answer that continues down the spine to the next step. */
  next?: string;
  notes?: ComponentChildren;
  notesLabel?: string;
}

const KIND_LABEL: Record<StepKind, string> = { q: 'Question', act: 'Duty', always: 'Always' };

export function Flow({ steps, label, compact }: { steps: FlowStep[]; label: string; compact?: boolean }) {
  const withNotes = steps.some((s) => s.notes);
  return (
    <ol class={`s7-flow${withNotes ? ' with-notes' : ''}${compact ? ' is-compact' : ''}`} aria-label={label}>
      {steps.map((s, i) => (
        <li class={`s7-step k-${s.kind}`} key={i}>
          <span class="s7-mark" aria-hidden="true">
            <span>{i + 1}</span>
          </span>
          <div class="s7-main">
            <div class="s7-node">
              <p class="s7-tag">
                <span class="visually-hidden">{KIND_LABEL[s.kind]}: </span>
                {s.tag}
              </p>
              {s.title && <p class="s7-title">{s.title}</p>}
              {s.body && <div class="s7-body">{s.body}</div>}
            </div>
            {s.branches && (
              <ul class="s7-branches" aria-label="Outcomes">
                {s.branches.map((b, j) => (
                  <li class={`s7-branch t-${b.tone}`} key={j}>
                    <span class="s7-ans">{b.ans}</span>
                    <span class="visually-hidden">: </span>
                    <div class="s7-out">{b.body}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {s.notes && (
            <div class="s7-notes" role="note" aria-label={s.notesLabel ?? 'Guidance at this step'}>
              {s.notes}
            </div>
          )}
          {s.next && i < steps.length - 1 && (
            <p class="s7-next">
              <span class="s7-ans">
                {s.next}
                <span aria-hidden="true"> ↓</span>
              </span>
              <span class="visually-hidden">: continue to the next step.</span>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

/** One margin note: a mono head (the paragraph or article) and the guidance itself. */
export function Note({ head, children }: { head: string; children: ComponentChildren }) {
  return (
    <div class="s7-note">
      <span class="s7-note-h">{head}</span>
      <p>{children}</p>
    </div>
  );
}
