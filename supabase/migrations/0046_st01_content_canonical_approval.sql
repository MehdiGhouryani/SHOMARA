-- Migration 0046: Formal Educational Approval for Station 01 (ST01) Content Package & Artifacts
-- Updates approval provenance status from EDUCATIONAL_REVIEW_REQUIRED to CANONICAL_APPROVED

update public.content_versions
set provenance = jsonb_set(provenance, '{approvalStatus}', '"CANONICAL_APPROVED"')
where content_artifact_id in (
  select id from public.content_artifacts where station_id = '21000000-0000-4000-8000-000000000001'
);

update public.content_packages
set version = '1.1.0-canonical',
    storage_path = 'content://g1/st01/1.1.0-canonical/package.json'
where id = '28000000-0000-4000-8000-000000000001';
