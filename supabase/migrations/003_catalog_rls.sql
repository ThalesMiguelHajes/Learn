-- 1. Permitir que clientes vejam e-books ativos no catálogo
CREATE POLICY "Clientes veem ebooks ativos no catalogo"
ON public.ebooks FOR SELECT
USING ( is_active = true AND auth.role() = 'authenticated' );
