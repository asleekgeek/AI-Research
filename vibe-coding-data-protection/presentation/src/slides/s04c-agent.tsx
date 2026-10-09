// s04-b4-agent-plane: paper §4.5.1–4.5.3. Condensed; the drawer (S) holds the verbatim text.
import { Chip } from '../components/Chip';
import { FigTile } from '../components/Figure';
import { Tabs } from '../components/Tabs';
import { Block, Flow, KV, Q, Src, Srcs } from './s04c-parts';

const ENFORCED = [
  { name: 'OS-level sandbox', what: 'around shell commands' },
  { name: 'Network proxy allowlist', what: 'in front of those commands' },
  { name: 'Cloud-side isolation', what: 'ephemeral runners, branch and token restrictions' },
  { name: 'Credential scope', what: 'the IAM or OAuth scope of the credentials the agent holds' },
];

function Enforced() {
  return (
    <div class="stack">
      <ol class="b4-enforced" aria-label="Controls enforced by something other than the model">
        {ENFORCED.map((c) => (
          <li key={c.name}>
            <span class="b4-enforced-name">{c.name}</span>
            <span class="b4-enforced-what">{c.what}</span>
          </li>
        ))}
      </ol>
      <p class="small muted">
        Across Claude Code, Copilot coding agent, Cursor, Codex, Windsurf/Devin Desktop and Replit, these are the only controls enforced by something other than the model. Every vendor documents
        seams in its own words <Chip code="CP" />.
      </p>
    </div>
  );
}

function SeamDiagram() {
  return (
    <figure class="b4-figure">
      <Flow
        label="What the sandbox and egress proxy wrap, and what runs beside them"
        lanes={[
          {
            label: 'Shell commands',
            tone: 'enforced',
            nodes: [
              { title: 'Agent runs a command' },
              { title: 'OS sandbox', sub: 'writes limited; reads may reach credential files', tone: 'enforced' },
              { title: 'Egress allowlist', sub: 'only listed hosts', tone: 'enforced' },
              { title: 'Allowlisted hosts', sub: 'registries, github.com: the lists include hosts that accept uploads', tone: 'open' },
            ],
          },
          {
            label: 'File tools, MCP servers, hooks',
            tone: 'open',
            nodes: [
              { title: 'Agent calls a tool or server' },
              { title: 'No sandbox, no proxy', sub: 'runs on the host with the user’s access', tone: 'open' },
              { title: 'Whatever the host reaches', sub: 'credential files, environment, network beyond the allowlist', tone: 'open' },
            ],
          },
        ]}
      />
      <figcaption class="small muted">
        Claude Code: <Q>The sandbox covers shell commands only. Claude's file tools, MCP servers, and hooks run outside it</Q> <Chip code="CP" />. Copilot: the firewall{' '}
        <Q>does not directly apply to MCP server processes or processes started in configured setup steps</Q> <Chip code="CP" />.
      </figcaption>
      <blockquote class="quote b4-pull">
        Every documented allowlist (Copilot's recommended list, Claude Code's <code>github.com</code>, Cursor defaults) includes hosts that accept uploads; a network allowlist bounds where
        exfiltration can go, not whether it can happen <Chip code="INF" />
      </blockquote>
    </figure>
  );
}

const S = '4.5.1';

function VendorTabs() {
  const cp = <Chip code="CP" />;
  return (
    <Tabs
      label="Each vendor's documented seams"
      tabs={[
        {
          id: 'claude',
          label: 'Claude Code',
          panel: (
            <div class="stack">
              <KV
                label="Claude Code seams"
                rows={[
                  {
                    k: 'Default',
                    v: (
                      <>
                        The sandbox is <Q>off by default</Q>; the network allowlist <Q>start[s] empty</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Reads',
                    v: (
                      <>
                        Writes stay in the working and temp directories, but reads cover <Q>Most of the machine, including credential files such as <code>~/.ssh</code> and <code>~/.aws/credentials</code></Q>;
                        environment variables are <Q>Inherited from Claude Code, including any secrets in its environment</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Coverage',
                    v: (
                      <>
                        <Q>A <code>denyRead</code> entry doesn't stop the Read tool</Q>; hooks, local MCP servers, LSP servers and <code>apiKeyHelper</code> <Q>run with your full access</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Fail-open',
                    v: (
                      <>
                        If the sandbox cannot start, <Q>Claude Code runs commands without sandboxing</Q> unless <code>failIfUnavailable</code> is true {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Retry',
                    v: (
                      <>
                        The model <Q>may retry the command with the <code>dangerouslyDisableSandbox</code> parameter</Q>; an allow rule such as <code>Bash(curl *)</code> <Q>also approves the retry</Q>.
                        Disable with <code>allowUnsandboxedCommands: false</code> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Rules',
                    v: (
                      <>
                        There is <Q>no built-in credential deny list</Q>. Bash deny rules match command text and are <Q>not a security boundary around the program</Q>: <code>Bash(curl *)</code> does not
                        stop <code>/usr/bin/curl</code> or <code>sh -c 'curl ...'</code> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Platform',
                    v: (
                      <>
                        Native Windows runs unsandboxed. Anthropic's own remedy is to run the whole process <Q>in a container, virtual machine, or the sandbox runtime</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Pre-trust',
                    v: (
                      <>
                        Three pre-trust execution paths fixed between August and December 2025: hooks in <code>.claude/settings.json</code> (GHSA-ph6w-f82w-28w6), MCP servers from <code>.mcp.json</code>{' '}
                        (CVE-2025-59536, fixed 1.0.111), <code>ANTHROPIC_BASE_URL</code> exfiltration (CVE-2026-21852, fixed 2.0.65) {cp}. Opening an untrusted repository remains an attack surface.
                      </>
                    ),
                  },
                ]}
              />
              <p class="small muted">
                Practitioner traces confirmed the Read-tool gap and exfiltration through gists once <code>github.com</code> is allowlisted <Chip code="RR" />. Sources:{' '}
                <Srcs s={S} ts={['Claude Code sandboxing', 'Claude Code permissions', 'Check Point Research', 'NVD', 'Claude Code Camp']} />
              </p>
            </div>
          ),
        },
        {
          id: 'copilot',
          label: 'Copilot coding agent',
          panel: (
            <div class="stack">
              <KV
                label="Copilot coding agent seams"
                rows={[
                  { k: 'Default', v: <>Firewall on by default with a recommended allowlist covering OS package repositories, container registries and language package registries {cp}</> },
                  {
                    k: 'Coverage',
                    v: (
                      <>
                        <Q>The firewall applies only to processes the agent starts through its Bash tool. It does not directly apply to MCP server processes or processes started in configured setup steps</Q>{' '}
                        {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Scope',
                    v: (
                      <>
                        It <Q>should not be considered a comprehensive security solution</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Platform',
                    v: (
                      <>
                        Enforced guardrails: no push to the default branch, one <code>copilot/</code> branch per task, Actions on agent PRs need write-user approval, hidden-character filtering, secrets
                        only from the <code>copilot</code> environment, 59-minute sessions {cp}
                      </>
                    ),
                  },
                  {
                    k: 'MCP',
                    v: (
                      <>
                        Once an MCP server is configured <Q>Copilot can use its tools autonomously without asking for approval</Q>, so GitHub recommends read-only tool allowlists rather than{' '}
                        <code>"*"</code> {cp}
                      </>
                    ),
                  },
                ]}
              />
              <p class="small muted">
                Sources: <Srcs s={S} ts={['GitHub firewall', 'GitHub responsible use', 'About coding agent', 'GitHub MCP']} />
              </p>
            </div>
          ),
        },
        {
          id: 'cursor',
          label: 'Cursor',
          panel: (
            <div class="stack">
              <KV
                label="Cursor seams"
                rows={[
                  {
                    k: 'Default',
                    v: (
                      <>
                        The sandbox (2.0, macOS Seatbelt) defaults to <code>readBoundary: "system"</code> (reads unrestricted) and <code>networkPolicy.default: "deny"</code> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Admin policy',
                    v: (
                      <>
                        Team-admin policies <Q>can't be weakened by user or repo files</Q> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Retry',
                    v: (
                      <>
                        Auto-review <Q>is not a security boundary</Q>; a failed sandboxed command can be rerun outside the sandbox after classifier review {cp}
                      </>
                    ),
                  },
                ]}
              />
              <p class="small muted">
                Sources: <Srcs s={S} ts={['Cursor sandbox.json', 'Cursor Run modes']} />
              </p>
            </div>
          ),
        },
        {
          id: 'codex',
          label: 'Codex',
          panel: (
            <div class="stack">
              <KV
                label="Codex seams"
                rows={[
                  {
                    k: 'Default',
                    v: (
                      <>
                        Defaults to <code>workspace-write</code> and offers <code>danger-full-access</code> {cp}
                      </>
                    ),
                  },
                  {
                    k: 'Network',
                    v: (
                      <>
                        The domain-enforcing proxy <Q>Defaults to <code>false</code></Q>, with <Q>App and connector traffic ... not controlled</Q> by it {cp}
                      </>
                    ),
                  },
                ]}
              />
              <p class="small muted">
                Source: <Src s={S} t="Codex config" />
              </p>
            </div>
          ),
        },
        {
          id: 'devin',
          label: 'Windsurf / Devin',
          panel: (
            <div class="stack">
              <KV
                label="Windsurf and Devin Desktop seams"
                rows={[{ k: 'Controls', v: <>Prefix-matched allow/deny lists up to a Turbo mode; no OS sandbox or network restriction is documented {cp}</> }]}
              />
              <p class="small muted">
                Source: <Src s={S} t="Devin Desktop" />
              </p>
            </div>
          ),
        },
        {
          id: 'replit',
          label: 'Replit',
          panel: (
            <div class="stack">
              <KV
                label="Replit"
                rows={[
                  {
                    k: 'Production',
                    v: (
                      <>
                        <Q>Agent is not able to modify the production database</Q> {cp}: the only vendor change in the record that removes the destructive capability rather than mitigating it{' '}
                        <Chip code="INF" />
                      </>
                    ),
                  },
                ]}
              />
              <p class="small muted">
                Source: <Src s={S} t="Replit dev/prod" />
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}

/** The lethal trifecta drawn as three overlapping sets; the agent that holds all three sits in the middle. */
function Trifecta() {
  return (
    <svg class="chart b4-venn" viewBox="0 0 320 270" role="img" aria-label="Lethal trifecta: private data, untrusted content and an exfiltration channel overlap where one agent holds all three">
      <circle class="b4-venn-set s1" cx="118" cy="104" r="80" />
      <circle class="b4-venn-set s2" cx="202" cy="104" r="80" />
      <circle class="b4-venn-set s3" cx="160" cy="176" r="80" />
      <text x="84" y="84" text-anchor="middle" class="b4-venn-label">
        Private
      </text>
      <text x="84" y="100" text-anchor="middle" class="b4-venn-label">
        data
      </text>
      <text x="236" y="84" text-anchor="middle" class="b4-venn-label">
        Untrusted
      </text>
      <text x="236" y="100" text-anchor="middle" class="b4-venn-label">
        content
      </text>
      <text x="160" y="222" text-anchor="middle" class="b4-venn-label">
        Exfiltration
      </text>
      <text x="160" y="238" text-anchor="middle" class="b4-venn-label">
        channel
      </text>
      <circle class="b4-venn-core" cx="160" cy="130" r="17" />
      <text x="160" y="134" text-anchor="middle" class="b4-venn-core-label">
        agent
      </text>
    </svg>
  );
}

function Mcp() {
  const s = '4.5.2';
  return (
    <div class="stack-lg">
      <div class="b4-mcp-top">
        <div class="stack b4-venn-wrap">
          <Trifecta />
          <p class="small">
            <Q>LLMs are unable to reliably distinguish the importance of instructions based on where they came from</Q> <Chip code="RR" /> <Src s={s} t="Simon Willison" />
          </p>
        </div>
        <div class="stack">
          <h3 class="h3">The General Analysis demonstration (8 Jul 2025), leg by leg</h3>
          <dl class="b4-legs">
            <div>
              <dt>Private data</dt>
              <dd>
                <code>integration_tokens</code>, reachable because Cursor ran the Supabase MCP under <code>service_role</code>
              </dd>
            </div>
            <div>
              <dt>Untrusted content</dt>
              <dd>
                a support ticket submitted via <code>anon</code>
              </dd>
            </div>
            <div>
              <dt>Exfiltration channel</dt>
              <dd>the agent copied the tokens back into the ticket</dd>
            </div>
          </dl>
          <p class="small">
            Read-only mode <Q>blocks the write-back step but still permits reads</Q> <Chip code="RR" /> <Src s={s} t="General Analysis" />
          </p>
          <p class="small">
            Tool poisoning (hidden instructions in tool descriptions, <Q>rug pulls</Q>, cross-server shadowing) exfiltrated <code>~/.cursor/mcp.json</code> and SSH keys in Invariant's demonstration{' '}
            <Chip code="RR" /> <Src s={s} t="Invariant Labs" />
          </p>
        </div>
      </div>

      <div class="b4-mcp-grid">
        <div class="stack">
          <FigTile n={32} />
          <p class="small muted">Sentry called a root-cause fix <Q>technically not defensible</Q>.</p>
        </div>
        <div class="card b4-record">
          <span class="eyebrow">Status of the record</span>
          <p>
            As of 9 October 2026 no primary source confirms an in-the-wild incident in which a coding agent exfiltrated secrets via MCP; the record is high-fidelity research (Sentry MCP agentjacking;{' '}
            <code>claude-code-action</code> CVE-2025-66032) plus one CI case the CSA says was exploited in the wild <Chip code="CP" />/<Chip code="PO" />
          </p>
          <p class="small">
            Absence is consistent with low detectability: the Sentry attack uses legitimate developer credentials and looks like normal activity <Chip code="INF" />
          </p>
          <p class="small muted">
            <Srcs s={s} ts={['CSA agentjacking', 'CSA CI/CD']} />
          </p>
        </div>
      </div>

      <div class="grid-2">
        <div class="stack">
          <h3 class="h3">
            Supabase's own MCP guidance (8 Oct 2026) <Chip code="CP" />
          </h3>
          <ul class="b4-ticks">
            <li>
              Connect to production <Q>only when the task requires production evidence</Q>, with <code>read_only=true</code>, <code>project_ref</code> scoping and restricted feature groups
            </li>
            <li>
              Manual approval of each tool call is <Q>a guardrail, not a guarantee of human review</Q>
            </li>
            <li>
              Result-wrapping against injection <Q>is not foolproof</Q>
            </li>
          </ul>
          <p class="small muted">
            Source: <Src s={s} t="Supabase MCP" />
          </p>
        </div>
        <div class="stack">
          <h3 class="h3">
            Protocol and gateways <Chip code="CP" />
          </h3>
          <ul class="b4-ticks">
            <li>The MCP authorisation spec makes authorisation optional, forbids token passthrough and recommends short-lived tokens</li>
            <li>
              Cloudflare MCP server portals give per-tool allowlists and Logpush, but blocked users <Q>can bypass this by using a server's direct URL</Q>
            </li>
            <li>
              Docker MCP Gateway (<Q>invite-only</Q>); Azure API Management with Entra JWT policies
            </li>
          </ul>
          <p class="small muted">
            Sources: <Srcs s={s} ts={['MCP spec 2025-06-18', 'Cloudflare', 'Docker', 'Microsoft Learn']} />
          </p>
        </div>
      </div>

      <p class="small b4-aside">
        <strong>Rules files are an injection surface.</strong> Pillar's <Q>Rules File Backdoor</Q> hid instructions in <code>.cursor/rules</code> and Copilot instruction files with zero-width and
        bidirectional Unicode; GitHub added a hidden-Unicode warning on 1 May 2025 <Chip code="VR" />; no in-the-wild case is reported <Chip code="VR" /> <Src s={s} t="Pillar Security" />
      </p>
    </div>
  );
}

function VendorChanges() {
  const s = '4.5.3';
  return (
    <ul class="b4-changes">
      <li>
        <span class="b4-changes-who">Replit</span>
        <div class="stack">
          <p>
            21 Jul 2025: <Q>automatic DB dev/prod separation to prevent this categorically</Q> <Chip code="PO" />, now documented as <Q>Agent is not able to modify the production database</Q>{' '}
            <Chip code="CP" />
          </p>
          <p class="small muted">
            <Src s={s} t="The Register" />
          </p>
        </div>
        <span class="b4-effect is-removes">
          Removes the capability <Chip code="INF" />
        </span>
      </li>
      <li>
        <span class="b4-changes-who">Railway</span>
        <div class="stack">
          <p>
            The API <code>volumeDelete</code> mutation now has the same <Q>two-day grace period</Q> as dashboard deletes <Chip code="CP" />. Still no permission-scoped API tokens: the model is
            Account, Workspace, Project (one environment) and OAuth <Chip code="CP" />; a <Q>Read-only access for AI agents</Q> request is <Q>Under Review</Q> with no reply <Chip code="CP" />
          </p>
          <p class="small">
            A token that can delete a volume can still delete it; the window converts an irreversible call into a two-day reversible one <Chip code="INF" />
          </p>
          <p class="small muted">
            <Srcs s={s} ts={['Railway Central Station', 'Railway Public API', 'Railway feedback']} />
          </p>
        </div>
        <span class="b4-effect is-recovers">
          Recoverability, not authorisation <Chip code="INF" />
        </span>
      </li>
      <li>
        <span class="b4-changes-who">Anthropic, Cursor</span>
        <div class="stack">
          <p>
            No statement or change attributable to PocketOS was found. Cursor's network controls (Feb 2026) predate it; Anthropic's 2026 hardening (<code>bypassPermissions</code> no longer honoured
            from project settings in v2.1.257, <code>blockReadsOutsideWorkingDirectories</code>, <code>allowManagedMcpServersOnly</code> in v2.1.273, strict-sandbox precedence fix in v2.1.285) is
            not attributed to the incident <Chip code="CP" />
          </p>
          <p class="small muted">
            <Srcs s={s} ts={['Claude Code settings', 'managed settings']} />
          </p>
        </div>
        <span class="b4-effect">Not attributed</span>
      </li>
      <li>
        <span class="b4-changes-who">Google, Amazon</span>
        <div class="stack">
          <p>
            Google fixed the Gemini CLI WIF over-grant with <code>.geminiignore</code> and role scoping <Chip code="CP" />; Amazon introduced <Q>mandatory peer review for production access</Q>{' '}
            <Chip code="CP" />
          </p>
          <p class="small muted">
            <Src s={s} t="Amazon" />
          </p>
        </div>
        <span class="b4-effect">Scoping and review</span>
      </li>
    </ul>
  );
}

export function AgentPlane() {
  return (
    <div class="stack-lg b4">
      <Enforced />
      <Block id="b4-seams" num="4.5.1" title="The sandbox wraps shell commands; tools, MCP servers and hooks run beside it">
        <SeamDiagram />
        <h3 class="h3">Each vendor's seams, in its own documentation's words</h3>
        <VendorTabs />
      </Block>
      <Block id="b4-mcp" num="4.5.2" title="MCP is the host-side channel every sandbox leaves open">
        <Mcp />
      </Block>
      <Block id="b4-changes" num="4.5.3" title="What vendors changed after incidents">
        <VendorChanges />
      </Block>
    </div>
  );
}
