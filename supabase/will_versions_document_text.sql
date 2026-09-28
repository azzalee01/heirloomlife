-- When a user amends an approved Will via the Estate Assistant, the new
-- generated document text is stored here instead of overwriting wills.document_text.
-- This lets the approved version remain downloadable until the amendment is
-- reviewed and promoted by staff.
--
alter table public.will_versions add column if not exists document_text text;
