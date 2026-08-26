-- ============================================================
-- KodaBooks — Migração 005: Adicionar CPF e Telefone
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Adiciona os campos opcionais na tabela de perfis
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Opcional: Você pode adicionar restrições de formato se quiser,
-- mas por enquanto deixaremos como texto livre (validado no Frontend).
