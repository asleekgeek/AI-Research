import type { SlideDef } from './types';
import { Tiers } from './s08-tiers';
import { Rollout } from './s08-rollout';
import './s08.css';

const PROPOSAL =
  'Everything on this slide is the authors’ design, not industry practice: the tiers extend the CSA’s three review categories, and the thresholds are borrowed from the CoE Starter Kit’s shipped defaults (6 months, 7 days, 3 weeks, 60 days) as starting points, not norms.';

const slides: SlideDef[] = [
  {
    slug: 's08-tiers',
    section: '8',
    title: 'A proposed tier model: controls scale with data and audience',
    short: 'Tiers T0–T3 (proposal)',
    dek: 'Four tiers extend the CSA’s three review categories with the platform constraint, ownership, exception path, kill switch and assurance evidence each needs.',
    paper: ['8.1'],
    flags: { prop: PROPOSAL, dated: true },
    Body: Tiers,
  },
  {
    slug: 's08-rollout',
    section: '8',
    title: 'A proposed rollout: stop the bleeding, pave the road, add gates, run it',
    short: 'Phased rollout (proposal)',
    dek: 'Four phases, from a non-punitive inventory to deterministic gates and steady-state operation, drawn to scale on a day axis.',
    paper: ['8.2'],
    flags: {
      prop: 'The phases, their windows, actions, owners and exit criteria are the authors’ design, not observed practice; the thresholds they rely on are the CoE Starter Kit’s shipped defaults used as starting points, not norms.',
      dated: true,
    },
    Body: Rollout,
  },
];
export default slides;
