-- Jurisdiction-neutral ("generic") clause variants + wills.jurisdiction.
-- NSW rows are untouched. Generic clause_text is the solicitor-approved wording
-- (per Aaron, 2026-11-28); all other clause metadata is copied verbatim from the
-- matching nsw row so substitution/selection behaviour is identical.
--
-- Schema note: clause_code was UNIQUE on its own, which cannot represent the same
-- clause in two jurisdictions. Broaden the natural key to (clause_code, jurisdiction).
-- Applied to Sydney (copbetdvhkreyzvywmmr) as 20261128055049.
alter table public.clauses drop constraint clauses_clause_code_key;
alter table public.clauses add constraint clauses_clause_code_jurisdiction_key unique (clause_code, jurisdiction);

alter table public.wills add column if not exists jurisdiction text;
grant update (jurisdiction) on public.wills to authenticated;
comment on column public.wills.jurisdiction is 'Testator State/Territory persisted at Will assembly (e.g. NSW, VIC) so the document re-renders from the same clause set.';

-- APPROPRIATION-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='APPROPRIATION-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'APPROPRIATION-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='APPROPRIATION-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$My Executor may, in their absolute discretion, appropriate any property (whether real or personal) forming part of my estate towards the satisfaction of any legacy, share or pecuniary entitlement payable to any beneficiary, at such value as my Executor determines to be fair and reasonable at the date of appropriation.

In making an appropriation, my Executor:

(a) is not required to obtain the prior consent of the beneficiary;

(b) shall give reasonable notice of the appropriation to the beneficiary or, if the beneficiary is under a legal disability, to their legal representative;

(c) shall document the appropriation in writing; and

(d) may take into account any tax consequences for the estate or the beneficiary.

An appropriation duly made under this clause is final and binding on all persons interested in my estate.

This power is in addition to any power of appropriation conferred by law.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/APPROPRIATION-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- DEFN-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='DEFN-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'DEFN-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='DEFN-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$In this Will, unless the context otherwise requires:

**"my estate"** means all real and personal property of which I am the beneficial owner at the date of my death, including property over which I have a general power of appointment;

**"my Executor"** means the executor or executors for the time being of this Will, including any substituted executor, and includes my Executor acting as trustee where the context so requires;

**"child"** and **"children"** include any person recognised as my child under the law applying to my estate and any child adopted by me, but does not include a stepchild unless expressly stated;

**"minor"** means a person who has not yet attained the age of 18 years;

**"vesting age"** means the age specified in a trust clause at which a beneficiary becomes absolutely entitled to trust property;

**"intestacy rules"** means the law relating to the distribution of the estate of a person who dies without a valid will, as it applies to my estate.

Words importing one gender include all genders. Words importing the singular include the plural and vice versa. A reference to a person includes a corporation.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/DEFN-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- MIN-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='MIN-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'MIN-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='MIN-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$If any beneficiary under this Will is under the age of {{vesting_age}} years at the date on which they become entitled to receive a gift, my Executor shall hold that beneficiary's entitlement (the "Trust Property") on the following trusts:

(a) my Executor shall hold the Trust Property and any income from it on trust for the beneficiary until they attain the vesting age or die under that age;

(b) until the beneficiary attains the vesting age, my Executor may in their absolute discretion apply so much of the income and capital of the Trust Property as my Executor thinks fit for the maintenance, education, advancement and general benefit of the beneficiary;

(c) on the beneficiary attaining the vesting age, my Executor shall transfer the Trust Property (including any undistributed income) to the beneficiary absolutely;

(d) if the beneficiary dies before attaining the vesting age, the Trust Property shall pass to any backup beneficiary named for that gift or, if none, shall fall into the residue of my estate, except that if the Trust Property is itself the residue or a share of the residue, it shall instead pass to the other beneficiaries entitled to the residue in the proportions in which they take it or, if there are none, shall be distributed in accordance with the intestacy rules as if I had died without a Will.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/MIN-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- MIN-02
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='MIN-02' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'MIN-02','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='MIN-02' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$In addition to any power conferred under this Will or by law, my Executor may at any time, in their absolute discretion, advance all or any part of the capital of any trust fund held for a minor beneficiary for the maintenance, education or other benefit of that beneficiary, without being required to bring the advancement into account when calculating the beneficiary's final entitlement unless my Executor specifies otherwise at the time of the advancement.

In exercising this power, my Executor:

(a) may pay any amount directly to the minor's parent or guardian, or directly to a school, medical provider or other person on behalf of the minor;

(b) is not obliged to have regard to other resources available to the minor or their parent or guardian; and

(c) shall keep a reasonable record of any advancements made.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/MIN-02.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- RES-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='RES-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'RES-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='RES-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$Subject to the payment of my debts, funeral expenses and the costs of administering my estate, I give the whole of the rest and residue of my estate {{residuary_disposition}}.

If all persons otherwise entitled to receive a share of the residue under this clause (including any substitute beneficiaries) fail to survive me, or fail to satisfy any applicable survivorship condition, that share shall pass in accordance with the intestacy rules as if I had died without a Will.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/RES-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- RES-SUB-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='RES-SUB-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'RES-SUB-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='RES-SUB-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$If {{residuary_beneficiary_name}} does not survive me by at least {{survivorship_days}} days, or if all named residuary beneficiaries fail to receive the residue, then I give the whole of the residue (or the share that would otherwise have passed to the deceased beneficiary) to {{residuary_substitute_name}} absolutely.

If no substitute beneficiary survives me by {{survivorship_days}} days, or if all substitutes have also failed to receive their entitlement, the residue shall be distributed in accordance with the intestacy rules as if I had died intestate with respect to that residue.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/RES-SUB-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- TRUST-POWERS-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='TRUST-POWERS-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'TRUST-POWERS-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='TRUST-POWERS-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$Where my Executor acts as trustee of any trust arising under this Will, my Executor has the following investment and management powers, which are in addition to all powers conferred by law and are not limited by it:

(a) **Investment** — to invest trust funds in any form of investment, including property, equities, managed funds and any other investment that a prudent person of business would consider appropriate, subject to any overriding duties of prudence and loyalty owed to the beneficiaries;

(b) **Retention** — to retain any property forming part of the trust for such period as my Executor thinks fit without liability for loss, even if it is not otherwise an authorised investment;

(c) **Variation** — to vary, transpose or realise any investment when and in such manner as my Executor thinks fit;

(d) **Delegation** — to delegate investment functions to a person reasonably believed to be appropriately qualified, and to review that delegation at reasonable intervals, to the extent permitted by law;

(e) **Professional advice** — to obtain and rely on the advice of investment or other professionals, and to act on that advice in good faith, without personal liability for any resulting loss.

The powers conferred by this clause are in addition to, and not in derogation of, all other powers conferred by law or this Will.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/TRUST-POWERS-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- TRUSTEE-APPOINT-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='TRUSTEE-APPOINT-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'TRUSTEE-APPOINT-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='TRUSTEE-APPOINT-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$My Executor (acting as trustee of any trust arising under this Will) may at any time, by deed, appoint one or more additional trustees or substitute trustees of that trust, provided that:

(a) the total number of trustees shall not exceed four at any time;

(b) every individual trustee must be at least 18 years of age and legally capable of acting as trustee at the time of appointment and throughout their tenure (unless a corporate trustee is appointed); and

(c) a new trustee appointed under this clause shall have the same powers and obligations as the original trustee.

This power is exercisable in addition to any power of appointment conferred by law.

A trustee who retires, whether under this clause or under any law, is not released from any liability arising before their retirement.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/TRUSTEE-APPOINT-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- REMUN-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='REMUN-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'REMUN-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='REMUN-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$If any executor acting under this Will is a professional executor (including a solicitor, accountant, trustee company or other corporate executor), that executor is entitled to charge and be paid from my estate remuneration and commission for their services in the administration of my estate on the basis of their standard scale of fees, or on such other basis as may be agreed between that executor and the remaining executor or executors (if any).

A professional executor is entitled to charge for all work done by them, their firm or their company in connection with the administration of my estate, including work of a professional character, without reduction by reason only that they also act as executor.

An individual executor who is not a professional does not receive remuneration by reason of this clause, but may apply to the Court for commission as permitted by law.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/REMUN-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- INTERP-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='INTERP-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'INTERP-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='INTERP-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$This Will is to be construed in accordance with the law of the State or Territory of Australia in which I am domiciled at the date of my death.

If any provision of this Will is held to be void, invalid or unenforceable for any reason, that provision shall be severed from this Will and the remaining provisions shall continue in full force and effect as if this Will had been executed without the severed provision.

A reference to any legislation includes any amendment, re-enactment or replacement of that legislation in force from time to time.

Headings in this Will are for convenience only and do not affect its interpretation.

If there is any uncertainty or ambiguity, this Will must be construed in a manner that gives effect to my apparent intention as gathered from the Will as a whole.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/INTERP-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;

-- DIVORCE-01
with nsw as (
  select c.name, c.purpose, cv.trigger_description, cv.exclusions, cv.dependencies,
         cv.variables, cv.plain_english_explanation, cv.drafting_notes
  from public.clauses c join public.clause_versions cv on cv.clause_id=c.id
  where c.clause_code='DIVORCE-01' and c.jurisdiction='nsw'
),
newc as (
  insert into public.clauses (clause_code, jurisdiction, name, purpose)
  select 'DIVORCE-01','generic', name, purpose from nsw
  where not exists (select 1 from public.clauses where clause_code='DIVORCE-01' and jurisdiction='generic')
  returning id
)
insert into public.clause_versions
  (clause_id, version, status, clause_text, trigger_description, exclusions, dependencies, variables, plain_english_explanation, drafting_notes, git_path, git_commit_sha)
select newc.id, 1, 'production', $c$**Effect of marriage and divorce**

If I marry, enter a registered relationship, divorce or end a registered relationship after signing this Will, the law applying to my estate determines the effect on this Will. In many places a marriage revokes a Will unless it was made in contemplation of that marriage, and the end of a marriage affects gifts and appointments to the former spouse. I should review this Will after any such change. This applies to legal divorce only; separation alone does not have this effect.$c$,
  nsw.trigger_description, nsw.exclusions, nsw.dependencies, nsw.variables, nsw.plain_english_explanation, nsw.drafting_notes,
  'legal/generic/clauses/DIVORCE-01.md','uncommitted-chat-approval-20261128'
from newc, nsw;
