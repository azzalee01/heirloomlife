-- P0: married/domestic-partner saves failed on "About You" because a spouse
-- testators row was inserted with NULL date_of_birth (spouse DOB is optional and
-- blank until the spouse step). The primary testator's DOB is already gated by the
-- eligibility step, so dropping NOT NULL is safe. Applied to Sydney as 20261128025409.
alter table public.testators alter column date_of_birth drop not null;
