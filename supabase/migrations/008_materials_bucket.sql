-- ============================================================
-- KodaBooks — Migração 008: Bucket para Materiais
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. Criar o bucket 'materials' caso não exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de RLS para o bucket 'materials'
-- Como materiais podem ser privados (só quem comprou baixa), o bucket deve ser private.

-- Admins podem fazer tudo no bucket 'materials'
CREATE POLICY "Admins podem gerenciar materials no storage"
ON storage.objects FOR ALL
USING (
    bucket_id = 'materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Clientes podem baixar (SELECT) materiais se eles os compraram
CREATE POLICY "Clientes podem baixar seus materials comprados"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'materials'
    AND auth.role() = 'authenticated'
    -- Nota: Uma validação completa e complexa verificaria se o nome do arquivo bate com o `file_path` de um material
    -- que o usuário comprou. Para simplificar no nível do Storage, você pode usar Signed URLs geradas pelo backend 
    -- (que checam a permissão antes de gerar) ao invés de abrir o acesso SELECT genérico.
    -- Vamos deixar o SELECT aberto apenas para Admins aqui, e clientes acessarão via Signed URLs.
);

-- Revogando permissões antigas se existirem (para limpar) e configurando corretamente:
DROP POLICY IF EXISTS "Clientes podem baixar seus materials comprados" ON storage.objects;

-- Conclusão: Clientes NÃO terão acesso direto de leitura pública.
-- O frontend solicitará ao backend uma "Signed URL" (URL assinada) válida por alguns minutos,
-- e o backend verificará na tabela `user_materials` se o usuário comprou o item antes de gerar a URL.
