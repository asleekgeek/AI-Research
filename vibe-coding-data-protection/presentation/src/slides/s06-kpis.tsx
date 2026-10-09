// §6.5–6.6: KPIs documented versus proposed (paper table 6.5#1) and the counter-evidence on bans
// versus enablement, ending on the paper's framing.
import { Bars } from '../components/Bars';
import { Chip } from '../components/Chip';
import { FigRef, FigTile } from '../components/Figure';
import { Inline, plain } from '../components/Inline';
import { table } from '../lib/data';
import type { BarSpec } from '../lib/charts';
import { paperHref, splitInline, Src } from './s06-util';

/** Netskope personal-account share, verbatim from key figure 34's value. */
const NETSKOPE: BarSpec[] = [
  { n: 34, label: 'From', value: 78, display: '78%', tone: 'ghost' },
  { n: 34, label: 'To', value: 47, display: '47%' },
];

/**
 * The precedent cells of table 6.5#1 carry figures the paper tags elsewhere (§6.1, §6.4, §6.2, §6.7);
 * each segment gets the tag the paper gives that same source or figure.
 */
function precedentTag(seg: string) {
  if (/admin centre and Starter Kit/.test(seg)) return <Chip code="CP" />;
  if (/^CSA /.test(seg)) return <Chip code="CP" />;
  if (/^Nokod survey/.test(seg)) return <Chip code="VR" />;
  if (/^Nokod customer/.test(seg)) return <FigRef n={40} />;
  if (/^Netskope/.test(seg)) return <Chip code="VR" />;
  if (/personal$/.test(seg)) return <FigRef n={34} />;
  if (/^Cyberhaven/.test(seg))
    return (
      <>
        <Chip code="VR" />{' '}
        <a class="figref" href={paperHref('6.7', 'cyberhaven')} target="_blank" rel="noopener noreferrer">
          source
        </a>
      </>
    );
  if (/^Tenable/.test(seg)) return <Chip code="CP" />;
  return null;
}

function KpiTable() {
  const t = table('6.5#1');
  const heads = t.headPlain;
  return (
    <div class="tbl-wrap" tabIndex={0} role="region" aria-label="KPIs, documented versus proposed, paper table 6.5" data-hscroll>
      <table class="ptable s6-status-table s6-kpi-table" data-paper-table="6.5#1">
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
            const prop = /^Proposed$/.test(t.rowsPlain[ri][1].replace(/\*/g, '').trim());
            const kpis = splitInline(r[0]);
            const segs = splitInline(r[2]);
            return (
              <tr key={ri} class={prop ? 's6-row-prop' : undefined}>
                <th scope="row" data-label={heads[0]}>
                  <ul class="s6-cell-list">
                    {kpis.map((k, i) => (
                      <li key={i}>
                        <Inline nodes={k} />
                      </li>
                    ))}
                  </ul>
                </th>
                <td data-label={heads[1]}>
                  <span class={`s6-status ${prop ? 's6-status-prop' : 's6-status-doc'}`}>
                    <Inline nodes={r[1]} />
                  </span>
                  {prop && (
                    <>
                      {' '}
                      <Chip code="PROP" />
                    </>
                  )}
                </td>
                <td data-label={heads[2]}>
                  <ul class="s6-cell-list">
                    {segs.map((s, i) => {
                      const tag = precedentTag(plain(s).trim());
                      return (
                        <li key={i}>
                          <Inline nodes={s} />
                          {tag && <> {tag}</>}
                        </li>
                      );
                    })}
                  </ul>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Kpis() {
  return (
    <div class="stack-lg">
      <section class="stack" aria-labelledby="s6k-t">
        <h2 id="s6k-t" class="eyebrow">KPIs: documented versus proposed</h2>
        <KpiTable />
        <p class="small muted">
          Tags beside the precedents are the ones the paper gives the same sources and figures in §6.1, §6.2, §6.4 and §6.7.
        </p>
      </section>

      <section class="stack" aria-labelledby="s6k-c">
        <h2 id="s6k-c" class="eyebrow">Counter-evidence on bans versus enablement</h2>
        <p class="lead">
          The paved road has four documented weaknesses <Chip code="CP" />
          <Chip code="VR" />.
        </p>
        <div class="s6-weak">
          <article class="card s6-weak-card s6-weak-wide">
            <span class="eyebrow">First</span>
            <h3 class="s6-weak-title">The sanctioned platform becomes its own shadow estate</h3>
            <div class="grid-2">
              <FigTile n={41} compact />
              <FigTile n={40} compact />
            </div>
            <ul class="s6-ticks small">
              <li>
                Zenity also reports 63% of copilots overshared (
                <Src id="6.6" has="zenity">
                  Zenity
                </Src>
                ) <Chip code="VR" />
              </li>
              <li>
                Nokod's samples: around 10,000 vulnerable applications owned by 2,500 individuals in large environments <Chip code="VR" />
              </li>
              <li>
                The CSA says governance dashboards are “frequently underutilized” <Chip code="CP" />
              </li>
              <li>
                A Power Platform practitioner calls personal connections “credentials sharing as a service” (
                <Src id="6.6" has="perspectives">
                  Perspectives+
                </Src>
                ) <Chip code="RR" />
              </li>
            </ul>
          </article>

          <article class="card s6-weak-card">
            <span class="eyebrow">Second</span>
            <h3 class="s6-weak-title">Maintenance and cost shift to engineering</h3>
            <p class="small">
              Gartner's forecasts <Chip code="PO" /> and Tenable's first-person account <Chip code="CP" />.
            </p>
          </article>

          <article class="card s6-weak-card s6-weak-wide">
            <span class="eyebrow">Third</span>
            <h3 class="s6-weak-title">“Bans fail” is under-evidenced</h3>
            <div class="s6-bans">
              <div class="stack">
                <p class="small">
                  In Netskope's telemetry (1 Oct 2024–31 Oct 2025), <strong>90% of organisations block at least some genAI apps</strong> (average 10), while organisation-managed use rose from 25% to 62% and personal-account use fell <Chip code="VR" />:
                </p>
                <Bars
                  specs={NETSKOPE}
                  max={100}
                  unit="%"
                  labelWidth="3.5rem"
                  caption={<>Personal-account use, which “fell from 78% to 47%” over the telemetry window.</>}
                />
              </div>
              <ul class="s6-ticks small">
                <li>
                  The 2023 corporate bans were temporary restrictions with no measured outcome (
                  <Src id="6.6" has="techcrunch">
                    TechCrunch
                  </Src>
                  ) <Chip code="PO" />
                </li>
                <li>
                  Stated intent to defy bans is self-report: 46% of 6,000 knowledge workers, Software AG (
                  <Src id="6.6" has="eweek">
                    eWeek
                  </Src>
                  ) <Chip code="VR" />
                </li>
              </ul>
            </div>
          </article>

          <article class="card s6-weak-card">
            <span class="eyebrow">Fourth</span>
            <h3 class="s6-weak-title">Non-punitive registration without enforcement has no documented effect</h3>
            <p class="small">
              The CSA itself notes policy without communication “may have negligible effect” <Chip code="CP" />.
            </p>
          </article>
        </div>
      </section>

      <section class="stack" aria-labelledby="s6k-f">
        <h2 id="s6k-f" class="eyebrow">
          How the paper frames it <Chip code="INF" />
        </h2>
        <div class="s6-frame">
          <div class="s6-frame-box">
            <span class="eyebrow">Consensus recommendation</span>
            <strong class="s6-frame-claim">Paved road plus registration</strong>
            <span class="small muted">Gartner, CSA, Tenable, Method, EXANTE, Cloudflare</span>
          </div>
          <div class="s6-frame-join">
            <span>compatible</span>
          </div>
          <div class="s6-frame-box">
            <span class="eyebrow">Consensus practice, measured by Netskope</span>
            <strong class="s6-frame-claim">“Block many, sanction some”</strong>
            <span class="small muted">90% of organisations block some genAI apps; organisation-managed use rose</span>
          </div>
        </div>
        <p class="s6-caution">
          No comparative study of ban versus amnesty versus paved-road outcomes exists <Chip code="INF" />.
        </p>
      </section>
    </div>
  );
}
