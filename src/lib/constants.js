export const ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
}

export const BUCKETS = {
  COVERS: 'covers',
  EBOOKS: 'ebooks',
  MATERIALS: 'materials',
}

export const MAX_FILE_SIZE = {
  COVER: 5 * 1024 * 1024,   // 5MB
  EBOOK: 50 * 1024 * 1024,  // 50MB
  MATERIAL: 100 * 1024 * 1024, // 100MB
}

export const ACCEPTED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_EBOOK_TYPES = ['application/pdf', 'application/epub+zip']
export const ACCEPTED_MATERIAL_TYPES = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'text/html']
