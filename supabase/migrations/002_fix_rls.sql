-- Corrige a recursão infinita na tabela profiles

-- 1. Primeiro, removemos a política problemática
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;

-- 2. Criamos uma função segura que checa se é admin (bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriamos a política usando a nova função
CREATE POLICY "Admins podem ver todos os perfis"
ON public.profiles FOR SELECT
USING ( public.is_admin() );

-- 4. Atualizamos também as outras políticas que usavam a mesma checagem falha
DROP POLICY IF EXISTS "Admins CRUD total em ebooks" ON public.ebooks;
CREATE POLICY "Admins CRUD total em ebooks"
ON public.ebooks FOR ALL
USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins gerenciam atribuições" ON public.user_ebooks;
CREATE POLICY "Admins gerenciam atribuições"
ON public.user_ebooks FOR ALL
USING ( public.is_admin() );
