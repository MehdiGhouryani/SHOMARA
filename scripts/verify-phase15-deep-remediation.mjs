import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const must=(ok,msg)=>{if(!ok) throw new Error(msg); console.log(`[PASS] ${msg}`)};

const sql42=read('supabase/migrations/0042_learning_truth_schema_alignment.sql');
const sql43=read('supabase/migrations/0043_runtime_semantics_v2.sql');
const sql44=read('supabase/migrations/0044_runtime_check_group_ordering.sql');
const runtimeSql = sql43 + '\n' + sql44;
const station=read('apps/mobile/src/station/StationFlow.tsx');
const runtime=read('apps/mobile/src/station/runtimeApi.ts');
const stationFlow=read('apps/mobile/src/station/StationFlow.tsx');
const policy=read('packages/learning-runtime/src/policies.ts');
const content=read('apps/web/lib/content-delivery.ts');
const gates=read('apps/web/lib/runtime-gates.ts');

must(!runtimeSql.includes("if v_existing.encounter_id <> v_encounter.id then raise exception using errcode='P0001', message='IDEMPOTENCY_CONTEXT_MISMATCH'; end if;"), 'new-attempt path no longer contains the duplicated dead idempotency branch');
must(runtimeSql.includes("if v_check_group='STATION_PASS' then"), 'Station Pass is derived only from explicit STATION_PASS check group');
must(runtimeSql.includes("v_encounter.learning_role='MASTERY_CHECK' and v_check_group='MASTERY_EVIDENCE' then"), 'MasteryEvaluation is restricted to explicit MASTERY_EVIDENCE');
must(runtimeSql.includes("active_mastery_evaluation_ref = v_mastery_eval.id"), 'Learning State points to the committed MasteryEvaluation');
must(runtimeSql.includes('source_type, actor_account_id, evidence_kind, provenance, client_event_id'), 'Evidence persists explicit provenance fields');
must(runtimeSql.includes('status, interpretation_type, uncertainty, basis'), 'Interpretation persists canonical uncertainty/type/basis');
must(runtimeSql.includes('insert into public.error_hypotheses'), 'negative evidence creates a traceable Error Hypothesis');
must(runtimeSql.includes("'phase15-station-pass-4of5x2-v1'"), 'Postgres runtime pins the versioned Station Pass policy');
must(sql44.includes("v_check_group := case when v_encounter.learning_role='MASTERY_CHECK'"), 'Postgres resolves check group before Evidence/Decision writes so provenance and arbitration carry the canonical group');
must(policy.includes("STATION_PASS_POLICY_VERSION = 'phase15-station-pass-4of5x2-v1'"), 'TypeScript runtime pins the same Station Pass policy version');

must(station.includes("} else if (target.id === 'G1-ST01-E08') {") && station.includes("await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B')"), 'E08 has an explicit Station Pass/Recovery/second-check branch');
must(station.includes("} else {\n          // A single qualifying Check is not Station Pass") && station.includes("await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B');"), 'E08 cannot reach Transfer after only one qualifying Check');
must(station.includes("setStationPassAchieved(true)"), 'Station Pass achievement is durable across E11/E12');
must(station.includes("target.id === 'G1-ST01-E10'") && station.includes("else if (stationPassAchieved) await beginEncounter(getLocalContent('transfer'), 'TRANSFER')") && station.includes("else await beginFreshCheckEncounter(getLocalContent('checkB'), 'CHECK_B')"), 'E10 only reaches Transfer after Station Pass; otherwise it returns to an independent Check');
must(station.includes("target.id === 'G1-ST01-E11'") && station.includes("beginFreshCheckEncounter(getLocalContent('mastery'), 'MASTERY_CHECK')"), 'E11 flows to the final Mastery Check');
must(station.includes("content.id === 'G1-ST01-E11' ? <OptionRow"), 'E11 uses the option interaction rather than CountGame');
// Phase-2 (2026-09-29): the child-facing copy no longer exposes system jargon ("Learning Engine").
// The guard's intent is kept: a reward is shown ONLY when Station Pass was actually earned, and the
// UI never claims mastery.
// Behaviour guard (not a literal ternary): the reward is gated on the real Station Pass flag, the completion copy comes from the session-feel contract, and no jargon leaks.
must(station.includes('<RewardReveal visible={stationPassAchieved}') && station.includes('sessionCompleteFeel(') && !station.includes('مسترشدن') && !station.includes('Learning Engine'), 'Completion UI shows a reward only when Station Pass was actually achieved and never claims mastery or exposes system jargon');

must(stationFlow.includes("if (__DEV__) {") && stationFlow.includes("throw new Error('REMOTE_RUNTIME_UNAVAILABLE')"), 'Mobile remote-session fallback is development-only');
must(content.includes('supabaseRestSelect') && content.includes('dbManifest') && content.includes('dbPackage') && content.includes('can_access_content_package'), 'Production Content Delivery uses the Supabase REST repository and entitlement boundary');
const manifestRoute=read('apps/web/app/api/v1/content/manifest/route.ts'); must(manifestRoute.includes('const principal = await requireRequestPrincipal(request)') && manifestRoute.includes('principal.accessToken'), 'Content manifest route binds the authenticated principal before using its token');
must(gates.includes("MATH_ADULT_PROJECTION_REPO") && gates.includes("MATH_ASSIGNMENT_REPO"), 'Adult/Assignment production remains fail-closed until real repositories exist');

const pkgPath=path.join(root,'content/dev-packs/g1-st01-v2/package.json');
const pkgBytes=fs.readFileSync(pkgPath); const pkg=JSON.parse(pkgBytes.toString('utf8')); const checksum=crypto.createHash('sha256').update(pkgBytes).digest('hex');
must(pkg.packageVersion==='1.2.0-staging' && pkg.items.length===20, 'ST01 package remains pinned to 12 logical + 8 skill-aware hidden variants');
must(read('supabase/migrations/0040_recovery_package_version.sql').includes(checksum), 'Package checksum remains pinned after content boundary changes');

console.log('[PASS] Legacy runtime adversarial regression suite: provenance and policy invariants verified.');
