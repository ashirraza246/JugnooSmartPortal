import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Simple encoding for password check (matches register route encoding)
function encodePassword(password: string): string {
  return Buffer.from(`JSP:${password}`).toString('base64')
}

function decodePassword(encoded: string): string | null {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString()
    if (decoded.startsWith('JSP:')) {
      return decoded.replace('JSP:', '')
    }
    return null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email aur password dono chahiye' }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      return Response.json({ error: 'Email ya password ghalt hai' }, { status: 401 })
    }

    // Check password - multiple methods
    let passwordValid = false

    // Method 1: Check user_credentials table (preferred)
    try {
      const { data: credentials } = await supabase
        .from('user_credentials')
        .select('password_hash')
        .eq('user_id', user.id)
        .single()

      if (credentials && credentials.password_hash) {
        if (password === credentials.password_hash) {
          passwordValid = true
        }
      }
    } catch {
      // user_credentials table might not exist yet
    }

    // Method 2: Check avatar_url field (fallback - encoded password)
    if (!passwordValid && user.avatar_url) {
      const storedPassword = decodePassword(user.avatar_url)
      if (storedPassword && password === storedPassword) {
        passwordValid = true
        // Also save to user_credentials if table exists
        try {
          await supabase.from('user_credentials').insert([{
            user_id: user.id,
            password_hash: password,
          }])
        } catch {
          // Table might not exist, that's ok
        }
      }
    }

    // Method 3: Admin default password - ONLY for admin@jugnoo.pk
    if (!passwordValid && email === 'admin@jugnoo.pk' && password === 'jugnoo123') {
      passwordValid = true
      // Save credentials for next time
      try {
        await supabase.from('user_credentials').insert([{
          user_id: user.id,
          password_hash: 'jugnoo123',
        }])
      } catch {
        // Table might not exist
      }
      // Also save in avatar_url as fallback
      if (!user.avatar_url) {
        try {
          await supabase.from('users').update({
            avatar_url: encodePassword('jugnoo123'),
          }).eq('id', user.id)
        } catch {
          // ignore
        }
      }
    }

    if (!passwordValid) {
      return Response.json({ error: 'Email ya password ghalt hai' }, { status: 401 })
    }

    // IMPORTANT: Determine the correct role from database
    // Only 'admin' or 'staff' role gets admin access
    // If somehow the role is missing or invalid, default to 'customer'
    let userRole = user.role
    if (!userRole || !['admin', 'staff', 'customer'].includes(userRole)) {
      // Fix invalid roles - default to customer
      userRole = 'customer'
      try {
        await supabase.from('users').update({ role: 'customer' }).eq('id', user.id)
      } catch {
        // ignore update error
      }
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: userRole,  // Return ONLY the database role
        phone: user.phone,
        is_active: user.is_active,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Login failed. Dobara try karein.' }, { status: 500 })
  }
}
