-- The generic INTERP-01 variant inherited the NSW plain-English note ("Says NSW law
-- applies…") when its metadata was copied from the nsw row. The generic clause is
-- domicile-based, so correct the note. This field is non-operative helper metadata
-- (not rendered into the Will); the NSW row is left unchanged.
-- Applied to Sydney (copbetdvhkreyzvywmmr) as 20261128071713.
update public.clause_versions cv
set plain_english_explanation =
  'Says the law of the Australian State or Territory where you are domiciled when you die applies, that an invalid part of the Will does not cancel the rest, and that the Will should be read to give effect to what you meant.'
from public.clauses c
where cv.clause_id = c.id
  and c.clause_code = 'INTERP-01'
  and c.jurisdiction = 'generic';
