-- ============================================================
-- KodaBooks — Migração 006: Tabelas de Materiais e Cursos
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. MATERIAIS
-- ============================================================
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    material_type TEXT NOT NULL DEFAULT 'pdf' CHECK (material_type IN ('pdf', 'html_slides', 'zip', 'link')),
    file_path TEXT,      -- Caminho no storage se for arquivo (pdf/zip) ou pasta base de HTML
    external_url TEXT,   -- URL externa se for material hospedado fora
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER materials_updated_at
    BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Relação de Materiais Comprados
CREATE TABLE public.user_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, material_id)
);

CREATE INDEX idx_user_materials_user ON public.user_materials(user_id);
CREATE INDEX idx_user_materials_material ON public.user_materials(material_id);

-- ============================================================
-- 2. CURSOS
-- ============================================================
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,      -- Link do YouTube (Não Listado)
    content TEXT,        -- Texto de apoio (Markdown ou HTML)
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Relação de Cursos Comprados
CREATE TABLE public.user_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_courses_user ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course ON public.user_courses(course_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Materiais
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins CRUD total em materials" ON public.materials FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem materials ativos" ON public.materials FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- User_Materials
ALTER TABLE public.user_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam atribuicoes materials" ON public.user_materials FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem suas atribuicoes materials" ON public.user_materials FOR SELECT USING (auth.uid() = user_id);

-- Cursos
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins CRUD total em courses" ON public.courses FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem courses ativos" ON public.courses FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Módulos e Aulas
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins CRUD total em modules" ON public.course_modules FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem modulos" ON public.course_modules FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins CRUD total em lessons" ON public.course_lessons FOR ALL USING (public.is_admin());
-- Apenas usuários que compraram o curso podem ver as aulas
CREATE POLICY "Clientes com acesso ao curso veem aulas" ON public.course_lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.course_modules cm
        JOIN public.user_courses uc ON uc.course_id = cm.course_id
        WHERE cm.id = course_lessons.module_id AND uc.user_id = auth.uid()
    ) OR public.is_admin()
);

-- User_Courses
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam atribuicoes courses" ON public.user_courses FOR ALL USING (public.is_admin());
CREATE POLICY "Clientes veem suas atribuicoes courses" ON public.user_courses FOR SELECT USING (auth.uid() = user_id);
