export const ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
}

export const BUCKETS = {
  COVERS: 'covers',
  EBOOKS: 'ebooks',
}

export const MAX_FILE_SIZE = {
  COVER: 5 * 1024 * 1024,   // 5MB
  EBOOK: 50 * 1024 * 1024,  // 50MB
}

export const ACCEPTED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ACCEPTED_EBOOK_TYPES = ['application/pdf', 'application/epub+zip']
