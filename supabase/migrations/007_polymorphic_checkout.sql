-- ============================================================
-- KodaBooks — Migração 007: Checkout Polimórfico
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. Modificar pending_checkouts
-- Nós vamos alterar a coluna ebook_id para item_id e adicionar item_type
ALTER TABLE public.pending_checkouts
    RENAME COLUMN ebook_id TO item_id;

-- Como item_id agora será polimórfico (pode apontar para ebooks, materials ou courses),
-- precisamos remover a restrição de chave estrangeira que aponta apenas para ebooks.
ALTER TABLE public.pending_checkouts
    DROP CONSTRAINT IF EXISTS pending_checkouts_ebook_id_fkey;

ALTER TABLE public.pending_checkouts
    ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'ebook'
    CHECK (item_type IN ('ebook', 'material', 'course'));

-- Atualizar o índice antigo
DROP INDEX IF EXISTS public.idx_pending_checkouts_ebook;
CREATE INDEX idx_pending_checkouts_item ON public.pending_checkouts(item_id);

-- 2. Modificar sale_items
-- Fazer a mesma coisa na tabela de sale_items
ALTER TABLE public.sale_items
    RENAME COLUMN ebook_id TO item_id;

ALTER TABLE public.sale_items
    DROP CONSTRAINT IF EXISTS sale_items_ebook_id_fkey;

ALTER TABLE public.sale_items
    ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'ebook'
    CHECK (item_type IN ('ebook', 'material', 'course'));

-- Atualizar índice de sale_items se existir
DROP INDEX IF EXISTS public.idx_sale_items_ebook;
CREATE INDEX idx_sale_items_item ON public.sale_items(item_id);
