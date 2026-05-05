-- Backstop for the floor-at-zero protection added in code. Both columns are
-- decremented from multiple paths (fulfillment, manual adjustment, AI count,
-- variant edit). The application now floors at 0 in every path; this CHECK
-- guarantees no future code path can sneak past.
--
-- Idempotent: skips silently if the constraint already exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_variants_inventory_quantity_non_negative'
  ) THEN
    ALTER TABLE product_variants
      ADD CONSTRAINT product_variants_inventory_quantity_non_negative
      CHECK (inventory_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_variants_committed_quantity_non_negative'
  ) THEN
    ALTER TABLE product_variants
      ADD CONSTRAINT product_variants_committed_quantity_non_negative
      CHECK (committed_quantity >= 0);
  END IF;
END $$;
