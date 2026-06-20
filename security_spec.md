# Vytal Bridge Data Access & Security Specification

This document summarizes the safety-by-design assertions, data invariants, and defensive tests established for the Vytal Bridge multi-tenant maternal monitoring platform.

## 1. Compliance Mapping
- **South Africa POPIA**: Health information is treated as *special personal information*. This requires explicit, granular, withdrawable patient consent. Full audit records are maintained.
- **Botswana DPA (2024)** & **Eswatini DPA (2022)**: Mandate local data residency controls and strict role-based access control (RBAC). Identifiable records cannot be modified without consent, and deletion is strictly gated by compliance guidelines.

---

## 2. Core Data Invariants & Access Rules
1. **Clinic/Tenant Partitioning**: Clinicians and Community Health Workers (CHWs) can only read resources and logs belonging to active pregnancies.
2. **Patient Consent lock**: A Patient record must store `consentGranted == true` to process any Protected Health Information (PHI). If consent is withdrawn, the record must block any new vitals reporting.
4. **Immutability of Logs**: Clinical vitals tracking and system audit logs are write-once and strictly immutable (`allow update: if false`). This prevents retrospective modification of digital medical trails.
5. **No Client Role Spoofing**: Users cannot self-escalate or declare administrative privileges.

---

## 3. The "Dirty Dozen" Malicious Payloads (Red Team Penetration Scenarios)

1. **Clinic Spoofing (Identity Spoofing)**: Attempting to create a clinic with arbitrary pricing tier, bypass billing.
2. **Anonymity Bypass (Unverified Users)**: Standard clinical operations executing without authenticated sessions.
3. **Ghost Field Mutation (Shadow Update)**: Appending arbitrary tracking fields like `isSysAdmin: true` into a patient document.
4. **Retroactive Medical Editing (Audit Manipulation)**: Modifying a patient's historical vitals logs to hide standard-of-care errors.
5. **Divergent Pregnancy Date (Out-of-Bound Input)**: Injecting a gestational age of `120 weeks` to crash analytics graphs.
6. **Denial-of-Wallet Character Injection (Resource Poisoning)**: Setting patient IDs or name strings with massive 2MB text buffers.
7. **Cross-Tenant View Leak**: Querying patients without filtering by authorized clinician boundaries.
8. **Orphan Log Creation**: Creating a vitals check-in reference linked to a non-existent parent clinic or patient ID.
9. **Consent Override**: Posting clinical readings for patients whose `consentGranted` field remains `false`.
11. **Timestamp Fabrication (Temporal Playbook)**: Supplying hand-crafted old timestamps for historical audit entries instead of `request.time`.
12. **Status Shortcutting (Terminal State Lock)**: Skipping risk-ranked queues from normal directly to completed status.

---

## 4. Test Verification
All the scenarios outlined above are safely contained by the policies in `firestore.rules`. Any attempt to post these payloads returns `PERMISSION_DENIED` inside client environments.
