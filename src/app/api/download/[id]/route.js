import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export async function GET(request, { params }) {
  const { id } = await params

  const url = new URL(request.url)
  const itemType = url.searchParams.get('type') || 'ebook'

  // 1. Verify authentication
  const { user } = await getUser()

  if (!user) {
    return Response.json(
      { error: 'Não autorizado. Faça login para continuar.' },
      { status: 401 }
    )
  }

  const supabase = await createClient()

  let ownershipTable = 'user_ebooks'
  let idCol = 'ebook_id'
  let itemTable = 'ebooks'
  let bucket = 'ebooks'

  if (itemType === 'material') {
    ownershipTable = 'user_materials'
    idCol = 'material_id'
    itemTable = 'materials'
    bucket = 'materials'
  }

  let hasAccess = false

  // 2. Verify ownership — check if user has this assigned directly
  const { data: ownership, error: ownershipError } = await supabase
    .from(ownershipTable)
    .select('id')
    .eq('user_id', user.id)
    .eq(idCol, id)
    .single()

  if (ownership) {
    hasAccess = true
  }

  // 3. If not direct ownership, check if they own a course that contains the material
  if (!hasAccess && itemType === 'material') {
    const { data: courseAccess } = await supabase
      .from('course_materials')
      .select('course_id, user_courses!inner(user_id)')
      .eq('material_id', id)
      .eq('user_courses.user_id', user.id)
      .limit(1)

    if (courseAccess && courseAccess.length > 0) {
      hasAccess = true
    }
  }

  if (!hasAccess) {
    return Response.json(
      { error: `Acesso negado. Você não possui este ${itemType}.` },
      { status: 403 }
    )
  }

  // 3. Get file info
  const { data: item, error: itemError } = await supabase
    .from(itemTable)
    .select(itemType === 'material' ? 'file_path, file_name, material_type' : 'file_path, file_name, file_type')
    .eq('id', id)
    .single()

  if (itemError || !item || !item.file_path) {
    return Response.json(
      { error: 'Arquivo não encontrado.' },
      { status: 404 }
    )
  }

  // 4. Download file using service role (bypasses RLS on storage)
  const serviceClient = createServiceClient()
  const { data: fileData, error: downloadError } = await serviceClient
    .storage
    .from(bucket)
    .download(item.file_path)

  if (downloadError || !fileData) {
    return Response.json(
      { error: 'Erro ao baixar o arquivo.' },
      { status: 500 }
    )
  }

  // 5. Stream the file to the client
  const type = itemType === 'material' ? item.material_type : item.file_type
  let contentType = 'application/octet-stream'
  if (type === 'epub') contentType = 'application/epub+zip'
  if (type === 'pdf') contentType = 'application/pdf'
  if (type === 'zip') contentType = 'application/zip'

  const fileName = item.file_name || `${itemType}.${type || 'pdf'}`

  return new Response(fileData, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
