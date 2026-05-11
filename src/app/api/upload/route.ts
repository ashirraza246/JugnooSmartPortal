import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
]

const ALLOWED_EXTENSIONS = [
  '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
  '.doc', '.docx', '.xls', '.xlsx', '.txt',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const appId = formData.get('appId') as string | null

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 })
    }

    if (file.size === 0) {
      return Response.json({ error: 'Empty file not allowed.' }, { status: 400 })
    }

    // Validate file type by MIME type
    const isValidMimeType = !file.type || ALLOWED_FILE_TYPES.includes(file.type)

    // Validate by extension as fallback
    const fileName = file.name.toLowerCase()
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))

    if (!isValidMimeType && !hasValidExtension) {
      return Response.json({
        error: 'Invalid file type. Allowed: PDF, images (JPG, PNG, GIF, WebP), documents (DOC, DOCX, XLS, XLSX, TXT)',
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `service-docs/${appId || 'unknown'}/${timestamp}_${sanitizedName}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Try uploading to Supabase Storage - use 'order-files' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('order-files')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      // If storage bucket doesn't exist, try creating it
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket not found')) {
        // Try creating the bucket
        await supabase.storage.createBucket('order-files', {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
        })

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('order-files')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          })

        if (retryError) {
          // If still failing, try the 'documents' bucket as fallback
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from('documents')
            .upload(filePath, buffer, {
              contentType: file.type || 'application/octet-stream',
              upsert: false,
            })

          if (fallbackError) {
            // Try creating documents bucket too
            try {
              await supabase.storage.createBucket('documents', { public: true, fileSizeLimit: MAX_FILE_SIZE })
            } catch {}

            const { data: retryFallbackData, error: retryFallbackError } = await supabase.storage
              .from('documents')
              .upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false,
              })

            if (retryFallbackError) {
              console.error('All storage upload attempts failed:', retryFallbackError)
              return Response.json({ error: 'Could not upload file. Storage buckets not available.' }, { status: 500 })
            }

            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(retryFallbackData!.path)
            return Response.json({ url: urlData.publicUrl })
          }

          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fallbackData!.path)
          return Response.json({ url: urlData.publicUrl })
        }

        const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(retryData!.path)
        return Response.json({ url: urlData.publicUrl })
      }

      console.error('Storage upload error:', uploadError)

      // Fallback: try 'documents' bucket if order-files fails for other reasons
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('documents')
        .upload(filePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (fallbackError) {
        return Response.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fallbackData.path)
      return Response.json({ url: urlData.publicUrl })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(uploadData.path)
    return Response.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload API error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
