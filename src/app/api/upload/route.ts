import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

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

function getAdminClient() {
  // Use service_role key if available (can create buckets and bypass RLS)
  // Fall back to anon key if service_role not configured
  const key = supabaseServiceKey || supabaseAnonKey
  if (!supabaseUrl || !key) return null
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function ensureBucketExists(bucketName: string): Promise<boolean> {
  const admin = getAdminClient()
  if (!admin) return false

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await admin.storage.listBuckets()

    if (listError) {
      console.warn(`Could not list buckets: ${listError.message}`)
      // Continue anyway - bucket might exist even if we can't list
    }

    const exists = buckets?.some(b => b.name === bucketName)

    if (!exists) {
      // Try to create it (requires service_role key)
      const { error: createError } = await admin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      })
      if (createError) {
        console.warn(`Could not create bucket ${bucketName}: ${createError.message}`)
        // Bucket might already exist but we just couldn't list it - try uploading anyway
      }
    }

    return true
  } catch (err) {
    console.warn(`Bucket check error: ${err}`)
    return false
  }
}

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
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

    // Use admin client for storage operations
    const admin = getAdminClient()
    if (!admin) {
      return Response.json({ error: 'Storage client not available' }, { status: 500 })
    }

    // List of buckets to try in order
    const bucketsToTry = ['order-files', 'documents']
    let storageUploadSuccess = false
    let storageUrl = ''

    for (const bucketName of bucketsToTry) {
      try {
        // Try to ensure the bucket exists
        await ensureBucketExists(bucketName)

        // Try uploading
        const { data: uploadData, error: uploadError } = await admin.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true, // Use upsert so we can replace files too
          })

        if (!uploadError && uploadData) {
          // Success - get public URL
          const { data: urlData } = admin.storage.from(bucketName).getPublicUrl(uploadData.path)
          storageUrl = urlData.publicUrl
          storageUploadSuccess = true
          break
        }

        // Log the error and try next bucket
        console.warn(`Upload to ${bucketName} failed:`, uploadError?.message)
      } catch (bucketErr) {
        console.warn(`Bucket ${bucketName} error:`, bucketErr)
      }
    }

    if (storageUploadSuccess && storageUrl) {
      return Response.json({ url: storageUrl, isStorage: true })
    }

    // Storage upload failed - use base64 data URL fallback
    // This stores the file directly in the database as a data URL
    console.info('Storage upload failed, using base64 fallback for file:', file.name)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`

    // PostgreSQL text columns support up to ~1GB, so we can safely store files up to ~5MB as base64
    // Base64 encoding increases size by ~33%, so a 5MB file becomes ~6.7MB as base64
    if (dataUrl.length < 7000000) { // 7MB limit for base64 data URL (~5MB original file)
      return Response.json({ url: dataUrl, isBase64: true })
    }

    return Response.json({
      error: 'File too large for upload. Storage buckets are not configured. Please add your SUPABASE_SERVICE_ROLE_KEY in the .env file. For now, try uploading a smaller file (under 5MB) or paste a link instead.',
    }, { status: 500 })
  } catch (error) {
    console.error('Upload API error:', error)
    return Response.json({
      error: 'Upload failed. Please try again or paste a link instead.',
    }, { status: 500 })
  }
}
