// s04-b4-recovery: paper §4.5.5–4.5.7. Prices only via key figures or the paper's own wording, each with its source.
import { Chip } from '../components/Chip';
import { FigRef, FigTile } from '../components/Figure';
import { Block, Flow, KV, Q, Src, Srcs } from './s04c-parts';

function DevProd() {
  const s = '4.5.5';
  return (
    <div class="stack b4-devprod">
        <KV
          label="Dev/prod separation by vendor"
          rows={[
            {
              k: 'Replit',
              v: (
                <>
                  <Q>Agent is not able to modify the production database</Q> <Chip code="CP" />
                </>
              ),
            },
            {
              k: 'Neon',
              v: (
                <>
                  Snapshots at <Q>Start of each agent session</Q> and <Q>Before database schema changes</Q>, restorable with the connection string preserved, at USD 0.09/GB-month <FigRef n={46} />;
                  anonymised branches masked with PostgreSQL Anonymizer <Chip code="CP" /> <Srcs s={s} ts={['Neon versioning', 'Neon anonymization']} />
                </>
              ),
            },
            {
              k: 'Supabase',
              v: (
                <>
                  Branches are <Q>data-less by default</Q>, auto-deleted on PR close, experimental and paid, with no masking documented <Chip code="CP" /> <Src s={s} t="Supabase branching" />
                </>
              ),
            },
            {
              k: 'PlanetScale',
              v: (
                <>
                  Production-branch deletion restricted to administrators; recommends against production data in development <Chip code="CP" /> <Src s={s} t="PlanetScale" />
                </>
              ),
            },
          ]}
        />
    </div>
  );
}

function Brokering() {
  const s = '4.5.5';
  return (
    <div class="stack">
      <Flow
        label="Credential brokering"
        lanes={[
          {
            label: 'Brokered call',
            tone: 'safe',
            nodes: [
              { title: 'Agent makes the call', sub: 'holds no destructive credential' },
              { title: 'Broker adds the credential', sub: 'short-lived, scoped, or only on allowed hosts', tone: 'safe' },
              { title: 'Cloud role, API or database', sub: 'sees a credential the agent never held' },
            ],
          },
        ]}
      />
      <KV
        label="Documented brokers"
        rows={[
          {
            k: 'Vercel OIDC',
            v: (
              <>
                Federation on all plans; build and function tokens with 2-hour TTL; cloud roles scoped per project and environment <Chip code="CP" /> <Src s={s} t="Vercel OIDC" />
              </>
            ),
          },
          {
            k: 'GitHub OIDC',
            v: (
              <>
                Actions tokens <Q>only valid for a single job</Q>, with <code>sub</code> claims such as <code>repo:org/repo:environment:prod</code> <Chip code="CP" /> <Src s={s} t="GitHub OIDC" />
              </>
            ),
          },
          {
            k: 'Outbound Workers',
            v: (
              <>
                Cloudflare intercepts every <code>fetch()</code> and adds authentication <Q>so end developers don't need credentials</Q> <Chip code="CP" /> <Src s={s} t="Cloudflare" />
              </>
            ),
          },
          {
            k: (
              <>
                <code>mask</code> + <code>injectHosts</code>
              </>
            ),
            v: (
              <>
                Claude Code substitutes the real secret only on allowed hosts <Chip code="CP" />
              </>
            ),
          },
        ]}
      />
      <p class="small">
        OWASP Agentic Top 10, ASI03: agents <Q>inherit credentials such as user sessions, API keys, and OAuth tokens</Q>; <Q>Issue short-lived, narrowly scoped tokens per task</Q> <Chip code="RR" />{' '}
        <Src s={s} t="Descope summary of OWASP" />
      </p>
      <p class="small b4-aside">
        Where a provider cannot scope tokens, as Railway still cannot, the closest approximation is token type (a project token bound to one environment) and the gap is a vendor-selection criterion{' '}
        <Chip code="INF" />
      </p>
    </div>
  );
}

/** The PocketOS class versus a copy outside the identity domain the agent's credentials reach. */
function BlastRadius() {
  return (
    <div class="b4-zones">
      <figure class="b4-zonefig is-bad">
        <figcaption>
          <span class="eyebrow">Inside the blast radius</span>
          <strong>Backups the same credential can reach</strong>
        </figcaption>
        <div class="b4-zone is-reach">
          <span class="b4-zone-label">Reachable by the agent's credential</span>
          <div class="b4-zone-items">
            <span class="b4-node is-plain">
              <span class="b4-node-title">Production data</span>
            </span>
            <span class="b4-node is-open">
              <span class="b4-node-title">Backups</span>
              <span class="b4-node-sub">same volume or same account</span>
            </span>
          </div>
        </div>
        <p class="small">
          The PocketOS class: same-volume or same-account backups were deleted by the same call <Chip code="PO" />/<Chip code="CP" />
        </p>
      </figure>
      <figure class="b4-zonefig is-good">
        <figcaption>
          <span class="eyebrow">Outside the blast radius</span>
          <strong>
            A copy in another identity domain <Chip code="PROP" />
          </strong>
        </figcaption>
        <div class="b4-zone is-reach">
          <span class="b4-zone-label">Reachable by the agent's credential</span>
          <div class="b4-zone-items">
            <span class="b4-node is-plain">
              <span class="b4-node-title">Production data</span>
            </span>
          </div>
        </div>
        <div class="b4-wall" aria-label="Separation">
          <span>no credential in the primary account can delete it or shorten retention</span>
        </div>
        <div class="b4-zone is-safe">
          <span class="b4-zone-label">Separate identity domain, storage-enforced immutability</span>
          <div class="b4-zone-items">
            <span class="b4-node is-safe">
              <span class="b4-node-title">Recovery points</span>
              <span class="b4-node-sub">restored through a tested, cross-account path</span>
            </span>
          </div>
        </div>
      </figure>
    </div>
  );
}

const NEEDS = [
  'A copy outside the identity domain the agent’s credentials can reach',
  'Storage-enforced immutability that no credential in the primary account can shorten',
  'Optional cross-account restore paths',
  'Tested restores with measured RPO and RTO',
];

function Backups() {
  const s = '4.5.6';
  return (
    <div class="stack-lg">
      <BlastRadius />
      <div class="stack">
        <h3 class="h3">
          What an architecture that survives the PocketOS class needs <Chip code="PROP" />
        </h3>
        <ul class="b4-needs">
          {NEEDS.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      <div class="split">
        <div class="stack">
          <h3 class="h3">
            AWS logically air-gapped vault, as documented <Chip code="CP" />
          </h3>
          <KV
            label="AWS logically air-gapped vault properties"
            rows={[
              {
                k: 'Where',
                v: (
                  <>
                    Recovery points stored <Q>in an AWS Backup service owned account</Q>
                  </>
                ),
              },
              {
                k: 'Lock',
                v: (
                  <>
                    <Q>always locked with a vault lock in compliance mode</Q>; minimum retention of 7 days
                  </>
                ),
              },
              {
                k: 'Sharing',
                v: (
                  <>
                    <Q>Can optionally be shared across accounts using AWS RAM</Q>
                  </>
                ),
              },
              {
                k: 'Approval',
                v: (
                  <>
                    <strong>Multi-party approval is optional.</strong> It enables recovery <Q>even if the vault-owning account is inaccessible</Q>, and needs two Organizations, Identity Center, a
                    RAM-shared approval team and an SCP; <Q>no additional MPA cost</Q>
                  </>
                ),
              },
              {
                k: 'Vault Lock',
                v: (
                  <>
                    Compliance mode becomes immutable after a grace period of at least 3 days, denying deletion to <Q>any user (including the root user)</Q>
                  </>
                ),
              },
              {
                k: 'Closure',
                v: (
                  <>
                    On account closure AWS deletes vault contents after 90 days <Q>even if a vault lock was in place</Q>
                  </>
                ),
              },
            ]}
          />
          <p class="small muted">
            Sources: <Srcs s={s} ts={['AWS LAG vault', 'AWS MPA', 'AWS Vault Lock']} />
          </p>
        </div>
        <div class="stack">
          <h3 class="h3">
            Equivalents elsewhere <Chip code="CP" />
          </h3>
          <ul class="b4-ticks">
            <li>
              <Src s={s} t="Azure" />: immutable vault <Q>Enabled and locked</Q> (irreversible; enforced soft delete 14 days; Resource Guard in a different tenant for <Q>Maximum</Q> isolation)
            </li>
            <li>
              <Src s={s} t="GCP" /> backup vaults, where <Q>no one (not even a Project Owner) can decrease the retention period</Q>
            </li>
            <li>
              <Src s={s} t="Backblaze" /> B2 compliance-mode Object Lock
            </li>
            <li>
              <Src s={s} t="pgBackRest" />, relying on storage-layer object lock
            </li>
          </ul>
        </div>
      </div>

      <div class="stack">
        <h3 class="h3">Cost anchors</h3>
        <div class="grid-3 b4-costs">
          <FigTile n={45} compact />
          <FigTile n={46} compact />
          <FigTile n={47} compact label="Air-gapped, compliance-locked copy of a 200 GB database (authors' arithmetic)" />
        </div>
        <p class="small">
          Also listed: AWS warm storage USD 0.05/GB-month; restore USD 0.02–0.03/GB <Chip code="CP" /> <Src s={s} t="AWS Backup pricing" />. The authors' arithmetic assumes 30 recovery points averaging 400
          GB stored <Chip code="INF" />.
        </p>
      </div>

      <div class="b4-grace" role="note">
        <p>
          <strong>Grace periods protect against one call.</strong> Provider-internal grace periods (Railway two days, Replit 7 days, Azure 14 days) protect against a single destructive call but not against a
          credential that can also purge or wait out the window <Chip code="INF" />
        </p>
        <p class="small">
          PocketOS's own newest backup was months old, so the restore-drill gap was a root cause alongside the storage layout <Chip code="PO" />/<Chip code="INF" />
        </p>
      </div>
    </div>
  );
}

function Registry() {
  const s = '4.5.7';
  return (
    <div class="stack-lg">
      <div class="split">
        <div class="stack">
          <FigTile n={33} />
          <p class="small">
            The November 2025 wave harvested AWS, GCP, Azure, npm and GitHub credentials via <code>preinstall</code>, and installed a self-hosted Actions runner when the GitHub token had{' '}
            <code>workflows</code> scope <Chip code="RR" /> <Src s={s} t="Semgrep" />
          </p>
        </div>
        <div class="stack">
          <Flow
            label="Agent-driven installs: open path and the deterministic form"
            lanes={[
              {
                label: 'Open path',
                tone: 'open',
                nodes: [
                  { title: <>Agent runs <code>npm install</code></> },
                  { title: 'Public registry', sub: 'Copilot’s recommended allowlist includes public registries', tone: 'open' },
                  { title: <><code>preinstall</code> runs</>, sub: <>sandbox reads cover <code>~/.aws</code>, <code>~/.npmrc</code>, the environment</>, tone: 'open' },
                ],
              },
              {
                label: <>Deterministic form <Chip code="PROP" /></>,
                tone: 'prop',
                nodes: [
                  { title: <>Agent runs <code>npm install</code></> },
                  { title: 'Egress allowlist', sub: 'reaches only the proxy', tone: 'enforced' },
                  { title: 'Internal curated registry proxy', tone: 'prop' },
                ],
              },
            ]}
          />
          <p class="small">
            An agent running <code>npm install</code> inside a sandbox whose reads cover <code>~/.aws</code>, <code>~/.npmrc</code> and the environment hands such a worm the same material a developer
            shell would <Chip code="INF" />. Copilot's recommended allowlist includes public registries, leaving this path open <Chip code="CP" />
          </p>
        </div>
      </div>
      <div class="grid-2">
        <div class="stack">
          <h3 class="h3">
            The CSA's controls for agent-driven installs <Chip code="CP" />
          </h3>
          <ul class="b4-ticks">
            <li>An allowlist, with other installs routed to human review</li>
            <li>Pinned lockfiles with hash verification in CI</li>
            <li>Flags on packages registered in the last 30–90 days</li>
            <li>SBOMs for AI-generated code</li>
          </ul>
          <p class="small muted">
            Source: <Src s={s} t="CSA slopsquatting" />
          </p>
        </div>
        <div class="stack">
          <h3 class="h3">What install-time scanning leaves open</h3>
          <p class="small">
            Socket Firewall's free tier blocks known-malicious packages at install, but <Q>possible AI-detected malware only triggers a warning</Q> and unknown packages pass <Chip code="VR" />{' '}
            <Src s={s} t="Socket" />
          </p>
          <p class="small muted">Registry-proxy products were not verified from primary documentation in this pass (gap). Package hallucination itself is measured in §5.7.</p>
        </div>
      </div>
    </div>
  );
}

export function Recovery() {
  return (
    <div class="stack-lg b4">
      <Block id="rc-devprod" num="4.5.5" title="Keep the agent away from production">
        <DevProd />
      </Block>
      <Block id="rc-broker" num="4.5.5" title="Broker the credential instead of handing it over">
        <Brokering />
      </Block>
      <Block id="rc-backup" num="4.5.6" title="Backups outside the blast radius">
        <Backups />
      </Block>
      <Block id="rc-registry" num="4.5.7" title="Dependency and registry controls">
        <Registry />
      </Block>
    </div>
  );
}
