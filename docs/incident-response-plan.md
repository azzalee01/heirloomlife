# Heirloom Life — Data Breach Response Plan

**Owner:** Aaron Lee (incident lead) · **Last reviewed:** 2026-11-28 · Review every 6 months.

Heirloom Life Pty Ltd holds highly sensitive personal information (wills, identity
and contact details, payment metadata). This plan sets out what we do if that data
is (or may be) compromised. It is aligned to the **Notifiable Data Breaches (NDB)
scheme** under Part IIIC of the *Privacy Act 1988* (Cth).

## What counts as an eligible data breach
Unauthorised access to, disclosure of, or loss of personal information that **a
reasonable person would conclude is likely to result in serious harm** to any
affected individual, where we have not been able to prevent that harm. Examples:
database exposure, leaked Will documents, a compromised admin/service credential,
a sub-processor breach affecting our data, a lost/stolen unencrypted device.

## Response steps

1. **Detect & record (immediately).** Anyone who suspects a breach emails
   `hello@heirloomlife.com.au` and notifies the incident lead. Start a dated
   incident log: what happened, when noticed, what data/systems, who is involved.

2. **Contain (hours).** Stop the bleeding — revoke/rotate affected credentials
   (Supabase service keys, `CRON_SECRET`, Stripe/Resend/Anthropic keys, admin
   sessions), disable compromised accounts, take the affected path offline if
   needed, and preserve logs/evidence before changing anything you don't have to.

3. **Assess (within 30 days of becoming aware — faster where possible).** Determine
   whose data, what information, and whether serious harm is **likely**. Consider
   the sensitivity (wills + ID are high), whether data was encrypted, and whether
   remedial action has removed the risk of harm. Document the assessment and the
   decision (notifiable or not) with reasons.

4. **Notify — if eligible and harm not prevented.** As soon as practicable:
   - **OAIC:** submit the Notifiable Data Breach form (oaic.gov.au).
   - **Affected individuals:** a clear statement of what happened, what information
     was involved, and what they should do (e.g. watch for scams, reset nothing —
     we have no passwords). Notify directly where we can; otherwise publish on the
     website and take reasonable steps to tell them.
   - If a **sub-processor** caused it, coordinate so only one of us notifies.

5. **Remediate & review.** Fix the root cause, verify the fix, and run a short
   post-incident review: what failed, what to change (controls, monitoring,
   process). Update this plan and the `/security-trust` page if anything material
   changed.

## Key contacts & systems
- **Incident lead:** Aaron Lee — `hello@heirloomlife.com.au`
- **OAIC** (regulator / NDB form): https://www.oaic.gov.au
- **Database & auth:** Supabase (project `copbetdvhkreyzvywmmr`, AWS ap-southeast-2 / Sydney)
- **Hosting:** Vercel (`heirloomlife`) · **Payments:** Stripe · **Email:** Resend
- **Other sub-processors:** Daily (witnessing video), Anthropic (estate assistant), PostHog (analytics)
- **Secrets to rotate on credential compromise:** Supabase service-role key,
  `CRON_SECRET`, `SEND_EMAIL_HOOK_SECRET`, Stripe keys, Resend/Anthropic keys.

## Records
Keep each incident's log, assessment and any notifications for at least the period
required by law. Even non-notifiable incidents are logged, so patterns are visible.
