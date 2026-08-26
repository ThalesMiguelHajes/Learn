-- ============================================================
-- KodaBooks — Migração 004: Tabelas de Pagamento (AbacatePay)
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor → New query
-- ============================================================

-- 1. TABELA DE CHECKOUTS PENDENTES
-- Rastreia sessões de pagamento abertas antes da confirmação
-- ============================================================
CREATE TABLE public.pending_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    billing_id TEXT,                   -- ID retornado pela AbacatePay (ex: "bill_abc123")
    billing_url TEXT,                  -- URL da página de pagamento PIX
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_checkouts_user ON public.pending_checkouts(user_id);
CREATE INDEX idx_pending_checkouts_billing ON public.pending_checkouts(billing_id);

CREATE TRIGGER pending_checkouts_updated_at
    BEFORE UPDATE ON public.pending_checkouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. ADICIONAR COLUNAS DE PAGAMENTO NA TABELA SALES
-- Para rastrear se a venda foi manual (pelo admin) ou automática (pelo cliente)
-- ============================================================
ALTER TABLE public.sales
    ADD COLUMN IF NOT EXISTS payment_source TEXT NOT NULL DEFAULT 'manual'
        CHECK (payment_source IN ('manual', 'abacatepay')),
    ADD COLUMN IF NOT EXISTS billing_id TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'paid'
        CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- ============================================================
-- ROW LEVEL SECURITY para pending_checkouts
-- ============================================================
ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver apenas seus próprios checkouts
CREATE POLICY "Clientes veem seus checkouts"
ON public.pending_checkouts FOR SELECT
USING (auth.uid() = user_id);

-- Apenas a service role (usada no webhook do servidor) pode inserir/atualizar
-- O INSERT é feito pela API route autenticada via cookie do usuário
CREATE POLICY "Usuários podem criar seus checkouts"
ON public.pending_checkouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins têm acesso total
CREATE POLICY "Admins gerenciam checkouts"
ON public.pending_checkouts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
