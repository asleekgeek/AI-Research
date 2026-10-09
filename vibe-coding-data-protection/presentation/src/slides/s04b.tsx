// §4.2–4.4: boundaries B1 (builder identity), B2 (ingress) and B3 (the data API).
import type { SlideDef } from './types';
import { VendorsBody } from './s04b-vendors';
import { IngressBody } from './s04b-ingress';
import { GatesBody } from './s04b-gates';
import { TrustBody } from './s04b-trust';
import { MatrixBody } from './s04b-matrix';
import { OtherBody } from './s04b-other';
import './s04b.css';

const slides: SlideDef[] = [
  {
    slug: 's04-b1-vendors',
    section: '4',
    title: 'Only three products let an admin forbid public apps with no per-builder override',
    short: 'B1 · Vendor defaults',
    dek: '“SSO” on a pricing page almost always means builder-console login; whether an admin can force every published app behind the IdP is a separate question.',
    paper: ['4.2'],
    flags: { dated: true },
    Body: VendorsBody,
  },
  {
    slug: 's04-b2-ingress',
    section: '4',
    title: 'An identity-aware proxy protects one hostname, not the platform subdomain or the data API',
    short: 'B2 · Ingress',
    dek: 'For apps on Vercel, Netlify or Lovable platform subdomains, an IAP in front of a custom domain protects only that hostname; the platform subdomain and any direct BaaS endpoint remain reachable unless separately locked.',
    paper: ['4.3'],
    flags: { dated: true },
    Body: IngressBody,
  },
  {
    slug: 's04-b3-gates',
    section: '4',
    title: 'Grants and RLS are each necessary, not sufficient, even after 30 October 2026',
    short: 'B3 · Postgres gates',
    dek: 'Four independent PostgreSQL mechanisms gate a Supabase Data API request, in order, and two side paths bypass all of them unless configured.',
    paper: ['4.4.1', '4.4.2'],
    flags: { dated: true },
    Body: GatesBody,
  },
  {
    slug: 's04-b3-trust-paths',
    section: '4',
    title: 'Not browser or server: where does authorisation bind to identity and tenant?',
    short: 'B3 · Trust paths',
    dek: 'The question is not “browser or server” but where the authorisation decision is bound to the caller’s identity and tenant on every request.',
    paper: ['4.4.3'],
    Body: TrustBody,
  },
  {
    slug: 's04-b3-test-matrix',
    section: '4',
    title: 'The test that matters is behavioural: count rows and read SQLSTATE, not HTTP status',
    short: 'B3 · Test matrix',
    dek: 'A presence check (“RLS enabled”, “policy exists”) passed the EdTech app and would pass a USING (true) policy.',
    paper: ['4.4.4'],
    flags: {
      prop: 'The three-principal, four-surface, five-operation matrix, its HTTP re-run, and the invoices migration and pgTAP test are the authors’ design, assembled from documented patterns. The tooling facts on this slide are documented and carry their own tags.',
    },
    Body: MatrixBody,
  },
  {
    slug: 's04-b3-other-baas',
    section: '4',
    title: 'Other BaaS share the failure class; only build-output scanning catches inlined secrets',
    short: 'B3 · Other BaaS, bundle secrets',
    dek: 'Firestore, Neon, Convex, PocketBase and Appwrite; then what repository and build-output scanners can and cannot see.',
    paper: ['4.4.5', '4.4.6'],
    flags: { dated: true },
    Body: OtherBody,
  },
];
export default slides;
