import type { SlideDef } from './types';
import { ForecastVsObservation } from './s06-forecast';
import { RegistryLifecycle } from './s06-registry';
import { Kpis } from './s06-kpis';
import { Surveys } from './s06-surveys';
import './s06.css';

const slides: SlideDef[] = [
  {
    slug: 's06-forecast-vs-observation',
    section: '6',
    title: 'Forecasts are not observations; three self-reports are not a comparison',
    short: 'Forecast vs observation',
    dek: 'Gartner’s published numbers split into forecasts without a method and one survey of security leaders; the CSA asks for awareness, not gatekeeping; three organisations describe their own practice.',
    paper: ['6.1', '6.2'],
    Body: ForecastVsObservation,
  },
  {
    slug: 's06-registry-lifecycle',
    section: '6',
    title: 'Registry fields and lifecycle defaults have precedent; app expiry does not',
    short: 'Registry and lifecycle',
    dek: 'Three documented registries supply most of the schema, and the CoE Starter Kit’s shipped defaults are the only mechanised lifecycle thresholds in the public record.',
    paper: ['6.3', '6.4'],
    flags: {
      dated: true,
      prop: 'Three registry fields are the authors’ addition, with no documented registry carrying them: an expiry or TTL date, a reference to the processing-activity record and DPIA-screening outcome, and hosting region with vendor DPA status. The other fields and the lifecycle defaults are documented practice.',
    },
    Body: RegistryLifecycle,
  },
  {
    slug: 's06-kpis',
    section: '6',
    title: 'Most governance KPIs have precedent; “bans fail” is under-evidenced',
    short: 'KPIs; bans vs enablement',
    dek: 'Ownership, telemetry and training KPIs have documented precedent, the inventory gap as a principle; the operational KPIs are the authors’ proposal. No comparative study of bans versus enablement exists.',
    paper: ['6.5', '6.6'],
    flags: {
      prop: 'The KPIs marked Proposed (time-to-register, scan-block overrides, mean time to quarantine, % apps behind IdP, restore-drill pass rate, cross-tenant test pass rate per release) are the authors’ design; no external precedent was located.',
    },
    Body: Kpis,
  },
  {
    slug: 's06-surveys',
    section: '6',
    title: 'The headline survey figures cannot be combined into one “shadow AI rate”',
    short: 'Survey ledger',
    dek: 'Each figure keeps its own population, method and definition. Group them by what they measure to see why they do not add up.',
    paper: ['6.7'],
    Body: Surveys,
  },
];
export default slides;
