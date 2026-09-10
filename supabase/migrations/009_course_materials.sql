-- ============================================================
-- KodaBooks — Migração 009: Associação de Materiais a Cursos
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

CREATE TABLE public.course_materials (
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (course_id, material_id)
);

-- RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Admins gerenciam
CREATE POLICY "Admins CRUD total em course_materials" ON public.course_materials FOR ALL USING (public.is_admin());

-- Clientes podem ver quais materiais pertencem a um curso (útil para listar na página do curso)
CREATE POLICY "Clientes veem course_materials" ON public.course_materials FOR SELECT USING (auth.role() = 'authenticated');
