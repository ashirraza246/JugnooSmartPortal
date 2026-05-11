import { supabase, isSupabaseConfigured } from '@/lib/supabase'

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
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `service-docs/${appId || 'unknown'}/${timestamp}_${sanitizedName}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Try uploading to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      // If storage bucket doesn't exist, try creating it
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket not found')) {
        // Try creating the bucket
        await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        })

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          })

        if (retryError) {
          // If still failing, fall back to base64 data URL approach
          console.error('Storage upload retry failed:', retryError)
          return Response.json({ error: 'Could not upload file. Please use a URL instead.' }, { status: 500 })
        }

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(retryData.path)
        return Response.json({ url: urlData.publicUrl })
      }

      console.error('Storage upload error:', uploadError)
      return Response.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(uploadData.path)
    return Response.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload API error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
