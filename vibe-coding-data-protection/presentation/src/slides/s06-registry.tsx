// §6.3–6.4: registry schema (paper table 6.3#1, proposals chipped) and the CoE Starter Kit's
// shipped lifecycle defaults drawn as a flow, with the other platforms' lifecycle notes.
import { Chip } from '../components/Chip';
import { Inline } from '../components/Inline';
import { table } from '../lib/data';
import { Src } from './s06-util';

function RegistryTable() {
  const t = table('6.3#1');
  const heads = t.headPlain;
  return (
    <div class="tbl-wrap" tabIndex={0} role="region" aria-label="Registry fields, paper table 6.3" data-hscroll>
      <table class="ptable s6-status-table" data-paper-table="6.3#1">
        <thead>
          <tr>
            {t.head.map((h, i) => (
              <th scope="col" key={i}>
                <Inline nodes={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, ri) => {
            const prop = /^Proposal$/.test(t.rowsPlain[ri][2].replace(/\*/g, '').trim());
            return (
              <tr key={ri} class={prop ? 's6-row-prop' : undefined}>
                <th scope="row" data-label={heads[0]}>
                  <Inline nodes={r[0]} />
                </th>
                <td data-label={heads[1]}>
                  <Inline nodes={r[1]} />
                </td>
                <td data-label={heads[2]}>
                  <span class={`s6-status ${prop ? 's6-status-prop' : 's6-status-doc'}`}>
                    <Inline nodes={r[2]} />
                  </span>
                  {prop && (
                    <>
                      {' '}
                      <Chip code="PROP" />
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** One state in the lifecycle flow. */
function St({ kind, children }: { kind?: 'trigger' | 'end' | 'warn' | 'ok'; children: any }) {
  return <div class={`s6-st${kind ? ` s6-st-${kind}` : ''}`}>{children}</div>;
}
/** A transition; its label (when there is one) is the paper's wording of the condition. */
function Go({ children }: { children?: any }) {
  return (
    <div class={`s6-go${children ? '' : ' s6-go-bare'}`}>
      {children ? <span class="s6-go-label">{children}</span> : <span class="visually-hidden">then</span>}
    </div>
  );
}
const N = ({ children }: { children: any }) => <strong class="s6-n">{children}</strong>;

function Lifecycle() {
  return (
    <figure class="s6-life" aria-labelledby="s6-life-cap">
      <div class="s6-lane">
        <h3 class="s6-lane-name">Inactive apps</h3>
        <div class="s6-flow">
          <St kind="trigger">
            Not modified or launched in <N>six months</N>
          </St>
          <Go>inactivity check</Go>
          <St>Owner asked via flow approval</St>
          <Go />
          <div class="s6-fork">
            <St kind="end">
              Deleted <N>three weeks</N> after approval
            </St>
            <St kind="warn">
              Escalated to the manager after <N>one month</N> of silence
            </St>
          </div>
        </div>
      </div>

      <div class="s6-lane">
        <h3 class="s6-lane-name">Non-compliant apps</h3>
        <div class="s6-flow">
          <St kind="trigger">
            Compliance trigger: shared with more than <N>20 users</N> or a group
          </St>
          <Go />
          <St>Missing business justification</St>
          <Go>
            after <N>7 days</N>
          </Go>
          <St kind="warn">Quarantined; end users shown an access-denied message</St>
          <Go />
          <div class="s6-fork">
            <St kind="ok">Released automatically on submission</St>
            <St kind="ok">Released manually after an admin risk assessment</St>
          </div>
        </div>
      </div>

      <div class="s6-lane">
        <h3 class="s6-lane-name">Ownerless and stale apps</h3>
        <div class="s6-flow">
          <St kind="trigger">Orphaned objects</St>
          <Go>weekly</Go>
          <St>
            Reassigned to the former owner's manager: “Take ownership”, “Delete” or “Assign to someone else”
          </St>
          <div class="s6-aside">
            <St kind="trigger">
              “Re-publish needed” at <N>60 days</N>
            </St>
          </div>
        </div>
      </div>

      <figcaption id="s6-life-cap" class="s6-life-cap">
        <span>
          Shipped defaults of Microsoft's Power Platform CoE Starter Kit (
          <Src id="6.4" has="coe/governance-components">
            governance components
          </Src>
          ;{' '}
          <Src id="6.4" has="setup-quarantine-components">
            quarantine setup
          </Src>
          ) <Chip code="CP" />
        </span>
        <span class="s6-life-caveat">
          The only mechanised thresholds published anywhere, and <strong>configurable examples, not norms</strong> <Chip code="INF" />
        </span>
      </figcaption>
    </figure>
  );
}

const ELSEWHERE = [
  {
    name: 'Lovable',
    has: 'lovable',
    body: (
      <>
        When a member leaves, owned projects “pass automatically to the most senior remaining member”; “Projects with access set to Restricted are not transferred automatically”; the leave event is audit-logged on Enterprise <Chip code="CP" />. This prevents orphaning but assigns by seniority rather than business relevance <Chip code="INF" />.
      </>
    ),
  },
  {
    name: 'Mendix',
    has: 'private-mendix-platform',
    body: (
      <>
        Archive and un-archive, single-owner transfer, and a 30-day grace after licence expiry <Chip code="CP" />.
      </>
    ),
  },
  {
    name: 'ServiceNow',
    has: 'servicenow',
    body: (
      <>
        Reviews “at least once a year”; “Significant modifications go through the same lifecycle phases as new apps”; retirement is notify, resolve dependencies, “Back up the app and its data ... and then delete the app” <Chip code="CP" />.
      </>
    ),
  },
];

export function RegistryLifecycle() {
  return (
    <div class="stack-lg">
      <section class="stack" aria-labelledby="s6r-reg">
        <h2 id="s6r-reg" class="eyebrow">Registry schema assembled from documented sources</h2>
        <ul class="s6-sources small">
          <li>
            <Src id="6.3" has="coe/governance-components">
              CoE Starter Kit
            </Src>{' '}
            compliance form <Chip code="CP" />
          </li>
          <li>
            <Src id="6.3" has="cloudflare">
              Cloudflare
            </Src>{' '}
            metadata store <Chip code="CP" />
          </li>
          <li>
            <Src id="6.3" has="servicenow">
              ServiceNow
            </Src>{' '}
            citizen-development intake <Chip code="CP" />
          </li>
          <li>
            <Src id="6.3" has="app-roles">
              Mendix
            </Src>
            : exactly one Technical Contact per app, transferable <Chip code="CP" />
          </li>
        </ul>
        <RegistryTable />
      </section>

      <section class="stack" aria-labelledby="s6r-life">
        <h2 id="s6r-life" class="eyebrow">Lifecycle: the only fully specified machinery in the public record</h2>
        <Lifecycle />
        <p class="small muted">
          The Kit is now “no longer actively maintained”, with core capabilities moved into the admin centre <Chip code="CP" />. The native admin centre lists ownerless apps active in the last 90 days with “Assign to new owner”, and warns that “New owners don't automatically get permissions to the environment or data sources” (
          <Src id="6.4" has="security-recommendations">
            Microsoft Learn
          </Src>
          ) <Chip code="CP" />.
        </p>
      </section>

      <section class="stack" aria-labelledby="s6r-else">
        <h2 id="s6r-else" class="eyebrow">Elsewhere</h2>
        <div class="grid-3">
          {ELSEWHERE.map((e) => (
            <article class="card card-tight" key={e.name}>
              <h3 class="h3">
                <Src id="6.4" has={e.has}>
                  {e.name}
                </Src>
              </h3>
              <p class="small">{e.body}</p>
            </article>
          ))}
        </div>
        <p class="small">
          Method's PR-scoped preview deletion is the only automatic expiry in a vibe-coding-specific disclosure <Chip code="CP" />. Exception handling exists in the Starter Kit (“excused” with approval comment) and in GSA's plan (CAIO waivers with written justification, reported to OMB within 30 days, reviewed annually; none issued) <Chip code="CP" />.
        </p>
        <p class="s6-caution">
          No source publishes an app TTL, a recertification cadence tied to data class, or an exception register for vibe-coded apps <Chip code="INF" />.
        </p>
      </section>
    </div>
  );
}

