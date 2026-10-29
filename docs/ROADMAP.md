# LifeLine AI: roadmap from demo to full-stack project

## Current version
- Static front end (HTML/CSS/JavaScript)
- Browser-only localStorage data
- Fictional hospitals and request records
- Rule-based assistant demonstration
- No login, no shared database, no external integrations

## Phase 1 — Verify the prototype
1. Run the app locally.
2. Test hospital search and service filters.
3. Create a request and verify its generated ID.
4. Change request status and inspect history.
5. Refresh the page to confirm local changes persist.
6. Export and reset demo data.
7. Test on mobile-sized browser view.

## Phase 2 — Add a shared database (e.g. Supabase)
Suggested tables:
- `hospitals`: id, name, area, service_categories, report_updated_at, verification_status
- `coordination_requests`: id, category, area, service_needed, sanitized_summary, status, created_at
- `request_events`: id, request_id, previous_status, new_status, actor_id, created_at
- `resource_reports`: id, hospital_id, resource_type, reported_value, reported_at, expires_at, verified_by

Use Row Level Security (RLS) policies. Public users must not be able to change hospital records or view private request data. Staff should only edit records for their assigned facility. Administrators need separate permissions. Never put service-role keys in browser code.

## Phase 3 — Authentication and roles
- Implement managed authentication.
- Verify staff identity and their organization before granting staff privileges.
- Use least-privilege access and server-side authorization; hiding buttons is not security.
- Record sensitive actions in audit logs.
- Use synthetic data during development.

## Phase 4 — AI support
- Use AI only for administrative assistance, such as turning a sanitized request note into structured fields or producing a concise handoff summary.
- Validate all model output against a strict schema.
- Display uncertainty and source timestamps.
- Require human confirmation before any action.
- Do not generate diagnoses, triage priority, treatment advice, or autonomous emergency decisions.
- Do not send real patient data to a model unless an approved privacy and legal basis, security controls, and provider agreement are in place.

## Phase 5 — Real-world validation
Before any live pilot:
- Obtain written participation from hospitals/authorized providers.
- Define the authoritative source and refresh frequency for each resource.
- Verify all status updates and expire stale records automatically.
- Perform a privacy/security review and threat model.
- Define incident response, access revocation, retention and deletion rules.
- Test reliability, accessibility, backups, monitoring and auditability.
- Obtain institutional and legal review appropriate to the deployment.
- Keep emergency phone services and clinicians as the authority for urgent decisions.

## Deployment warning
A public static deployment shares the interface, not its localStorage records. Each browser has its own isolated data. Do not present this demo as a live coordination system.


## Local open-model integration
- Added Qwen2.5 3B via Ollama local API.
- Model weights are downloaded separately with `ollama pull qwen2.5:3b`.
- Next engineering steps: authenticated backend, shared database, audit logs, access controls, and authorized provider data integrations before any real-world use.
