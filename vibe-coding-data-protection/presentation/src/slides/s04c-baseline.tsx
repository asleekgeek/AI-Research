// s04-b4-baseline: paper §4.5.4. The Claude Code table is the paper's, cell for cell.
import { Chip } from '../components/Chip';
import { PaperTable } from '../components/PaperTable';
import { Q, Src, Srcs } from './s04c-parts';

const S = '4.5.4';

const LOCATIONS = [
  <code>/Library/Application Support/ClaudeCode/managed-settings.json</code>,
  <code>/etc/claude-code/managed-settings.json</code>,
  <code>C:\Program Files\ClaudeCode\managed-settings.json</code>,
  <>MDM profiles</>,
  <>Windows registry, re-checked every 30 minutes</>,
  <>the claude.ai console</>,
];

/** How a managed value combines with user and project values, per the documented lock semantics. */
function LockSemantics() {
  return (
    <div class="b4-locks" role="list" aria-label="Documented lock semantics">
      <div class="b4-lock b4-lock-head" aria-hidden="true">
        <span class="b4-lock-in">Set in managed and local settings</span>
        <span class="b4-lock-out">Takes effect</span>
      </div>
      <div class="b4-lock" role="listitem">
        <span class="b4-lock-kind">Boolean keys</span>
        <span class="b4-lock-in">
          <span class="b4-tok is-managed">managed value</span>
          <span class="b4-tok is-local is-overridden">local value</span>
        </span>
        <span class="b4-lock-out">
          <span class="b4-tok is-managed">managed value</span>
        </span>
        <span class="b4-lock-note">Boolean keys set in managed settings override local values</span>
      </div>
      <div class="b4-lock" role="listitem">
        <span class="b4-lock-kind">Array keys</span>
        <span class="b4-lock-in">
          <span class="b4-tok is-managed">managed entries</span>
          <span class="b4-tok is-local">user and project entries</span>
        </span>
        <span class="b4-lock-out">
          <span class="b4-tok is-managed">managed entries</span>
          <span class="b4-tok is-local">user and project entries</span>
        </span>
        <span class="b4-lock-note">Array keys merge…</span>
      </div>
      <div class="b4-lock" role="listitem">
        <span class="b4-lock-kind">Array keys under a lock</span>
        <span class="b4-lock-in">
          <span class="b4-tok is-managed">managed entries</span>
          <span class="b4-tok is-local is-overridden">user and project entries</span>
        </span>
        <span class="b4-lock-out">
          <span class="b4-tok is-managed">managed entries</span>
        </span>
        <span class="b4-lock-note">
          …unless a lock such as <code>allowManagedDomainsOnly</code> or <code>allowManagedReadPathsOnly</code> covers them
        </span>
      </div>
    </div>
  );
}

/** What the baseline encloses and what it leaves on the host. */
function Residual() {
  return (
    <figure class="b4-figure">
      <div class="b4-nest is-vm" role="group" aria-label="Containment after the baseline">
        <span class="b4-nest-label">
          Container or VM around the whole process <span class="muted">· for unattended or high-risk use</span>
        </span>
        <div class="b4-nest is-host">
          <span class="b4-nest-label">Host, with the developer's access</span>
          <div class="b4-nest-row">
            <div class="b4-nest is-sandbox">
              <span class="b4-nest-label">Managed sandbox</span>
              <ul class="b4-nest-items">
                <li>shell commands</li>
                <li>on, fail closed, no unsandboxed retry</li>
                <li>egress to the internal registry proxy and git host only</li>
              </ul>
            </div>
            <div class="b4-nest is-outside">
              <span class="b4-nest-label">Still outside the sandbox</span>
              <ul class="b4-nest-items">
                <li>MCP servers</li>
                <li>hooks</li>
                <li>
                  <code>apiKeyHelper</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption class="small">
        Residual after this baseline: MCP servers, hooks and <code>apiKeyHelper</code> still run with full host access; unattended or high-risk use should run the whole process in a container or VM{' '}
        <Chip code="CP" />/<Chip code="INF" />
      </figcaption>
    </figure>
  );
}

const COPILOT = [
  <>
    Org <Q>Enable firewall</Q> = Enabled
  </>,
  <>Recommended allowlist = Disabled, with an org custom allowlist pointing at an internal registry proxy and required GitHub hosts</>,
  <>
    <Q>Allow repository custom rules</Q> off
  </>,
  <>
    MCP servers limited to read-only <code>tools</code> allowlists; no <code>COPILOT_MCP_</code> secrets with write scopes
  </>,
  <>
    Environment protection rules on the <code>copilot</code> environment
  </>,
  <>
    Third-party actions pinned to commit SHAs; no <code>id-token: write</code> or <code>contents: write</code> for agent workflows
  </>,
];

export function Baseline() {
  return (
    <div class="stack-lg b4">
      <section class="b4-block" aria-labelledby="bl-mech">
        <header class="b4-block-head">
          <span class="eyebrow">Mechanism</span>
          <h2 id="bl-mech" class="h2">
            Where managed settings live, and how they win
          </h2>
        </header>
        <div class="split b4-mech">
          <div class="stack">
            <p class="small">
              Anthropic publishes the mechanism and its lock semantics <Chip code="CP" />. Managed settings are read from:
            </p>
            <ul class="b4-paths">
              {LOCATIONS.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <p class="small muted">
              Anthropic's fuller example <Q>isn't a recommended policy</Q> <Chip code="CP" />. Sources: <Srcs s={S} ts={['Claude Code managed settings', 'sandboxing', 'Claude Code settings example']} />
            </p>
          </div>
          <div class="stack">
            <LockSemantics />
            <p class="small">
              <code>allowUnsandboxedCommands: false</code> makes the sandbox <Q>admin-required</Q> <Chip code="CP" />
            </p>
          </div>
        </div>
      </section>

      <section class="b4-block" aria-labelledby="bl-table">
        <header class="b4-block-head">
          <span class="eyebrow">Claude Code baseline</span>
          <h2 id="bl-table" class="h2">
            Documented keys, assembled into one baseline
          </h2>
          <p class="small">
            Every key is documented <Chip code="CP" />; the combination is the authors' <Chip code="PROP" />. The paper's table, cell for cell:
          </p>
        </header>
        <div class="b4-baseline">
          <PaperTable id="4.5.4#1" caption="Minimal Claude Code managed-settings baseline (paper §4.5.4)" />
        </div>
      </section>

      <div class="grid-2 b4-after">
        <section class="b4-block" aria-labelledby="bl-res">
          <header class="b4-block-head">
            <span class="eyebrow">Residual</span>
            <h2 id="bl-res" class="h2">
              What the baseline still leaves on the host
            </h2>
          </header>
          <Residual />
        </section>
        <section class="b4-block" aria-labelledby="bl-copilot">
          <header class="b4-block-head">
            <span class="eyebrow">Copilot coding agent baseline</span>
            <h2 id="bl-copilot" class="h2">
              Documented toggles, proposed combination
            </h2>
            <p class="small">
              Toggles documented <Chip code="CP" />; combination <Chip code="PROP" />
            </p>
          </header>
          <ul class="b4-ticks">
            {COPILOT.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p class="small muted">
            Whether an enterprise can lock all orgs is not documented (gap). Sources: <Src s={S} t="GitHub firewall" />; <Src s={S} t="CSA CI/CD" />
          </p>
        </section>
      </div>
    </div>
  );
}
