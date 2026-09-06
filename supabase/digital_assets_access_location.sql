-- Add access_location column to assets table for digital asset (cryptocurrency) entries.
-- Stores WHERE access instructions are kept (e.g. "sealed envelope with executor"),
-- never the credentials themselves. Only populated for asset_type = 'digital_asset'.
ALTER TABLE assets ADD COLUMN IF NOT EXISTS access_location text;
