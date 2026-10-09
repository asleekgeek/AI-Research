import type { SlideDef } from './types';
import { AgentPlane } from './s04c-agent';
import { Baseline } from './s04c-baseline';
import { Recovery } from './s04c-recovery';
import { Discovery } from './s04c-discovery';
import './s04c.css';

const slides: SlideDef[] = [
  {
    slug: 's04-b4-agent-plane',
    section: '4',
    title: 'Controls enforced outside the model are few, and every vendor documents their seams',
    short: 'Agent plane',
    dek: 'An OS sandbox around shell commands, a network proxy allowlist, cloud-side isolation and the scope of the credentials the agent holds are the only controls enforced by something other than the model. MCP is the host-side channel every sandbox leaves open.',
    paper: ['4.5.1', '4.5.2', '4.5.3'],
    flags: { dated: true },
    Body: AgentPlane,
  },
  {
    slug: 's04-b4-baseline',
    section: '4',
    title: 'Managed settings can lock the sandbox, but the host-side seams remain',
    short: 'Managed-settings baseline',
    dek: 'Anthropic documents where managed settings live and how they override local values. The baseline assembles documented keys; MCP servers, hooks and apiKeyHelper still run with full host access.',
    paper: ['4.5.4'],
    flags: {
      dated: true,
      prop: "The combination of keys in both baselines is the authors' design. Each key, toggle and lock semantic is documented by the vendor and tagged confirmed-primary.",
    },
    Body: Baseline,
  },
  {
    slug: 's04-b4-recovery',
    section: '4',
    title: "Dev/prod separation is the one categorical control; backups must sit outside the agent's reach",
    short: 'Dev/prod, brokering, backups',
    dek: 'Credential brokering keeps the destructive credential out of the agent’s reach. Provider grace periods protect against a single destructive call, not against a credential that can also purge or wait out the window.',
    paper: ['4.5.5', '4.5.6', '4.5.7'],
    flags: { dated: true },
    Body: Recovery,
  },
  {
    slug: 's04-discovery',
    section: '4',
    title: 'Per-app hostnames on platform subdomains never reach certificate logs, so discovery needs other signals',
    short: 'Shadow-app discovery',
    dek: 'All five builder platform subdomains are served under a single wildcard certificate, live apps included. A six-step pipeline works from inside the sanctioned tenants outward.',
    paper: ['4.6'],
    flags: {
      dated: true,
      prop: "The six-step pipeline is the authors' proposal. The wildcard-certificate finding is the authors' own direct verification, tagged confirmed-primary.",
    },
    Body: Discovery,
  },
];
export default slides;
