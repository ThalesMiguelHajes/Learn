-- ============================================================
-- KodaBooks — Schema Completo do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. TABELA DE PERFIS (extensão do auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. TABELA DE E-BOOKS
-- ============================================================
CREATE TABLE public.ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    file_path TEXT,
    file_name TEXT,
    file_type TEXT CHECK (file_type IN ('pdf', 'epub')),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER ebooks_updated_at
    BEFORE UPDATE ON public.ebooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. TABELA DE RELAÇÃO: user_ebooks
-- ============================================================
CREATE TABLE public.user_ebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, ebook_id)
);

CREATE INDEX idx_user_ebooks_user ON public.user_ebooks(user_id);
CREATE INDEX idx_user_ebooks_ebook ON public.user_ebooks(ebook_id);

-- 4. FUNCTION: Criar perfil automaticamente ao cadastrar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Usuários podem atualizar seu perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ebooks
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins CRUD total em ebooks"
ON public.ebooks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Clientes veem apenas seus ebooks"
ON public.ebooks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_ebooks
        WHERE user_id = auth.uid() AND ebook_id = ebooks.id
    )
);

-- user_ebooks
ALTER TABLE public.user_ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam atribuições"
ON public.user_ebooks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Clientes veem suas atribuições"
ON public.user_ebooks FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE POLICIES
-- (Execute APÓS criar os buckets 'covers' e 'ebooks' no Dashboard)
-- ============================================================

-- BUCKET: covers (público para leitura, admin para escrita)
CREATE POLICY "Capas são públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Admins podem fazer upload de capas"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'covers'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins podem atualizar capas"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'covers'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins podem deletar capas"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'covers'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- BUCKET: ebooks (totalmente privado)
CREATE POLICY "Admins podem fazer upload de ebooks"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'ebooks'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins podem deletar ebooks"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'ebooks'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
