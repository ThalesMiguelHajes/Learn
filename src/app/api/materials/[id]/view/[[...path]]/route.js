import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

const mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  otf: 'font/otf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
}

function getMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

export async function GET(request, { params }) {
  const { id, path } = await params

  // 1. Verify authentication
  const { user } = await getUser()

  if (!user) {
    return new Response('Não autorizado', { status: 401 })
  }

  const supabase = await createClient()

  let hasAccess = false

  // 2. Verify ownership — check if user has this assigned directly
  const { data: ownership } = await supabase
    .from('user_materials')
    .select('id')
    .eq('user_id', user.id)
    .eq('material_id', id)
    .single()

  if (ownership) {
    hasAccess = true
  }

  // 3. If not direct ownership, check if they own a course that contains the material
  if (!hasAccess) {
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

  // 4. Check if user is admin (admins can view anything)
  if (!hasAccess) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile && profile.role === 'admin') {
      hasAccess = true
    }
  }

  if (!hasAccess) {
    return new Response('Acesso negado. Você não possui este material.', { status: 403 })
  }

  // 5. Get file info
  const { data: item, error: itemError } = await supabase
    .from('materials')
    .select('file_path, material_type')
    .eq('id', id)
    .single()

  if (itemError || !item || !item.file_path) {
    return new Response('Material não encontrado.', { status: 404 })
  }

  // Determine requested file path
  // path can be undefined (if accessing /view), an array like ['index.html'] or ['assets', 'img.png']
  const requestedPath = path && path.length > 0 ? path.join('/') : 'index.html'
  
  // Construct full storage path
  // item.file_path is something like "1725992929-x7ysad/slides"
  const fullStoragePath = `${item.file_path}/${requestedPath}`

  // 6. Download file using service role (bypasses RLS on storage)
  const serviceClient = createServiceClient()
  const { data: fileData, error: downloadError } = await serviceClient
    .storage
    .from('materials')
    .download(fullStoragePath)

  if (downloadError || !fileData) {
    // Return 404 if file is missing inside the bucket, instead of 500
    if (downloadError.message?.includes('not found') || downloadError.name === 'StorageApiError') {
       return new Response('Arquivo não encontrado no diretório do material.', { status: 404 })
    }
    return new Response('Erro ao buscar o arquivo do material.', { status: 500 })
  }

  // 7. Stream the file to the client with correct headers
  const contentType = getMimeType(requestedPath)

  return new Response(fileData, {
    headers: {
      'Content-Type': contentType,
      // For HTML and assets we want them to render in browser, so no attachment disposition
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour to speed up asset loading
    },
  })
}
