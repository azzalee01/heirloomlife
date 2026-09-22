# Proposal: Original Will Location Field

**Status:** Proposed — not yet implemented  
**Created:** 2026-09-21 · Branch: copy/trust-sweep

---

## Background

When a user downloads and signs their Heirloom Will, the signed physical document must be stored somewhere safe (e.g. a home safe, solicitor's office, bank). The Vault currently stores the digital Will document, but has no field for recording where the signed original is kept.

A related field (`previous_will_location`) already exists in the schema to capture where the user's *prior* will was stored before creating their Heirloom Will. That field is not the same thing.

---

## Proposed feature

Add an `original_will_location` field (or equivalent) to the user's estate record, capturing:

- Where the signed original Will is physically stored
- Who else knows its location (e.g. executor, solicitor)

This would surface in the Vault after a Will is downloaded, as a prompt: "Where will you keep your signed original Will?"

---

## Why

- The Vault correctly tells users their original signed Will is the legally operative document
- Users often forget where they stored it, or their executor cannot find it
- Several marketing pages already advise users to "store the original somewhere safe" — this turns advice into action

---

## Scope

- Schema: new field on `wills` or `testators` table (or a separate `estate_record` table)
- UI: post-download prompt in the Vault
- Copy: "Where will you store your signed Will?" with example options
- No impact on the digital Will document or solicitor review process

---

## Out of scope

- This does not replace the physical original — the Vault stores the digital copy only
- Do not market the Vault as a substitute for the signed original

---

_Implement only after founder confirmation of schema design._
