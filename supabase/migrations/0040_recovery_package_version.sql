-- Phase 14: update ST01 staging package to include skill-aware recovery variants.
update public.content_packages
set version='1.2.0-staging', checksum='53d5702849c1b0f55dadace5ec2846f834e05093616601a25e686c3d06b5ab3a', bytes=2633, release_channel='STABLE', status='ACTIVE'
where id='28000000-0000-4000-8000-000000000001';

update public.content_manifests
set version='g1-staging-manifest-v2', generated_at=now()
where id='29000000-0000-4000-8000-000000000001';
