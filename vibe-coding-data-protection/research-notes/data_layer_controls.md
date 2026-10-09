# Data-access-layer controls for vibe-coded apps on BaaS platforms (Supabase first; Firebase, Convex, Neon Data API, PocketBase, Appwrite)

Research date: 8–9 October 2026. All claims below are from primary vendor/standards documentation fetched during this pass unless marked otherwise. Where this contradicts or sharpens the original report, the audit ID (A1, A2, A3, A10/A11) is noted.

Resolution of the audit's technical corrections, in one paragraph each, with the primary evidence:

- **A1 (publishable/anon key in the browser is expected design).** Confirmed. Supabase's API-keys documentation classifies publishable keys (`sb_publishable_...`) as "Safe to expose online" in web pages, mobile apps, CLIs and source code, and says "Anyone can read it, so it only reaches what Row Level Security allows" ([Supabase API keys](https://supabase.com/docs/guides/api/api-keys)). Exploitability therefore depends on grants, RLS, column privileges, views and RPC, not on the key being visible. Only secret keys (`sb_secret_...`) and the legacy `service_role` JWT are privileged.
- **A2 (API DELETE removes rows, not tables).** Confirmed by the privilege model. The default grants that the 30 Oct 2026 change removes were `select, insert, update, delete` on tables ([Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)). None of those is a DDL privilege; a Data API caller can empty a table it has DELETE on but cannot `DROP` it.
- **A3 (30 Oct 2026 applies to new tables; existing grants, RLS semantics and direct connections unchanged).** Confirmed verbatim: "Existing tables are not affected in your project, they keep their current grants and stay reachable", "RLS behavior remains unchanged", and apps that read/write "over a direct connection ... this change will not affect you" ([Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)).
- **A10/A11 (BFF is only stronger with least privilege and tenant binding).** Confirmed by Supabase's own server-side guidance: the admin client "bypasses Row Level Security, so filter by the caller's ID", and "Use `ctx.supabaseAdmin` only for work that has to cross those policies" ([Supabase Edge Functions auth](https://supabase.com/docs/guides/functions/auth)). The documented alternative, forwarding the caller's token so RLS still applies server-side, is the least-privilege BFF path (see section 5).

---

## 1. Exact semantics: grants vs RLS vs column privileges vs views (security_invoker) vs RPC/security-definer functions in Supabase, and what the 30 Oct 2026 change does and does not do

### Takeaway
Four independent Postgres mechanisms gate a Data API request in this order: schema exposure → table/column GRANT (missing grant = `42501` before any policy runs) → RLS (which rows) → for views and functions, the owner's privileges unless `security_invoker`/`security invoker` is used. The 30 Oct 2026 change only removes *default table and sequence grants for future `public` tables* in hosted projects; it does not enable RLS, add policies, alter existing tables, revoke function EXECUTE, or touch direct connections, custom schemas or self-hosted installs.

### Cited Findings

**Layer 1 — Grants (table-level privileges)**
- "Grants decide whether a role can run an operation on the table at all." Policies then decide which rows that operation applies to — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "A missing grant raises a `42501` error before any policy runs." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "Adding policies doesn't take those grants back." A table with only policies still gives `anon` an insert path if the grant was never revoked — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "A table in an exposed schema without RLS is readable and writable by any role with a grant on it." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- PostgREST: "All authorization happens in the database." Requests with no JWT (or no role claim) run as the anonymous role configured in `db-anon-role`; a JWT role claim causes `SET LOCAL ROLE <role>` for the duration of the request; "The authenticator role is used for connecting to the database and should be configured to have very limited access." — [PostgREST auth reference](https://docs.postgrest.org/en/v13/references/auth.html)
- PostgreSQL privilege check precedes row filtering: the RLS docs' example shows `ERROR: permission denied for table passwd` when a user lacks table privilege, while a `SELECT` on permitted columns succeeds — [PostgreSQL ddl-rowsecurity](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

**Layer 2 — RLS (row-level policies)**
- "When row security is enabled on a table ... all normal access to the table for selecting rows or modifying rows must be allowed by a row security policy." "If no policy exists for the table, a default-deny policy is used, meaning that no rows are visible or can be modified." — [PostgreSQL ddl-rowsecurity](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Multiple policies combine "using either `OR` (for permissive policies, which are the default) or using `AND` (for restrictive policies)." — [PostgreSQL ddl-rowsecurity](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- "Superusers and roles with the `BYPASSRLS` attribute always bypass the row security system when accessing a table." "Table owners normally bypass row security as well, though a table owner can choose to be subject to row security with ALTER TABLE ... FORCE ROW LEVEL SECURITY." — [PostgreSQL ddl-rowsecurity](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- "Referential integrity checks, such as unique or primary key constraints and foreign key references, always bypass row security"; schemas must be designed "to avoid 'covert channel' leaks of information through such referential integrity checks." — [PostgreSQL ddl-rowsecurity](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Supabase: "Once RLS is enabled, no data is accessible through the API when using a publishable key, until you create policies." "Think of a policy as adding a `WHERE` clause to every query." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "To perform an `UPDATE` operation, a corresponding `SELECT` policy is required." "Without a `SELECT` policy, the `UPDATE` operation will not work as expected." USING "decides which existing rows can be updated"; WITH CHECK "decides what the resulting row is allowed to look like"; without WITH CHECK "the `using` expression decides both which rows are visible and which new rows are allowed." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Agent skill restates the two classic policy bugs: "`TO authenticated` alone is authentication without authorization (BOLA / IDOR)." and "Without `WITH CHECK`, a user can reassign a row's `user_id` to another user" — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Claims source: "`raw_app_meta_data` - cannot be updated by the user, so it's a good place to store authorization data." A `user_metadata` claim "can create security issues in your application as this information can be modified by authenticated end users." "Keep in mind that a JWT is not always up-to-date." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "Always name the role a policy applies to, using the `to` clause." Wrapping `auth.uid()` as `(select auth.uid())` "causes an `initPlan` to be run by the Postgres optimizer." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Bypass semantics for secret keys: "A secret key bypasses RLS only when the request carries no user access token." If a user access token is present, the request "runs under the RLS policies of that signed-in user." "A secret key authorizes access through the `service_role` Postgres role, which has the `bypassrls` attribute." Custom roles can be given `bypassrls` with `alter role "role_name" with bypassrls;` — "Never share login credentials for any Postgres Role with this privilege." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

**Layer 3 — Column-level privileges**
- Column privileges exist because RLS "doesn't give you control over which columns they can access within rows." Example: `revoke update on table public.posts from authenticated; grant update (title, content) on table public.posts to authenticated;` — [Supabase column-level security](https://supabase.com/docs/guides/database/postgres/column-level-security)
- Operational caveat: "Restricted roles cannot use the wildcard operator (`*`) on the affected table"; "All operations (insert, update, delete) as well as using `select *` will fail." If both table-level and column-level grants exist and you revoke the column-level one, "the table-level privilege will still be in effect." — [Supabase column-level security](https://supabase.com/docs/guides/database/postgres/column-level-security)
- "This is an advanced feature. We do not recommend using column-level privileges for most users." The UI is under Feature Preview in the dashboard. — [Supabase column-level security](https://supabase.com/docs/guides/database/postgres/column-level-security)
- Security retro: "Column-level security works independently from RLS." — [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)

**Layer 4 — Views**
- PostgreSQL: "By default, access to the underlying base relations referenced in the view is determined by the permissions of the view owner." If a base relation has RLS, "by default, the row-level security policies of the view owner are applied ... However, if the view has `security_invoker` set to `true`, then the policies and permissions of the invoking user are used instead, as if the base relations had been referenced directly." — [PostgreSQL CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html)
- Supabase: "Views bypass RLS by default because they are usually created with the `postgres` user." "A view over a protected table hands out every row its policies were meant to withhold." Postgres 15+: `security_invoker = true` to "make a view obey the RLS policies of its underlying tables when invoked by `anon` and `authenticated`"; older versions: revoke from `anon`/`authenticated` or place the view in an unexposed schema. — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Agent skill: "In Postgres 15 and above, use `CREATE VIEW ... WITH (security_invoker = true)`." — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)

**Layer 5 — RPC / database functions**
- "By default, any role can run a database function." A function created in the Dashboard or by a migration is owned by `postgres`; "Any role can call it by default, including `anon`." — [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- "Prefer `security invoker`, which is also the default." "A `security definer` function can return rows the caller isn't allowed to read." "When you use `security definer`, you must set the `search_path`" (empty path, schema-qualified names). — [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- "A 'security definer' function runs using the same role that *created* the function" — if created by `postgres`, "that function will have `bypassrls` privileges." "A `security definer` function in an exposed schema is callable over the Data API with the creator's privileges." Without a pinned search path, "a caller can point an unqualified name at their own object and run it with the function owner's privileges." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- "RLS doesn't apply to functions, so grant `EXECUTE` only to the roles that need to call them." "Review every `SECURITY DEFINER` function carefully." — [Supabase hardening guide](https://supabase.com/docs/guides/database/hardening-data-api)
- Restricting EXECUTE, per function: `revoke execute on function public.hello_world from public; revoke execute on function public.hello_world from anon;`; by default: `revoke execute on all functions in schema public from public; revoke execute on all functions in schema public from anon, authenticated; alter default privileges in schema public revoke execute on functions from public; alter default privileges in schema public revoke execute on functions from anon, authenticated; grant execute on function public.hello_world to authenticated;` — [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- Agent skill: "Never add `SECURITY DEFINER` to resolve a permission error; it silently removes access control without fixing the underlying cause." "Postgres grants `EXECUTE` to `PUBLIC` by default for every new function." — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Security Advisor has dedicated lints: "security definer view (0010)", "security definer functions executable by anon (0028) or authenticated (0029)", "function search path mutable (0011)". — [Supabase database advisors](https://supabase.com/docs/guides/database/database-advisors)

**GraphQL path uses the same model**
- pg_graphql follows "Postgres' security model - including Row Level Security, Roles, and Grants"; by default objects in `public` are visible to `anon` and `authenticated`; "To remove a table from the GraphQL API, you can revoke permission on that table from the relevant role." "From pg_graphql 1.6.0, introspection is disabled by default and must be enabled per schema." — [Supabase GraphQL docs](https://supabase.com/docs/guides/graphql)
- pg_graphql stops being enabled by default on new projects on 18 May 2026 — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

**The 30 October 2026 change — precise scope (changelog 45329, published 28 Apr 2026)**
- What changes: new tables in `public` are no longer exposed to the Data API and GraphQL API automatically; each needs an explicit `grant`. Previously `select, insert, update, delete` were granted by default to `anon`, `authenticated` and `service_role` on every new `public` table. — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Grants vs RLS, verbatim: grants "control whether a role can access a table at all, while RLS controls which rows that role can see." "RLS behavior remains unchanged." — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Existing tables, verbatim: "Existing tables are not affected in your project, they keep their current grants and stay reachable." — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Direct connections, verbatim: "If your app reads and writes Postgres over a direct connection ... this change will not affect you." Not affected: tables in `storage`, `auth`, `realtime` and custom schemas; self-hosted deployments. — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Error: PostgREST returns code `42501`, message "permission denied for table your_table", hint "Grant the required privileges to the current role with: GRANT SELECT ON public.your_table TO anon;" — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- Dates: 28 Apr 2026 opt-out checkbox ("Automatically expose new tables") at project creation; 13 May email first notice; 18 May pg_graphql no longer default; 27 May final reminder; **30 May 2026 new default for all new projects, "gradual rollout over a few weeks"**; 23 Sep email five-week notice; 23 Oct final notice; **30 Oct 2026 applied to all existing projects**. — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- What customers must do: bundle `GRANT` with `ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` in the same migration; existing projects can adopt early by running `alter default privileges for role postgres in schema public revoke ...` for tables and sequences from `anon, authenticated, service_role` (affects only future objects); tighten specific existing tables by revoking individually; Security Advisor flags affected tables until 30 Oct. Rollback: restore default privileges, then bulk-grant existing tables/sequences, then revoke individually. — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
- The hardening guide's fuller revoke set (which goes beyond the changelog by also covering functions): `alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated, service_role;` / `... revoke execute on functions from anon, authenticated, service_role;` / `... revoke usage, select on sequences from anon, authenticated, service_role;` / `... revoke execute on functions from public;`. Then: "Grant the minimum privileges each role needs", e.g. `grant select on table public.your_table to anon; grant select, insert, update, delete on table public.your_table to authenticated;`. "Enable RLS on every table and view exposed through the Data API." "With the Data API disabled, none of the auto-generated REST endpoints respond, regardless of grants or RLS." — [Supabase hardening guide](https://supabase.com/docs/guides/database/hardening-data-api)

### Inferences
- Because the changelog's revoke SQL covers tables and sequences, while the hardening guide separately revokes default EXECUTE on functions, the 30 Oct change as documented does **not** change the default `EXECUTE TO PUBLIC` on new functions. A new RPC function in `public` remains callable by `anon` after 30 Oct unless the project also applies the function-level revokes. Treat RPC exposure as a separate audit item.
- "Secure by default" after 30 Oct means only: a new table that an agent forgets to grant is unreachable via REST/GraphQL (fail closed). A table the agent *does* grant to `anon` with no RLS, or with RLS and a `USING (true)` policy, is as exposed as before. Grants are necessary, not sufficient; RLS is necessary, not sufficient; both plus correct policy logic are required.
- Because `service_role` has `BYPASSRLS` and `security definer` functions owned by `postgres` inherit bypass, the practical "privileged paths" to audit on any project are: (a) anything using a secret/service_role key, (b) `security definer` functions and views in exposed schemas, (c) custom roles with `bypassrls`, (d) direct Postgres connection strings held by apps or agents.
- The revoke-default-privileges statements in both the changelog and hardening guide are issued `for role postgres`. Tables created by a different owner role would not be covered by those default-privilege changes (PostgreSQL default privileges are per creating role). This is a PostgreSQL semantics inference; the Supabase pages do not discuss other owner roles.

### Gaps
- No primary statement was found on whether the 30 Oct 2026 rollout for existing projects is instantaneous or gradual like the 30 May rollout ("gradual rollout over a few weeks"). Architects should test behaviour after 30 Oct rather than assume the exact day.
- The changelog says a dashboard per-table "Data API access" toggle was "currently in staging" (retro, early 2026); whether it shipped by October 2026 was not verified.

---

## 2. Publishable/secret key model and legacy anon/service_role deprecation timeline

### Takeaway
Publishable keys are designed to be public and map to `anon`/`authenticated`; secret keys map to `service_role` (BYPASSRLS), are rejected by the API when sent from a browser (HTTP 401), and must never ship in clients. Legacy JWT `anon`/`service_role` keys are "deprecated by the end of 2026" with deletion "Late 2026, TBC"; no fixed cut-off date was published as of 9 Oct 2026.

### Cited Findings
- Publishable keys (`sb_publishable_...`) are "Safe to expose online" in web pages, mobile or desktop apps, GitHub Actions, CLIs and source code; "Anyone can read it, so it only reaches what Row Level Security allows." They map to `anon` when no user is signed in and `authenticated` when one is. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- The publishable key does not protect against reverse engineering, network inspection, XSS, CSRF or MITM; RLS must be enabled on all tables. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- Secret keys (`sb_secret_...`) "provide full access to your project's data, bypassing" RLS; "A secret key bypasses every Row Level Security policy you have." "Never put one in a browser, a shipped application, or source control." "A leaked secret key exposes all of your project's data." "A secret key doesn't work in a browser" — Supabase returns HTTP 401. Recommended: a separate secret key per backend component. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- Secret keys "are hidden by default and need to be individually" revealed, each reveal logged in the organisation Audit Log; "By deleting a secret key it is instantly revoked." — [Supabase changelog 29260](https://supabase.com/changelog/29260-upcoming-changes-to-supabase-api-keys)
- New keys are short strings, not JWTs; a long key starting `eyJ` "was written for the legacy keys." New keys go in the `apikey` header, not `Authorization: Bearer`. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- Deprecation: "Supabase is deprecating the anon and service_role keys by the end of 2026." No specific removal date is given. "Creating publishable and secret keys doesn't revoke your legacy keys" — disabling is "a separate step". — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- Timeline from the key-change changelog (published 12 Sep 2024, updated 17 Jun 2025): June 2025 early preview; July 2025 full launch; from November 2025 monthly migration reminders and "Projects restored from **1st November 2025** will no longer be restored with the legacy API keys"; "Late 2026, TBC: Legacy API keys will be deleted and removed from the Docs / Dashboard." — [Supabase changelog 29260](https://supabase.com/changelog/29260-upcoming-changes-to-supabase-api-keys)
- Security retro: legacy keys "will be removed in late 2026." — [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)
- Both legacy `service_role` and new secret keys bypass RLS; "The JWT-based `service_role` key is a legacy alternative. Prefer a secret key where possible." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Rotation procedure for secret keys: create new → replace in every component → confirm → retire old; "Only delete a new secret key after step 3". For legacy keys, deactivate rather than delete. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- OpenAPI schema enumeration closed: from 11 Mar 2026 (new projects) and 8 Apr 2026 (all existing projects) the OpenAPI spec at `/rest/v1/` is no longer served to `anon`-key callers, who get "Access to schema is forbidden"; "This does not affect normal Data API usage"; the endpoint "remains accessible ... if you are using the service role keys" or new secret keys. — [Supabase changelog 42949](https://supabase.com/changelog/42949-breaking-change-removing-access-to-openapi-spec-via-the-anon-key)
- Edge Functions: `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` env vars still exist but carry legacy keys. — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)

### Inferences
- The "secret key doesn't work in a browser (401)" check is a server-side heuristic on request characteristics; it is a misuse speed-bump, not a substitute for keeping the key out of the bundle (a leaked secret key is fully usable from curl or a script).
- Since restored projects since 1 Nov 2025 get no legacy keys, any app still hard-coding `eyJ...` anon keys will break on project restore before the general deprecation; this is an operational date to track.

### Gaps
- No exact calendar date for legacy-key removal was found in any Supabase page as of 9 Oct 2026 ("end of 2026" / "Late 2026, TBC"). Mark as scheduled-but-unfixed.
- Whether the 401-in-browser check for secret keys relies on headers such as `Origin`/`User-Agent` was not documented on the fetched page.

---

## 3. RLS auto-enable event trigger, Security Advisor, email alerts, and applicability to builder-provisioned and MCP/agent-provisioned projects

### Takeaway
Dashboard-created tables get RLS on by default; the event trigger that enables RLS for tables created via SQL/migrations/agents is an **opt-in per-project object** (only `postgres` can create it, covers only `public`, only enables RLS and adds no grants or policies). Security Advisor lints, email alerts for RLS-disabled tables and weekly org summaries are platform features on hosted projects; no primary source states that builder-provisioned projects have the trigger installed.

### Cited Findings
- "For tables created via the dashboard, RLS is enabled by default." Tables made with external tools or migrations can be covered by Postgres Event Triggers to "enforce RLS automatically"; the retro describes setup as documented and available as a one-click option in the dashboard, opt-in rather than default. — [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)
- The event-triggers reference shows `CREATE EVENT TRIGGER ensure_rls ON ddl_command_end WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')` executing `rls_auto_enable()`, a `SECURITY DEFINER` PL/pgSQL function with `search_path` set to `pg_catalog`, which loops over `pg_event_trigger_ddl_commands()` and runs `alter table if exists ... enable row level security` for matching tables and partitioned tables. It covers only `public` (skips `pg_catalog`, `information_schema`, `pg_toast%`, `pg_temp%`). "Existing tables still need RLS enabled manually." Only the `postgres` user can create event triggers. The page does not mention a dashboard one-click option, grants or policies. — [Supabase event triggers](https://supabase.com/docs/guides/database/postgres/event-triggers)
- Email alerts: "Supabase sends email alerts to project owners" when a table is created with RLS disabled; alerts also appear in the dashboard. Weekly: "Organization owners receive weekly security emails summarizing any findings." Advisors run through Splinter and are "also available through the MCP server." — [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)
- Security Advisor lint catalogue (dashboard, "The advisors run automatically", manual rerun possible): auth users exposed (0002), policy exists rls disabled (0007), rls enabled no policy (0008), security definer view (0010), function search path mutable (0011), rls disabled in public (0013), extension in public (0014), rls references user metadata (0015), materialized view in api (0016), foreign table in api (0017), sensitive columns exposed (0023), permissive rls policy (0024), public bucket allows listing (0025), security definer functions executable by anon (0028)/authenticated (0029), pg graphql table exposure (0026, 0027), insecure queue exposed in api (0019). — [Supabase database advisors](https://supabase.com/docs/guides/database/database-advisors)
- MCP exposes `get_advisors` ("Get security and performance advisors"), `execute_sql`, `apply_migration`, `get_publishable_keys`. The MCP docs do not state whether tables created through MCP get RLS or grants automatically. — [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp)
- MCP production guidance: "Production projects can contain sensitive data." Before connecting one: scope to the project, enable read-only mode (SQL runs "as a read-only Postgres user"), restrict feature groups ("All groups except Storage are enabled by default"), "Keep manual approval enabled for interactive work", and "Use Supabase's branching feature to create a development branch for your database." "The primary attack vector unique to LLMs is prompt injection"; result-wrapping "is not foolproof". — [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp); [Supabase AI tools MCP page](https://supabase.com/docs/guides/ai-tools/mcp)
- The agent-skills announcement states: "We strongly discourage connecting the Supabase MCP server to your production database." — [Supabase agent skills blog](https://supabase.com/blog/supabase-agent-skills)
- Agent skill instructs agents: "Run advisors → `supabase db advisors` (CLI v2.81.3+) or MCP `get_advisors`. Fix any issues." — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Lovable's Quick scan (runs on publish) checks "Tables without per-record access control (row-level security)" and "access rules that let everyone through", file storage rules and leaked-password protection; its Deep scan checks that "your server code honors the ownership rules your database enforces" and that privileged actions "check the caller's role rather than only that they signed in." "These tools help identify common security issues, but they cannot guarantee complete security." — [Lovable security docs](https://docs.lovable.dev/features/security)

### Inferences
- The changelog's 30 Oct 2026 change applies to "all existing projects" on the hosted platform (self-hosted excluded). If a builder's backend is a hosted Supabase project, the grant change applies irrespective of who created it. The RLS event trigger, by contrast, is a per-database object that someone must create, so its presence on a builder-provisioned project cannot be assumed and must be verified (`select evtname from pg_event_trigger`).
- Because the trigger fires on `ddl_command_end` for `CREATE TABLE` regardless of client, it will fire for migrations, MCP `apply_migration`/`execute_sql`, ORMs and psql once installed. That is implied by the mechanism, not stated by Supabase.
- Lint 0008 ("rls enabled no policy") and 0024 ("permissive rls policy") are presence/pattern checks. They cannot tell whether a policy's predicate matches the application's tenancy model; only behavioural tests can (section 4).

### Gaps
- No primary documentation was found stating whether Lovable Cloud, Bolt, v0 or Replit-provisioned Supabase projects install the RLS event trigger or run under the new default grants. The original report's claim via Cybernews that safeguards "are not applied automatically when databases are created through coding tools" was not verified against vendor documentation in this pass.
- The dashboard "one-click" trigger installer described in the retro was not found in the event-triggers docs; its exact dashboard location is unverified.
- Whether weekly Security Advisor emails are sent for Free-tier organisations or all tiers was not specified in the fetched pages.

---

## 4. Designing behavioural authorisation tests (anonymous, same-tenant, cross-tenant) across REST, GraphQL, RPC and Storage, and the available tools

### Takeaway
A behavioural test matrix needs three principals (anonymous publishable-key caller, authenticated tenant-A user, authenticated tenant-B user), four surfaces (REST table, GraphQL, RPC function, Storage object) and five operations (select, insert, update, upsert, delete), asserting on row counts and SQLSTATE rather than HTTP status alone. Supported tooling as of Oct 2026: pgTAP via `supabase test db` (with the basejump helpers for user impersonation), Supabase's dashboard RLS Tester (preview, SELECT-only), the Security Advisor/`get_advisors` for presence checks, SupaShield (community CLI), and application-level HTTP tests signing in as real users.

### Cited Findings

**Database-level (pgTAP) — the documented primary method**
- pgTAP is "a unit testing framework for Postgres" covering RLS policies; create tests with `supabase test new todos_rls.test`, run with `supabase test db`; wrap each file in `begin;` ... `rollback;`. Impersonate with `set local role authenticated;` and `set local request.jwt.claim.sub = '<uuid>';` (troubleshooting section uses `set local "request.jwt.claims"`). Assertions used: `results_eq`, `lives_ok`, `results_ne`. CI: `supabase/setup-cli@v1`, `supabase start`, `supabase test db` on every pull request. — [Supabase testing overview](https://supabase.com/docs/guides/local-development/testing/overview)
- Helper extension: `select dbdev.install('basejump-supabase_test_helpers'); create extension if not exists "basejump-supabase_test_helpers" version '0.0.6';`. Helpers: `tests.create_supabase_user(identifier, email, phone, metadata)`, `tests.get_supabase_uid()`, `tests.authenticate_as()`, `tests.authenticate_as_service_role()` (sets role to `service_role`), `tests.clear_authentication()` (sets role to `anon`), `tests.rls_enabled(schema[, table])`, `tests.freeze_time()`. Authors recommend activating the extension only within a test suite, not in production. Latest version file 0.0.6. — [Supabase pgTAP extended](https://supabase.com/docs/guides/local-development/testing/pgtap-extended); [basejump/supabase-test-helpers](https://github.com/usebasejump/supabase-test-helpers)
- Write-denial assertion pattern: `throws_ok(..., '42501', 'new row violates row-level security policy for table "org_members"')`. Cross-user example asserts User 2 sees only their own row via `results_eq` count. — [Supabase pgTAP extended](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)
- Note the doc's own weakness: for cross-user update it uses `results_ne` on an `update ... returning 1`, which only asserts the result is not `values(1)` rather than asserting zero rows updated. — [Supabase pgTAP extended](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)

**Application-level (HTTP) tests**
- "Unlike database-level testing with pgTAP, application-level tests cannot use transactions for isolation." The documented pattern uses Vitest, creates users with the admin client, signs in with `signInWithPassword` before each check, and isolates with unique IDs/prefixes and `afterAll` cleanup. — [Supabase testing overview](https://supabase.com/docs/guides/local-development/testing/overview)

**Vendor-provided testers and advisors**
- RLS Tester (Studio feature preview, published 24 Apr 2026): "Run a SQL query as a user (not logged in / logged in - this is the role impersonation part)" and see which policies the query evaluates; client-library calls are translated by the AI Assistant ("verify the output"). Limitation: "Only `SELECT` queries are supported for now" because mutations could trigger side effects. — [Supabase changelog 45233](https://supabase.com/changelog/45233-feature-preview-rls-tester)
- Security Advisor lints (section 3) and MCP `get_advisors` — [Supabase database advisors](https://supabase.com/docs/guides/database/database-advisors); [Supabase MCP docs](https://supabase.com/docs/guides/getting-started/mcp)

**Community tooling**
- SupaShield (MIT, GitHub `Rodrigotari1/supashield`, announced 17 Oct 2025): introspects schema, generates tests (`supashield init`) that simulate anonymous and authenticated roles plus custom JWT claims, runs CRUD against every RLS-enabled table inside rolled-back transactions, `--as-user` uses a real `auth.users` row, produces snapshots for CI diffing and can export to pgTAP. Author: "not a substitute for proper security reviews." — [dev.to announcement](https://dev.to/rodrigotari1/i-built-a-cli-to-test-supabase-rls-policies-30aa); [GitHub](https://github.com/Rodrigotari1/supashield)

**Builder-integrated scanners**
- Lovable Deep scan covers access control, unauthenticated endpoints, leaked secrets, exposed PII, and checks server code honours DB ownership rules; Aikido integration runs "dynamic AI penetration testing" where "AI agents interact with your running application, send real payloads"; Wiz adds SCA and static analysis. — [Lovable security docs](https://docs.lovable.dev/features/security)

**Storage surface specifics**
- Storage access is governed by RLS on `storage.objects`; "By default Storage does not allow any uploads to buckets without RLS policies." Upload needs INSERT; upsert/overwrite additionally needs SELECT and UPDATE; folder-scoping pattern `bucket_id = 'my_bucket_id' and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')`. Public buckets "are already publicly accessible." "Service keys entirely bypass RLS policies, granting you unrestricted access to all Storage APIs." — [Supabase storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- Agent skill: "Granting only INSERT allows new uploads but file replacement (upsert) silently fails." — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Lint 0025 "public bucket allows listing" exists. — [Supabase database advisors](https://supabase.com/docs/guides/database/database-advisors)

### Minimal correct example and negative test (my synthesis from the cited rules)

The SQL below is composed from the documented patterns above (explicit grants bundled with RLS in one migration per changelog 45329 and the hardening guide; `TO` clause, `(select ...)` wrapping and `app_metadata` claims per the RLS docs and SKILL.md; USING + WITH CHECK on UPDATE per SKILL.md). It is not a copied Supabase example.

```sql
-- migration: invoices, tenant-bound via app_metadata.org_id
create table public.invoices (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null,
  amount     numeric not null,
  created_by uuid not null default auth.uid()
);

-- Explicit grants (mandatory for new tables after the 30 May / 30 Oct 2026 rollouts).
-- Deliberately no grant to anon.
grant select, insert, update, delete on table public.invoices to authenticated;

alter table public.invoices enable row level security;

-- Helper to read the tenant claim once per statement (initPlan), from the
-- user-immutable app_metadata, never user_metadata.
create or replace function public.current_org_id() returns uuid
language sql stable as $$
  select ((select auth.jwt()) -> 'app_metadata' ->> 'org_id')::uuid
$$;
revoke execute on function public.current_org_id() from public, anon;
grant  execute on function public.current_org_id() to authenticated;

create policy invoices_select on public.invoices
  for select to authenticated
  using (org_id = (select public.current_org_id()));

create policy invoices_insert on public.invoices
  for insert to authenticated
  with check (org_id = (select public.current_org_id()));

create policy invoices_update on public.invoices
  for update to authenticated
  using      (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

create policy invoices_delete on public.invoices
  for delete to authenticated
  using (org_id = (select public.current_org_id()));
```

```sql
-- supabase/tests/invoices_rls.test.sql  (run: supabase test db)
begin;
select plan(6);

-- Seed as service_role (bypasses RLS) — two tenants, one row each.
set local role service_role;
insert into public.invoices (id, org_id, amount, created_by) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 10, '00000000-0000-0000-0000-00000000000a'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000002', 20, '00000000-0000-0000-0000-00000000000b');

-- 1. Anonymous: no grant → 42501 before any policy runs.
set local role anon;
select throws_ok(
  $$ select * from public.invoices $$, '42501',
  null, 'anon has no grant on invoices');

-- 2. Tenant A user sees exactly their own row.
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","app_metadata":{"org_id":"aaaaaaaa-0000-0000-0000-000000000001"}}';
select results_eq(
  $$ select count(*) from public.invoices $$, array[1::bigint],
  'tenant A sees one row');

-- 3. Cross-tenant read: tenant B user cannot see tenant A's row (empty, not 42501).
set local "request.jwt.claims" =
  '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated","app_metadata":{"org_id":"bbbbbbbb-0000-0000-0000-000000000002"}}';
select is_empty(
  $$ select id from public.invoices where id = '11111111-1111-1111-1111-111111111111' $$,
  'tenant B cannot read tenant A invoice');

-- 4. Cross-tenant insert: WITH CHECK rejects a row stamped with another org_id.
select throws_ok(
  $$ insert into public.invoices (org_id, amount) values ('aaaaaaaa-0000-0000-0000-000000000001', 1) $$,
  '42501', 'new row violates row-level security policy for table "invoices"',
  'tenant B cannot insert into tenant A');

-- 5. Cross-tenant update affects zero rows (assert the count, not just status).
select results_eq(
  $$ with u as (update public.invoices set amount = 999
                 where id = '11111111-1111-1111-1111-111111111111' returning 1)
     select count(*) from u $$, array[0::bigint],
  'tenant B update of tenant A row affects 0 rows');

-- 6. Reassignment attack: tenant B cannot move its own row into tenant A.
select throws_ok(
  $$ update public.invoices set org_id = 'aaaaaaaa-0000-0000-0000-000000000001'
     where id = '22222222-2222-2222-2222-222222222222' $$,
  '42501', null, 'WITH CHECK blocks org_id reassignment');

select * from finish();
rollback;
```

The same six cases should be re-run over HTTP (publishable key, no `Authorization` header for the anonymous case; signed-in tenant A and tenant B JWTs for the others) against `/rest/v1/invoices`, `/graphql/v1` (if enabled), each `/rest/v1/rpc/<fn>` and `/storage/v1/object/<bucket>/...`, following the documented application-level pattern (sign in with real users, assert on returned row counts).

### Inferences
- Assertion discipline matters more than tooling: an RLS-filtered `SELECT` succeeds with zero rows and an `UPDATE`/`DELETE` of invisible rows succeeds affecting zero rows (per the "implicit WHERE clause" semantics), so HTTP-level tests that only check for a 200/204 will pass on a broken policy. Tests must assert on body row counts, `count` headers or `returning` values. A `42501` on the other hand indicates a missing grant or a WITH CHECK violation and is the correct expectation for anonymous access to tenant data after 30 Oct 2026.
- The RLS Tester's SELECT-only limitation means it cannot detect the two most damaging write-side defects (missing WITH CHECK allowing `org_id` reassignment; UPDATE with no SELECT policy). pgTAP or HTTP tests are needed for those.
- Postman/Newman and Playwright API tests were not covered by any Supabase documentation fetched. They are generic HTTP harnesses and can execute the HTTP matrix above; the Supabase-specific requirement is simply to obtain tenant A/B JWTs via `signInWithPassword` first.
- A "launchql/supabase-test-suite" GitHub repository appeared in search results but was not fetched or verified; treat as unverified.

### Gaps
- No Supabase document was found that provides a ready-made cross-tenant HTTP test suite covering REST + GraphQL + RPC + Storage together; the components exist separately.
- PostgREST's exact HTTP status for a zero-row `DELETE`/`PATCH` without `Prefer: return=representation` was not re-verified from PostgREST docs in this pass (my recollection is 204 regardless of rows affected, which is why count assertions are needed).
- Whether `supabase db advisors` (CLI v2.81.3+) returns a non-zero exit code on ERROR-level findings suitable for CI gating was not verified.

---

## 5. Direct-to-BaaS-with-verified-RLS vs backend-for-frontend: trust-path analysis, BFF design requirements, and where Cedar/OpenFGA/OPA/Oso fit

### Takeaway
Both paths are defensible only when the authorisation decision is bound to the caller's identity and tenant on every request. Direct-to-BaaS delegates that to grants+RLS evaluated in Postgres; a BFF holding a secret key removes RLS from the path and must re-implement tenant binding in code, which Supabase's own docs flag as the confused-deputy risk. The least-privilege BFF either forwards the user's JWT so RLS still applies, or connects with a dedicated non-BYPASSRLS role; policy engines produce decisions that the BFF must still translate into tenant-bound queries.

### Cited Findings
- PostgREST's model: "All authorization happens in the database"; authenticator role "should be configured to have very limited access." — [PostgREST auth reference](https://docs.postgrest.org/en/v13/references/auth.html)
- Identity propagation through a privileged key: "A secret key bypasses RLS only when the request carries no user access token." With a user token present the request "runs under the RLS policies of that signed-in user." — [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase's server-side pattern: "Use `auth: 'user'` to get a `ctx.supabase` scoped to the caller's Row Level Security (RLS) policies." Warning: "`ctx.supabaseAdmin` bypasses Row Level Security, so filter by the caller's ID from `ctx.userClaims`"; "Use `ctx.supabaseAdmin` only for work that has to cross those policies." Default `verify_jwt = true` ("the platform validates the JWT before your handler runs"); "Turning it off to clear a 401 during development removes the platform's check". Service-to-service: secret key on the `apikey` header, `auth: 'secret'`. — [Supabase Edge Functions auth](https://supabase.com/docs/guides/functions/auth)
- Edge Functions are "server-side TypeScript functions"; credentials go in project secrets accessed via environment variables; "treat Postgres like a remote, pooled service". — [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Pre-request hooks for what RLS cannot express: the hardening guide describes `db-pre-request` checks for "rate limiting, extra API key checks, or blocking direct access to certain objects", with rate-limit records in a `private` schema. — [Supabase hardening guide](https://supabase.com/docs/guides/database/hardening-data-api)
- OWASP Authorization Cheat Sheet requirements that a BFF must meet: "Least Privileges refers to the principle of assigning users only the minimum privileges necessary"; "an application should be configured to deny access by default"; "Permission should be validated correctly on every request"; "Developers must never rely on client-side access control checks"; "Access control checks must be performed server-side, at the gateway, or using serverless function"; "ABAC and ReBAC should typically be preferred for application development"; "Logging is one of the most important detective controls"; "Unit and integration testing are essential". — [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- Convex's model (functions are the only data path): "By default your Convex functions are public and accessible to clients." "Public functions may be called by malicious users in ways that cause surprising results." "Internal functions can only be called by other functions and cannot be called directly from a Convex client." — [Convex internal functions](https://docs.convex.dev/functions/internal-functions); identity via `ctx.auth.getUserIdentity()` returning `null` when unauthenticated — [Convex functions auth](https://docs.convex.dev/auth/functions-auth)

**Authorisation engines (decision points, not enforcement points)**
- Cedar: request is "Can this principal take this action on this resource in this context?"; "no request is authorized (decision `Allow`) unless there is a specific `permit` policy that grants it; by default, the decision is `Deny`"; "any satisfied `forbid` policy *overrides* it, producing a `Deny` decision." — [Cedar authorization docs](https://docs.cedarpolicy.com/auth/authorization.html)
- OPA: "general-purpose policy engine that unifies policy enforcement across the stack"; "OPA decouples policy decision-making from policy enforcement"; "When your software needs to make policy decisions it queries OPA and supplies structured data (e.g., JSON) as input"; policies in Rego; runs as HTTP server or embedded Go library. — [OPA docs](https://www.openpolicyagent.org/docs/latest/)
- OpenFGA: "a scalable open source authorization system for developers" that "relies on Relationship-Based Access Control", "Inspired by Google's Zanzibar", "owned by the Cloud Native Computing Foundation", HTTP and gRPC APIs, can run as a library from a Go service. — [OpenFGA docs](https://openfga.dev/docs/fga)
- Oso Cloud: "a centralized authorization service built on Polar"; returns "a boolean, a list, or logic to run against your database"; "Local Authorization" lets you "Evaluate authorization decisions directly against your local database". — [Oso docs](https://www.osohq.com/docs)

### Inferences (trust-path analysis)
- **Path A — browser → PostgREST with publishable key, verified grants+RLS.** Enforcement point is Postgres, which sees the real `sub` and claims on every request; it cannot be bypassed by the client. Weaknesses: policy logic correctness (needs section-4 tests), privileged side paths (security definer RPC, views without `security_invoker`, public buckets), and no place to put rate limiting, business validation or audit beyond pre-request hooks and triggers. Internet-reachable API is inherent.
- **Path B1 — BFF forwarding the user's JWT (Supabase `auth: 'user'`, or secret key *plus* user access token).** Keeps RLS as the enforcement point while adding a server tier for rate limiting, audit logging, input validation and composition. This is the least-privilege BFF: compromise of the BFF yields no more than the current caller's rights unless the secret key is also exfiltrated.
- **Path B2 — BFF with secret key / `service_role` and no user token.** RLS is removed from the path. Tenant binding now depends on every query carrying the right filter; one missing `where org_id = ...` is a cross-tenant leak, and a BOLA on any BFF endpoint exposes the whole database. This is the confused deputy the audit describes; it is strictly weaker than Path A unless the BFF's authorisation is itself verified by the same cross-tenant tests. Supabase's own docs ("filter by the caller's ID", "only for work that has to cross those policies") treat this as the exception, not the default.
- **Path B3 — BFF with a dedicated Postgres role over a direct connection.** The 30 Oct grants change does not apply ("direct connection ... will not affect you"), so grants and RLS must be designed explicitly; the role must not have `BYPASSRLS` and must not be the table owner (owners bypass RLS unless `FORCE ROW LEVEL SECURITY`). Per-request identity can be propagated with `SET LOCAL ROLE` / `set_config('request.jwt.claims', ...)` in a transaction, mirroring PostgREST.
- **Where engines fit.** Cedar/OPA/OpenFGA/Oso answer "may principal P do action A on resource R" and (for Oso/OpenFGA) list permitted objects. They do not touch the data path. In Path A they are irrelevant (Postgres is the engine). In Path B they belong in the BFF *before* the query and, critically, their decision must be reflected in the query predicate (list filtering / "logic to run against your database"), otherwise the engine approves while the secret-key query over-fetches. A hybrid that keeps RLS as the last line and uses an engine for coarse business rules is the defensible design for T2+ data.
- **BFF design requirements consolidated** (from OWASP, Supabase function docs, PostgREST): per-request identity propagation (verify JWT at the edge, `verify_jwt = true`); tenant binding derived from `app_metadata`/server-side lookup, never from request body or `user_metadata`; least-privilege DB credential (user-scoped client or non-BYPASSRLS role) with secret key reserved for narrowly scoped admin operations; deny-by-default routing; rate limiting; audit logging of principal, tenant, action, resource; cross-tenant negative tests in CI.

### Gaps
- No vendor documentation was found that benchmarks or compares breach outcomes of direct-RLS vs BFF architectures; the analysis above is reasoning from the documented semantics, not measured data.
- OpenFGA's Check/ListObjects API names and Oso's open-source library deprecation status were not confirmed on the fetched pages.

---

## 6. Firebase/Firestore security-rule pitfalls (test mode), Firebase App Check, and equivalents in other BaaS

### Takeaway
Firestore's test mode "allows anyone to read and overwrite your data"; production mode denies all client reads/writes while server SDKs bypass rules entirely; rules are "not filters". App Check is anti-abuse attestation that "prevents some, but not all, abuse vectors" and is complementary to, not a replacement for, Authentication and rules. Among the other BaaS, Neon Data API and PocketBase/Appwrite differ sharply in default exposure: Neon auto-grants `authenticated` on future tables if "Grant public schema access" is left on; PocketBase and Appwrite default to locked.

### Cited Findings

**Firebase / Firestore**
- Starting modes: Test mode is "Good for getting started with the mobile and web client libraries, but allows anyone to read and overwrite your data." Production mode "Denies all reads and writes from mobile and web clients"; "Your authenticated application servers ... can still access your database." — [Firestore quickstart](https://firebase.google.com/docs/firestore/quickstart)
- Allow-all rule warning: "NEVER use this rule set in production; it allows anyone to overwrite your entire database." "Every database request from a Cloud Firestore mobile/web client library is evaluated against your security rules before reading or writing any data." "The server client libraries bypass all Cloud Firestore Security Rules and instead authenticate through Google Application Default Credentials." — [Firestore security get-started](https://firebase.google.com/docs/firestore/security/get-started)
- Locked-mode rules: `allow read, write: if false;` for Firestore and Storage; `".read": false, ".write": false` for Realtime Database. "Firebase Security Rules are the only safeguard blocking access for malicious users." If you deploy, the app "is publicly accessible — even if you haven't *launched* it." — [Firebase rules basics](https://firebase.google.com/docs/rules/basics)
- "security rules are not filters—queries are all or nothing." "If a query could potentially return documents that the client does not have permission to read, the entire request fails." Rules evaluate "against its potential result set, not against the actual properties of documents". — [Firestore rules and queries](https://firebase.google.com/docs/firestore/security/rules-query)
- "if *any* rule grants access to a dataset, Firebase Security Rules grants access to that dataset" and "you can't refine access at a subpath if you've granted access at a higher level". — [Firebase rules get-started](https://firebase.google.com/docs/rules/get-started)
- App Check "helps protect your app backends from abuse by preventing unauthorized clients from accessing your backend resources"; "It prevents some, but not all, abuse vectors directed towards your backends." "Using App Check does not guarantee the elimination of all abuse." "App Check and Firebase Authentication are complementary parts of your app security story." Providers: DeviceCheck, App Attest, reCAPTCHA Enterprise (Apple); Play Integrity, reCAPTCHA Enterprise (Android); reCAPTCHA Enterprise (Web). "When you enable App Check enforcement, requests from clients without a valid attestation will be rejected." — [Firebase App Check](https://firebase.google.com/docs/app-check)

**Neon Data API**
- Exposes "your Postgres database as a REST endpoint secured by JWT authentication and Row-Level Security." "The Data API has no permission layer of its own" — access is controlled only by GRANTs and RLS, so "a missing or misconfigured policy can expose a table to anyone with the endpoint URL." The "Grant public schema access" option grants `authenticated` USAGE on `public` and SELECT/UPDATE/INSERT/DELETE on its tables and runs `ALTER DEFAULT PRIVILEGES` so **future tables get those privileges automatically**; the console warns for tables without RLS that "authenticated users can view all rows in those tables." An `anonymous` role exists for no-login data. JWTs "expire after approximately 15 minutes." — [Neon Data API](https://neon.com/docs/data-api/get-started)

**Convex**
- Clients reach data only via functions; functions are public by default; internal functions are not client-callable (quotes in section 5). — [Convex internal functions](https://docs.convex.dev/functions/internal-functions)

**PocketBase**
- Five rules per collection (`listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`). `null` ("locked") is the default: "the action could be performed only by an authorized superuser"; empty string means "anyone will be able to perform the action (superusers, authorized users and guests)"; non-empty string is a filter. "PocketBase API Rules act also as records filter!" Superusers bypass rules. Failed `listRule` returns empty 200; `createRule` 400; `view/update/delete` 404; locked rules 403. — [PocketBase API rules](https://pocketbase.io/docs/api-rules-and-filters/)

**Appwrite**
- Resources created via Server SDK or Console without explicit permissions are inaccessible: "no one can access it by default because the permissions will be empty." Client SDK-created resources give the creator read/update/delete. Server integrations with API key scopes access resources "regardless of their permissions." Per-row permissions require the Row Security setting; "Omitting READ/UPDATE/DELETE at table level prevents users from accessing all rows." `Role.any()` "Grants access to anyone." — [Appwrite permissions](https://appwrite.io/docs/advanced/platform/permissions)

### Inferences
- Firebase's test mode is the functional equivalent of a Supabase table granted to `anon` with no RLS. Unlike Supabase's grant-removal, Firebase's mitigation is time-based expiry of the test-mode rule (the console-generated `request.time < timestamp.date(...)` condition), which converts an open database into a broken app after the window rather than a locked one; teams then often "fix" it by re-opening rules.
- Neon's Data API default (auto-grant to `authenticated` on future tables) is the pre-30-Oct-2026 Supabase posture restricted to logged-in users: any authenticated user can read every row of any new table that lacks RLS. For multi-tenant apps the equivalent of Supabase's hardening is to leave "Grant public schema access" off and grant per table.
- PocketBase and Appwrite are closed-by-default at the rule/permission layer; their characteristic vibe-coding failure is the generated code setting `""` rules or `Role.any()` to make a demo work, i.e. the same "permissive policy" class as Supabase lint 0024.
- Convex's model has no declarative row filter; every public function is an API endpoint whose authorisation is code. The behavioural cross-tenant test is therefore the *only* test available there; presence checks have no object to check.

### Gaps
- The exact Firebase console text for test mode (the 30-day `request.time < timestamp.date(...)` rule and the expiry email) is UI/email content and was not found verbatim on the fetched Firebase documentation pages; only the quickstart's "allows anyone to read and overwrite your data" and the get-started page's "NEVER use this rule set in production" were confirmed.
- App Check "monitoring mode" vs enforcement and replay protection were not present in the fetched overview page.
- Convex RLS-style helpers (`convex-helpers`) and Neon's exact handling of `anonymous` grants were not verified.

---

## 7. Client bundle secret exposure: NEXT_PUBLIC_/VITE_, source maps (Vercel), build-output scanning (Netlify), GitHub push protection, Supabase auto-revocation, gitleaks/trufflehog

### Takeaway
Framework prefixes inline values into the browser bundle at build time by design; Vercel's protected source maps (default for new projects since 14 May 2026, opt-in for existing) and Netlify's smart-detection build-output scanning (fails the build) are the host-side controls; GitHub repository push protection is off by default and requires paid Secret Protection, while user-level protection covers public repos only; Supabase auto-revokes secret keys found in public GitHub and GitHub added Supabase/Lovable detectors on 5 Oct 2026.

### Cited Findings
- Next.js: "Non-`NEXT_PUBLIC_` environment variables are only available in the Node.js environment"; prefixing with `NEXT_PUBLIC_` makes Next.js "inline" the value "at build time, into the js bundle that is delivered to the client, replacing all references to `process.env.[variable]` with a hard-coded value." "By default, environment variables are only available on the server". — [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- Vite: "Variables prefixed with `VITE_` will be exposed in client-side source code after Vite bundling. To prevent accidentally leaking env variables to the client, avoid using this prefix." "`VITE_*` variables should *not* contain sensitive information such as API keys." "The values of these variables are bundled into your source code at build time." — [Vite env and mode](https://vite.dev/guide/env-and-mode)
- Supabase agent skill: "In Next.js, any `NEXT_PUBLIC_` env var is sent to the browser." "Never expose the `service_role` or secret key in public clients." — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Vercel Protected Source Maps (changelog 14 May 2026): puts browser `.map` files "behind Vercel Authentication"; team members can fetch them, everyone else gets a 404; new projects enabled by default; existing projects "opt in from Settings → Deployment Protection, with no redeploy needed." — [Vercel changelog](https://vercel.com/changelog/protected-source-maps-ship-browser-source-maps-securely)
- Netlify: "Smart detection automatically scans for potential secrets in your repository code and build output." "The build will automatically fail to prevent a secret exposure." "available on Personal, Pro, and Enterprise plans." Controls: `SECRETS_SCAN_ENABLED=false` disables all scanning; `SECRETS_SCAN_SMART_DETECTION_ENABLED=false` disables only smart detection ("Normal secret scanning will still run for environment variables you've explicitly marked as secrets"); `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES=value-one,value-two` safelists false positives. — [Netlify secret scanning](https://docs.netlify.com/manage/security/secret-scanning/)
- GitHub push protection: for users it "Is enabled by default" (GitHub.com, account-tied) and "Stops you from pushing secrets to public repositories"; for repositories it "Is disabled by default" and "Requires GitHub Secret Protection to be enabled"; by default "anyone with write access to the repository can bypass push protection by specifying a bypass reason" ("It's used in tests", "It's a false positive", "I'll fix it later"), each creating an alert; delegated bypass available. Covers CLI pushes, UI commits, uploads, REST API, GitHub MCP server (public repos only). — [GitHub about push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection)
- Pricing: GitHub's estimator gives only an illustrative figure, "(for example, $19 per active committer)"; "Actual billing is based on the number of active committers in the selected private repositories during the billing period", measured over "the last 90 days". — [GitHub Secret Protection pricing](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-organization-security/configure-specific-tools/estimating-the-price-of-secret-protection)
- GitHub detectors added 5 Oct 2026: `supabase_oauth_access_token`, `supabase_scoped_personal_access_token`, and `lovable_api_key` (Lovable Labs "joined the secret scanning partnership program"; "Partner secrets are automatically reported to the secret issuer when found in public repositories"). Push-protection support for these is not stated. — [GitHub changelog 5 Oct 2026](https://github.blog/changelog/2026-10-05-secret-scanning-adds-detectors-for-lovable-supabase-and-more)
- Supabase automatically revokes secret keys found in public GitHub repositories and notifies the owner (tied to new key formats); push protection with GitHub was "planned, 2026" with detection currently post-commit. — [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)
- Lovable: "API keys and other secrets cannot be stored safely in client-side code"; keys pasted into chat are detected and routed to Secrets; API calls should be made "in server-side code instead of in the browser." — [Lovable security docs](https://docs.lovable.dev/features/security)
- gitleaks: "a tool for **detecting** secrets like passwords, API keys, and tokens in git repos", with `gitleaks git`, `gitleaks dir`, `gitleaks stdin`; available "as a pre-commit hook directly in your repo or as a GitHub action". README: "Gitleaks is feature complete. I'm not merging new features into Gitleaks. Future releases will be security patches only." No Supabase mention in the README. — [gitleaks](https://github.com/gitleaks/gitleaks)
- TruffleHog: "classifies over 800 secret types"; "over 700 credential detectors that support active verification against their respective APIs"; "For every secret TruffleHog can classify, it can also log in to confirm if that secret is live or not"; scans GitHub, GitLab, Docker, filesystems, S3, GCS, CI; "Available as a GitHub Action and a pre-commit hook." No Supabase mention in the README. — [trufflehog](https://github.com/trufflesecurity/trufflehog)

### Inferences
- The decisive distinction for CI gating is *what is scanned*: repo scanners (gitleaks, trufflehog, GitHub) see source, so they catch a hard-coded secret key but not an env var that a build inlines via `NEXT_PUBLIC_`/`VITE_`. Only build-output scanning (Netlify smart detection) or a custom post-build grep of `dist/`/`.next/static` catches the prefixed-variable leak. A publishable key in the bundle is expected and must be safelisted; a `sb_secret_` or `eyJ...service_role` string in the bundle must fail the build.
- Vercel's protected source maps mitigate *code* exposure (logic, internal URLs, comments) not key exposure: a `NEXT_PUBLIC_` value is in the minified bundle itself, which is public regardless of `.map` protection.
- The two Supabase token types GitHub added on 5 Oct 2026 are management-plane tokens (OAuth access, scoped PAT), which is the class that lets an attacker alter a project; the 2022 partnership (search result title "Supabase is now a GitHub secret scanning partner", 28 Mar 2022, not fetched) presumably covers data-plane keys. Whether `sb_secret_` keys specifically are push-protection patterns was not confirmed.

### Gaps
- GitHub's supported-patterns table (530 patterns, paginated) could not be searched for Supabase rows; which Supabase key formats have push protection and validity checks is unverified.
- gitleaks/trufflehog default rule coverage for `sb_secret_`/`sb_publishable_` formats was not verified (READMEs do not list detectors).
- Netlify's `SECRETS_SCAN_OMIT_PATHS` / `SECRETS_SCAN_OMIT_KEYS` and its handling of `NEXT_PUBLIC_`/`VITE_` variables live on the Secrets Controller page, not fetched.

---

## 8. Supabase agent skill / AI-skills guidance for coding agents: what it tells models to do

### Takeaway
Supabase publishes an open-source agent skill (`npx skills add supabase/agent-skills`, v0.1.0, Agent Skills open standard, also a Claude Code plugin) whose SKILL.md encodes the exact failure modes of vibe-coded apps: enable RLS on every exposed table, grant explicitly, use `TO` plus tenant predicates, both USING and WITH CHECK on UPDATE, `security_invoker` views, no `SECURITY DEFINER` to silence errors, `app_metadata` not `user_metadata`, publishable keys only in clients, run advisors before committing migrations, and do not connect MCP to production. Supabase reports small-sample gains (e.g. Sonnet 4.6 46% → 71%).

### Cited Findings
- Install: `npx skills add supabase/agent-skills`; Claude Code plugin `claude plugin marketplace add supabase/agent-skills` then `claude plugin install supabase@supabase-agent-skills`; single skill `--skill supabase`; works with "Claude Code, Codex, GitHub Copilot, Cursor, or any of the agents that support" the Agent Skills Open Standard. Released as v0.1.0. — [Supabase agent skills blog](https://supabase.com/blog/supabase-agent-skills)
- Two skills: `supabase` (products, client libraries, auth, CLI/MCP, schema changes, security audits, debugging) and `supabase-postgres-best-practices` (tables, migrations, "RLS policies and their tests", indexes, functions). Installs default to project scope; `npx skills update` regularly ("We update our agent skills frequently"). The docs page does not mention AGENTS.md, CLAUDE.md or Cursor rules. — [Supabase AI skills docs](https://supabase.com/docs/guides/getting-started/ai-skills)
- SKILL.md rules (verbatim): "Enable RLS on every table in any exposed schema, which includes `public` by default." "anon and authenticated roles will need to be explicitly granted access." "When granting public (`anon`/`authenticated`) access, always enable RLS too." "`TO authenticated` alone is authentication without authorization (BOLA / IDOR)." "UPDATE policies require both `USING` and `WITH CHECK`." "UPDATE requires a SELECT policy." "`auth.role()` is deprecated — use the `TO` clause instead." "Never expose the `service_role` or secret key in public clients." "Prefer publishable keys for frontend code." "Legacy `anon` keys are only for compatibility." "Views bypass RLS by default." "Never add `SECURITY DEFINER` to resolve a permission error; it silently removes access control". "Prefer `SECURITY INVOKER`." "Never use `user_metadata` claims in JWT-based authorization decisions." "Store authorization data in `raw_app_meta_data` / `app_metadata` instead." "Deleting a user does not invalidate existing access tokens." "Storage upsert requires INSERT + SELECT + UPDATE." "Run advisors → `supabase db advisors` (CLI v2.81.3+) or MCP `get_advisors`. Fix any issues." Migrations: "Do NOT use `apply_migration` to change a local database schema"; generate with `supabase db pull <descriptive-name> --local --yes`; declarative projects "Do not start by hand-writing a migration." "Always pin package versions and commit lockfiles". — [Supabase SKILL.md](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md)
- Blog's security checklist summary adds: "Deleting a user doesn't invalidate their JWT. You must revoke sessions first." and "We strongly discourage connecting the Supabase MCP server to your production database." — [Supabase agent skills blog](https://supabase.com/blog/supabase-agent-skills)
- Measured results (LLM judge on Braintrust, six scenarios per condition): Claude Code Opus 4.6 58% → 50% (MCP only) → 67% (MCP + skill); Sonnet 4.6 46% → 58% → 71%; Codex GPT-5.4 71% → 71% → 88%; GPT-5.4 Mini 42% → 63% → 71%. "These are early results with a small sample size." — [Supabase agent skills blog](https://supabase.com/blog/supabase-agent-skills)
- The Supabase MCP server's own instructions to agents (as surfaced to this session) tell the agent to install the skill via `npx skills add supabase/agent-skills`, to read the project's "security and performance advisories before making changes", and to "Prefer local development and testing before applying changes to a remote project." (Observed in the MCP server instruction block in this session; not a public web page.)

### Inferences
- The skill is stack-specific and concrete, which is exactly the class of guidance the original report found effective; but it is probabilistic. Opus 4.6 *dropped* from 58% to 50% with MCP alone, which shows that giving an agent more tools without the rules can reduce security outcomes. The skill is a floor-raiser; the deterministic gates (grants-by-default after 30 Oct, advisors as CI checks, pgTAP cross-tenant tests) remain the controls.
- Nothing in the skill tells an agent to *write* the pgTAP cross-tenant tests; it tells it to run advisors and "run a test query to confirm the change works". The `supabase-postgres-best-practices` skill mentions RLS tests but its content was not fetched. Organisations should add an explicit AGENTS.md/CLAUDE.md requirement for the section-4 matrix.

### Gaps
- `supabase-postgres-best-practices` SKILL.md content (including its RLS test guidance) was not fetched.
- Supabase publishes no AGENTS.md template as such; the "skills" format is the published artefact. Whether Lovable, Bolt or v0 embed equivalent rules in their system prompts is not publicly documented.

---

## Key questions — direct answers

**Q1. Quote the Supabase changelog on the 30 Oct 2026 change precisely.** Scope: "New tables created in the `public` schema" lose automatic Data API/GraphQL exposure and need an explicit `grant`; previously `select, insert, update, delete` were granted by default to `anon`, `authenticated`, `service_role`. "Existing tables are not affected in your project, they keep their current grants and stay reachable." "RLS behavior remains unchanged." Error `42501`, "permission denied for table your_table", hint "Grant the required privileges to the current role with: GRANT SELECT ON public.your_table TO anon;". Direct connections: "this change will not affect you." Not affected: `storage`, `auth`, `realtime`, custom schemas, self-hosted. Existing projects must do nothing for existing tables; for new tables after 30 Oct they must add grants in the same migration as RLS/policies; they may opt in early with `alter default privileges for role postgres in schema public revoke ...`. — [Supabase changelog 45329](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

**Q2. What do Supabase docs say about publishable vs anon key capabilities and secret/service_role exposure?** Publishable keys are "Safe to expose online" and reach only "what Row Level Security allows"; secret keys bypass RLS, do not work from a browser (401), and "Never put one in a browser, a shipped application, or source control." Legacy anon/service_role deprecated "by the end of 2026". — [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)

**Q3. Minimal correct SQL for an explicit-grants-plus-RLS multi-tenant table and negative test.** See section 4 (grants to `authenticated` only; RLS enabled; four policies with `TO authenticated`, tenant predicate from `app_metadata`, USING + WITH CHECK on UPDATE; pgTAP file asserting 42501 for anon, empty result for cross-tenant read, 42501 for cross-tenant insert and `org_id` reassignment, zero rows for cross-tenant update).

**Q4. Documented tools for behavioural RLS testing (2026).** pgTAP + `supabase test db` ([Supabase testing overview](https://supabase.com/docs/guides/local-development/testing/overview)); basejump `supabase_test_helpers` 0.0.6 ([GitHub](https://github.com/usebasejump/supabase-test-helpers)); Supabase RLS Tester feature preview, 24 Apr 2026, SELECT-only ([changelog 45233](https://supabase.com/changelog/45233-feature-preview-rls-tester)); SupaShield CLI, Oct 2025 ([GitHub](https://github.com/Rodrigotari1/supashield)); Security Advisor / `get_advisors` for presence checks ([advisors](https://supabase.com/docs/guides/database/database-advisors)); Lovable Deep scan + Aikido DAST ([Lovable](https://docs.lovable.dev/features/security)).

**Q5. Where do Supabase, Firebase and Lovable say business logic/authorisation should live?** Supabase: authorisation in Postgres via grants + RLS ("All authorization happens in the database" — [PostgREST](https://docs.postgrest.org/en/v13/references/auth.html)); server-side code should use a user-scoped client so RLS still applies and use the admin client "only for work that has to cross those policies" ([Edge Functions auth](https://supabase.com/docs/guides/functions/auth)); functions should be `security invoker` and ownership checked in the body where needed ([database functions](https://supabase.com/docs/guides/database/functions)). Firebase: "Firebase Security Rules are the only safeguard blocking access for malicious users" for client SDKs; server SDKs bypass rules ([rules basics](https://firebase.google.com/docs/rules/basics); [Firestore get-started](https://firebase.google.com/docs/firestore/security/get-started)); App Check is complementary, not a substitute ([App Check](https://firebase.google.com/docs/app-check)). Lovable: RLS "control[s] which users can access or modify data", "Misconfigured RLS rules are a common cause of data leaks", API calls with secrets belong "in server-side code instead of in the browser"; no explicit client/edge/DB placement doctrine ([Lovable security](https://docs.lovable.dev/features/security)).
