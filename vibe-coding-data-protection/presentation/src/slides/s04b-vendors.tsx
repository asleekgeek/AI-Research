// §4.2 Boundary B1: the dated buyer-validation matrix as a vendor explorer, which identity
// "SSO" gates, and inventory exports. Every cell shown is the paper's table cell, verbatim.
import { useState } from 'react';
import { fig, section, table } from '../lib/data';
import { Inline, plain } from '../components/Inline';
import { PaperTable } from '../components/PaperTable';
import { Tabs } from '../components/Tabs';
import { FigRef } from '../components/Figure';
import { IconShield } from '../components/Icons';
import { Src, Tags, useId, useRoving } from './s04b-lib';

const MATRIX = '4.2.1#1';
const SSO = '4.2.2#1';
/** The three products §4.2.1 names as shipping an admin-enforced, inherited "no public apps" policy. */
const ENFORCED = ['Replit', 'Base44 / Wix', 'Microsoft Power Platform'];
/** Matrix vendor -> its row in the §4.2.2 "which identity SSO gates" table. */
const SSO_ROW: Record<string, string> = {
  Lovable: 'Lovable',
  Replit: 'Replit',
  'Base44 / Wix': 'Base44',
  'v0 / Vercel': 'Vercel',
  Netlify: 'Netlify',
  'Cloudflare reference architecture': 'Cloudflare Access',
  'Microsoft Power Platform': 'Power Platform',
};
/** Key figures that restate a price printed in that vendor's row. */
const ROW_FIGS: Record<string, number[]> = { 'v0 / Vercel': [42], 'Cloudflare reference architecture': [43] };

function vendor(cell: string) {
  const m = /^(.*?) \((.*)\)$/.exec(cell);
  return m ? { name: m[1], stamp: m[2] } : { name: cell, stamp: '' };
}

function Ladder() {
  const day1 = section('4.2.1').blocks[2];
  return (
    <section class="s4b-lead" aria-labelledby="b1-ladder">
      <div class="stack">
        <h2 id="b1-ladder" class="eyebrow">
          Can an admin forbid public apps for every builder?
        </h2>
        <ol class="s4b-ladder">
          <li class="lv lv-yes">
            <span class="lv-key">
              <IconShield />
              Admin-enforced, inherited “no public apps” policy; no per-builder override
            </span>
            <span class="lv-who">
              <span>
                <strong>Replit</strong> “Private deployments: Require”
              </span>
              <span>
                <strong>Base44</strong> “Apps SSO”
              </span>
              <span>
                <strong>Microsoft Power Platform</strong> Entra by construction
              </span>
            </span>
          </li>
          <li class="lv lv-mid">
            <span class="lv-key">Team defaults, overridable per project</span>
            <span class="lv-who">
              <span>
                <strong>Vercel</strong>
              </span>
              <span>
                <strong>Netlify</strong>
              </span>
            </span>
          </li>
          <li class="lv lv-no">
            <span class="lv-key">Default for first publish remains “Anyone”</span>
            <span class="lv-who">
              <span>
                <strong>Lovable</strong> <Tags c={['CP']} />
              </span>
            </span>
          </li>
        </ol>
        <p class="small muted">
          Every row was re-checked against vendor documentation on 8–9 October 2026 <Tags c={['CP']} />. Pick a vendor below for its full row.
        </p>
      </div>
      <aside class="s4b-callout" aria-labelledby="b1-day1">
        <h2 id="b1-day1" class="eyebrow">
          Day one on Lovable
        </h2>
        <p>{day1.t === 'p' && <Inline nodes={day1.c} />}</p>
      </aside>
    </section>
  );
}

function VendorExplorer() {
  const t = table(MATRIX);
  const sso = table(SSO);
  const [sel, setSel] = useState(0);
  const { ref, onKeyDown } = useRoving(t.rows.length, sel, setSel);
  const id = useId('vendor');
  const v = vendor(t.rowsPlain[sel][0]);
  const enforced = ENFORCED.includes(v.name);
  const si = SSO_ROW[v.name] ? sso.rowsPlain.findIndex((r) => r[0] === SSO_ROW[v.name]) : -1;
  if (SSO_ROW[v.name] && si < 0) throw new Error(`No §4.2.2 row for ${v.name}`);
  const figs = ROW_FIGS[v.name] ?? [];
  return (
    <div class="s4b-vx">
      <div class="s4b-vx-nav">
        <div class="s4b-vx-list" role="tablist" aria-label="Vendor" onKeyDown={onKeyDown as any}>
          {t.rowsPlain.map((r, i) => {
            const n = vendor(r[0]);
            return (
              <button
                key={i}
                type="button"
                role="tab"
                ref={ref(i)}
                id={`${id}-t${i}`}
                aria-selected={i === sel}
                aria-controls={`${id}-p`}
                tabIndex={i === sel ? 0 : -1}
                onClick={() => setSel(i)}
              >
                <span>{n.name}</span>
                {ENFORCED.includes(n.name) && (
                  <span class="vx-mark">
                    <IconShield />
                    <span class="visually-hidden">(admin-enforced, no per-builder override)</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p class="vx-legend small muted">
          <span class="vx-mark" aria-hidden="true">
            <IconShield />
          </span>
          One of the three products the paper names as shipping an admin-enforced, inherited “no public apps” policy.
        </p>
      </div>
      <div class="s4b-vx-panel" role="tabpanel" id={`${id}-p`} aria-labelledby={`${id}-t${sel}`} tabIndex={0}>
        <div class="vx-head">
          <h3 class="vx-title">{v.name}</h3>
          <span class="vx-stamp">
            <span class="muted">Verified:</span> {v.stamp}
          </span>
        </div>
        {enforced && (
          <p class="vx-flag">
            <IconShield />
            Ships an admin-enforced, inherited “no public apps” policy with no per-builder override <Tags c={['CP']} />
          </p>
        )}
        <dl class="s4b-fields">
          {[1, 2, 3, 4].map((c) => (
            <div key={c} class={`s4b-field${c === 1 ? ' is-hero' : ''}`}>
              <dt>{plain(t.head[c])}</dt>
              <dd>
                <Inline nodes={t.rows[sel][c]} />
              </dd>
            </div>
          ))}
        </dl>
        {si >= 0 && (
          <div class="vx-sso">
            <h4 class="eyebrow">Which identity its “SSO” gates · §4.2.2</h4>
            <dl class="s4b-fields">
              {[1, 2].map((c) => (
                <div key={c} class="s4b-field">
                  <dt>{plain(sso.head[c])}</dt>
                  <dd>
                    <Inline nodes={sso.rows[si][c]} />
                  </dd>
                </div>
              ))}
            </dl>
            <p class="small muted">
              Source: <Inline nodes={sso.rows[si][3]} />
            </p>
          </div>
        )}
        {figs.length > 0 && (
          <p class="small vx-figs">
            Price in this row, as a key figure:{' '}
            {figs.map((n) => (
              <span key={n}>
                {fig(n).figure} <FigRef n={n} />
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

function SsoPanel() {
  const verdict = section('4.2.2').blocks[2];
  return (
    <div class="stack-lg">
      <p class="lead">
        “SSO” on a pricing page almost always means builder-console login. The buyer must ask two questions separately.
      </p>
      <ol class="s4b-qs">
        <li>
          <span class="q-n" aria-hidden="true">
            1
          </span>
          <span class="q-k">Console</span>
          <span class="q-t">Can my IdP be the only way into the console?</span>
        </li>
        <li>
          <span class="q-n" aria-hidden="true">
            2
          </span>
          <span class="q-k">Every published app</span>
          <span class="q-t">Can my IdP be the only way into every published app, enforced by an admin with no per-app override?</span>
        </li>
      </ol>
      <div class="s4b-answers" role="table" aria-label="How the documentation answers the two questions">
        <div role="row" class="ans-head">
          <span role="columnheader">Vendor</span>
          <span role="columnheader">1 · Console</span>
          <span role="columnheader">2 · Every published app</span>
        </div>
        <div role="row">
          <span role="rowheader">Base44</span>
          <span role="cell" class="ans-yes">Yes</span>
          <span role="cell" class="ans-yes">Yes</span>
        </div>
        <div role="row">
          <span role="rowheader">Lovable</span>
          <span role="cell" class="ans-yes">Yes</span>
          <span role="cell" class="ans-part">“Restrictable but not forced”</span>
        </div>
        <div role="row">
          <span role="rowheader">Vercel</span>
          <span role="cell" class="ans-span ans-part">Yes to both only on Enterprise, via a Passport team default that remains project-overridable</span>
        </div>
      </div>
      <p class="small ans-foot">{verdict.t === 'p' && <Inline nodes={verdict.c} />}</p>
      <div class="s4b-tbl">
        <PaperTable id={SSO} caption="Which identity each “SSO” gates (paper table, §4.2.2)" />
      </div>
    </div>
  );
}

function InventoryPanel() {
  return (
    <div class="stack-lg">
      <p class="lead">Three platforms document a downloadable tenant-wide inventory with owner and data-source metadata.</p>
      <div class="grid-3">
        <article class="card">
          <h3>
            Lovable Security insights <Tags c={['CP']} />
          </h3>
          <p class="small">
            Business/Enterprise. Lists owner, publish status, security and PII findings, auth providers, external access, <strong>connectors</strong>, Lovable Cloud status and secret names; “Externally published”, “no owner” and “abandoned” filters; CSV export up to 100,000 rows.
          </p>
          <p class="small">
            <Src sec="4.2.3" label="Lovable Security insights">
              Lovable docs
            </Src>
          </p>
        </article>
        <article class="card">
          <h3>
            Power Platform inventory <Tags c={['CP']} />
          </h3>
          <p class="small">
            Agents, apps (including code and vibe apps), flows, connectors (preview) and environments via CSV, API, <code>pac resource-query</code> and Azure Resource Graph; connector-usage mapping (preview), orphaned-owner detection and in-place Block.
          </p>
          <p class="small">
            <Src sec="4.2.3" label="Power Platform inventory">
              Microsoft Learn
            </Src>
          </p>
        </article>
        <article class="card">
          <h3>
            ServiceNow AI Control Tower <Tags c={['CP']} />
          </h3>
          <p class="small">Shows “what data they access”.</p>
          <p class="small">
            <Src sec="4.2.3" label="ServiceNow">
              ServiceNow docs
            </Src>
          </p>
        </article>
      </div>
      <div class="s4b-nots">
        <h3 class="eyebrow">No documented export with data-source fields</h3>
        <ul>
          <li>
            <strong>Replit</strong>: a Security Center with SBOM download and SIEM-streamed audit logs, but no documented export with data-source fields (<Src sec="4.2.3" label="Replit Enterprise" />) <Tags c={['CP']} />
          </li>
          <li>
            <strong>Vercel and Netlify</strong>: project lists and protection settings only <Tags c={['CP']} />
          </li>
        </ul>
        <p class="small muted">
          Lovable's audit log is retained about 13 weeks on Enterprise; tamper-evidence is not stated (<Src sec="4.2.3" label="Lovable for Enterprise" />) <Tags c={['CP']} />
        </p>
      </div>
    </div>
  );
}

export function VendorsBody() {
  const three = table(MATRIX).rowsPlain.map((r, i) => (ENFORCED.includes(vendor(r[0]).name) ? i : -1)).filter((i) => i >= 0);
  return (
    <div class="stack-lg s4b">
      <Ladder />
      <Tabs
        label="Builder identity and workspace (B1)"
        tabs={[
          { id: 'vendor', label: 'Vendor by vendor', panel: <VendorExplorer /> },
          {
            id: 'matrix',
            label: 'Full matrix',
            panel: (
              <div class="stack s4b-tbl">
                <PaperTable id={MATRIX} tall caption="Dated buyer-validation matrix (paper table, §4.2.1). Highlighted: the three products with an admin-enforced, inherited “no public apps” policy." highlight={(r) => three.includes(r)} />
              </div>
            ),
          },
          { id: 'sso', label: 'Which identity “SSO” gates', panel: <SsoPanel /> },
          { id: 'inventory', label: 'Inventory exports', panel: <InventoryPanel /> },
        ]}
      />
    </div>
  );
}
