-- Finance Director — Phase 1B: AP on ReceivingInvoice
--
-- Adds 4 columns to receiving_invoices so we can track invoice total, due
-- date, paid date, and payment method. Powers the Outstanding-AP surface
-- at /admin/finance/ap.
--
-- Run against prod manually:
--     psql "$DATABASE_URL" -f prisma/migrations/manual/2026-05-20-finance-phase-1b.sql
--     npx prisma generate

BEGIN;

ALTER TABLE receiving_invoices
  ADD COLUMN IF NOT EXISTS invoice_total_cents BIGINT,
  ADD COLUMN IF NOT EXISTS due_date            DATE,
  ADD COLUMN IF NOT EXISTS paid_at             TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS paid_via            TEXT;

CREATE INDEX IF NOT EXISTS receiving_invoices_due_date_idx
  ON receiving_invoices (due_date);
CREATE INDEX IF NOT EXISTS receiving_invoices_paid_at_idx
  ON receiving_invoices (paid_at);

COMMIT;
