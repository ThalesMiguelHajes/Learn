import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  const { id } = await params

  // 1. Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json(
      { error: 'Não autorizado. Faça login para continuar.' },
      { status: 401 }
    )
  }

  // 2. Verify ownership — check if user has this ebook assigned
  const { data: ownership, error: ownershipError } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', id)
    .single()

  if (ownershipError || !ownership) {
    return Response.json(
      { error: 'Acesso negado. Você não possui este e-book.' },
      { status: 403 }
    )
  }

  // 3. Get ebook file info
  const { data: ebook, error: ebookError } = await supabase
    .from('ebooks')
    .select('file_path, file_name, file_type')
    .eq('id', id)
    .single()

  if (ebookError || !ebook || !ebook.file_path) {
    return Response.json(
      { error: 'Arquivo do e-book não encontrado.' },
      { status: 404 }
    )
  }

  // 4. Download file using service role (bypasses RLS on storage)
  const serviceClient = createServiceClient()
  const { data: fileData, error: downloadError } = await serviceClient
    .storage
    .from('ebooks')
    .download(ebook.file_path)

  if (downloadError || !fileData) {
    return Response.json(
      { error: 'Erro ao baixar o arquivo.' },
      { status: 500 }
    )
  }

  // 5. Stream the file to the client
  const contentType = ebook.file_type === 'epub'
    ? 'application/epub+zip'
    : 'application/pdf'

  const fileName = ebook.file_name || `ebook.${ebook.file_type || 'pdf'}`

  return new Response(fileData, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
